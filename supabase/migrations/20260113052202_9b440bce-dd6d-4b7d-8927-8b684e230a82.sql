-- ============================================
-- FASE 0: FUNDAÇÃO NORMA-SUPREMA
-- ============================================

-- Enum para status do catálogo de regras
CREATE TYPE public.catalog_status AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');

-- Enum para tipos de norma
CREATE TYPE public.norm_type AS ENUM ('CONSTRUCTION', 'PERFORMANCE', 'MATERIAL', 'INTERFACE', 'SAFETY');

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('USER', 'ENGINEER_CHIEF', 'QA_MANAGER', 'ADMIN');

-- Enum para status de especificação
CREATE TYPE public.spec_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- Enum para tipos de decisão
CREATE TYPE public.decision_type AS ENUM ('NORM_SELECTION', 'MATERIAL_CHOICE', 'TEST_REQUIREMENT', 'CALCULATION', 'VALIDATION');

-- Enum para severidade de emergência
CREATE TYPE public.emergency_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Enum para ação do sistema
CREATE TYPE public.system_action AS ENUM ('BLOCK_CREATION', 'BLOCK_PUBLICATION', 'ENTER_EMERGENCY');

-- Enum para tipos de válvula
CREATE TYPE public.valve_type_enum AS ENUM ('ESFERA', 'GLOBO', 'GAVETA', 'RETENCAO', 'BORBOLETA', 'CONTROLE');

-- Enum para tipos de serviço
CREATE TYPE public.service_type AS ENUM ('PIPELINE', 'PROCESS', 'WELLHEAD', 'GENERAL');

-- ============================================
-- Tabela de Controle Central: RULE_CATALOG_VERSION
-- ============================================
CREATE TABLE public.rule_catalog_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) UNIQUE NOT NULL,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    engineer_chief_id UUID,
    status catalog_status DEFAULT 'DRAFT',
    coverage_report JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Normas com Hierarquia
-- ============================================
CREATE TABLE public.standards_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.standards_hierarchy(id),
    norm_code VARCHAR(50) UNIQUE NOT NULL,
    norm_title VARCHAR(200) NOT NULL,
    norm_type norm_type NOT NULL,
    applies_to_valve_types JSONB,
    applies_to_service_types JSONB,
    is_mandatory BOOLEAN DEFAULT FALSE,
    rule_catalog_version VARCHAR(20) REFERENCES public.rule_catalog_version(version),
    effective_date DATE,
    supersedes_norm_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Domínios Controlados por Norma
-- ============================================
CREATE TABLE public.norm_controlled_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norm_code VARCHAR(50) REFERENCES public.standards_hierarchy(norm_code),
    attribute_key VARCHAR(50) NOT NULL,
    allowed_values JSONB NOT NULL,
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    step DECIMAL(10,2),
    unit VARCHAR(20),
    rule_catalog_version VARCHAR(20) REFERENCES public.rule_catalog_version(version),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(norm_code, attribute_key)
);

-- ============================================
-- Tabela de Compatibilidade de Materiais
-- ============================================
CREATE TABLE public.material_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norm_code VARCHAR(50) REFERENCES public.standards_hierarchy(norm_code),
    material_type VARCHAR(50) NOT NULL,
    material_code VARCHAR(100) NOT NULL,
    material_name VARCHAR(200) NOT NULL,
    nace_qualified BOOLEAN DEFAULT FALSE,
    nace_temperature_min DECIMAL(10,2),
    nace_hardness_max DECIMAL(10,2),
    compatible_with JSONB,
    fire_test_compatible BOOLEAN DEFAULT FALSE,
    low_emission_compatible BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Compatibilidade Fire Test
-- ============================================
CREATE TABLE public.fire_test_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norm_code VARCHAR(50),
    valve_type valve_type_enum,
    allowed_body_materials JSONB,
    allowed_seat_materials JSONB,
    allowed_seal_materials JSONB,
    max_pressure_rating DECIMAL(10,2),
    temperature_range JSONB,
    requires_third_party_cert BOOLEAN DEFAULT TRUE,
    certified_labs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Requisitos SIL
