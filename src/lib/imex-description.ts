// IMEX Description Builder - Single Source of Truth
// Generates standardized IMEX codes from valve specifications
// Uses IMEX catalog for code/imex_code/label mappings

import type { ValveType, PressureClass, EndType, ActuationType } from '@/types/valve';
import { 
  IMEX_CATALOG, 
  getImexCode, 
  findByCode,
  type CatalogItem 
} from '@/data/imex-catalog';

// ============================================================================
// TYPES
// ============================================================================

export interface ImexSpec {
  // Basic - now stores imex_code values
  valveType: ValveType | string | null;
  diameterNPS: string | null;         // Stores code (e.g., "2", "1.5")
  pressureClass: PressureClass | string | null;
  endType: EndType | string | null;
  flangeFace?: string | null;
  
  // Materials - stores imex_code values
  bodyMaterial: string | null;        // Stores code (e.g., "ASTM_A216_WCB")
  seatMaterial: string | null;        // Stores code (e.g., "PTFE")
  obturatorMaterial?: string | null;
  stemMaterial?: string | null;
  
  // Actuation - stores imex_code
  actuationType: ActuationType | string | null;
  
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
// LEGACY MAPPINGS (for backwards compatibility)
// ============================================================================

// Valve type to model code mapping
const VALVE_MODEL_MAP: Record<string, string> = {
  'ESFERA': 'TRUF',
  'ESFERA_RED': 'TRUR',
  'ESFERA_FLOAT': 'FL3F',
  'GLOBO': 'GLBY',
  'GLOBO_ANG': 'GLBA',
  'GAVETA': 'GVSC',
  'GAVETA_EXP': 'GVEX',
  'RETENCAO': 'CHKS',
  'RETENCAO_PIST': 'CHKP',
  'BORBOLETA': 'BTFL',
  'CONTROLE': 'CTRL',
};

// Pressure class to single character encoding
const PRESSURE_CLASS_MAP: Record<string, string> = {
  '150': '1',
  '300': '3',
  '600': '6',
  '800': '8',
  '900': 'A',
  '1500': 'B',
  '2500': 'Y',
};

// End type to connection code
const END_TYPE_MAP: Record<string, string> = {
  'FLANGEADO': 'FRE',
  'FLANGEADO_RF': 'FRF',
  'FLANGEADO_RTJ': 'RTJ',
  'FLANGEADO_FF': 'FFF',
  'BW': 'BWE',
  'SW': 'SOW',
  'NPT': 'NIP',
  'WAFER': 'WAF',
  'LUG': 'LUG',
};

// Body material code extraction
const BODY_MATERIAL_MAP: Record<string, string> = {
  'ASTM_A216_WCB': 'WCB',
  'ASTM_A352_LCB': 'LCB',
  'ASTM_A352_LCC': 'LCC',
  'ASTM_A351_CF8M': '36L',
  'ASTM_A351_CF3M': '36L',
  'ASTM_A995_4A': 'F55',
  'ASTM_A995_5A': 'F55',
  'ASTM_A995_6A': 'F55',
  'ASTM_A105': 'A15',
  'ASTM_A182_F316': '36L',
  'ASTM_A182_F304': '34L',
  // Legacy support
  'ASTM A216 WCB': 'WCB',
  'ASTM A352 LCC': 'LCC',
  'ASTM A351 CF8M': '36L',
  'ASTM A351 CF3M': '36L',
  'ASTM A995 4A': 'F55',
  'ASTM A995 5A': 'F55',
  'ASTM A995 6A': 'F55',
  'ASTM A105': 'A15',
  'ASTM A182 F316': '36L',
  'ASTM A182 F304': '34L',
};

// Seat/trim material codes
const SEAT_MATERIAL_MAP: Record<string, string> = {
  'PTFE': 'PT',
  'RPTFE': 'RP',
  'PEEK': 'PK',
  'METAL': 'MT',
  'STELLITE': 'ST',
  'ENP': 'EP',
  'INCONEL': 'IN',
  'NYLON': 'NY',
  'DEVLON': 'DV',
  'GRAFITE': 'GR',
};

// Actuation type codes
const ACTUATION_MAP: Record<string, string> = {
  'MANUAL': '0L0000',
  'MANUAL_GEAR': '0L538M',
  'PNEUMATICO': '1V4GB7',
  'PNEUMATICO_SA': '1V4GB7',
  'PNEUMATICO_DA': '1V4GBD',
  'ELETRICO': '0L6GL7',
  'HIDRAULICO': '0L7HY1',
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
  
  // Handle decimal format (e.g., "2.5", "0.5")
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
 * X = pressure class character (150=1, 300=3, 600=6, 800=8, 900=A, 1500=B, 2500=Y)
 */
export function encodeSizeClass(
  nps: string | null | undefined,
  pressureClass: string | null | undefined
): string | null {
  const inchValue = parseNpsToInch(nps);
  if (inchValue === null || !pressureClass) return null;
  
  // Get class character from map or catalog
  let classChar = PRESSURE_CLASS_MAP[pressureClass];
  if (!classChar) {
    const catalogItem = findByCode(IMEX_CATALOG.pressureClasses, pressureClass);
    classChar = catalogItem?.imex_code || '';
  }
  
  if (!classChar) return null;
  
  // NPS * 10, formatted as 3 digits with leading zeros
  const sizeCode = Math.round(inchValue * 10).toString().padStart(3, '0');
  
  return `${sizeCode}${classChar}`;
}

/**
 * Extracts IMEX code from material using catalog or legacy maps
 */
function extractMaterialCode(material: string | null | undefined, map: Record<string, string>): string | null {
  if (!material) return null;
  
  // Direct match in legacy map
  if (map[material]) return map[material];
  
  // Try catalog lookup
  const catalogItem = findByCode(IMEX_CATALOG.bodyMaterials, material) ||
                      findByCode(IMEX_CATALOG.seatMaterials, material) ||
                      findByCode(IMEX_CATALOG.stemMaterials, material);
  if (catalogItem) return catalogItem.imex_code;
  
  // Partial match (material name contains key)
  for (const [key, code] of Object.entries(map)) {
    if (material.toUpperCase().includes(key.toUpperCase()) || 
        key.toUpperCase().includes(material.toUpperCase())) {
      return code;
    }
  }
  
  // Return first 3 characters as fallback
  return material.substring(0, 3).toUpperCase().replace(/\s/g, '');
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
  if (spec.valveType) {
    // Try catalog first, then legacy map
    const catalogItem = findByCode(IMEX_CATALOG.valveModels, spec.valveType);
    modelo = catalogItem?.imex_code || VALVE_MODEL_MAP[spec.valveType] || '';
    
    if (modelo) {
      segments.push({
        key: 'modelo',
        label: 'Modelo',
        value: modelo,
        source: catalogItem?.label || spec.valveType,
      });
    } else {
      missing.push('Tipo de válvula');
    }
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
  if (spec.endType) {
    // Try catalog first, then legacy map
    const catalogItem = findByCode(IMEX_CATALOG.endConnections, spec.endType);
    conexao = catalogItem?.imex_code || END_TYPE_MAP[spec.endType] || '';
    
    // Add flange face if flanged
    if (spec.endType.includes('FLANGEADO') && spec.flangeFace) {
      const faceItem = findByCode(IMEX_CATALOG.flangeFaces, spec.flangeFace);
      if (faceItem) {
        conexao = faceItem.imex_code;
      }
    }
    
    if (conexao) {
      segments.push({
        key: 'conexao',
        label: 'Conexão',
        value: conexao,
        source: catalogItem?.label || spec.endType,
      });
    } else {
      missing.push('Tipo de extremidade');
    }
  } else {
    missing.push('Tipo de extremidade');
  }
  
  // 4. CORPO (Body Material)
  let corpo = '';
  const bodyCode = extractMaterialCode(spec.bodyMaterial, BODY_MATERIAL_MAP);
  if (bodyCode) {
    corpo = bodyCode;
    const catalogItem = findByCode(IMEX_CATALOG.bodyMaterials, spec.bodyMaterial || '');
    segments.push({
      key: 'corpo',
      label: 'Corpo',
      value: corpo,
      source: catalogItem?.label || spec.bodyMaterial,
    });
  } else {
    missing.push('Material do corpo');
  }
  
  // 5. TRIM (Seat Material)
  let trim = '';
  const seatCode = extractMaterialCode(spec.seatMaterial, SEAT_MATERIAL_MAP);
  if (seatCode) {
    trim = seatCode;
    const catalogItem = findByCode(IMEX_CATALOG.seatMaterials, spec.seatMaterial || '');
    segments.push({
      key: 'trim',
      label: 'Trim',
      value: trim,
      source: catalogItem?.label || spec.seatMaterial,
    });
  } else {
    missing.push('Material da sede');
  }
  
  // 6. ATUACAO (Actuation Type)
  let atuacao = '';
  if (spec.actuationType) {
    // Try catalog first, then legacy map
    const catalogItem = findByCode(IMEX_CATALOG.actuationCodes, spec.actuationType);
    atuacao = catalogItem?.imex_code || ACTUATION_MAP[spec.actuationType] || '';
    
    if (atuacao) {
      segments.push({
        key: 'atuacao',
        label: 'Atuação',
        value: atuacao,
        source: catalogItem?.label || spec.actuationType,
      });
    } else {
      missing.push('Tipo de atuação');
    }
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
