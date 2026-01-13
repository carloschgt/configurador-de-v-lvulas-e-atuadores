import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ValveType = Database['public']['Enums']['valve_type_enum'];
type ServiceType = Database['public']['Enums']['service_type'];

interface NormValidationResult {
  isValid: boolean;
  applicableNorms: string[];
  rejectedNorms: { norm: string; reason: string }[];
  constructionStandards: { code: string; title: string }[];
  domains: Record<string, string[]>;
  materials: {
    body: Material[];
    obturator: Material[];
    seat: Material[];
    stem: Material[];
  };
}

interface Material {
  code: string;
  name: string;
  naceQualified: boolean;
  naceTemperatureMin: number | null;
  naceHardnessMax: number | null;
  fireTestCompatible: boolean;
  lowEmissionCompatible: boolean;
  compatibleWith: string[];
}

export const useNormValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateCombination = useCallback(async (
    valveType: ValveType | null,
    serviceType: ServiceType | null
  ): Promise<NormValidationResult> => {
    setIsValidating(true);
    
    try {
      if (!valveType || !serviceType) {
        return {
          isValid: false,
          applicableNorms: [],
          rejectedNorms: [],
          constructionStandards: [],
          domains: {},
          materials: { body: [], obturator: [], seat: [], stem: [] }
        };
      }

      // Fetch applicable standards
      const { data: standards, error: standardsError } = await supabase
        .from('standards_hierarchy')
        .select('*')
        .eq('is_active', true);

      if (standardsError) throw standardsError;

      // Filter standards that apply to this valve type and service type
      const applicableStandards = standards?.filter(std => {
        const valveTypes = std.applies_to_valve_types as string[] | null;
        const serviceTypes = std.applies_to_service_types as string[] | null;
        
        const appliesToValve = valveTypes?.includes(valveType) ?? false;
        const appliesToService = serviceTypes?.includes(serviceType) ?? false;
        
        return appliesToValve && appliesToService;
      }) || [];

      const rejectedStandards = standards?.filter(std => {
        const valveTypes = std.applies_to_valve_types as string[] | null;
        const serviceTypes = std.applies_to_service_types as string[] | null;
        
        return !(valveTypes?.includes(valveType) ?? false) || 
               !(serviceTypes?.includes(serviceType) ?? false);
      }) || [];

      // Get construction standards (type = CONSTRUCTION)
      const constructionStandards = applicableStandards
        .filter(s => s.norm_type === 'CONSTRUCTION')
        .map(s => ({ code: s.norm_code, title: s.norm_title }));

      // If no construction standards, this combination is NOT valid
      if (constructionStandards.length === 0) {
        return {
          isValid: false,
          applicableNorms: [],
          rejectedNorms: rejectedStandards.map(s => ({
            norm: s.norm_code,
            reason: `Não aplicável para ${valveType} + ${serviceType}`
          })),
          constructionStandards: [],
          domains: {},
          materials: { body: [], obturator: [], seat: [], stem: [] }
        };
      }

      // Fetch domains for the first construction standard
      const primaryNorm = constructionStandards[0].code;
      const { data: domains, error: domainsError } = await supabase
        .from('norm_controlled_domains')
        .select('*')
        .eq('norm_code', primaryNorm)
        .eq('is_active', true);

      if (domainsError) throw domainsError;

      const domainMap: Record<string, string[]> = {};
      domains?.forEach(d => {
        domainMap[d.attribute_key] = d.allowed_values as string[];
      });

      // Fetch materials
      const { data: materials, error: materialsError } = await supabase
        .from('material_compatibility')
        .select('*')
        .eq('norm_code', primaryNorm)
        .eq('is_active', true);

      if (materialsError) throw materialsError;

      const mapMaterial = (m: typeof materials[0]): Material => ({
        code: m.material_code,
        name: m.material_name,
        naceQualified: m.nace_qualified ?? false,
        naceTemperatureMin: m.nace_temperature_min,
        naceHardnessMax: m.nace_hardness_max,
        fireTestCompatible: m.fire_test_compatible ?? false,
        lowEmissionCompatible: m.low_emission_compatible ?? false,
        compatibleWith: (m.compatible_with as string[]) || []
      });

      const materialsByType = {
        body: materials?.filter(m => m.material_type === 'CORPO').map(mapMaterial) || [],
        obturator: materials?.filter(m => m.material_type === 'OBTURADOR').map(mapMaterial) || [],
        seat: materials?.filter(m => m.material_type === 'SEDE').map(mapMaterial) || [],
        stem: materials?.filter(m => m.material_type === 'HASTE').map(mapMaterial) || []
      };

      return {
        isValid: true,
        applicableNorms: applicableStandards.map(s => s.norm_code),
        rejectedNorms: rejectedStandards.map(s => ({
          norm: s.norm_code,
          reason: `Não aplicável para ${valveType} + ${serviceType}`
        })),
        constructionStandards,
        domains: domainMap,
        materials: materialsByType
      };

    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        applicableNorms: [],
        rejectedNorms: [],
        constructionStandards: [],
        domains: {},
        materials: { body: [], obturator: [], seat: [], stem: [] }
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const calculateTorque = useCallback(async (
    valveSize: number,
    pressureClass: number,
    seatMaterial: string
  ) => {
    // Base torque calculation (simplified)
    // Real implementation would use norm-specific formulas
    const baseTorque = valveSize * pressureClass * 0.05;
    
    // Friction coefficients by seat material
    const frictionCoefficients: Record<string, number> = {
      'STELLITE_6': 0.15,
      'ENP': 0.12,
      'PTFE': 0.08
    };
    
    const friction = frictionCoefficients[seatMaterial] || 0.15;
    const minTorque = baseTorque * (1 + friction) * 0.9;
    const maxTorque = baseTorque * (1 + friction) * 1.1;
    const recommended = baseTorque * (1 + friction);

    return {
      minTorque: Math.round(minTorque),
      maxTorque: Math.round(maxTorque),
      recommended: Math.round(recommended),
      unit: 'Nm'
    };
  }, []);

  const validateMaterialNACE = useCallback(async (
    materialCode: string,
    requiresNACE: boolean
  ) => {
    if (!requiresNACE) return { isValid: true, message: '' };

    const { data, error } = await supabase
      .from('material_compatibility')
      .select('*')
      .eq('material_code', materialCode)
      .eq('nace_qualified', true)
      .maybeSingle();

    if (error || !data) {
      return {
        isValid: false,
        message: `Material ${materialCode} não é qualificado para serviço NACE MR0175`
      };
    }

    return {
      isValid: true,
      message: `Material qualificado NACE: Temp. Mín ${data.nace_temperature_min}°C, Dureza Máx ${data.nace_hardness_max} HRC`
    };
  }, []);

  const validateFireTestCompatibility = useCallback(async (
    valveType: ValveType,
    bodyMaterial: string,
    seatMaterial: string,
    pressureClass: number
  ) => {
    const { data, error } = await supabase
      .from('fire_test_compatibility')
      .select('*')
      .eq('valve_type', valveType);

    if (error || !data || data.length === 0) {
      return {
        isValid: false,
        message: 'Não há dados de compatibilidade de teste a fogo para este tipo de válvula',
        applicableNorms: []
      };
    }

    const compatible = data.filter(ftc => {
      const bodyMaterials = ftc.allowed_body_materials as string[];
      const seatMaterials = ftc.allowed_seat_materials as string[];
      const maxPressure = ftc.max_pressure_rating || 9999;

      return bodyMaterials?.includes(bodyMaterial) &&
             seatMaterials?.includes(seatMaterial) &&
             pressureClass <= maxPressure;
    });

    if (compatible.length === 0) {
      return {
        isValid: false,
        message: `Combinação de materiais não compatível com teste a fogo. Verifique: Corpo=${bodyMaterial}, Sede=${seatMaterial}`,
        applicableNorms: []
      };
    }

    return {
      isValid: true,
      message: 'Combinação compatível com teste a fogo',
      applicableNorms: compatible.map(c => c.norm_code).filter(Boolean) as string[]
    };
  }, []);

  return {
    isValidating,
    validateCombination,
    calculateTorque,
    validateMaterialNACE,
    validateFireTestCompatibility
  };
};
