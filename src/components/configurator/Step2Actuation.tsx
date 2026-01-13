import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  ValveConfiguration,
  ACTUATION_TYPES,
} from "@/types/valve";

interface Step2ActuationProps {
  config: ValveConfiguration;
  onChange: (updates: Partial<ValveConfiguration>) => void;
}

const Step2Actuation = ({ config, onChange }: Step2ActuationProps) => {
  const showActuatorFields = config.actuationType && config.actuationType !== "MANUAL";
  const isQuarterTurn = config.valveType === "ESFERA" || config.valveType === "BORBOLETA";
  const isLinear = config.valveType === "GLOBO" || config.valveType === "GAVETA" || config.valveType === "CONTROLE";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actuation Type */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tipo de Acionamento</CardTitle>
          <CardDescription>
            Defina como a válvula será operada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACTUATION_TYPES.map((act) => (
              <button
                key={act.value}
                onClick={() => onChange({ actuationType: act.value as any })}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                  config.actuationType === act.value
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-accent/50 hover:border-primary/50"
                }`}
              >
                <span className="text-2xl">
                  {act.value === "MANUAL" && "🔧"}
                  {act.value === "PNEUMATICO" && "💨"}
                  {act.value === "ELETRICO" && "⚡"}
                  {act.value === "HIDRAULICO" && "💧"}
                </span>
                <span className="font-medium text-sm">{act.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actuator Parameters */}
      {showActuatorFields && (
        <Card className="card-industrial animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parâmetros do Atuador</CardTitle>
            <CardDescription>
              Informe os dados técnicos necessários para dimensionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quarter Turn Valves */}
            {isQuarterTurn && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="torque">Torque (Nm) *</Label>
                  <Input
                    id="torque"
                    type="number"
                    placeholder="Ex: 250"
                    value={config.torque || ""}
                    onChange={(e) => onChange({ torque: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Torque necessário para operação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topFlange">Top Flange (ISO 5211)</Label>
                  <Input
                    id="topFlange"
                    placeholder="Ex: F10, F12, F14"
                    value={config.topFlange || ""}
                    onChange={(e) => onChange({ topFlange: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Interface de montagem do atuador
                  </p>
                </div>
              </div>
            )}

            {/* Linear Valves */}
            {isLinear && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stemDiameter">Diâmetro da Haste (in) *</Label>
                  <Input
                    id="stemDiameter"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 0.5"
                    value={config.stemDiameter || ""}
                    onChange={(e) => onChange({ stemDiameter: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pitch">Passo (mm) *</Label>
                  <Input
                    id="pitch"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5"
                    value={config.pitch || ""}
                    onChange={(e) => onChange({ pitch: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel">Curso (mm) *</Label>
                  <Input
                    id="travel"
                    type="number"
                    placeholder="Ex: 50"
                    value={config.travel || ""}
                    onChange={(e) => onChange({ travel: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thrust">Força (kN) *</Label>
                  <Input
                    id="thrust"
                    type="number"
                    placeholder="Ex: 10"
                    value={config.thrust || ""}
                    onChange={(e) => onChange({ thrust: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-primary/20">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Os parâmetros do atuador são necessários para o correto dimensionamento e seleção do equipamento.
                Consulte a folha de dados da válvula para obter os valores precisos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Info */}
      {config.actuationType === "MANUAL" && (
        <Card className="card-industrial border-primary/20 bg-accent/30 animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <div>
                <p className="font-medium">Acionamento Manual</p>
                <p className="text-sm text-muted-foreground">
                  A válvula será operada manualmente através de volante ou alavanca.
                  Não são necessários parâmetros adicionais de atuação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Step2Actuation;
