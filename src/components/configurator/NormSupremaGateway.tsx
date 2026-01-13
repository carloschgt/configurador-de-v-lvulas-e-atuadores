import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AlertTriangle, Lock, Check, Info } from 'lucide-react';
import { useNormValidation } from '@/hooks/useNormValidation';
import { useNormDecisionLog } from '@/hooks/useNormDecisionLog';
import type { Database } from '@/integrations/supabase/types';

// Import valve images
import valveEsfera from '@/assets/valves/valve-esfera.png';
import valveGlobo from '@/assets/valves/valve-globo.png';
import valveGaveta from '@/assets/valves/valve-gaveta.png';
import valveRetencao from '@/assets/valves/valve-retencao.png';
import valveBorboleta from '@/assets/valves/valve-borboleta.png';
import valveControle from '@/assets/valves/valve-controle.png';

type ValveType = Database['public']['Enums']['valve_type_enum'];
type ServiceType = Database['public']['Enums']['service_type'];

interface NormSupremaGatewayProps {
  children: React.ReactNode;
  onValidSelection?: (data: {
    valveType: ValveType;
    serviceType: ServiceType;
    constructionStandard: string;
    domains: Record<string, string[]>;
    materials: any;
    applicableNorms: string[];
  }) => void;
  onInvalidSelection?: () => void;
}

const VALVE_TYPES: { type: ValveType; label: string; image: string; description: string }[] = [
  { type: 'ESFERA', label: 'Esfera', image: valveEsfera, description: 'Válvula de esfera para controle de fluxo' },
  { type: 'GLOBO', label: 'Globo', image: valveGlobo, description: 'Válvula globo para regulagem precisa' },
  { type: 'GAVETA', label: 'Gaveta', image: valveGaveta, description: 'Válvula gaveta para bloqueio total' },
  { type: 'RETENCAO', label: 'Retenção', image: valveRetencao, description: 'Válvula de retenção anti-retorno' },
  { type: 'BORBOLETA', label: 'Borboleta', image: valveBorboleta, description: 'Válvula borboleta compacta' },
  { type: 'CONTROLE', label: 'Controle', image: valveControle, description: 'Válvula de controle proporcional' },
];

const SERVICE_TYPES: { type: ServiceType; label: string; description: string }[] = [
  { type: 'PIPELINE', label: 'Pipeline', description: 'Transporte de petróleo e gás' },
  { type: 'PROCESS', label: 'Processo', description: 'Unidades de processamento' },
  { type: 'WELLHEAD', label: 'Cabeça de Poço', description: 'Equipamentos de poço' },
  { type: 'GENERAL', label: 'Uso Geral', description: 'Aplicações industriais gerais' },
];

