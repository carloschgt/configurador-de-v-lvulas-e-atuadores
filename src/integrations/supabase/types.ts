export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      atributos: {
        Row: {
          aplica_em: string | null
          codigo: string
          created_at: string | null
          grupo: string
          id: string
          is_active: boolean | null
          nome: string
          norma_referencia: string | null
          obrigatorio: boolean | null
          observacoes: string | null
          ordem: number | null
          tipo: string
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          aplica_em?: string | null
          codigo: string
          created_at?: string | null
          grupo: string
          id?: string
          is_active?: boolean | null
          nome: string
          norma_referencia?: string | null
          obrigatorio?: boolean | null
          observacoes?: string | null
          ordem?: number | null
          tipo: string
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          aplica_em?: string | null
          codigo?: string
          created_at?: string | null
          grupo?: string
          id?: string
          is_active?: boolean | null
          nome?: string
          norma_referencia?: string | null
          obrigatorio?: boolean | null
          observacoes?: string | null
          ordem?: number | null
          tipo?: string
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes_salvas: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          codigo_config: string
          created_at: string | null
          dados_json: Json
          id: string
          resumo_texto: string | null
          servico: string | null
          status: string | null
          tag_cliente: string | null
          tipo_valvula: string
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo_config: string
          created_at?: string | null
          dados_json?: Json
          id?: string
          resumo_texto?: string | null
          servico?: string | null
          status?: string | null
          tag_cliente?: string | null
          tipo_valvula: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo_config?: string
          created_at?: string | null
          dados_json?: Json
          id?: string
          resumo_texto?: string | null
          servico?: string | null
          status?: string | null
          tag_cliente?: string | null
          tipo_valvula?: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      emergency_procedures: {
        Row: {
          backup_procedure: string | null
          created_at: string | null
          estimated_resolution_time: number | null
          failure_type: string | null
          id: string
          notify_channels: Json | null
          notify_roles: Json | null
          resolution_steps: Json | null
          severity: Database["public"]["Enums"]["emergency_severity"] | null
          system_action: Database["public"]["Enums"]["system_action"] | null
        }
        Insert: {
          backup_procedure?: string | null
          created_at?: string | null
          estimated_resolution_time?: number | null
          failure_type?: string | null
          id?: string
          notify_channels?: Json | null
          notify_roles?: Json | null
          resolution_steps?: Json | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          system_action?: Database["public"]["Enums"]["system_action"] | null
        }
        Update: {
          backup_procedure?: string | null
          created_at?: string | null
          estimated_resolution_time?: number | null
          failure_type?: string | null
          id?: string
          notify_channels?: Json | null
          notify_roles?: Json | null
          resolution_steps?: Json | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          system_action?: Database["public"]["Enums"]["system_action"] | null
        }
        Relationships: []
      }
      fire_test_compatibility: {
        Row: {
          allowed_body_materials: Json | null
          allowed_seal_materials: Json | null
          allowed_seat_materials: Json | null
          certified_labs: Json | null
          created_at: string | null
          id: string
          max_pressure_rating: number | null
          norm_code: string | null
          requires_third_party_cert: boolean | null
          temperature_range: Json | null
          valve_type: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Insert: {
          allowed_body_materials?: Json | null
          allowed_seal_materials?: Json | null
          allowed_seat_materials?: Json | null
          certified_labs?: Json | null
          created_at?: string | null
          id?: string
          max_pressure_rating?: number | null
          norm_code?: string | null
          requires_third_party_cert?: boolean | null
          temperature_range?: Json | null
          valve_type?: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Update: {
          allowed_body_materials?: Json | null
          allowed_seal_materials?: Json | null
          allowed_seat_materials?: Json | null
          certified_labs?: Json | null
          created_at?: string | null
          id?: string
          max_pressure_rating?: number | null
          norm_code?: string | null
          requires_third_party_cert?: boolean | null
          temperature_range?: Json | null
          valve_type?: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Relationships: []
      }
      historico_alteracoes: {
        Row: {
          campo_alterado: string
          configuracao_id: string | null
          created_at: string | null
          id: string
          usuario_id: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo_alterado: string
          configuracao_id?: string | null
          created_at?: string | null
          id?: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo_alterado?: string
          configuracao_id?: string | null
          created_at?: string | null
          id?: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_alteracoes_configuracao_id_fkey"
            columns: ["configuracao_id"]
            isOneToOne: false
            referencedRelation: "configuracoes_salvas"
            referencedColumns: ["id"]
          },
        ]
      }
      material_compatibility: {
        Row: {
          compatible_with: Json | null
          created_at: string | null
          fire_test_compatible: boolean | null
          id: string
          is_active: boolean | null
          low_emission_compatible: boolean | null
          material_code: string
          material_name: string
          material_type: string
          nace_hardness_max: number | null
          nace_qualified: boolean | null
          nace_temperature_min: number | null
          norm_code: string | null
        }
        Insert: {
          compatible_with?: Json | null
          created_at?: string | null
          fire_test_compatible?: boolean | null
          id?: string
          is_active?: boolean | null
          low_emission_compatible?: boolean | null
          material_code: string
          material_name: string
          material_type: string
          nace_hardness_max?: number | null
          nace_qualified?: boolean | null
          nace_temperature_min?: number | null
          norm_code?: string | null
        }
        Update: {
          compatible_with?: Json | null
          created_at?: string | null
          fire_test_compatible?: boolean | null
          id?: string
          is_active?: boolean | null
          low_emission_compatible?: boolean | null
          material_code?: string
          material_name?: string
          material_type?: string
          nace_hardness_max?: number | null
          nace_qualified?: boolean | null
          nace_temperature_min?: number | null
          norm_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_compatibility_norm_code_fkey"
            columns: ["norm_code"]
            isOneToOne: false
            referencedRelation: "standards_hierarchy"
            referencedColumns: ["norm_code"]
          },
        ]
      }
      norm_controlled_domains: {
        Row: {
          allowed_values: Json
          attribute_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_value: number | null
          min_value: number | null
          norm_code: string | null
          rule_catalog_version: string | null
          step: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_values: Json
          attribute_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          min_value?: number | null
          norm_code?: string | null
          rule_catalog_version?: string | null
          step?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_values?: Json
          attribute_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          min_value?: number | null
          norm_code?: string | null
          rule_catalog_version?: string | null
          step?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "norm_controlled_domains_norm_code_fkey"
            columns: ["norm_code"]
            isOneToOne: false
            referencedRelation: "standards_hierarchy"
            referencedColumns: ["norm_code"]
          },
          {
            foreignKeyName: "norm_controlled_domains_rule_catalog_version_fkey"
            columns: ["rule_catalog_version"]
            isOneToOne: false
            referencedRelation: "rule_catalog_version"
            referencedColumns: ["version"]
          },
        ]
      }
      norm_decision_log: {
        Row: {
          applicable_norms: Json | null
          calculation_inputs: Json | null
          calculation_results: Json | null
          decision_type: Database["public"]["Enums"]["decision_type"]
          id: string
          parameter_name: string | null
          rejected_norms: Json | null
          rejection_reason: string | null
          selected_value: string | null
          spec_id: string | null
          system_rule_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          applicable_norms?: Json | null
          calculation_inputs?: Json | null
          calculation_results?: Json | null
          decision_type: Database["public"]["Enums"]["decision_type"]
          id?: string
          parameter_name?: string | null
          rejected_norms?: Json | null
          rejection_reason?: string | null
          selected_value?: string | null
          spec_id?: string | null
          system_rule_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          applicable_norms?: Json | null
          calculation_inputs?: Json | null
          calculation_results?: Json | null
          decision_type?: Database["public"]["Enums"]["decision_type"]
          id?: string
          parameter_name?: string | null
          rejected_norms?: Json | null
          rejection_reason?: string | null
          selected_value?: string | null
          spec_id?: string | null
          system_rule_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "norm_decision_log_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "specifications"
            referencedColumns: ["id"]
          },
        ]
      }
      opcoes_atributo: {
        Row: {
          aplica_em: string | null
          atributo_codigo: string
          codigo_interno: string | null
          condicao: string | null
          created_at: string | null
          fonte: string | null
          id: string
          is_active: boolean | null
          ordem: number | null
          valor: string
        }
        Insert: {
          aplica_em?: string | null
          atributo_codigo: string
          codigo_interno?: string | null
          condicao?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          is_active?: boolean | null
          ordem?: number | null
          valor: string
        }
        Update: {
          aplica_em?: string | null
          atributo_codigo?: string
          codigo_interno?: string | null
          condicao?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          is_active?: boolean | null
          ordem?: number | null
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "opcoes_atributo_atributo_codigo_fkey"
            columns: ["atributo_codigo"]
            isOneToOne: false
            referencedRelation: "atributos"
            referencedColumns: ["codigo"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regras_validacao: {
        Row: {
          acao: string
          ativo: boolean | null
          created_at: string | null
          entao_atributo: string
          id: string
          mensagem_aviso: string | null
          mensagem_erro: string | null
          prioridade: number | null
          se_atributo: string
          se_valor: string
          tipo_valvula: string | null
          valor_sugerido: string | null
          valores_permitidos: string | null
        }
        Insert: {
          acao: string
          ativo?: boolean | null
          created_at?: string | null
          entao_atributo: string
          id?: string
          mensagem_aviso?: string | null
          mensagem_erro?: string | null
          prioridade?: number | null
          se_atributo: string
          se_valor: string
          tipo_valvula?: string | null
          valor_sugerido?: string | null
          valores_permitidos?: string | null
        }
        Update: {
          acao?: string
          ativo?: boolean | null
          created_at?: string | null
          entao_atributo?: string
          id?: string
          mensagem_aviso?: string | null
          mensagem_erro?: string | null
          prioridade?: number | null
          se_atributo?: string
          se_valor?: string
          tipo_valvula?: string | null
          valor_sugerido?: string | null
          valores_permitidos?: string | null
        }
        Relationships: []
      }
      rule_catalog_version: {
        Row: {
          coverage_report: Json | null
          created_at: string | null
          engineer_chief_id: string | null
          id: string
          release_date: string | null
          status: Database["public"]["Enums"]["catalog_status"] | null
          updated_at: string | null
          version: string
        }
        Insert: {
          coverage_report?: Json | null
          created_at?: string | null
          engineer_chief_id?: string | null
          id?: string
          release_date?: string | null
          status?: Database["public"]["Enums"]["catalog_status"] | null
          updated_at?: string | null
          version: string
        }
        Update: {
          coverage_report?: Json | null
          created_at?: string | null
          engineer_chief_id?: string | null
          id?: string
          release_date?: string | null
          status?: Database["public"]["Enums"]["catalog_status"] | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      sil_requirements: {
        Row: {
          application_type: string | null
          created_at: string | null
          hardware_fault_tolerance: number | null
          id: string
          proof_test_interval_months: number | null
          required_sil_level: string | null
          safe_failure_fraction: number | null
          valve_requirements: Json | null
        }
        Insert: {
          application_type?: string | null
          created_at?: string | null
          hardware_fault_tolerance?: number | null
          id?: string
          proof_test_interval_months?: number | null
          required_sil_level?: string | null
          safe_failure_fraction?: number | null
          valve_requirements?: Json | null
        }
        Update: {
          application_type?: string | null
          created_at?: string | null
          hardware_fault_tolerance?: number | null
          id?: string
          proof_test_interval_months?: number | null
          required_sil_level?: string | null
          safe_failure_fraction?: number | null
          valve_requirements?: Json | null
        }
        Relationships: []
      }
      specifications: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          configuration: Json
          conformity_checks: Json | null
          conformity_score: number | null
          construction_standard: string | null
          created_at: string | null
          created_by: string | null
          id: string
          imex_code: string | null
          published_at: string | null
          rejection_reason: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          spec_code: string
          status: Database["public"]["Enums"]["spec_status"] | null
          updated_at: string | null
          valve_type: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          configuration?: Json
          conformity_checks?: Json | null
          conformity_score?: number | null
          construction_standard?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          imex_code?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          spec_code: string
          status?: Database["public"]["Enums"]["spec_status"] | null
          updated_at?: string | null
          valve_type?: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          configuration?: Json
          conformity_checks?: Json | null
          conformity_score?: number | null
          construction_standard?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          imex_code?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          spec_code?: string
          status?: Database["public"]["Enums"]["spec_status"] | null
          updated_at?: string | null
          valve_type?: Database["public"]["Enums"]["valve_type_enum"] | null
        }
        Relationships: []
      }
      standards_hierarchy: {
        Row: {
          applies_to_service_types: Json | null
          applies_to_valve_types: Json | null
          created_at: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          norm_code: string
          norm_title: string
          norm_type: Database["public"]["Enums"]["norm_type"]
          parent_id: string | null
          rule_catalog_version: string | null
          supersedes_norm_code: string | null
          updated_at: string | null
        }
        Insert: {
          applies_to_service_types?: Json | null
          applies_to_valve_types?: Json | null
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          norm_code: string
          norm_title: string
          norm_type: Database["public"]["Enums"]["norm_type"]
          parent_id?: string | null
          rule_catalog_version?: string | null
          supersedes_norm_code?: string | null
          updated_at?: string | null
        }
        Update: {
          applies_to_service_types?: Json | null
          applies_to_valve_types?: Json | null
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          norm_code?: string
          norm_title?: string
          norm_type?: Database["public"]["Enums"]["norm_type"]
          parent_id?: string | null
          rule_catalog_version?: string | null
          supersedes_norm_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standards_hierarchy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "standards_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standards_hierarchy_rule_catalog_version_fkey"
            columns: ["rule_catalog_version"]
            isOneToOne: false
            referencedRelation: "rule_catalog_version"
            referencedColumns: ["version"]
          },
        ]
      }
      sugestoes_material: {
        Row: {
          atributo_codigo: string
          created_at: string | null
          id: string
          is_active: boolean | null
          mensagem: string | null
          prioridade: number | null
          servico: string
          valor_sugerido: string
        }
        Insert: {
          atributo_codigo: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mensagem?: string | null
          prioridade?: number | null
          servico: string
          valor_sugerido: string
        }
        Update: {
          atributo_codigo?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mensagem?: string | null
          prioridade?: number | null
          servico?: string
          valor_sugerido?: string
        }
        Relationships: []
      }
      system_health_log: {
        Row: {
          active_catalog_count: number | null
          check_timestamp: string | null
          domain_coverage_percent: number | null
          id: string
          is_healthy: boolean
          issues: Json | null
          norm_coverage_percent: number | null
        }
        Insert: {
          active_catalog_count?: number | null
          check_timestamp?: string | null
          domain_coverage_percent?: number | null
          id?: string
          is_healthy: boolean
          issues?: Json | null
          norm_coverage_percent?: number | null
        }
        Update: {
          active_catalog_count?: number | null
          check_timestamp?: string | null
          domain_coverage_percent?: number | null
          id?: string
          is_healthy?: boolean
          issues?: Json | null
          norm_coverage_percent?: number | null
        }
        Relationships: []
      }
      tipos_valvula: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "USER" | "ENGINEER_CHIEF" | "QA_MANAGER" | "ADMIN"
      catalog_status: "DRAFT" | "ACTIVE" | "DEPRECATED"
      decision_type:
        | "NORM_SELECTION"
        | "MATERIAL_CHOICE"
        | "TEST_REQUIREMENT"
        | "CALCULATION"
        | "VALIDATION"
      emergency_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      norm_type:
        | "CONSTRUCTION"
        | "PERFORMANCE"
        | "MATERIAL"
        | "INTERFACE"
        | "SAFETY"
      service_type: "PIPELINE" | "PROCESS" | "WELLHEAD" | "GENERAL"
      spec_status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PUBLISHED"
      system_action: "BLOCK_CREATION" | "BLOCK_PUBLICATION" | "ENTER_EMERGENCY"
      valve_type_enum:
        | "ESFERA"
        | "GLOBO"
        | "GAVETA"
        | "RETENCAO"
        | "BORBOLETA"
        | "CONTROLE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["USER", "ENGINEER_CHIEF", "QA_MANAGER", "ADMIN"],
      catalog_status: ["DRAFT", "ACTIVE", "DEPRECATED"],
      decision_type: [
        "NORM_SELECTION",
        "MATERIAL_CHOICE",
        "TEST_REQUIREMENT",
        "CALCULATION",
        "VALIDATION",
      ],
      emergency_severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      norm_type: [
        "CONSTRUCTION",
        "PERFORMANCE",
        "MATERIAL",
        "INTERFACE",
        "SAFETY",
      ],
      service_type: ["PIPELINE", "PROCESS", "WELLHEAD", "GENERAL"],
      spec_status: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "PUBLISHED"],
      system_action: ["BLOCK_CREATION", "BLOCK_PUBLICATION", "ENTER_EMERGENCY"],
      valve_type_enum: [
        "ESFERA",
        "GLOBO",
        "GAVETA",
        "RETENCAO",
        "BORBOLETA",
        "CONTROLE",
      ],
    },
  },
} as const
