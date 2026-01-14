// IMEX Description Builder - Single Source of Truth
// Generates standardized IMEX codes from valve specifications

import type { ValveType, PressureClass, EndType, ActuationType } from '@/types/valve';

// ============================================================================
// TYPES
// ============================================================================

export interface ImexSpec {
  // Basic
  valveType: ValveType | null;
  diameterNPS: string | null;
  pressureClass: PressureClass | null;
  endType: EndType | null;
  flangeFace?: string | null;
  
  // Materials
  bodyMaterial: string | null;
  seatMaterial: string | null;
  obturatorMaterial?: string | null;
  stemMaterial?: string | null;
  
  // Actuation
  actuationType: ActuationType | null;
  
  // Special requirements
  fireTest?: string | null;
  lowFugitiveEmission?: boolean;
  silCertification?: string | null;
  naceCompliant?: boolean;
  
  // Optional observations
  observations?: string;
}

export interface DescriptionSegment {
  key: string;
  label: string;
  value: string;
  source: string | null;
}

export interface BuildResult {
  value: string;
  segments: DescriptionSegment[];
  missing: string[];
  isComplete: boolean;
}

// ============================================================================
// MAPPINGS
// ============================================================================

// Valve type to model code mapping
const VALVE_MODEL_MAP: Record<ValveType, string> = {
  'ESFERA': 'VE',
  'GLOBO': 'VG',
  'GAVETA': 'VGT',
  'RETENCAO': 'VR',
  'BORBOLETA': 'VB',
  'CONTROLE': 'VC',
};

// Pressure class to single character encoding
const PRESSURE_CLASS_MAP: Record<PressureClass, string> = {
  '150': '1',
  '300': '3',
  '600': '6',
  '900': 'A',
  '1500': 'B',
  '2500': 'Y',
};

// End type to connection code
const END_TYPE_MAP: Record<EndType, string> = {
  'FLANGEADO': 'FL',
  'BW': 'BW',
  'SW': 'SW',
  'NPT': 'TH',
  'WAFER': 'WF',
  'LUG': 'LG',
};

// Body material code extraction
const BODY_MATERIAL_MAP: Record<string, string> = {
  'ASTM A216 WCB': 'WCB',
  'ASTM A352 LCC': 'LCC',
  'ASTM A351 CF8M': 'CF8M',
  'ASTM A351 CF3M': 'CF3M',
  'ASTM A995 4A': 'DPX',
  'ASTM A995 5A': 'SDPX',
  'ASTM A995 6A': 'SDPX',
  'ASTM A105': 'A105',
  'ASTM A182 F316': 'F316',
  'ASTM A182 F304': 'F304',
};

// Seat/trim material codes
const SEAT_MATERIAL_MAP: Record<string, string> = {
  'PTFE': 'PT',
  'RPTFE': 'RPT',
  'PEEK': 'PK',
  'METAL': 'MT',
  'STELLITE': 'ST',
  'ENP': 'ENP',
  'INCONEL': 'INC',
  'NYLON': 'NY',
  'DEVLON': 'DV',
  'GRAFITE': 'GR',
};

// Actuation type codes
const ACTUATION_MAP: Record<ActuationType, string> = {
  'MANUAL': 'MN',
  'PNEUMATICO': 'PN',
  'ELETRICO': 'EL',
  'HIDRAULICO': 'HY',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parses NPS string to numeric inch value
 * Accepts formats: "1/2", "3/4", "1", "1 1/2", "2", "2.5", etc.
 */
export function parseNpsToInch(nps: string | null | undefined): number | null {
  if (!nps || nps.trim() === '') return null;
  
  const cleaned = nps.trim();
  
  // Handle decimal format (e.g., "2.5")
  if (/^\d+\.?\d*$/.test(cleaned)) {
    return parseFloat(cleaned);
  }
  
  // Handle mixed number format (e.g., "1 1/2")
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    return whole + (numerator / denominator);
  }
  
  // Handle simple fraction format (e.g., "1/2", "3/4")
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return numerator / denominator;
  }
  
  // Handle whole number format (e.g., "2", "10")
  const wholeMatch = cleaned.match(/^(\d+)$/);
  if (wholeMatch) {
    return parseInt(wholeMatch[1], 10);
  }
  
  return null;
}

/**
 * Encodes NPS and pressure class into NNNX format
 * NNN = 3 digits (NPS * 10, zero-padded)
 * X = pressure class character
 */
export function encodeSizeClass(
  nps: string | null | undefined,
  pressureClass: PressureClass | null | undefined
): string | null {
  const inchValue = parseNpsToInch(nps);
  if (inchValue === null || !pressureClass) return null;
  
  const classChar = PRESSURE_CLASS_MAP[pressureClass];
  if (!classChar) return null;
  
  // NPS * 10, formatted as 3 digits with leading zeros
  const sizeCode = Math.round(inchValue * 10).toString().padStart(3, '0');
  
  return `${sizeCode}${classChar}`;
}

/**
 * Extracts material code from full material name
 */
function extractMaterialCode(material: string | null | undefined, map: Record<string, string>): string | null {
  if (!material) return null;
  
  // Direct match
  if (map[material]) return map[material];
  
  // Partial match (material name contains key)
  for (const [key, code] of Object.entries(map)) {
    if (material.toUpperCase().includes(key.toUpperCase()) || 
        key.toUpperCase().includes(material.toUpperCase())) {
      return code;
    }
  }
  
  // Return first 4 characters as fallback
  return material.substring(0, 4).toUpperCase().replace(/\s/g, '');
}

