-- ===========================================
-- IMEX CONFIGURADOR - SISTEMA DINÂMICO DE ATRIBUTOS
-- ===========================================

-- Tabela: tipos_valvula (lista de tipos de válvulas disponíveis)
CREATE TABLE IF NOT EXISTS public.tipos_valvula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL UNIQUE,
  icone VARCHAR,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: atributos (BASE_ATRIBUTOS - definição de campos dinâmicos)
CREATE TABLE IF NOT EXISTS public.atributos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo VARCHAR NOT NULL,
  nome VARCHAR NOT NULL,
  codigo VARCHAR NOT NULL UNIQUE,
  tipo VARCHAR NOT NULL CHECK (tipo IN ('lista', 'texto', 'numero', 'simnao', 'multiselect')),
  unidade VARCHAR,
  obrigatorio BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  aplica_em TEXT DEFAULT 'TODOS',
  norma_referencia VARCHAR,
  observacoes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: opcoes_atributo (BASE_DOMINIOS - valores permitidos para cada atributo)
CREATE TABLE IF NOT EXISTS public.opcoes_atributo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  atributo_codigo VARCHAR NOT NULL REFERENCES public.atributos(codigo) ON DELETE CASCADE,
  valor VARCHAR NOT NULL,
  aplica_em TEXT DEFAULT 'TODOS',
  codigo_interno VARCHAR,
  condicao TEXT,
  fonte VARCHAR,
  ordem INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: regras_validacao (BASE_REGRAS - regras de validação dinâmicas)
CREATE TABLE IF NOT EXISTS public.regras_validacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_valvula VARCHAR,
  se_atributo VARCHAR NOT NULL,
  se_valor VARCHAR NOT NULL,
  entao_atributo VARCHAR NOT NULL,
  acao VARCHAR NOT NULL CHECK (acao IN ('mostrar', 'ocultar', 'habilitar', 'bloquear', 'obrigar', 'sugerir', 'validar')),
  valores_permitidos TEXT,
  valor_sugerido VARCHAR,
  mensagem_erro TEXT,
  mensagem_aviso TEXT,
  prioridade INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: configuracoes_salvas (configurações de válvulas salvas)
CREATE TABLE IF NOT EXISTS public.configuracoes_salvas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_config VARCHAR NOT NULL UNIQUE,
  tag_cliente VARCHAR,
  tipo_valvula VARCHAR NOT NULL,
  servico VARCHAR,
  dados_json JSONB NOT NULL DEFAULT '{}',
  resumo_texto TEXT,
  status VARCHAR DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'validado', 'enviado', 'aprovado')),
  usuario_id UUID REFERENCES auth.users(id),
  aprovado_por UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: sugestoes_material (sugestões automáticas baseadas em serviço)
CREATE TABLE IF NOT EXISTS public.sugestoes_material (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servico VARCHAR NOT NULL,
  atributo_codigo VARCHAR NOT NULL,
  valor_sugerido VARCHAR NOT NULL,
  mensagem TEXT,
  prioridade INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: historico_alteracoes (log de alterações em configurações)
CREATE TABLE IF NOT EXISTS public.historico_alteracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  configuracao_id UUID REFERENCES public.configuracoes_salvas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  campo_alterado VARCHAR NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.tipos_valvula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atributos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_atributo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_validacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_salvas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_alteracoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: tipos_valvula (public read)
CREATE POLICY "Anyone can view tipos_valvula" ON public.tipos_valvula
  FOR SELECT USING (true);

CREATE POLICY "Engineers can manage tipos_valvula" ON public.tipos_valvula
  FOR ALL USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: atributos (public read)
CREATE POLICY "Anyone can view atributos" ON public.atributos
  FOR SELECT USING (true);

CREATE POLICY "Engineers can manage atributos" ON public.atributos
  FOR ALL USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: opcoes_atributo (public read)
CREATE POLICY "Anyone can view opcoes_atributo" ON public.opcoes_atributo
  FOR SELECT USING (true);

CREATE POLICY "Engineers can manage opcoes_atributo" ON public.opcoes_atributo
  FOR ALL USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: regras_validacao (public read)
CREATE POLICY "Anyone can view regras_validacao" ON public.regras_validacao
  FOR SELECT USING (true);

CREATE POLICY "Engineers can manage regras_validacao" ON public.regras_validacao
  FOR ALL USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: configuracoes_salvas
CREATE POLICY "Users can view own configuracoes" ON public.configuracoes_salvas
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can create configuracoes" ON public.configuracoes_salvas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update own configuracoes" ON public.configuracoes_salvas
  FOR UPDATE USING (usuario_id = auth.uid() AND status = 'rascunho');

CREATE POLICY "Engineers can view all configuracoes" ON public.configuracoes_salvas
  FOR SELECT USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Engineers can update all configuracoes" ON public.configuracoes_salvas
  FOR UPDATE USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: sugestoes_material (public read)
CREATE POLICY "Anyone can view sugestoes_material" ON public.sugestoes_material
  FOR SELECT USING (true);

CREATE POLICY "Engineers can manage sugestoes_material" ON public.sugestoes_material
  FOR ALL USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

-- RLS Policies: historico_alteracoes
CREATE POLICY "Users can view own historico" ON public.historico_alteracoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM configuracoes_salvas c 
      WHERE c.id = historico_alteracoes.configuracao_id 
      AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can view all historico" ON public.historico_alteracoes
  FOR SELECT USING (has_role(auth.uid(), 'ENGINEER_CHIEF') OR has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "System can insert historico" ON public.historico_alteracoes
  FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_tipos_valvula_updated_at
  BEFORE UPDATE ON public.tipos_valvula
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atributos_updated_at
  BEFORE UPDATE ON public.atributos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_salvas_updated_at
  BEFORE UPDATE ON public.configuracoes_salvas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_atributos_grupo ON public.atributos(grupo);
CREATE INDEX idx_atributos_aplica_em ON public.atributos(aplica_em);
CREATE INDEX idx_opcoes_atributo_codigo ON public.opcoes_atributo(atributo_codigo);
CREATE INDEX idx_opcoes_atributo_aplica_em ON public.opcoes_atributo(aplica_em);
CREATE INDEX idx_regras_validacao_tipo ON public.regras_validacao(tipo_valvula);
CREATE INDEX idx_regras_validacao_atributo ON public.regras_validacao(se_atributo);
CREATE INDEX idx_configuracoes_usuario ON public.configuracoes_salvas(usuario_id);
CREATE INDEX idx_configuracoes_status ON public.configuracoes_salvas(status);
CREATE INDEX idx_sugestoes_servico ON public.sugestoes_material(servico);