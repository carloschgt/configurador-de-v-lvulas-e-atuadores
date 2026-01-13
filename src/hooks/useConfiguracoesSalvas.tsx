import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfiguracaoSalva {
  id: string;
  codigo_config: string;
  tag_cliente: string | null;
  tipo_valvula: string;
  servico: string | null;
  dados_json: Record<string, any>;
  resumo_texto: string | null;
  status: 'rascunho' | 'validado' | 'enviado' | 'aprovado';
  usuario_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SalvarConfigResult {
  sucesso: boolean;
  codigo?: string;
  id?: string;
  erro?: string;
}

export const useConfiguracoesSalvas = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSalva[]>([]);

  const gerarCodigoConfig = (tipoValvula: string): string => {
    const prefixo = tipoValvula.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `VLV-${prefixo}-${timestamp}-${random}`;
  };

  const gerarResumoTexto = (dados: Record<string, any>): string => {
    const partes: string[] = [];
    
    if (dados.tipo_valvula) partes.push(`Tipo: ${dados.tipo_valvula}`);
    if (dados.diameterNPS) partes.push(`NPS: ${dados.diameterNPS}"`);
    if (dados.pressureClass) partes.push(`Classe: ${dados.pressureClass}`);
    if (dados.material_corpo) partes.push(`Corpo: ${dados.material_corpo}`);
    if (dados.servico) partes.push(`Serviço: ${dados.servico}`);
    
    return partes.join(' | ');
  };

  const salvarConfiguracao = useCallback(async (
    tipoValvula: string,
    dados: Record<string, any>,
    tagCliente?: string,
    idExistente?: string
  ): Promise<SalvarConfigResult> => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { sucesso: false, erro: 'Usuário não autenticado' };
      }

      const codigo = idExistente ? dados.codigo_config : gerarCodigoConfig(tipoValvula);
      const resumo = gerarResumoTexto(dados);

      if (idExistente) {
        // Atualizar existente
        const { error } = await supabase
          .from('configuracoes_salvas')
          .update({
            dados_json: dados,
            tag_cliente: tagCliente,
            servico: dados.servico || null,
            resumo_texto: resumo,
            updated_at: new Date().toISOString()
          })
          .eq('id', idExistente);

        if (error) throw error;

        // Registrar histórico
        await registrarHistorico(idExistente, user.id, 'dados_json', null, JSON.stringify(dados));

        toast.success('Configuração atualizada!');
        return { sucesso: true, codigo, id: idExistente };

      } else {
        // Criar nova
        const { data, error } = await supabase
          .from('configuracoes_salvas')
          .insert({
            codigo_config: codigo,
            tipo_valvula: tipoValvula,
            tag_cliente: tagCliente,
            servico: dados.servico || null,
            dados_json: dados,
            resumo_texto: resumo,
            status: 'rascunho',
            usuario_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        toast.success(`Configuração salva: ${codigo}`);
        return { sucesso: true, codigo, id: data.id };
      }

    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar configuração');
      return { sucesso: false, erro: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const carregarConfiguracoes = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('configuracoes_salvas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConfiguracoes(data as ConfiguracaoSalva[]);

    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const carregarConfiguracao = useCallback(async (id: string): Promise<ConfiguracaoSalva | null> => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_salvas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as ConfiguracaoSalva;

    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
      return null;
    }
  }, []);

  const validarConfiguracao = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('configuracoes_salvas')
        .update({ status: 'validado' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuração validada!');
      return true;

    } catch (err) {
      console.error('Erro ao validar:', err);
      toast.error('Erro ao validar configuração');
      return false;
    }
  }, []);

  const enviarParaAprovacao = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('configuracoes_salvas')
        .update({ status: 'enviado' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuração enviada para aprovação!');
      return true;

    } catch (err) {
      console.error('Erro ao enviar:', err);
      toast.error('Erro ao enviar para aprovação');
      return false;
    }
  }, []);

  const aprovarConfiguracao = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('configuracoes_salvas')
        .update({ 
          status: 'aprovado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuração aprovada!');
      return true;

    } catch (err) {
      console.error('Erro ao aprovar:', err);
      toast.error('Erro ao aprovar configuração');
      return false;
    }
  }, []);

  const deletarConfiguracao = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('configuracoes_salvas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuração excluída');
      return true;

    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao excluir configuração');
      return false;
    }
  }, []);

  const registrarHistorico = async (
    configId: string,
    userId: string,
    campo: string,
    valorAnterior: string | null,
    valorNovo: string
  ) => {
    try {
      await supabase
        .from('historico_alteracoes')
        .insert({
          configuracao_id: configId,
          usuario_id: userId,
          campo_alterado: campo,
          valor_anterior: valorAnterior,
          valor_novo: valorNovo
        });
    } catch (err) {
      console.error('Erro ao registrar histórico:', err);
    }
  };

  return {
    isLoading,
    configuracoes,
    salvarConfiguracao,
    carregarConfiguracoes,
    carregarConfiguracao,
    validarConfiguracao,
    enviarParaAprovacao,
    aprovarConfiguracao,
    deletarConfiguracao
  };
};
