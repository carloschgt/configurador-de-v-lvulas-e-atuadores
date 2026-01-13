import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Gauge, AlertTriangle, Check, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNormValidation } from '@/hooks/useNormValidation';

interface TorqueCalculatorProps {
  valveSize?: number;
  pressureClass?: number;
  seatMaterial?: string;
  onTorqueValidated?: (isValid: boolean, torqueValue: number) => void;
}

const TorqueCalculator = ({
  valveSize,
  pressureClass,
  seatMaterial,
  onTorqueValidated
}: TorqueCalculatorProps) => {
  const { calculateTorque } = useNormValidation();
  const [calculatedTorque, setCalculatedTorque] = useState<{
    minTorque: number;
    maxTorque: number;
    recommended: number;
    unit: string;
  } | null>(null);
  const [selectedTorque, setSelectedTorque] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculate = async () => {
      if (valveSize && pressureClass && seatMaterial) {
        setIsCalculating(true);
        const result = await calculateTorque(valveSize, pressureClass, seatMaterial);
        setCalculatedTorque(result);
        setSelectedTorque(result.recommended);
        onTorqueValidated?.(true, result.recommended);
        setIsCalculating(false);
      }
    };
    calculate();
  }, [valveSize, pressureClass, seatMaterial, calculateTorque, onTorqueValidated]);

  const isWithinRange = calculatedTorque && 
    selectedTorque >= calculatedTorque.minTorque && 
    selectedTorque <= calculatedTorque.maxTorque;

  const getPositionPercent = () => {
    if (!calculatedTorque) return 50;
    const range = calculatedTorque.maxTorque - calculatedTorque.minTorque;
    const position = ((selectedTorque - calculatedTorque.minTorque) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const handleTorqueChange = (value: number[]) => {
    const newValue = value[0];
    setSelectedTorque(newValue);
    
    if (calculatedTorque) {
      const isValid = newValue >= calculatedTorque.minTorque && newValue <= calculatedTorque.maxTorque;
      onTorqueValidated?.(isValid, newValue);
    }
  };

  if (!valveSize || !pressureClass || !seatMaterial) {
    return (
      <Card className="card-industrial">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            Calculador de Torque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Complete a seleção de diâmetro, classe de pressão e material da sede para calcular o torque.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-industrial">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          Calculador de Torque
          <Badge variant="outline" className="ml-auto">
            <Calculator className="h-3 w-3 mr-1" />
            Auto-Calculado
          </Badge>
        </CardTitle>
        <CardDescription>
          Torque calculado automaticamente com base nos parâmetros da válvula (Regra F1.6)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isCalculating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : calculatedTorque ? (
          <>
            {/* Calculation Inputs Summary */}
            <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Diâmetro</p>
                <p className="font-mono font-bold">{valveSize}"</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Classe</p>
                <p className="font-mono font-bold">{pressureClass}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="font-mono font-bold text-sm">{seatMaterial}</p>
              </div>
            </div>

            {/* Torque Range Visualization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Faixa de Torque Permitida</Label>
                <span className="text-sm font-mono">
                  {calculatedTorque.minTorque} - {calculatedTorque.maxTorque} {calculatedTorque.unit}
                </span>
              </div>

              <div className="relative pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>{calculatedTorque.minTorque} {calculatedTorque.unit}</span>
                  <span className="text-primary font-medium">
                    Recomendado: {calculatedTorque.recommended} {calculatedTorque.unit}
                  </span>
                  <span>{calculatedTorque.maxTorque} {calculatedTorque.unit}</span>
                </div>

                <Slider
                  value={[selectedTorque]}
                  min={calculatedTorque.minTorque - 50}
                  max={calculatedTorque.maxTorque + 50}
                  step={1}
                  onValueChange={handleTorqueChange}
                  className={cn(
                    isWithinRange 
                      ? '[&_[role=slider]]:bg-success [&_[role=slider]]:border-success' 
                      : '[&_[role=slider]]:bg-destructive [&_[role=slider]]:border-destructive'
                  )}
                />

                {/* Valid range indicator */}
                <div 
                  className="absolute top-[3.25rem] h-1 bg-success/30 rounded"
                  style={{
                    left: `${((calculatedTorque.minTorque - (calculatedTorque.minTorque - 50)) / 
                            ((calculatedTorque.maxTorque + 50) - (calculatedTorque.minTorque - 50))) * 100}%`,
                    width: `${((calculatedTorque.maxTorque - calculatedTorque.minTorque) / 
                             ((calculatedTorque.maxTorque + 50) - (calculatedTorque.minTorque - 50))) * 100}%`
                  }}
                />
              </div>

              {/* Selected Value Display */}
              <div className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-lg border-2",
                isWithinRange 
                  ? "border-success bg-success/10" 
                  : "border-destructive bg-destructive/10"
              )}>
                {isWithinRange ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-2xl font-mono font-bold">
                  {selectedTorque} {calculatedTorque.unit}
                </span>
              </div>
            </div>

            {/* Validation Message */}
            {!isWithinRange && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>TORQUE FORA DA FAIXA NORMA</strong>
                  <p className="mt-1">
                    Faixa permitida: {calculatedTorque.minTorque} - {calculatedTorque.maxTorque} {calculatedTorque.unit}
                  </p>
                  <p className="text-xs mt-1">
                    Ajuste o torque para dentro da faixa calculada ou revise os parâmetros da válvula.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Formula Info */}
            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-dashed">
              <p className="font-medium mb-1">Cálculo baseado em:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Diâmetro × Classe de Pressão × Coeficiente Base</li>
                <li>Coeficiente de atrito do material da sede</li>
                <li>Margem de segurança: ±10%</li>
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TorqueCalculator;
