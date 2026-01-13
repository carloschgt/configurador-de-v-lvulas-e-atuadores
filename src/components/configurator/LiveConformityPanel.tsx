import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield,
  Zap,
  FileCheck,
  Lock
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ValveType = Database['public']['Enums']['valve_type_enum'];
type ServiceType = Database['public']['Enums']['service_type'];

interface ConformityCheck {
  id: string;
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING' | 'BLOCKED';
  message: string;
  standard?: string;
  systemRuleId?: string;
}

interface LiveConformityPanelProps {
  valveType: ValveType | null;
  serviceType: ServiceType | null;
  constructionStandard: string | null;
  naceRequired: boolean;
  fireTestRequired: boolean;
  lowEmissionRequired: boolean;
  silLevel: string | null;
  selectedMaterials: {
    body: string | null;
    obturator: string | null;
    seat: string | null;
    stem: string | null;
  };
  checks?: ConformityCheck[];
}

const LiveConformityPanel = ({
  valveType,
  serviceType,
  constructionStandard,
  naceRequired,
  fireTestRequired,
  lowEmissionRequired,
  silLevel,
  selectedMaterials,
  checks = []
}: LiveConformityPanelProps) => {
  // Generate conformity checks based on current state
  const generateChecks = (): ConformityCheck[] => {
    const allChecks: ConformityCheck[] = [...checks];

    // Check 1: Valve Type + Service Type combination
    if (valveType && serviceType) {
      allChecks.push({
        id: 'combination',
        rule: 'Combinação Válvula/Serviço',
        status: 'PASS',
        message: `${valveType} + ${serviceType} validado`,
        systemRuleId: 'F1.1'
      });
    } else {
      allChecks.push({
        id: 'combination',
        rule: 'Combinação Válvula/Serviço',
        status: 'PENDING',
        message: 'Selecione tipo de válvula e serviço',
        systemRuleId: 'F1.1'
      });
    }

    // Check 2: Construction Standard
    if (constructionStandard) {
      allChecks.push({
        id: 'construction',
        rule: 'Norma de Construção',
        status: 'PASS',
        message: `Conforme ${constructionStandard}`,
        standard: constructionStandard,
        systemRuleId: 'F1.2'
      });
    } else if (valveType && serviceType) {
      allChecks.push({
        id: 'construction',
        rule: 'Norma de Construção',
        status: 'BLOCKED',
        message: 'Selecione uma norma válida',
        systemRuleId: 'F1.2'
      });
    }

    // Check 3: NACE Compliance
    if (naceRequired) {
      const allMaterialsNace = selectedMaterials.body && selectedMaterials.obturator && 
                               selectedMaterials.seat && selectedMaterials.stem;
      
      allChecks.push({
        id: 'nace',
        rule: 'Conformidade NACE MR0175',
        status: allMaterialsNace ? 'PASS' : 'BLOCKED',
        message: allMaterialsNace 
          ? 'Todos os materiais qualificados NACE'
          : 'Selecione materiais qualificados NACE',
        standard: 'NACE MR0175 / ISO 15156',
        systemRuleId: 'F1.4'
      });
    }

    // Check 4: Fire Test
    if (fireTestRequired) {
      allChecks.push({
        id: 'fire',
        rule: 'Teste a Fogo',
        status: selectedMaterials.seat ? 'PASS' : 'PENDING',
        message: selectedMaterials.seat 
          ? 'Materiais compatíveis com teste a fogo'
          : 'Verificar compatibilidade de materiais',
        standard: 'API 607 / API 6FA',
        systemRuleId: 'F2.1'
      });
    }

    // Check 5: Low Emission
    if (lowEmissionRequired) {
      allChecks.push({
        id: 'emission',
        rule: 'Baixa Emissão Fugitiva',
        status: selectedMaterials.stem ? 'PASS' : 'PENDING',
        message: 'Verificar requisitos ISO 15848-1',
        standard: 'ISO 15848-1',
        systemRuleId: 'F2.2'
      });
    }

    // Check 6: SIL
    if (silLevel && silLevel !== 'NA') {
      allChecks.push({
        id: 'sil',
        rule: `Certificação ${silLevel}`,
        status: 'WARNING',
        message: 'Requer cálculo de PFDavg',
        standard: 'IEC 61508 / IEC 61511',
        systemRuleId: 'F3.1'
      });
    }

    return allChecks;
  };

  const allChecks = generateChecks();
  
  const passCount = allChecks.filter((c) => c.status === 'PASS').length;
  const failCount = allChecks.filter((c) => c.status === 'FAIL').length;
  const blockedCount = allChecks.filter((c) => c.status === 'BLOCKED').length;
  const warningCount = allChecks.filter((c) => c.status === 'WARNING').length;
  const pendingCount = allChecks.filter((c) => c.status === 'PENDING').length;
  
  const totalChecks = allChecks.length;
  const coveragePercent = totalChecks > 0 
    ? Math.round((passCount / totalChecks) * 100) 
    : 0;

  const canPublish = failCount === 0 && blockedCount === 0 && pendingCount === 0;

  const getStatusIcon = (status: ConformityCheck['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'BLOCKED':
        return <Lock className="h-4 w-4 text-destructive" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConformityCheck['status']) => {
    switch (status) {
      case 'PASS':
        return <Badge className="bg-success/10 text-success border-success/20">OK</Badge>;
      case 'FAIL':
        return <Badge variant="destructive">Erro</Badge>;
      case 'BLOCKED':
        return <Badge variant="destructive">Bloqueado</Badge>;
      case 'WARNING':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Atenção</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Card className="card-industrial h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Conformidade Norma-Suprema
          </CardTitle>
        </div>
        
        {/* Coverage Progress */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cobertura Normativa</span>
            <span className={`font-mono font-bold ${
              coveragePercent === 100 ? 'text-success' : 
              coveragePercent >= 50 ? 'text-warning' : 'text-destructive'
            }`}>
              {coveragePercent}%
            </span>
          </div>
          <Progress 
            value={coveragePercent} 
            className={`h-2 ${
              coveragePercent === 100 ? '[&>div]:bg-success' : 
              coveragePercent >= 50 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
            }`}
          />
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {blockedCount > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  {blockedCount} Bloqueados
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Requisitos que impedem a publicação</TooltipContent>
            </Tooltip>
          )}
          {failCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {failCount} Erros
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
              {warningCount} Alertas
            </Badge>
          )}
          {passCount > 0 && (
            <Badge className="bg-success/10 text-success border-success/20 text-xs">
              {passCount} OK
            </Badge>
          )}
        </div>

        {/* Publication Status */}
        <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${
          canPublish 
            ? 'bg-success/10 border border-success/20' 
            : 'bg-destructive/10 border border-destructive/20'
        }`}>
          {canPublish ? (
            <>
              <FileCheck className="h-4 w-4 text-success" />
              <span className="text-sm text-success font-medium">Pronto para publicação</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">Publicação bloqueada</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-32rem)]">
          <div className="space-y-2 p-4 pt-0">
            {allChecks.map((check) => (
              <div
                key={check.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  check.status === 'FAIL' || check.status === 'BLOCKED'
                    ? 'border-destructive/30 bg-destructive/5'
                    : check.status === 'WARNING'
                    ? 'border-warning/30 bg-warning/5'
                    : check.status === 'PASS'
                    ? 'border-success/20 bg-success/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{check.rule}</p>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {check.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {check.standard && (
                      <span className="text-xs text-primary/80 font-mono">
                        {check.standard}
                      </span>
                    )}
                    {check.systemRuleId && (
                      <span className="text-xs text-muted-foreground font-mono">
                        [{check.systemRuleId}]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveConformityPanel;
