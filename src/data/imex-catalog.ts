// IMEX Catalog - Single Source of Truth for IMEX Codes
// Each item has: code (internal), imex_code (for description), label (display)

export interface CatalogItem {
  code: string;      // Internal identifier (e.g., ASTM_A216_WCB)
  imex_code: string; // What goes into IMEX description (e.g., WCB)
  label: string;     // User-friendly display text
}

// ============================================================================
// VALVE MODELS
// ============================================================================

export const VALVE_MODELS: CatalogItem[] = [
  { code: 'ESFERA', imex_code: 'TRUF', label: 'Esfera - Trunnion Full Bore' },
  { code: 'ESFERA_RED', imex_code: 'TRUR', label: 'Esfera - Trunnion Reduced Bore' },
  { code: 'ESFERA_FLOAT', imex_code: 'FL3F', label: 'Esfera - Floating 3-Piece' },
  { code: 'GAVETA', imex_code: 'GVSC', label: 'Gaveta - Gate Valve Slab' },
  { code: 'GAVETA_EXP', imex_code: 'GVEX', label: 'Gaveta - Expanding Gate' },
  { code: 'GLOBO', imex_code: 'GLBY', label: 'Globo - Globe Y-Pattern' },
  { code: 'GLOBO_ANG', imex_code: 'GLBA', label: 'Globo - Globe Angle' },
  { code: 'RETENCAO', imex_code: 'CHKS', label: 'Retenção - Check Swing' },
  { code: 'RETENCAO_PIST', imex_code: 'CHKP', label: 'Retenção - Check Piston' },
  { code: 'BORBOLETA', imex_code: 'BTFL', label: 'Borboleta - Butterfly' },
  { code: 'CONTROLE', imex_code: 'CTRL', label: 'Controle - Control Valve' },
];

// ============================================================================
// END CONNECTIONS
// ============================================================================

export const END_CONNECTIONS: CatalogItem[] = [
  { code: 'FLANGEADO', imex_code: 'FRE', label: 'Flangeado - RF/RTJ Ends' },
  { code: 'FLANGEADO_RF', imex_code: 'FRF', label: 'Flangeado - Raised Face' },
  { code: 'FLANGEADO_RTJ', imex_code: 'RTJ', label: 'Flangeado - Ring Type Joint' },
  { code: 'FLANGEADO_FF', imex_code: 'FFF', label: 'Flangeado - Flat Face' },
  { code: 'BW', imex_code: 'BWE', label: 'BW - Butt Weld Ends' },
  { code: 'SW', imex_code: 'SOW', label: 'SW - Socket Weld' },
  { code: 'NPT', imex_code: 'NIP', label: 'NPT - Rosqueado (Threaded)' },
  { code: 'WAFER', imex_code: 'WAF', label: 'Wafer' },
  { code: 'LUG', imex_code: 'LUG', label: 'Lug' },
];

// ============================================================================
// BODY MATERIALS
// ============================================================================

export const BODY_MATERIALS: CatalogItem[] = [
  { code: 'ASTM_A216_WCB', imex_code: 'WCB', label: 'ASTM A216 WCB - Aço Carbono' },
  { code: 'ASTM_A352_LCB', imex_code: 'LCB', label: 'ASTM A352 LCB - Baixa Temperatura' },
  { code: 'ASTM_A352_LCC', imex_code: 'LCC', label: 'ASTM A352 LCC - Baixa Temperatura' },
  { code: 'ASTM_A351_CF8M', imex_code: '36L', label: 'ASTM A351 CF8M - Inox 316' },
  { code: 'ASTM_A351_CF3M', imex_code: '36L', label: 'ASTM A351 CF3M - Inox 316L' },
  { code: 'ASTM_A995_4A', imex_code: 'F55', label: 'ASTM A995 4A - Duplex' },
  { code: 'ASTM_A995_5A', imex_code: 'F55', label: 'ASTM A995 5A - Super Duplex' },
  { code: 'ASTM_A995_6A', imex_code: 'F55', label: 'ASTM A995 6A - Super Duplex' },
  { code: 'ASTM_A105', imex_code: 'A15', label: 'ASTM A105 - Aço Carbono Forjado' },
  { code: 'ASTM_A182_F316', imex_code: '36L', label: 'ASTM A182 F316 - Inox 316 Forjado' },
  { code: 'ASTM_A182_F304', imex_code: '34L', label: 'ASTM A182 F304 - Inox 304 Forjado' },
  { code: 'ASTM_A890_4A', imex_code: 'F55', label: 'ASTM A890 4A - Duplex' },
  { code: 'INCONEL_625', imex_code: 'I25', label: 'Inconel 625' },
  { code: 'MONEL_400', imex_code: 'M40', label: 'Monel 400' },
];

