// Valve Configuration Types for IMEX Solutions

export type ValveType = 
  | 'ESFERA' 
  | 'GLOBO' 
  | 'GAVETA' 
  | 'RETENCAO' 
  | 'BORBOLETA' 
  | 'CONTROLE';

export type ActuationType = 
  | 'MANUAL' 
  | 'PNEUMATICO' 
  | 'ELETRICO' 
  | 'HIDRAULICO';

export type ConstructionStandard = 
  | 'ABNT NBR 15827' 
  | 'API 6D' 
  | 'ISO 14313';

export type PressureClass = 
  | '150' 
  | '300' 
  | '600' 
  | '900' 
  | '1500' 
  | '2500';

export type EndType = 
  | 'FLANGEADO' 
  | 'BW' 
  | 'SW' 
  | 'NPT' 
  | 'WAFER' 
  | 'LUG';

export type FlangeFace = 
  | 'RF' 
  | 'RTJ' 
  | 'FF';

export type FireTestOption = 
  | 'USO_GERAL' 
  | 'TESTADA_A_FOGO';

export type SILCertification = 
  | 'NA' 
  | 'SIL1' 
  | 'SIL2' 
  | 'SIL3';

export type SpecStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'PUBLISHED';

export interface ValveConfiguration {
  // Step 1 - Basic
  valveType: ValveType | null;
  constructionStandard: ConstructionStandard | null;
  diameterNPS: string | null;
  pressureClass: PressureClass | null;
  endType: EndType | null;
  flangeFace: FlangeFace | null;
  
  // Step 2 - Actuation
  actuationType: ActuationType | null;
  stemDiameter?: number;
  pitch?: number;
  travel?: number;
  torque?: number;
  thrust?: number;
  topFlange?: string;
  
  // Step 3 - Materials & Special
  bodyMaterial: string | null;
  obturatorMaterial: string | null;
  seatMaterial: string | null;
  stemMaterial: string | null;
  fireTest: FireTestOption | null;
  lowFugitiveEmission: boolean;
  silCertification: SILCertification | null;
  naceCompliant: boolean;
}

export interface Specification {
  id: string;
  specCode: string;
  status: SpecStatus;
  imexCode?: string;
  configuration: ValveConfiguration;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ConformityCheck {
  id: string;
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  message: string;
  standard?: string;
}

// Lookup data types
export interface AttributeOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValveTypeInfo {
  type: ValveType;
  label: string;
  description: string;
  icon: string;
}

// Available options
export const VALVE_TYPES: ValveTypeInfo[] = [
  { type: 'ESFERA', label: 'Esfera', description: 'Válvula de esfera para controle de fluxo', icon: '⚙️' },
  { type: 'GLOBO', label: 'Globo', description: 'Válvula globo para regulagem precisa', icon: '🔵' },
  { type: 'GAVETA', label: 'Gaveta', description: 'Válvula gaveta para bloqueio total', icon: '🚪' },
  { type: 'RETENCAO', label: 'Retenção', description: 'Válvula de retenção anti-retorno', icon: '↩️' },
  { type: 'BORBOLETA', label: 'Borboleta', description: 'Válvula borboleta compacta', icon: '🦋' },
  { type: 'CONTROLE', label: 'Controle', description: 'Válvula de controle proporcional', icon: '🎛️' },
];

export const CONSTRUCTION_STANDARDS: AttributeOption[] = [
  { value: 'ABNT NBR 15827', label: 'ABNT NBR 15827 - Válvulas para petróleo e gás' },
  { value: 'API 6D', label: 'API 6D - Pipeline valves' },
  { value: 'ISO 14313', label: 'ISO 14313 - Pipeline valves' },
];

export const DIAMETER_OPTIONS: string[] = [
  '1/2', '3/4', '1', '1 1/2', '2', '3', '4', '6', '8', '10', '12', '14', '16', '18', '20', '24'
];

export const PRESSURE_CLASSES: PressureClass[] = ['150', '300', '600', '900', '1500', '2500'];

export const END_TYPES: AttributeOption[] = [
  { value: 'FLANGEADO', label: 'Flangeado' },
  { value: 'BW', label: 'BW (Butt Weld)' },
  { value: 'SW', label: 'SW (Socket Weld)' },
  { value: 'NPT', label: 'NPT (Rosqueado)' },
  { value: 'WAFER', label: 'Wafer' },
  { value: 'LUG', label: 'Lug' },
];

export const FLANGE_FACES: AttributeOption[] = [
  { value: 'RF', label: 'RF (Raised Face)' },
  { value: 'RTJ', label: 'RTJ (Ring Type Joint)' },
  { value: 'FF', label: 'FF (Flat Face)' },
];

export const ACTUATION_TYPES: AttributeOption[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'PNEUMATICO', label: 'Pneumático' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'HIDRAULICO', label: 'Hidráulico' },
];

export const BODY_MATERIALS: AttributeOption[] = [
  { value: 'ASTM A216 WCB', label: 'ASTM A216 WCB - Aço Carbono' },
  { value: 'ASTM A352 LCC', label: 'ASTM A352 LCC - Baixa Temperatura' },
  { value: 'ASTM A351 CF8M', label: 'ASTM A351 CF8M - Inox 316' },
  { value: 'ASTM A351 CF3M', label: 'ASTM A351 CF3M - Inox 316L' },
  { value: 'ASTM A995 4A', label: 'ASTM A995 4A - Duplex' },
  { value: 'ASTM A995 5A', label: 'ASTM A995 5A - Super Duplex' },
];

export const SIL_OPTIONS: AttributeOption[] = [
  { value: 'NA', label: 'N/A - Não aplicável' },
  { value: 'SIL1', label: 'SIL 1' },
  { value: 'SIL2', label: 'SIL 2' },
  { value: 'SIL3', label: 'SIL 3' },
];