-- ============================================
CREATE TABLE public.sil_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_type VARCHAR(100),
    required_sil_level VARCHAR(10),
    hardware_fault_tolerance INTEGER,
    safe_failure_fraction DECIMAL(5,4),
    proof_test_interval_months INTEGER,
    valve_requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Perfis de Usuário
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(200),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Roles de Usuário (SEPARADA para segurança)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- ============================================
-- Tabela de Especificações
-- ============================================
CREATE TABLE public.specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_code VARCHAR(50) UNIQUE NOT NULL,
    imex_code VARCHAR(50),
    status spec_status DEFAULT 'DRAFT',
    
    -- Dados básicos
    valve_type valve_type_enum,
    service_type service_type,
    construction_standard VARCHAR(50),
    
    -- Configuração completa
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Conformidade
    conformity_score DECIMAL(5,2) DEFAULT 0,
    conformity_checks JSONB DEFAULT '[]',
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Tabela de Log de Decisões Norma-Suprema
-- ============================================
CREATE TABLE public.norm_decision_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID REFERENCES public.specifications(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    decision_type decision_type NOT NULL,
    parameter_name VARCHAR(100),
    selected_value VARCHAR(200),
    
    applicable_norms JSONB,
    rejected_norms JSONB,
    rejection_reason TEXT,
    
    user_id UUID REFERENCES auth.users(id),
    system_rule_id VARCHAR(50),
    
    calculation_inputs JSONB,
    calculation_results JSONB
);

-- ============================================
-- Tabela de Procedimentos de Emergência
-- ============================================
CREATE TABLE public.emergency_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    failure_type VARCHAR(50),
    severity emergency_severity,
    system_action system_action,
    notify_roles JSONB,
    notify_channels JSONB,
    resolution_steps JSONB,
    estimated_resolution_time INTEGER,
    backup_procedure TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Health Check do Sistema
-- ============================================
CREATE TABLE public.system_health_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_healthy BOOLEAN NOT NULL,
    active_catalog_count INTEGER,
    norm_coverage_percent DECIMAL(5,2),
    domain_coverage_percent DECIMAL(5,2),
    issues JSONB DEFAULT '[]'
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.rule_catalog_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standards_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.norm_controlled_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_test_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sil_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.norm_decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTION for role checking
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies (only admins/engineers can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Engineers can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- Rule catalog version (public read, engineers can modify)
CREATE POLICY "Anyone can view catalog versions" ON public.rule_catalog_version
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Engineers can manage catalog" ON public.rule_catalog_version
    FOR ALL USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

-- Standards hierarchy (public read)
CREATE POLICY "Anyone can view standards" ON public.standards_hierarchy
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Engineers can manage standards" ON public.standards_hierarchy
    FOR ALL USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

-- Norm controlled domains (public read)
CREATE POLICY "Anyone can view domains" ON public.norm_controlled_domains
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Engineers can manage domains" ON public.norm_controlled_domains
    FOR ALL USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

-- Material compatibility (public read)
CREATE POLICY "Anyone can view materials" ON public.material_compatibility
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Engineers can manage materials" ON public.material_compatibility
    FOR ALL USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

-- Fire test compatibility (public read)
CREATE POLICY "Anyone can view fire test data" ON public.fire_test_compatibility
    FOR SELECT TO authenticated USING (true);

-- SIL requirements (public read)
CREATE POLICY "Anyone can view SIL requirements" ON public.sil_requirements
    FOR SELECT TO authenticated USING (true);

-- Specifications policies
CREATE POLICY "Users can view own specs" ON public.specifications
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Engineers can view all specs" ON public.specifications
    FOR SELECT USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can create specs" ON public.specifications
    FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own draft specs" ON public.specifications
    FOR UPDATE USING (created_by = auth.uid() AND status = 'DRAFT');

CREATE POLICY "Engineers can update any spec" ON public.specifications
    FOR UPDATE USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

-- Norm decision log (linked to spec ownership)
CREATE POLICY "Users can view own spec logs" ON public.norm_decision_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.specifications s 
            WHERE s.id = spec_id AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Engineers can view all logs" ON public.norm_decision_log
    FOR SELECT USING (public.has_role(auth.uid(), 'ENGINEER_CHIEF') OR public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Users can insert logs for own specs" ON public.norm_decision_log
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.specifications s 
            WHERE s.id = spec_id AND s.created_by = auth.uid()
        )
    );

