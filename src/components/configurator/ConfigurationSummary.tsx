import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { ValveConfiguration, VALVE_TYPES } from "@/types/valve";

interface ConfigurationSummaryProps {
  config: ValveConfiguration;
}

const ConfigurationSummary = ({ config }: ConfigurationSummaryProps) => {
  const valveInfo = VALVE_TYPES.find((v) => v.type === config.valveType);

  const SummaryItem = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-start py-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-right max-w-[60%] truncate">
          {value}
        </span>
      </div>
    );
  };

  return (
    <Card className="card-industrial h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Resumo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="p-4 pt-0 space-y-4">
            {/* Header */}
            {config.valveType && (
              <div className="p-3 rounded-lg bg-accent/50 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{valveInfo?.icon}</span>
                  <span className="font-semibold">{valveInfo?.label}</span>
                </div>
                {config.constructionStandard && (
                  <Badge variant="secondary" className="text-xs">
                    {config.constructionStandard}
                  </Badge>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Dados Básicos
              </p>
              <div className="space-y-0.5">
                <SummaryItem label="Diâmetro" value={config.diameterNPS ? `${config.diameterNPS}"` : null} />
                <SummaryItem label="Classe" value={config.pressureClass ? `Class ${config.pressureClass}` : null} />
                <SummaryItem label="Extremidade" value={config.endType} />
                <SummaryItem label="Face" value={config.flangeFace} />
              </div>
            </div>

            <Separator />

            {/* Actuation */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Acionamento
              </p>
              <div className="space-y-0.5">
                <SummaryItem label="Tipo" value={config.actuationType} />
                {config.torque && <SummaryItem label="Torque" value={`${config.torque} Nm`} />}
                {config.thrust && <SummaryItem label="Força" value={`${config.thrust} kN`} />}
                {config.travel && <SummaryItem label="Curso" value={`${config.travel} mm`} />}
                <SummaryItem label="Top Flange" value={config.topFlange} />
              </div>
            </div>

            <Separator />

            {/* Materials */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Materiais
              </p>
              <div className="space-y-0.5">
                <SummaryItem label="Corpo/Tampa" value={config.bodyMaterial} />
                <SummaryItem label="Obturador" value={config.obturatorMaterial} />
                <SummaryItem label="Sede" value={config.seatMaterial} />
                <SummaryItem label="Haste" value={config.stemMaterial} />
              </div>
            </div>

            <Separator />

            {/* Special */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Requisitos Especiais
              </p>
              <div className="flex flex-wrap gap-1.5">
                {config.fireTest === "TESTADA_A_FOGO" && (
                  <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                    Fire Safe
                  </Badge>
                )}
                {config.lowFugitiveEmission && (
                  <Badge className="bg-info/10 text-info border-info/20 text-xs">
                    Low Emission
                  </Badge>
                )}
                {config.silCertification && config.silCertification !== "NA" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {config.silCertification}
                  </Badge>
                )}
                {config.naceCompliant && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                    NACE
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConfigurationSummary;