const NormSupremaGateway = ({ children, onValidSelection, onInvalidSelection }: NormSupremaGatewayProps) => {
  const [selectedValve, setSelectedValve] = useState<ValveType | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  const { validateCombination, isValidating } = useNormValidation();
  const { logNormSelection } = useNormDecisionLog();

  // Validate combination when valve or service changes
  useEffect(() => {
    const validate = async () => {
      if (selectedValve && selectedService) {
        const result = await validateCombination(selectedValve, selectedService);
        setValidationResult(result);
        
        // Reset standard selection if current selection is no longer valid
        if (selectedStandard && !result.constructionStandards.find(s => s.code === selectedStandard)) {
          setSelectedStandard(null);
        }
        
        // Auto-select if only one standard available
        if (result.constructionStandards.length === 1 && !selectedStandard) {
          setSelectedStandard(result.constructionStandards[0].code);
        }
      } else {
        setValidationResult(null);
        setSelectedStandard(null);
      }
    };
    
    validate();
  }, [selectedValve, selectedService, validateCombination]);

  // Notify parent when all selections are valid and log decision
  useEffect(() => {
    if (selectedValve && selectedService && selectedStandard && validationResult?.isValid) {
      // Log the norm selection decision
      logNormSelection(
        undefined, // specId - not created yet
        selectedValve,
        selectedService,
        selectedStandard,
        validationResult.applicableNorms,
        validationResult.rejectedNorms || []
      );

      onValidSelection?.({
        valveType: selectedValve,
        serviceType: selectedService,
        constructionStandard: selectedStandard,
        domains: validationResult.domains,
        materials: validationResult.materials,
        applicableNorms: validationResult.applicableNorms
      });
    } else {
      onInvalidSelection?.();
    }
  }, [selectedValve, selectedService, selectedStandard, validationResult, onValidSelection, onInvalidSelection, logNormSelection]);

  const isStandardAvailable = (standardCode: string) => {
    return validationResult?.constructionStandards?.some(s => s.code === standardCode);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* REGRA FAIL-CLOSED F1.1: Seleção tripla bloqueada */}
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Regra Norma-Suprema:</strong> Selecione o tipo de válvula, tipo de serviço e norma de construção. 
          Somente combinações válidas são permitidas.
        </AlertDescription>
      </Alert>

      {/* Valve Type Selection */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            1. Tipo de Válvula
            {selectedValve && <Check className="h-4 w-4 text-success" />}
          </CardTitle>
          <CardDescription>Selecione o tipo de válvula a configurar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {VALVE_TYPES.map((valve) => (
              <button
                key={valve.type}
                onClick={() => setSelectedValve(valve.type)}
                className={cn(
                  "group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                  selectedValve === valve.type
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]"
                )}
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                  <img 
                    src={valve.image} 
                    alt={`Válvula ${valve.label}`}
                    className={cn(
                      "w-full h-full object-contain transition-all duration-200",
                      selectedValve === valve.type 
                        ? "drop-shadow-lg" 
                        : "group-hover:drop-shadow-md"
                    )}
                  />
                </div>
                <span className={cn(
                  "font-semibold text-sm md:text-base",
                  selectedValve === valve.type ? "text-primary" : "text-foreground"
                )}>
                  {valve.label}
                </span>
                <span className="text-xs text-muted-foreground text-center line-clamp-2">
                  {valve.description}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Type Selection */}
      <Card className={cn(
        "card-industrial transition-opacity",
        !selectedValve && "opacity-50 pointer-events-none"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            2. Tipo de Serviço
            {selectedService && <Check className="h-4 w-4 text-success" />}
            {!selectedValve && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>Selecione a aplicação da válvula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERVICE_TYPES.map((service) => (
              <button
                key={service.type}
                onClick={() => setSelectedService(service.type)}
                disabled={!selectedValve}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
                  selectedService === service.type
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
                  !selectedValve && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="font-medium text-sm">{service.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {service.description}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Construction Standard Selection - FAIL-CLOSED */}
      <Card className={cn(
        "card-industrial transition-opacity",
        (!selectedValve || !selectedService) && "opacity-50 pointer-events-none"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            3. Norma de Construção
            {selectedStandard && <Check className="h-4 w-4 text-success" />}
            {(!selectedValve || !selectedService) && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {isValidating ? (
              "Verificando normas aplicáveis..."
            ) : validationResult?.isValid ? (
              `${validationResult.constructionStandards.length} norma(s) disponível(is) para ${selectedValve} + ${selectedService}`
            ) : validationResult ? (
              <span className="text-destructive">Combinação não suportada</span>
            ) : (
              "Selecione tipo de válvula e serviço primeiro"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : validationResult?.isValid ? (
            <div className="grid grid-cols-1 gap-3">
              {validationResult.constructionStandards.map((std: any) => (
                <button
                  key={std.code}
                  onClick={() => setSelectedStandard(std.code)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    selectedStandard === std.code
                      ? "border-primary bg-accent ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div>
                    <p className="font-medium">{std.code.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{std.title}</p>
                  </div>
                  {selectedStandard === std.code && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Selecionado
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : validationResult && !validationResult.isValid ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>CONFIGURAÇÃO EM DESENVOLVIMENTO</strong>
                <p className="mt-1">
                  Não há normas de construção cadastradas para a combinação {selectedValve} + {selectedService}.
                </p>
                <p className="mt-1 text-xs">
                  Contate a Engenharia: engenharia@imexsolutions.com.br
                </p>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Applicable Norms Tree */}
      {validationResult?.isValid && selectedStandard && (
        <Card className="card-industrial">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Árvore Norma-Suprema</CardTitle>
            <CardDescription>Normas aplicáveis a esta configuração</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Show selected standard first */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm font-mono">{selectedStandard.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="ml-auto text-xs">Principal</Badge>
              </div>
              {/* Show other applicable norms (excluding selected) */}
              {validationResult.applicableNorms
                .filter((norm: string) => norm !== selectedStandard)
                .map((norm: string) => (
                  <div 
                    key={norm}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm font-mono">{norm.replace(/_/g, ' ')}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Render children when valid selection is made */}
      {selectedValve && selectedService && selectedStandard && validationResult?.isValid && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default NormSupremaGateway;
