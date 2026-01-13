import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AlertTriangle, Lock, Check, Info } from 'lucide-react';
import { useNormValidation } from '@/hooks/useNormValidation';
import type { Database } from '@/integrations/supabase/types';

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

const VALVE_TYPES: { type: ValveType; label: string; icon: string; description: string }[] = [
  { type: 'ESFERA', label: 'Esfera', icon: '⚙️', description: 'Válvula de esfera para controle de fluxo' },
  { type: 'GLOBO', label: 'Globo', icon: '🔵', description: 'Válvula globo para regulagem precisa' },
  { type: 'GAVETA', label: 'Gaveta', icon: '🚪', description: 'Válvula gaveta para bloqueio total' },
  { type: 'RETENCAO', label: 'Retenção', icon: '↩️', description: 'Válvula de retenção anti-retorno' },
  { type: 'BORBOLETA', label: 'Borboleta', icon: '🦋', description: 'Válvula borboleta compacta' },
  { type: 'CONTROLE', label: 'Controle', icon: '🎛️', description: 'Válvula de controle proporcional' },
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

  // Notify parent when all selections are valid
  useEffect(() => {
    if (selectedValve && selectedService && selectedStandard && validationResult?.isValid) {
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
  }, [selectedValve, selectedService, selectedStandard, validationResult, onValidSelection, onInvalidSelection]);

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {VALVE_TYPES.map((valve) => (
              <button
                key={valve.type}
                onClick={() => setSelectedValve(valve.type)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
                  selectedValve === valve.type
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <span className="text-2xl">{valve.icon}</span>
                <span className="font-medium text-sm">{valve.label}</span>
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
              {validationResult.applicableNorms.map((norm: string, idx: number) => (
                <div 
                  key={norm}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    idx === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                  )}
                >
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm font-mono">{norm.replace(/_/g, ' ')}</span>
                  {idx === 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">Principal</Badge>
                  )}
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
