import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ValveConfiguration,
  VALVE_TYPES,
  CONSTRUCTION_STANDARDS,
  DIAMETER_OPTIONS,
  PRESSURE_CLASSES,
  END_TYPES,
  FLANGE_FACES,
  ValveType,
} from "@/types/valve";

interface Step1BasicProps {
  config: ValveConfiguration;
  onChange: (updates: Partial<ValveConfiguration>) => void;
}

const Step1Basic = ({ config, onChange }: Step1BasicProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Valve Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Tipo de Válvula *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VALVE_TYPES.map((valve) => (
            <button
              key={valve.type}
              onClick={() => onChange({ valveType: valve.type })}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 hover:border-primary/50",
                config.valveType === valve.type
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:bg-accent/50"
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
      </div>

      {/* Construction Standard */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Norma de Construção</CardTitle>
          <CardDescription>
            Selecione a norma aplicável para o tipo de válvula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standard">Norma *</Label>
            <Select
              value={config.constructionStandard || ""}
              onValueChange={(value) => onChange({ constructionStandard: value as any })}
            >
              <SelectTrigger id="standard">
                <SelectValue placeholder="Selecione a norma" />
              </SelectTrigger>
              <SelectContent>
                {CONSTRUCTION_STANDARDS.map((std) => (
                  <SelectItem key={std.value} value={std.value}>
                    {std.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diameter">Diâmetro NPS *</Label>
              <Select
                value={config.diameterNPS || ""}
                onValueChange={(value) => onChange({ diameterNPS: value })}
              >
                <SelectTrigger id="diameter">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DIAMETER_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pressure">Classe de Pressão *</Label>
              <Select
                value={config.pressureClass || ""}
                onValueChange={(value) => onChange({ pressureClass: value as any })}
              >
                <SelectTrigger id="pressure">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PRESSURE_CLASSES.map((p) => (
                    <SelectItem key={p} value={p}>
                      Class {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* End Type & Flange Face */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Extremidades</CardTitle>
          <CardDescription>
            Configure o tipo de conexão da válvula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endType">Tipo de Extremidade *</Label>
              <Select
                value={config.endType || ""}
                onValueChange={(value) => onChange({ endType: value as any })}
              >
                <SelectTrigger id="endType">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {END_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flangeFace">
                Face do Flange
                {config.endType === "FLANGEADO" && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Obrigatório
                  </Badge>
                )}
              </Label>
              <Select
                value={config.flangeFace || ""}
                onValueChange={(value) => onChange({ flangeFace: value as any })}
                disabled={config.endType !== "FLANGEADO"}
              >
                <SelectTrigger id="flangeFace">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {FLANGE_FACES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step1Basic;