// ============================================================================
// TRIM MATERIALS (Seat + Obturator combinations)
// ============================================================================

export const TRIM_MATERIALS: CatalogItem[] = [
  { code: 'PTFE_PTFE', imex_code: 'D2D2PE', label: 'PTFE / PTFE' },
  { code: 'RPTFE_RPTFE', imex_code: 'D2D2RP', label: 'RPTFE / RPTFE' },
  { code: 'PEEK_PEEK', imex_code: 'A2A2PK', label: 'PEEK / PEEK' },
  { code: 'METAL_METAL', imex_code: 'M1STST', label: 'Metal-Metal (Stellite)' },
  { code: 'ENP_ENP', imex_code: 'A2A2RC', label: 'ENP / ENP - Nickel Plating' },
  { code: 'INCONEL_INCONEL', imex_code: 'M1ININ', label: 'Inconel / Inconel' },
  { code: 'STELLITE_STELLITE', imex_code: 'M1STST', label: 'Stellite / Stellite' },
  { code: 'NYLON_NYLON', imex_code: 'D2D2NY', label: 'Nylon / Nylon' },
  { code: 'DEVLON_DEVLON', imex_code: 'D2D2DV', label: 'Devlon / Devlon' },
  { code: 'GRAFITE_GRAFITE', imex_code: 'A2A2GR', label: 'Grafite / Grafite' },
];

// ============================================================================
// SEAT MATERIALS (individual)
// ============================================================================

export const SEAT_MATERIALS: CatalogItem[] = [
  { code: 'PTFE', imex_code: 'PT', label: 'PTFE' },
  { code: 'RPTFE', imex_code: 'RP', label: 'RPTFE (Reforçado)' },
  { code: 'PEEK', imex_code: 'PK', label: 'PEEK' },
  { code: 'METAL', imex_code: 'MT', label: 'Metal-Metal' },
  { code: 'STELLITE', imex_code: 'ST', label: 'Stellite' },
  { code: 'ENP', imex_code: 'EP', label: 'ENP (Nickel Plating)' },
  { code: 'INCONEL', imex_code: 'IN', label: 'Inconel' },
  { code: 'NYLON', imex_code: 'NY', label: 'Nylon' },
  { code: 'DEVLON', imex_code: 'DV', label: 'Devlon' },
  { code: 'GRAFITE', imex_code: 'GR', label: 'Grafite' },
];

// ============================================================================
// STEM MATERIALS
// ============================================================================

export const STEM_MATERIALS: CatalogItem[] = [
  { code: 'ASTM_A182_F6A', imex_code: 'F6A', label: 'ASTM A182 F6a - Inox 410' },
  { code: 'ASTM_A182_F316', imex_code: '316', label: 'ASTM A182 F316 - Inox 316' },
  { code: 'ASTM_A182_F51', imex_code: 'F51', label: 'ASTM A182 F51 - Duplex' },
  { code: 'ASTM_A182_F53', imex_code: 'F53', label: 'ASTM A182 F53 - Super Duplex' },
  { code: 'INCONEL_625', imex_code: 'I25', label: 'Inconel 625' },
  { code: 'MONEL_K500', imex_code: 'K50', label: 'Monel K500' },
];

// ============================================================================
// ACTUATION / ACCESSORIES
// ============================================================================

export const ACTUATION_CODES: CatalogItem[] = [
  { code: 'MANUAL', imex_code: '0L0000', label: 'Manual - Sem atuador' },
  { code: 'MANUAL_GEAR', imex_code: '0L538M', label: 'Manual - Com redutor (Gearbox)' },
  { code: 'PNEUMATICO_SA', imex_code: '1V4GB7', label: 'Pneumático - Single Acting' },
  { code: 'PNEUMATICO_DA', imex_code: '1V4GBD', label: 'Pneumático - Double Acting' },
  { code: 'ELETRICO', imex_code: '0L6GL7', label: 'Elétrico' },
  { code: 'HIDRAULICO', imex_code: '0L7HY1', label: 'Hidráulico' },
  { code: 'ELETRO_HIDRAULICO', imex_code: '0L8EH1', label: 'Eletro-Hidráulico' },
];

// ============================================================================
// SUFFIXES
// ============================================================================

export const SUFFIXES: CatalogItem[] = [
  { code: 'NEW', imex_code: 'NEW', label: 'Novo - Padrão' },
  { code: 'FS', imex_code: 'FS', label: 'Fire Safe (Testada a Fogo)' },
  { code: 'LFE', imex_code: 'LFE', label: 'Low Fugitive Emission' },
  { code: 'NACE', imex_code: 'NACE', label: 'NACE MR0175 / ISO 15156' },
  { code: 'SIL1', imex_code: 'SIL1', label: 'SIL 1 Certified' },
  { code: 'SIL2', imex_code: 'SIL2', label: 'SIL 2 Certified' },
  { code: 'SIL3', imex_code: 'SIL3', label: 'SIL 3 Certified' },
  { code: 'CRY', imex_code: 'CRY', label: 'Cryogenic Service' },
  { code: 'HT', imex_code: 'HT', label: 'High Temperature' },
];

