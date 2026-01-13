// Norms Engine - Motor normativo fail-closed

export interface NormPack {
  version: string;
  status: string;
  norms: Record<string, Norm>;
  system_requirements: {
    min_norms_for_operation: number;
    required_domain_completeness: number;
    auto_block_threshold: number;
  };
  fail_closed_rules: Record<string, string>;
  torque_coefficients: Record<string, number>;
  base_torque_constants: {
    pressure_factor: number;
    size_exponent: number;
    safety_margin: number;
  };
}

export interface Norm {
  code: string;
  title: string;
  type: string;
  valve_types: string[];
  service_types: string[];
  precedence?: number;
  domains?: Record<string, string[]>;
  constraints?: Constraint[];
  material_qualifications?: Record<string, MaterialQualification>;
  inherits_from?: string;
  trigger_condition?: string;
}

export interface Constraint {
  name: string;
  if: Record<string, any>;
  then?: Record<string, string[]>;
  block?: string[] | Record<string, string[]>;
  require?: string[];
  severity: 'BLOCK' | 'WARN' | 'INFO';
  message: string;
  source_norm?: string;
}

export interface MaterialQualification {
  qualified: boolean;
  reason?: string;
  max_hardness?: string;
  min_temp?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  applicableNorms: string[];
  blockedOptions: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
  sourceNorm?: string;
  severity: 'BLOCK' | 'WARN' | 'INFO';
}

// Cache for norm pack
let cachedNormPack: NormPack | null = null;

export async function loadNormPack(): Promise<NormPack> {
  if (cachedNormPack) return cachedNormPack;
  
  try {
    const response = await fetch('/norms_starter_pack.json');
    if (!response.ok) {
      throw new Error('Failed to load norm pack');
    }
    cachedNormPack = await response.json();
    return cachedNormPack!;
  } catch (error) {
    console.error('Error loading norm pack:', error);
    throw new Error('CRITICAL: Norm pack not available');
  }
}

