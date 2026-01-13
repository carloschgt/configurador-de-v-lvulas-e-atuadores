import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Flame, Wind } from "lucide-react";
import {
  ValveConfiguration,
  BODY_MATERIALS,
  SIL_OPTIONS,
} from "@/types/valve";

interface Step3MaterialsProps {
  config: ValveConfiguration;
  onChange: (updates: Partial<ValveConfiguration>) => void;
}

const Step3Materials = ({ config, onChange }: Step3MaterialsProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Materials */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Materiais</CardTitle>
          <CardDescription>
            Selecione os materiais para cada componente da válvula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyMaterial">Material Corpo/Tampa *</Label>
              <Select
                value={config.bodyMaterial || ""}
                onValueChange={(value) => onChange({ bodyMaterial: value })}
              >
                <SelectTrigger id="bodyMaterial">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_MATERIALS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obturatorMaterial">Material Obturador *</Label>
              <Select
                value={config.obturatorMaterial || ""}
                onValueChange={(value) => onChange({ obturatorMaterial: value })}
              >
                <SelectTrigger id="obturatorMaterial">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_MATERIALS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatMaterial">Material Sede *</Label>
              <Select
                value={config.seatMaterial || ""}
                onValueChange={(value) => onChange({ seatMaterial: value })}
              >
                <SelectTrigger id="seatMaterial">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PTFE">PTFE</SelectItem>
                  <SelectItem value="RPTFE">RPTFE (Reforçado)</SelectItem>
                  <SelectItem value="PEEK">PEEK</SelectItem>
                  <SelectItem value="METAL">Metal-Metal</SelectItem>
                  <SelectItem value="INCONEL">Inconel</SelectItem>
                  <SelectItem value="STELLITE">Stellite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stemMaterial">Material da Haste *</Label>
              <Select
                value={config.stemMaterial || ""}
                onValueChange={(value) => onChange({ stemMaterial: value })}
              >
                <SelectTrigger id="stemMaterial">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASTM A182 F6a">ASTM A182 F6a - Inox 410</SelectItem>
                  <SelectItem value="ASTM A182 F316">ASTM A182 F316 - Inox 316</SelectItem>
                  <SelectItem value="ASTM A182 F51">ASTM A182 F51 - Duplex</SelectItem>
                  <SelectItem value="ASTM A182 F53">ASTM A182 F53 - Super Duplex</SelectItem>
                  <SelectItem value="INCONEL 625">Inconel 625</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Requisitos Especiais</CardTitle>
          <CardDescription>
            Configure certificações e requisitos adicionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fire Test */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Teste a Fogo</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onChange({ fireTest: "USO_GERAL" })}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  config.fireTest === "USO_GERAL"
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">Uso Geral</p>
                  <p className="text-xs text-muted-foreground">Aplicações padrão</p>
                </div>
              </button>

              <button
                onClick={() => onChange({ fireTest: "TESTADA_A_FOGO" })}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  config.fireTest === "TESTADA_A_FOGO"
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Flame className="h-5 w-5 text-warning" />
                <div className="text-left">
                  <p className="font-medium text-sm">Testada a Fogo</p>
                  <p className="text-xs text-muted-foreground">API 607 / ISO 10497</p>
                </div>
              </button>
            </div>
          </div>

          {/* Low Fugitive Emission */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 text-info" />
              <div>
                <p className="font-medium text-sm">Baixa Emissão Fugitiva</p>
                <p className="text-xs text-muted-foreground">ISO 15848-1 / API 622/624/641</p>
              </div>
            </div>
            <Switch
              checked={config.lowFugitiveEmission}
              onCheckedChange={(checked) => onChange({ lowFugitiveEmission: checked })}
            />
          </div>

          {/* SIL Certification */}
          <div className="space-y-2">
            <Label htmlFor="sil">Certificação SIL (IEC 61508)</Label>
            <Select
              value={config.silCertification || ""}
              onValueChange={(value) => onChange({ silCertification: value as any })}
            >
              <SelectTrigger id="sil">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SIL_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NACE Compliance */}
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-sm">Conformidade NACE MR0175</p>
                <p className="text-xs text-muted-foreground">
                  Serviço ácido (Sour Service) - ISO 15156
                </p>
              </div>
            </div>
            <Switch
              checked={config.naceCompliant}
              onCheckedChange={(checked) => onChange({ naceCompliant: checked })}
            />
          </div>

          {config.naceCompliant && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Atenção: Verificação NACE requerida
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Os materiais selecionados serão verificados quanto à conformidade com NACE MR0175/ISO 15156.
                Materiais não qualificados serão sinalizados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Step3Materials;
