import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidacaoResultado {
  erros: Record<string, string>;
  avisos: Record<string, string>;
  sugestoes: Record<string, { valor: string; mensagem: string }>;
  camposAfetados: CampoAfetado[];
  isValid: boolean;
}

interface CampoAfetado {
  campo: string;
  acao: 'mostrar' | 'ocultar' | 'habilitar' | 'bloquear' | 'obrigar' | 'sugerir';
  valoresPermitidos?: string[];
  valorSugerido?: string;
  mensagem?: string;
}

interface Regra {
  id: string;
  tipo_valvula: string | null;
  se_atributo: string;
  se_valor: string;
  entao_atributo: string;
  acao: string;
  valores_permitidos: string | null;
  valor_sugerido: string | null;
  mensagem_erro: string | null;
  mensagem_aviso: string | null;
  prioridade: number;
}

interface Sugestao {
  servico: string;
  atributo_codigo: string;
  valor_sugerido: string;
  mensagem: string | null;
}

export const useValidadorValvulas = (tipoValvula: string | null, valores: Record<string, any>) => {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [avisos, setAvisos] = useState<Record<string, string>>({});
  const [sugestoes, setSugestoes] = useState<Record<string, { valor: string; mensagem: string }>>({});
  const [camposAfetados, setCamposAfetados] = useState<CampoAfetado[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validar quando valores ou tipo mudam
  useEffect(() => {
    if (tipoValvula) {
      validarTudo();
    }
  }, [valores, tipoValvula]);

  const validarTudo = useCallback(async () => {
    if (!tipoValvula) return;

    setIsValidating(true);
    const novosErros: Record<string, string> = {};
    const novosAvisos: Record<string, string> = {};
    const novasSugestoes: Record<string, { valor: string; mensagem: string }> = {};
    const novosCamposAfetados: CampoAfetado[] = [];

    try {
      // 1. Buscar campos obrigatórios
      const { data: atributos } = await supabase
        .from('atributos')
        .select('*')
        .eq('is_active', true)
        .eq('obrigatorio', true)
        .or(`aplica_em.eq.TODOS,aplica_em.ilike.%${tipoValvula}%`);

      atributos?.forEach(attr => {
        if (!valores[attr.codigo] && attr.codigo !== 'tipo_valvula') {
          novosErros[attr.codigo] = `${attr.nome} é obrigatório`;
        }
      });

      // 2. Buscar e aplicar regras de negócio
      const { data: regras } = await supabase
        .from('regras_validacao')
        .select('*')
        .eq('ativo', true)
        .or(`tipo_valvula.is.null,tipo_valvula.eq.${tipoValvula}`)
        .order('prioridade', { ascending: false });

      (regras as Regra[] | null)?.forEach(regra => {
        const valorCampo = valores[regra.se_atributo];

        if (valorCampo === regra.se_valor || 
            (regra.se_valor === 'Sim' && valorCampo === true) ||
            (regra.se_valor === 'Não' && valorCampo === false)) {
          
          const valorAlvo = valores[regra.entao_atributo];
          const valoresPermitidos = regra.valores_permitidos?.split(';').map(v => v.trim());

          switch (regra.acao) {
            case 'mostrar':
              novosCamposAfetados.push({
                campo: regra.entao_atributo,
                acao: 'mostrar',
                valoresPermitidos
              });
              break;
            
            case 'ocultar':
              novosCamposAfetados.push({
                campo: regra.entao_atributo,
                acao: 'ocultar'
              });
              break;
            
            case 'bloquear':
              if (valoresPermitidos && valorAlvo && !valoresPermitidos.includes(valorAlvo)) {
                novosErros[regra.entao_atributo] = regra.mensagem_erro || 
                  `Valor "${valorAlvo}" não permitido. Opções: ${valoresPermitidos.join(', ')}`;
              }
              novosCamposAfetados.push({
                campo: regra.entao_atributo,
                acao: 'bloquear',
                valoresPermitidos
              });
              break;
            
            case 'obrigar':
              if (!valorAlvo) {
                novosErros[regra.entao_atributo] = regra.mensagem_erro || 
                  `Campo obrigatório quando ${regra.se_atributo} = ${regra.se_valor}`;
              }
              novosCamposAfetados.push({
                campo: regra.entao_atributo,
                acao: 'obrigar'
              });
              break;
            
            case 'sugerir':
              if (regra.valor_sugerido && !valorAlvo) {
                novasSugestoes[regra.entao_atributo] = {
                  valor: regra.valor_sugerido,
                  mensagem: regra.mensagem_aviso || `Sugestão: ${regra.valor_sugerido}`
                };
              }
              break;
            
            case 'validar':
              if (valoresPermitidos && valorAlvo && !valoresPermitidos.includes(valorAlvo)) {
                novosErros[regra.entao_atributo] = regra.mensagem_erro || 
                  `Valor inválido para ${regra.entao_atributo}`;
              }
              break;
          }

          // Avisos
          if (regra.mensagem_aviso && !novosErros[regra.entao_atributo]) {
            novosAvisos[regra.entao_atributo] = regra.mensagem_aviso;
          }
        }
      });

      // 3. Validar combinações específicas de material x serviço
      await validarCombinacoesMaterial(valores, novosErros, novosAvisos);

      // 4. Gerar sugestões automáticas baseadas no serviço
      if (valores.servico) {
        const { data: sugestoesDB } = await supabase
          .from('sugestoes_material')
          .select('*')
          .eq('servico', valores.servico)
          .eq('is_active', true)
          .order('prioridade', { ascending: false });

        (sugestoesDB as Sugestao[] | null)?.forEach(sug => {
          if (!valores[sug.atributo_codigo] && !novasSugestoes[sug.atributo_codigo]) {
            novasSugestoes[sug.atributo_codigo] = {
              valor: sug.valor_sugerido,
              mensagem: sug.mensagem || `Sugestão para ${valores.servico}: ${sug.valor_sugerido}`
            };
          }
        });
      }

    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setErros(novosErros);
      setAvisos(novosAvisos);
      setSugestoes(novasSugestoes);
      setCamposAfetados(novosCamposAfetados);
      setIsValidating(false);
    }
  }, [tipoValvula, valores]);

  const validarCombinacoesMaterial = async (
    valores: Record<string, any>,
    erros: Record<string, string>,
    avisos: Record<string, string>
  ) => {
    // Validação NACE
    if (valores.nace_compliant === true || valores.sour_service === 'Sim') {
      const materiaisNaoNACE = ['ASTM A216 WCB', 'ASTM A105', 'ASTM A106'];
      if (materiaisNaoNACE.includes(valores.material_corpo)) {
        erros.material_corpo = 'Material não qualificado para serviço NACE/Sour. Use Inox ou Duplex.';
      }
    }

    // Validação Fire Safe + PTFE
    if (valores.fire_safe === 'Sim' && valores.material_sede === 'PTFE') {
      avisos.material_sede = 'PTFE pode não atender requisitos fire safe completos. Considere RPTFE ou Metal.';
    }

    // Validação Água do mar
    if (valores.servico === 'Água do mar' || valores.fluido?.toLowerCase().includes('água do mar')) {
      const materiaisApropriados = ['ASTM A995 4A', 'ASTM A995 5A', 'ASTM A995 6A', 'ASTM A351 CF8M'];
      if (valores.material_corpo && !materiaisApropriados.some(m => valores.material_corpo.includes(m))) {
        avisos.material_corpo = 'Para água do mar, recomenda-se material Duplex ou Inox 316.';
      }
    }

    // Validação alta temperatura
    if (valores.temperatura_operacao && Number(valores.temperatura_operacao) > 200) {
      if (valores.material_sede === 'PTFE' || valores.material_sede === 'RPTFE') {
        erros.material_sede = 'PTFE não recomendado para temperaturas acima de 200°C. Use PEEK ou Metal.';
      }
    }

    // Validação H2S
    if (valores.fluido?.toLowerCase().includes('h2s') || valores.sour_service === 'Sim') {
      if (!valores.nace_compliant) {
        avisos.nace_compliant = 'Fluido contém H2S. Conformidade NACE MR0175 é recomendada.';
      }
    }
  };

  const validarCampoIndividual = useCallback(async (
    campo: string, 
    valor: any, 
    valoresAtuais: Record<string, any>
  ): Promise<{ erros: string[]; sugestao?: string }> => {
    if (!tipoValvula) return { erros: [] };

    const resultado = { erros: [] as string[], sugestao: undefined as string | undefined };

    try {
      // Buscar regras para este campo
      const { data: regras } = await supabase
        .from('regras_validacao')
        .select('*')
        .eq('ativo', true)
        .eq('entao_atributo', campo)
        .or(`tipo_valvula.is.null,tipo_valvula.eq.${tipoValvula}`);

      (regras as Regra[] | null)?.forEach(regra => {
        const valorCondição = valoresAtuais[regra.se_atributo];
        
        if (valorCondição === regra.se_valor) {
          const valoresPermitidos = regra.valores_permitidos?.split(';').map(v => v.trim());
          
          if (valoresPermitidos && valor && !valoresPermitidos.includes(valor)) {
            resultado.erros.push(regra.mensagem_erro || 'Valor não permitido');
          }

          if (regra.valor_sugerido) {
            resultado.sugestao = regra.valor_sugerido;
          }
        }
      });

    } catch (error) {
      console.error('Erro validando campo:', error);
    }

    return resultado;
  }, [tipoValvula]);

  const aplicarSugestao = useCallback((campo: string) => {
    const sugestao = sugestoes[campo];
    if (sugestao) {
      return sugestao.valor;
    }
    return null;
  }, [sugestoes]);

  const getCampoVisibilidade = useCallback((campo: string): 'visivel' | 'oculto' | 'bloqueado' => {
    const afetado = camposAfetados.find(c => c.campo === campo);
    if (!afetado) return 'visivel';
    
    switch (afetado.acao) {
      case 'ocultar': return 'oculto';
      case 'bloquear': return 'bloqueado';
      default: return 'visivel';
    }
  }, [camposAfetados]);

  const getValoresPermitidos = useCallback((campo: string): string[] | null => {
    const afetado = camposAfetados.find(c => c.campo === campo && c.valoresPermitidos);
    return afetado?.valoresPermitidos || null;
  }, [camposAfetados]);

  return {
    erros,
    avisos,
    sugestoes,
    camposAfetados,
    isValid: Object.keys(erros).length === 0,
    isValidating,
    validarCampoIndividual,
    aplicarSugestao,
    getCampoVisibilidade,
    getValoresPermitidos,
    revalidar: validarTudo
  };
};