export async function checkSystemHealth(): Promise<{
  status: 'HEALTHY' | 'DEGRADED' | 'BLOCKED';
  message: string;
  details?: string;
}> {
  try {
    const normPack = await loadNormPack();
    
    // Check 1: Minimum norms
    const normCount = Object.keys(normPack.norms).length;
    if (normCount < normPack.system_requirements.min_norms_for_operation) {
      return {
        status: 'BLOCKED',
        message: 'Base normativa insuficiente',
        details: `Requer ${normPack.system_requirements.min_norms_for_operation} normas, encontradas ${normCount}`
      };
    }
    
    // Check 2: Domain completeness
    let totalDomains = 0;
    let completeDomains = 0;
    
    for (const norm of Object.values(normPack.norms)) {
      if (norm.domains) {
        for (const [key, values] of Object.entries(norm.domains)) {
          totalDomains++;
          if (Array.isArray(values) && values.length > 0) {
            completeDomains++;
          }
        }
      }
    }
    
    const completenessPercent = totalDomains > 0 
      ? (completeDomains / totalDomains) * 100 
      : 0;
    
    if (completenessPercent < normPack.system_requirements.required_domain_completeness) {
      return {
        status: 'BLOCKED',
        message: 'Domínios normativos incompletos',
        details: `Completude: ${completenessPercent.toFixed(1)}%`
      };
    }
    
    return {
      status: 'HEALTHY',
      message: 'Sistema operacional'
    };
    
  } catch (error) {
    return {
      status: 'BLOCKED',
      message: 'Erro crítico no sistema normativo',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getNormsForValveType(valveType: string): Promise<Norm[]> {
  const normPack = await loadNormPack();
  
  return Object.values(normPack.norms).filter(norm => 
    norm.valve_types.includes(valveType) || norm.valve_types.includes('*')
  );
}

export async function getNormsForCombination(
  valveType: string, 
  serviceType: string
): Promise<Norm[]> {
  const normPack = await loadNormPack();
  
  return Object.values(normPack.norms).filter(norm => 
    (norm.valve_types.includes(valveType) || norm.valve_types.includes('*')) &&
    (norm.service_types.includes(serviceType) || norm.service_types.includes('*'))
  );
}

export async function validateConfiguration(
  config: Record<string, any>,
  primaryNormCode: string
): Promise<ValidationResult> {
  const normPack = await loadNormPack();
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const blockedOptions: Record<string, string[]> = {};
  const applicableNorms: string[] = [primaryNormCode];
  
  const primaryNorm = normPack.norms[primaryNormCode];
  if (!primaryNorm) {
    return {
      isValid: false,
      errors: [{ field: 'primaryNorm', message: 'Norma primária não encontrada', severity: 'BLOCK' }],
      warnings: [],
      applicableNorms: [],
      blockedOptions: {}
    };
  }
  
  // Process constraints
  if (primaryNorm.constraints) {
    for (const constraint of primaryNorm.constraints) {
      // Check if constraint condition is met
      let conditionMet = true;
      for (const [key, value] of Object.entries(constraint.if)) {
        if (config[key] !== value) {
          conditionMet = false;
          break;
        }
      }
      
      if (conditionMet) {
        // Apply blocks
        if (constraint.block) {
          if (Array.isArray(constraint.block)) {
            // Simple block list
            for (const blocked of constraint.block) {
              if (Object.values(config).includes(blocked)) {
                if (constraint.severity === 'BLOCK') {
                  errors.push({
                    field: 'material',
                    message: constraint.message,
                    sourceNorm: constraint.source_norm,
                    severity: 'BLOCK'
                  });
                } else {
                  warnings.push({
                    field: 'material',
                    message: constraint.message,
                    sourceNorm: constraint.source_norm,
                    severity: constraint.severity
                  });
                }
              }
            }
          } else {
            // Field-specific blocks
            for (const [field, blockedValues] of Object.entries(constraint.block)) {
              blockedOptions[field] = [...(blockedOptions[field] || []), ...blockedValues];
              
              if (config[field] && blockedValues.includes(config[field])) {
                errors.push({
                  field,
                  message: constraint.message,
                  sourceNorm: constraint.source_norm,
                  severity: 'BLOCK'
                });
              }
            }
          }
        }
        
        // Check required fields
        if (constraint.require) {
          for (const required of constraint.require) {
            if (!config[required]) {
              errors.push({
                field: required,
                message: constraint.message,
                sourceNorm: constraint.source_norm,
                severity: 'BLOCK'
              });
            }
          }
        }
        
        // Add triggered norms
        if (constraint.source_norm && !applicableNorms.includes(constraint.source_norm)) {
          applicableNorms.push(constraint.source_norm);
        }
      }
    }
  }
  
  // Check NACE qualification
  if (config.NACE === true) {
    const nacenorm = normPack.norms['NACE_MR0175_2015'];
    if (nacenorm?.material_qualifications) {
      for (const [material, qualification] of Object.entries(nacenorm.material_qualifications)) {
        if (!qualification.qualified) {
          blockedOptions['MATERIAL_CORPO'] = [...(blockedOptions['MATERIAL_CORPO'] || []), material];
          
          if (config.MATERIAL_CORPO === material) {
            errors.push({
              field: 'MATERIAL_CORPO',
              message: `Material ${material} não qualificado NACE: ${qualification.reason}`,
              sourceNorm: 'NACE_MR0175_2015',
              severity: 'BLOCK'
            });
          }
        }
      }
    }
    
    if (!applicableNorms.includes('NACE_MR0175_2015')) {
      applicableNorms.push('NACE_MR0175_2015');
    }
  }
  
  // Check Fire Test
  if (config.FIRE_TEST === true) {
    const fireNorm = normPack.norms['API_607_2016'];
    if (fireNorm) {
      // Block polymer seats
      blockedOptions['MATERIAL_SEDE'] = [...(blockedOptions['MATERIAL_SEDE'] || []), 'PTFE', 'NYLON'];
      
      if (['PTFE', 'NYLON'].includes(config.MATERIAL_SEDE)) {
        errors.push({
          field: 'MATERIAL_SEDE',
          message: 'Teste a fogo não permite sede polimérica',
          sourceNorm: 'API_607_2016',
          severity: 'BLOCK'
        });
      }
    }
    
    if (!applicableNorms.includes('API_607_2016')) {
      applicableNorms.push('API_607_2016');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    applicableNorms,
    blockedOptions
  };
}

export async function calculateTorque(
  valveSize: number,
  pressureClass: number,
  seatMaterial: string
): Promise<{
  minTorque: number;
  maxTorque: number;
  recommended: number;
  unit: string;
  formula: string;
}> {
  const normPack = await loadNormPack();
  
  const coeff = normPack.torque_coefficients[seatMaterial] || 0.15;
  const { pressure_factor, size_exponent, safety_margin } = normPack.base_torque_constants;
  
  // Base torque calculation
  const baseTorque = coeff * Math.pow(valveSize, size_exponent) * (1 + pressure_factor * pressureClass);
  
  const minTorque = baseTorque * 0.9;
  const maxTorque = baseTorque * safety_margin;
  const recommended = baseTorque;
  
  return {
    minTorque: Math.round(minTorque),
    maxTorque: Math.round(maxTorque),
    recommended: Math.round(recommended),
    unit: 'Nm',
    formula: `T = μ × D^${size_exponent} × (1 + ${pressure_factor} × P)`
  };
}
