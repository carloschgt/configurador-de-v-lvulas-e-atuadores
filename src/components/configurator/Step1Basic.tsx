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
import { ValveConfiguration } from "@/types/valve";
import { 
  IMEX_CATALOG,
  type CatalogItem 
} from "@/data/imex-catalog";

interface Step1BasicProps {
  config: ValveConfiguration;
  onChange: (updates: Partial<ValveConfiguration>) => void;
}

const Step1Basic = ({ config, onChange }: Step1BasicProps) => {
  return (
    <div className="space-y-6 animate-fade-in">

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
                {IMEX_CATALOG.constructionStandards.map((std) => (
                  <SelectItem key={std.code} value={std.code}>
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
                  {IMEX_CATALOG.diameterOptions.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.label}
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
                  {IMEX_CATALOG.pressureClasses.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.label}
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
                  {IMEX_CATALOG.endConnections.map((e) => (
                    <SelectItem key={e.code} value={e.code}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flangeFace">
                Face do Flange
                {config.endType?.includes("FLANGEADO") && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Obrigatório
                  </Badge>
                )}
              </Label>
              <Select
                value={config.flangeFace || ""}
                onValueChange={(value) => onChange({ flangeFace: value as any })}
                disabled={!config.endType?.includes("FLANGEADO")}
              >
                <SelectTrigger id="flangeFace">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {IMEX_CATALOG.flangeFaces.map((f) => (
                    <SelectItem key={f.code} value={f.code}>
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
