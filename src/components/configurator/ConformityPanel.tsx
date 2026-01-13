import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield } from "lucide-react";
import { ValveConfiguration, ConformityCheck } from "@/types/valve";

interface ConformityPanelProps {
  config: ValveConfiguration;
}

const ConformityPanel = ({ config }: ConformityPanelProps) => {
  // Generate conformity checks based on configuration
  const generateChecks = (): ConformityCheck[] => {
    const checks: ConformityCheck[] = [];

    // Basic configuration checks
    if (config.valveType) {
      checks.push({
        id: "valve-type",
        rule: "Tipo de válvula definido",
        status: "PASS",
        message: `Válvula tipo ${config.valveType} selecionada`,
      });
    } else {
      checks.push({
        id: "valve-type",
        rule: "Tipo de válvula",
        status: "PENDING",
        message: "Selecione o tipo de válvula",
      });
    }

    // Construction standard
    if (config.constructionStandard) {
      checks.push({
        id: "standard",
        rule: "Norma de construção",
        status: "PASS",
        message: `Conforme ${config.constructionStandard}`,
        standard: config.constructionStandard,
      });
    }

    // Pressure class validation
    if (config.pressureClass && config.diameterNPS) {
      const highPressure = Number(config.pressureClass) >= 900;
      const largeDiameter = Number(config.diameterNPS.replace(/[^\d.]/g, '')) >= 10;
      
      if (highPressure && largeDiameter) {
        checks.push({
          id: "pressure-size",
          rule: "Combinação pressão/diâmetro",
          status: "WARNING",
          message: "Alta pressão + grande diâmetro: verificar disponibilidade",
        });
      }
    }

    // Flange face validation
    if (config.endType === "FLANGEADO" && !config.flangeFace) {
      checks.push({
        id: "flange-face",
        rule: "Face do flange",
        status: "FAIL",
        message: "Face do flange obrigatória para extremidade flangeada",
      });
    }

    // NACE compliance check
    if (config.naceCompliant) {
      const naceApprovedMaterials = ["ASTM A351 CF3M", "ASTM A995 4A", "ASTM A995 5A"];
      const bodyMaterialOk = config.bodyMaterial ? naceApprovedMaterials.includes(config.bodyMaterial) : false;

      checks.push({
        id: "nace",
        rule: "Conformidade NACE MR0175",
        status: config.bodyMaterial ? (bodyMaterialOk ? "PASS" : "FAIL") : "PENDING",
        message: bodyMaterialOk 
          ? "Material do corpo qualificado para serviço ácido"
          : config.bodyMaterial 
            ? "Material do corpo não qualificado para NACE"
            : "Selecione o material do corpo",
        standard: "NACE MR0175 / ISO 15156",
      });
    }

    // Fire test standard
    if (config.fireTest === "TESTADA_A_FOGO") {
      checks.push({
        id: "fire-test",
        rule: "Teste a fogo",
        status: "PASS",
        message: "Certificação API 607 / ISO 10497 requerida",
        standard: "API 607",
      });
    }

    // Low fugitive emission
    if (config.lowFugitiveEmission) {
      checks.push({
        id: "lfe",
        rule: "Baixa emissão fugitiva",
        status: "PASS",
        message: "Certificação ISO 15848-1 requerida",
        standard: "ISO 15848-1",
      });
    }

    // SIL certification
    if (config.silCertification && config.silCertification !== "NA") {
      checks.push({
        id: "sil",
        rule: `Certificação ${config.silCertification}`,
        status: "PASS",
        message: "Documentação IEC 61508/61511 requerida",
        standard: "IEC 61508",
      });
    }

    return checks;
  };

  const checks = generateChecks();
  const passCount = checks.filter((c) => c.status === "PASS").length;
  const failCount = checks.filter((c) => c.status === "FAIL").length;
  const warningCount = checks.filter((c) => c.status === "WARNING").length;
  const pendingCount = checks.filter((c) => c.status === "PENDING").length;

  const getStatusIcon = (status: ConformityCheck["status"]) => {
    switch (status) {
      case "PASS":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "FAIL":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConformityCheck["status"]) => {
    switch (status) {
      case "PASS":
        return <Badge className="bg-success/10 text-success border-success/20">OK</Badge>;
      case "FAIL":
        return <Badge variant="destructive">Erro</Badge>;
      case "WARNING":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Atenção</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Card className="card-industrial h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Conformidade
          </CardTitle>
          <div className="flex items-center gap-1">
            {failCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {failCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                {warningCount}
              </Badge>
            )}
            {passCount > 0 && (
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                {passCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-2 p-4 pt-0">
            {checks.map((check) => (
              <div
                key={check.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  check.status === "FAIL"
                    ? "border-destructive/30 bg-destructive/5"
                    : check.status === "WARNING"
                    ? "border-warning/30 bg-warning/5"
                    : check.status === "PASS"
                    ? "border-success/20 bg-success/5"
                    : "border-border bg-muted/30"
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
                  {check.standard && (
                    <p className="text-xs text-primary/80 mt-1 font-mono">
                      {check.standard}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConformityPanel;