// ============================================================================
// PRESSURE CLASSES
// ============================================================================

export const PRESSURE_CLASSES: CatalogItem[] = [
  { code: '150', imex_code: '1', label: 'Class 150' },
  { code: '300', imex_code: '3', label: 'Class 300' },
  { code: '600', imex_code: '6', label: 'Class 600' },
  { code: '800', imex_code: '8', label: 'Class 800' },
  { code: '900', imex_code: 'A', label: 'Class 900' },
  { code: '1500', imex_code: 'B', label: 'Class 1500' },
  { code: '2500', imex_code: 'Y', label: 'Class 2500' },
];

// ============================================================================
// DIAMETER OPTIONS (NPS)
// ============================================================================

export const DIAMETER_OPTIONS: CatalogItem[] = [
  { code: '0.5', imex_code: '005', label: '1/2"' },
  { code: '0.75', imex_code: '008', label: '3/4"' },
  { code: '1', imex_code: '010', label: '1"' },
  { code: '1.5', imex_code: '015', label: '1 1/2"' },
  { code: '2', imex_code: '020', label: '2"' },
  { code: '3', imex_code: '030', label: '3"' },
  { code: '4', imex_code: '040', label: '4"' },
  { code: '6', imex_code: '060', label: '6"' },
  { code: '8', imex_code: '080', label: '8"' },
  { code: '10', imex_code: '100', label: '10"' },
  { code: '12', imex_code: '120', label: '12"' },
  { code: '14', imex_code: '140', label: '14"' },
  { code: '16', imex_code: '160', label: '16"' },
  { code: '18', imex_code: '180', label: '18"' },
  { code: '20', imex_code: '200', label: '20"' },
  { code: '24', imex_code: '240', label: '24"' },
  { code: '30', imex_code: '300', label: '30"' },
  { code: '36', imex_code: '360', label: '36"' },
];

// ============================================================================
// CONSTRUCTION STANDARDS
// ============================================================================

export const CONSTRUCTION_STANDARDS: CatalogItem[] = [
  { code: 'ABNT_NBR_15827', imex_code: 'NBR', label: 'ABNT NBR 15827 - Válvulas para petróleo e gás' },
  { code: 'API_6D', imex_code: '6D', label: 'API 6D - Pipeline valves' },
  { code: 'ISO_14313', imex_code: 'ISO', label: 'ISO 14313 - Pipeline valves' },
  { code: 'API_6A', imex_code: '6A', label: 'API 6A - Wellhead equipment' },
  { code: 'API_600', imex_code: '600', label: 'API 600 - Steel gate valves' },
  { code: 'API_602', imex_code: '602', label: 'API 602 - Compact steel gate valves' },
];

// ============================================================================
// FLANGE FACES
// ============================================================================

export const FLANGE_FACES: CatalogItem[] = [
  { code: 'RF', imex_code: 'RF', label: 'RF - Raised Face' },
  { code: 'RTJ', imex_code: 'RJ', label: 'RTJ - Ring Type Joint' },
  { code: 'FF', imex_code: 'FF', label: 'FF - Flat Face' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function findByCode<T extends CatalogItem>(items: T[], code: string): T | undefined {
  return items.find(item => item.code === code);
}

export function findByImexCode<T extends CatalogItem>(items: T[], imexCode: string): T | undefined {
  return items.find(item => item.imex_code === imexCode);
}

export function getImexCode<T extends CatalogItem>(items: T[], code: string): string {
  const item = findByCode(items, code);
  return item?.imex_code || '';
}

export function getLabel<T extends CatalogItem>(items: T[], code: string): string {
  const item = findByCode(items, code);
  return item?.label || code;
}

// ============================================================================
// CATALOG EXPORT
// ============================================================================

export const IMEX_CATALOG = {
  valveModels: VALVE_MODELS,
  endConnections: END_CONNECTIONS,
  bodyMaterials: BODY_MATERIALS,
  trimMaterials: TRIM_MATERIALS,
  seatMaterials: SEAT_MATERIALS,
  stemMaterials: STEM_MATERIALS,
  actuationCodes: ACTUATION_CODES,
  suffixes: SUFFIXES,
  pressureClasses: PRESSURE_CLASSES,
  diameterOptions: DIAMETER_OPTIONS,
  constructionStandards: CONSTRUCTION_STANDARDS,
  flangeFaces: FLANGE_FACES,
};
