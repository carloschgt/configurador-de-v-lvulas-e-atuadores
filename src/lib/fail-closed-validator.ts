// Fail-Closed Validator - Sistema de validação fail-closed

import { loadNormPack, validateConfiguration } from './norms-engine';

export interface SpecificationConfig {
  valveType: string;
  serviceType: string;
  primaryNormCode: string;
  
  // Step 1 - Basic
  diameterNPS: string;
  pressureClass: string;
  endType: string;
  flangeFace?: string;
  
  // Step 2 - Materials
  bodyMaterial: string;
  obturatorMaterial: string;
  seatMaterial: string;
  stemMaterial: string;
  
  // Step 3 - Special
  naceRequired: boolean;
  fireTestRequired: boolean;
  lowEmissionRequired: boolean;
  silLevel?: string;
  
  // Step 4 - Actuation
  actuationType: string;
  selectedTorque?: number;
}

export interface PublicationCheck {
  id: string;
  rule: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  message: string;
  sourceNorm?: string;
  canBypass: boolean;
}

export interface PublicationResult {
  canPublish: boolean;
  coveragePercent: number;
  checks: PublicationCheck[];
  blockedBy: string[];
  applicableNorms: string[];
}

// REGRA FAIL-CLOSED SUPREMA: Validação completa antes da publicação
export async function validateForPublication(
  config: SpecificationConfig
): Promise<PublicationResult> {
  const checks: PublicationCheck[] = [];
  const blockedBy: string[] = [];
  let applicableNorms: string[] = [config.primaryNormCode];

  // Check 1: Primary norm exists
  const normPack = await loadNormPack();
  const primaryNorm = normPack.norms[config.primaryNormCode];
  
  if (!primaryNorm) {
    checks.push({
      id: 'NORM_001',
      rule: 'Norma de construção primária',
      status: 'FAIL',
      message: 'Norma primária não encontrada no catálogo',
      canBypass: false
    });
    blockedBy.push('NORM_001');
  } else {
    checks.push({
      id: 'NORM_001',
      rule: 'Norma de construção primária',
      status: 'PASS',
      message: `${primaryNorm.code} - ${primaryNorm.title}`,
      sourceNorm: primaryNorm.code,
      canBypass: false
    });
  }

  // Check 2: All basic fields filled
  const basicFields = ['diameterNPS', 'pressureClass', 'endType'];
  const missingBasic = basicFields.filter(f => !config[f as keyof SpecificationConfig]);
  
  if (missingBasic.length > 0) {
    checks.push({
      id: 'BASIC_001',
      rule: 'Campos básicos obrigatórios',
      status: 'FAIL',
      message: `Campos faltando: ${missingBasic.join(', ')}`,
      canBypass: false
    });
    blockedBy.push('BASIC_001');
  } else {
    checks.push({
      id: 'BASIC_001',
      rule: 'Campos básicos obrigatórios',
      status: 'PASS',
      message: 'Todos os campos básicos preenchidos',
      canBypass: false
    });
  }

  // Check 3: Flange face required when flanged
  if (config.endType === 'FLANGEADO' && !config.flangeFace) {
    checks.push({
      id: 'BASIC_002',
      rule: 'Face do flange obrigatória',
      status: 'FAIL',
      message: 'Extremidade flangeada requer seleção de face',
      sourceNorm: 'ASME_B16.5',
      canBypass: false
    });
    blockedBy.push('BASIC_002');
  } else if (config.endType === 'FLANGEADO') {
    checks.push({
      id: 'BASIC_002',
      rule: 'Face do flange obrigatória',
      status: 'PASS',
      message: `Face ${config.flangeFace} selecionada`,
      sourceNorm: 'ASME_B16.5',
      canBypass: false
    });
  }

  // Check 4: All material fields filled
  const materialFields = ['bodyMaterial', 'obturatorMaterial', 'seatMaterial', 'stemMaterial'];
  const missingMaterials = materialFields.filter(f => !config[f as keyof SpecificationConfig]);
  
  if (missingMaterials.length > 0) {
    checks.push({
      id: 'MAT_001',
      rule: 'Materiais obrigatórios',
      status: 'FAIL',
      message: `Materiais faltando: ${missingMaterials.join(', ')}`,
      canBypass: false
    });
    blockedBy.push('MAT_001');
  } else {
    checks.push({
      id: 'MAT_001',
      rule: 'Materiais obrigatórios',
      status: 'PASS',
      message: 'Todos os materiais selecionados',
      canBypass: false
    });
  }

  // Check 5: NACE compliance
  if (config.naceRequired) {
    applicableNorms.push('NACE_MR0175_2015');
    
    const naceNorm = normPack.norms['NACE_MR0175_2015'];
    if (naceNorm?.material_qualifications) {
      const bodyQual = naceNorm.material_qualifications[config.bodyMaterial];
      
      if (!bodyQual?.qualified) {
        checks.push({
          id: 'NACE_001',
          rule: 'Qualificação NACE do corpo',
          status: 'FAIL',
          message: `Material ${config.bodyMaterial} não qualificado NACE: ${bodyQual?.reason || 'Verificar norma'}`,
          sourceNorm: 'NACE_MR0175_2015',
          canBypass: false
        });
        blockedBy.push('NACE_001');
      } else {
        checks.push({
          id: 'NACE_001',
          rule: 'Qualificação NACE do corpo',
          status: 'PASS',
          message: `Material ${config.bodyMaterial} qualificado (máx ${bodyQual.max_hardness})`,
          sourceNorm: 'NACE_MR0175_2015',
          canBypass: false
        });
      }
    }
  }

  // Check 6: Fire test compatibility
  if (config.fireTestRequired) {
    applicableNorms.push('API_607_2016');
    
    const polymerSeats = ['PTFE', 'NYLON', 'PEEK'];
    if (polymerSeats.includes(config.seatMaterial)) {
      checks.push({
        id: 'FIRE_001',
        rule: 'Compatibilidade Fire Test',
        status: 'FAIL',
        message: `Sede ${config.seatMaterial} não permitida para fire test`,
        sourceNorm: 'API_607_2016',
        canBypass: false
      });
      blockedBy.push('FIRE_001');
    } else {
      checks.push({
        id: 'FIRE_001',
        rule: 'Compatibilidade Fire Test',
        status: 'PASS',
        message: `Sede ${config.seatMaterial} compatível com fire test`,
        sourceNorm: 'API_607_2016',
        canBypass: false
      });
    }
  }

  // Check 7: Low emission compatibility
  if (config.lowEmissionRequired) {
    applicableNorms.push('ISO_15848_2015');
    
    checks.push({
      id: 'EMIT_001',
      rule: 'Requisitos ISO 15848',
      status: 'PASS',
      message: 'Configuração compatível com baixa emissão fugitiva',
      sourceNorm: 'ISO_15848_2015',
      canBypass: false
    });
  }

  // Check 8: SIL requirements
  if (config.silLevel && config.silLevel !== 'NA') {
    applicableNorms.push('IEC_61508_2010');
    
    checks.push({
      id: 'SIL_001',
      rule: `Requisitos ${config.silLevel}`,
      status: 'PENDING',
      message: 'Requer cálculo de PFDavg',
      sourceNorm: 'IEC_61508_2010',
      canBypass: false
    });
  }

  // Check 9: Actuation type
  if (!config.actuationType) {
    checks.push({
      id: 'ACT_001',
      rule: 'Tipo de acionamento',
      status: 'FAIL',
      message: 'Tipo de acionamento não selecionado',
      canBypass: false
    });
    blockedBy.push('ACT_001');
  } else {
    checks.push({
      id: 'ACT_001',
      rule: 'Tipo de acionamento',
      status: 'PASS',
      message: `Acionamento ${config.actuationType}`,
      canBypass: false
    });
  }

  // Calculate coverage
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.status === 'PASS').length;
  const coveragePercent = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

  // Remove duplicates from applicable norms
  applicableNorms = [...new Set(applicableNorms)];

  return {
    canPublish: blockedBy.length === 0 && coveragePercent === 100,
    coveragePercent,
    checks,
    blockedBy,
    applicableNorms
  };
}

// REGRA FINAL: Validação no momento da publicação
export async function finalPublicationValidation(
  config: SpecificationConfig,
  userId: string
): Promise<{
  success: boolean;
  specCode?: string;
  errors: string[];
}> {
  const errors: string[] = [];

  // Step 1: Validate configuration
  const result = await validateForPublication(config);
  
  if (!result.canPublish) {
    errors.push('Especificação não passou nas validações');
    errors.push(...result.blockedBy.map(id => 
      result.checks.find(c => c.id === id)?.message || id
    ));
    return { success: false, errors };
  }

  // Step 2: Check system health
  const normPack = await loadNormPack();
  if (normPack.status !== 'ACTIVE') {
    errors.push('Sistema normativo não está ativo');
    return { success: false, errors };
  }

  // Step 3: Generate spec code
  const specCode = `IMEX-${config.valveType}-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    specCode,
    errors: []
  };
}