-- Emergency procedures (public read)
CREATE POLICY "Anyone can view emergency procedures" ON public.emergency_procedures
    FOR SELECT TO authenticated USING (true);

-- System health log (public read)
CREATE POLICY "Anyone can view health log" ON public.system_health_log
    FOR SELECT TO authenticated USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    -- Assign default USER role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'USER');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_specifications_updated_at
    BEFORE UPDATE ON public.specifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rule_catalog_updated_at
    BEFORE UPDATE ON public.rule_catalog_version
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INITIAL DATA: API 6D MVP
-- ============================================

-- Insert initial catalog version
INSERT INTO public.rule_catalog_version (version, status, coverage_report)
VALUES ('v1.0.0-API6D', 'ACTIVE', '{"valves_covered": ["ESFERA"], "services_covered": ["PIPELINE", "PROCESS"]}');

-- Insert API 6D standard
INSERT INTO public.standards_hierarchy (norm_code, norm_title, norm_type, applies_to_valve_types, applies_to_service_types, is_mandatory, rule_catalog_version, is_active)
VALUES 
    ('API_6D_2022', 'API 6D - Pipeline and Piping Valves', 'CONSTRUCTION', '["ESFERA", "GAVETA", "GLOBO", "RETENCAO"]', '["PIPELINE", "PROCESS"]', true, 'v1.0.0-API6D', true),
    ('ISO_14313', 'ISO 14313 - Pipeline valves', 'CONSTRUCTION', '["ESFERA", "GAVETA"]', '["PIPELINE"]', false, 'v1.0.0-API6D', true),
    ('API_607_2016', 'API 607 - Fire Test for Quarter-turn Valves', 'PERFORMANCE', '["ESFERA", "BORBOLETA"]', '["PIPELINE", "PROCESS", "WELLHEAD"]', false, 'v1.0.0-API6D', true),
    ('API_6FA', 'API 6FA - Fire Test for Valves', 'PERFORMANCE', '["ESFERA", "GAVETA", "GLOBO"]', '["PIPELINE", "PROCESS"]', false, 'v1.0.0-API6D', true),
    ('ISO_15848_1', 'ISO 15848-1 - Fugitive Emissions', 'PERFORMANCE', '["ESFERA", "GAVETA", "GLOBO", "BORBOLETA"]', '["PIPELINE", "PROCESS", "WELLHEAD"]', false, 'v1.0.0-API6D', true),
    ('NACE_MR0175', 'NACE MR0175 - Sour Service', 'MATERIAL', '["ESFERA", "GAVETA", "GLOBO", "RETENCAO", "BORBOLETA", "CONTROLE"]', '["PIPELINE", "PROCESS", "WELLHEAD", "GENERAL"]', false, 'v1.0.0-API6D', true);

-- Insert controlled domains for API 6D
INSERT INTO public.norm_controlled_domains (norm_code, attribute_key, allowed_values, min_value, max_value, unit, rule_catalog_version)
VALUES
    ('API_6D_2022', 'DIAMETRO_NPS', '["2", "3", "4", "6", "8", "10", "12", "14", "16", "18", "20", "24", "30", "36"]', 2, 36, 'inches', 'v1.0.0-API6D'),
    ('API_6D_2022', 'CLASSE_PRESSAO', '["150", "300", "600", "900", "1500", "2500"]', 150, 2500, 'lb', 'v1.0.0-API6D'),
    ('API_6D_2022', 'TIPO_EXTREMIDADE', '["FLANGEADO", "BW", "SW"]', null, null, null, 'v1.0.0-API6D'),
    ('API_6D_2022', 'FACE_FLANGE', '["RF", "RTJ"]', null, null, null, 'v1.0.0-API6D');

