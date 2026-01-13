import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Atributo {
  id: string;
  grupo: string;
  nome: string;
  codigo: string;
  tipo: 'lista' | 'texto' | 'numero' | 'simnao' | 'multiselect';
  unidade: string | null;
  obrigatorio: boolean;
  ordem: number;
  aplica_em: string;
  norma_referencia: string | null;
  observacoes: string | null;
  opcoes?: string[];
}

interface GrupoAtributos {
  nome: string;
  campos: Atributo[];
}

export const useAtributosDinamicos = (tipoValvula: string | null) => {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [grupos, setGrupos] = useState<GrupoAtributos[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarAtributos = useCallback(async () => {
    if (!tipoValvula) {
      setAtributos([]);
      setGrupos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar atributos aplicáveis ao tipo de válvula
      const { data: atributosData, error: atributosError } = await supabase
        .from('atributos')
        .select('*')
        .eq('is_active', true)
        .or(`aplica_em.eq.TODOS,aplica_em.ilike.%${tipoValvula}%`)
        .order('ordem', { ascending: true });

      if (atributosError) throw atributosError;

      // 2. Para cada atributo do tipo 'lista', buscar opções
      const atributosComOpcoes: Atributo[] = await Promise.all(
        (atributosData || []).map(async (attr) => {
          if (attr.tipo === 'lista' || attr.tipo === 'multiselect') {
            const { data: opcoes } = await supabase
              .from('opcoes_atributo')
              .select('valor')
              .eq('atributo_codigo', attr.codigo)
              .eq('is_active', true)
              .or(`aplica_em.eq.TODOS,aplica_em.ilike.%${tipoValvula}%`)
              .order('ordem', { ascending: true });

            return {
              ...attr,
              opcoes: opcoes?.map(o => o.valor) || []
            } as Atributo;
          }
          return attr as Atributo;
        })
      );

      setAtributos(atributosComOpcoes);

      // 3. Agrupar por grupo
      const gruposMap: Record<string, Atributo[]> = {};
      atributosComOpcoes.forEach(attr => {
        if (!gruposMap[attr.grupo]) {
          gruposMap[attr.grupo] = [];
        }
        gruposMap[attr.grupo].push(attr);
      });

      // Ordenar grupos
      const ordemGrupos = [
        'Identificação',
        'Normas',
        'Dimensão',
        'Pressão',
        'Materiais',
        'Acionamento',
        'Requisitos Especiais',
        'Outros'
      ];

      const gruposOrdenados = ordemGrupos
        .filter(g => gruposMap[g])
        .map(g => ({ nome: g, campos: gruposMap[g] }));

      // Adicionar grupos não listados na ordem padrão
      Object.keys(gruposMap).forEach(g => {
        if (!ordemGrupos.includes(g)) {
          gruposOrdenados.push({ nome: g, campos: gruposMap[g] });
        }
      });

      setGrupos(gruposOrdenados);

    } catch (err) {
      console.error('Erro ao carregar atributos:', err);
      setError('Falha ao carregar campos do formulário');
    } finally {
      setIsLoading(false);
    }
  }, [tipoValvula]);

  useEffect(() => {
    carregarAtributos();
  }, [carregarAtributos]);

  const buscarOpcoesFiltradasPorValor = useCallback(async (
    codigoAtributo: string,
    valoresPermitidos: string[] | null
  ): Promise<string[]> => {
    if (!tipoValvula) return [];

    const { data } = await supabase
      .from('opcoes_atributo')
      .select('valor')
      .eq('atributo_codigo', codigoAtributo)
      .eq('is_active', true)
      .or(`aplica_em.eq.TODOS,aplica_em.ilike.%${tipoValvula}%`)
      .order('ordem', { ascending: true });

    let opcoes = data?.map(o => o.valor) || [];

    // Filtrar se houver valores permitidos
    if (valoresPermitidos && valoresPermitidos.length > 0) {
      opcoes = opcoes.filter(o => valoresPermitidos.includes(o));
    }

    return opcoes;
  }, [tipoValvula]);

  return {
    atributos,
    grupos,
    isLoading,
    error,
    recarregar: carregarAtributos,
    buscarOpcoesFiltradasPorValor
  };
};