/**
 * Builds suffix string from special requirements
 */
function buildSuffixes(spec: ImexSpec): string {
  const suffixes: string[] = [];
  
  // Fire test
  if (spec.fireTest === 'TESTADA_A_FOGO' || spec.fireTest === 'Sim') {
    suffixes.push('FS');
  }
  
  // Low fugitive emission
  if (spec.lowFugitiveEmission) {
    suffixes.push('LFE');
  }
  
  // SIL certification
  if (spec.silCertification && spec.silCertification !== 'NA') {
    suffixes.push(spec.silCertification);
  }
  
  // NACE compliance
  if (spec.naceCompliant) {
    suffixes.push('NACE');
  }
  
  // Default suffix if none specified
  if (suffixes.length === 0) {
    suffixes.push('NEW');
  }
  
  return suffixes.join('-');
}

// ============================================================================
// MAIN BUILDER FUNCTION
// ============================================================================

/**
 * Builds the complete IMEX description from specification
 * Format: MODELO.DIAMCLASSE.CONEXAO.CORPO.TRIM.ATUACAO-SUFIXOS(OBS)
 */
export function buildDescricaoImex(spec: ImexSpec): BuildResult {
  const segments: DescriptionSegment[] = [];
  const missing: string[] = [];
  
  // 1. MODELO (Valve Type)
  let modelo = '';
  if (spec.valveType && VALVE_MODEL_MAP[spec.valveType]) {
    modelo = VALVE_MODEL_MAP[spec.valveType];
    segments.push({
      key: 'modelo',
      label: 'Modelo',
      value: modelo,
      source: spec.valveType,
    });
  } else {
    missing.push('Tipo de válvula');
  }
  
  // 2. DIAMCLASSE (Size + Pressure Class)
  let diamClasse = '';
  const sizeClass = encodeSizeClass(spec.diameterNPS, spec.pressureClass);
  if (sizeClass) {
    diamClasse = sizeClass;
    segments.push({
      key: 'diamClasse',
      label: 'Diâmetro/Classe',
      value: diamClasse,
      source: `${spec.diameterNPS}" #${spec.pressureClass}`,
    });
  } else {
    if (!spec.diameterNPS) missing.push('Diâmetro NPS');
    if (!spec.pressureClass) missing.push('Classe de pressão');
  }
  
  // 3. CONEXAO (End Type)
  let conexao = '';
  if (spec.endType && END_TYPE_MAP[spec.endType]) {
    conexao = END_TYPE_MAP[spec.endType];
    // Add flange face if flanged
    if (spec.endType === 'FLANGEADO' && spec.flangeFace) {
      conexao += `-${spec.flangeFace}`;
    }
    segments.push({
      key: 'conexao',
      label: 'Conexão',
      value: conexao,
      source: spec.endType,
    });
  } else {
    missing.push('Tipo de extremidade');
  }
  
  // 4. CORPO (Body Material)
  let corpo = '';
  const bodyCode = extractMaterialCode(spec.bodyMaterial, BODY_MATERIAL_MAP);
  if (bodyCode) {
    corpo = bodyCode;
    segments.push({
      key: 'corpo',
      label: 'Corpo',
      value: corpo,
      source: spec.bodyMaterial,
    });
  } else {
    missing.push('Material do corpo');
  }
  
  // 5. TRIM (Seat Material)
  let trim = '';
  const seatCode = extractMaterialCode(spec.seatMaterial, SEAT_MATERIAL_MAP);
  if (seatCode) {
    trim = seatCode;
    segments.push({
      key: 'trim',
      label: 'Trim',
      value: trim,
      source: spec.seatMaterial,
    });
  } else {
    missing.push('Material da sede');
  }
  
  // 6. ATUACAO (Actuation Type)
  let atuacao = '';
  if (spec.actuationType && ACTUATION_MAP[spec.actuationType]) {
    atuacao = ACTUATION_MAP[spec.actuationType];
    segments.push({
      key: 'atuacao',
      label: 'Atuação',
      value: atuacao,
      source: spec.actuationType,
    });
  } else {
    missing.push('Tipo de atuação');
  }
  
  // 7. SUFIXOS (Special Requirements)
  const sufixos = buildSuffixes(spec);
  segments.push({
    key: 'sufixos',
    label: 'Sufixos',
    value: sufixos,
    source: 'Requisitos especiais',
  });
  
  // Build the final value
  const parts = [modelo, diamClasse, conexao, corpo, trim, atuacao].filter(Boolean);
  let value = parts.join('.');
  
  // Add suffixes
  if (value && sufixos) {
    value += `-${sufixos}`;
  }
  
  // Add observations if present
  if (spec.observations && spec.observations.trim()) {
    value += `(${spec.observations.trim()})`;
  }
  
  // Handle incomplete state
  if (parts.length < 6) {
    const placeholders = Array(6 - parts.length).fill('???');
    value = [...parts, ...placeholders].join('.') + `-${sufixos}`;
  }
  
  return {
    value: value || '???',
    segments,
    missing,
    isComplete: missing.length === 0,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const IMEX_MAPPINGS = {
  valveModels: VALVE_MODEL_MAP,
  pressureClasses: PRESSURE_CLASS_MAP,
  endTypes: END_TYPE_MAP,
  bodyMaterials: BODY_MATERIAL_MAP,
  seatMaterials: SEAT_MATERIAL_MAP,
  actuationTypes: ACTUATION_MAP,
};