-- Insert material compatibility data
INSERT INTO public.material_compatibility (norm_code, material_type, material_code, material_name, nace_qualified, nace_temperature_min, nace_hardness_max, compatible_with, fire_test_compatible, low_emission_compatible)
VALUES
    ('API_6D_2022', 'CORPO', 'A216_WCB', 'ASTM A216 WCB - Aço Carbono', false, null, null, '["A182_F6A", "A182_F316"]', true, true),
    ('API_6D_2022', 'CORPO', 'A352_LCC', 'ASTM A352 LCC - Baixa Temperatura', true, -46, 22, '["A182_F6A", "A182_F316", "A351_CF8M"]', true, true),
    ('API_6D_2022', 'CORPO', 'A351_CF8M', 'ASTM A351 CF8M - Inox 316', true, -196, 22, '["A182_F316", "STELLITE_6"]', true, true),
    ('API_6D_2022', 'CORPO', 'A995_4A', 'ASTM A995 4A - Duplex', true, -46, 28, '["A182_F51", "STELLITE_6"]', true, true),
    ('API_6D_2022', 'CORPO', 'A995_5A', 'ASTM A995 5A - Super Duplex', true, -46, 32, '["A182_F55", "STELLITE_6"]', true, true),
    ('API_6D_2022', 'OBTURADOR', 'A182_F6A', 'ASTM A182 F6A - 13Cr', true, -29, 22, '["STELLITE_6", "ENP"]', true, true),
    ('API_6D_2022', 'OBTURADOR', 'A182_F316', 'ASTM A182 F316 - Inox 316', true, -196, 22, '["STELLITE_6", "A351_CF8M"]', true, true),
    ('API_6D_2022', 'SEDE', 'STELLITE_6', 'Stellite 6', true, -46, 40, '["A182_F6A", "A182_F316", "A182_F51"]', true, true),
    ('API_6D_2022', 'SEDE', 'ENP', 'ENP - Electroless Nickel Plating', true, -29, 50, '["A182_F6A"]', false, true),
    ('API_6D_2022', 'SEDE', 'PTFE', 'PTFE - Politetrafluoretileno', false, null, null, '["A182_F316"]', false, true),
    ('API_6D_2022', 'HASTE', 'A182_F6A', 'ASTM A182 F6A - 13Cr', true, -29, 22, null, true, true),
    ('API_6D_2022', 'HASTE', 'A182_F316', 'ASTM A182 F316 - Inox 316', true, -196, 22, null, true, true),
    ('API_6D_2022', 'HASTE', 'INCONEL_625', 'Inconel 625', true, -196, 35, null, true, true);

-- Insert fire test compatibility
INSERT INTO public.fire_test_compatibility (norm_code, valve_type, allowed_body_materials, allowed_seat_materials, allowed_seal_materials, max_pressure_rating, temperature_range, requires_third_party_cert, certified_labs)
VALUES
    ('API_607_2016', 'ESFERA', '["A216_WCB", "A352_LCC", "A351_CF8M", "A995_4A", "A995_5A"]', '["STELLITE_6", "ENP"]', '["GRAPHITE", "FLEXITALLIC"]', 2500, '{"min": -46, "max": 1000}', true, '["DNV", "ABS", "LR", "BV"]'),
    ('API_6FA', 'ESFERA', '["A216_WCB", "A352_LCC", "A351_CF8M"]', '["STELLITE_6"]', '["GRAPHITE"]', 1500, '{"min": -29, "max": 800}', true, '["DNV", "ABS"]');

-- Insert SIL requirements
INSERT INTO public.sil_requirements (application_type, required_sil_level, hardware_fault_tolerance, safe_failure_fraction, proof_test_interval_months, valve_requirements)
VALUES
    ('ESD', 'SIL2', 1, 0.90, 12, '{"stroke_time": "< 2s", "partial_stroke_test": "required", "position_verification": "required"}'),
    ('HIPPS', 'SIL3', 1, 0.99, 6, '{"stroke_time": "< 1s", "partial_stroke_test": "required", "position_verification": "required", "redundancy": "required"}'),
    ('PSV', 'SIL1', 0, 0.60, 24, '{"stroke_time": "< 5s", "partial_stroke_test": "optional"}');