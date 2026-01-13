import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, Check, Info, Calculator } from 'lucide-react';

interface SILCalculatorProps {
  requiredSIL?: 'SIL1' | 'SIL2' | 'SIL3' | null;
  onSILValidated?: (isValid: boolean, calculatedSIL: string | null, pfdAvg: number) => void;
}

interface SILRequirement {
  level: string;
  pfd_min: number;
  pfd_max: number;
  hft: number;
  sff_min: number;
  color: string;
}

const SIL_REQUIREMENTS: SILRequirement[] = [
  { level: 'SIL1', pfd_min: 0.01, pfd_max: 0.1, hft: 0, sff_min: 0.6, color: 'bg-yellow-500' },
  { level: 'SIL2', pfd_min: 0.001, pfd_max: 0.01, hft: 1, sff_min: 0.9, color: 'bg-orange-500' },
  { level: 'SIL3', pfd_min: 0.0001, pfd_max: 0.001, hft: 1, sff_min: 0.99, color: 'bg-red-500' },
];

const SILCalculator = ({ requiredSIL, onSILValidated }: SILCalculatorProps) => {
  // Input parameters
  const [lambdaDU, setLambdaDU] = useState<number>(0.000005); // Dangerous undetected failure rate (per hour)
  const [testInterval, setTestInterval] = useState<number>(8760); // Hours (1 year default)
  const [mttr, setMttr] = useState<number>(8); // Mean Time To Repair (hours)
  const [beta, setBeta] = useState<number>(0.1); // Common Cause Factor

  // Calculate PFDavg using simplified formula
  const calculations = useMemo(() => {
    // PFDavg = (λdu * TI) / 2 + β * λdu * TI + λdu * MTTR
    const pfdAvg = (lambdaDU * testInterval) / 2 + beta * lambdaDU * testInterval + lambdaDU * mttr;
    
    // Determine achieved SIL level
    let achievedSIL: string | null = null;
    for (const sil of SIL_REQUIREMENTS) {
      if (pfdAvg >= sil.pfd_min && pfdAvg < sil.pfd_max) {
        achievedSIL = sil.level;
        break;
      }
    }
    
    // If PFD is too high, no SIL achieved
    if (pfdAvg >= 0.1) {
      achievedSIL = null;
    }
    
    // If PFD is extremely low, it's SIL3+
    if (pfdAvg < 0.0001) {
      achievedSIL = 'SIL3';
    }

    // Risk Reduction Factor
    const rrf = pfdAvg > 0 ? 1 / pfdAvg : Infinity;

    return {
      pfdAvg,
      achievedSIL,
      rrf,
      meetsRequired: !requiredSIL || (achievedSIL && getSILLevel(achievedSIL) >= getSILLevel(requiredSIL))
    };
  }, [lambdaDU, testInterval, mttr, beta, requiredSIL]);

  // Notify parent of validation
  useEffect(() => {
    onSILValidated?.(calculations.meetsRequired, calculations.achievedSIL, calculations.pfdAvg);
  }, [calculations, onSILValidated]);

  function getSILLevel(sil: string): number {
    const match = sil.match(/SIL(\d)/);
    return match ? parseInt(match[1]) : 0;
  }

  function formatScientific(value: number): string {
    if (value === 0) return '0';
    if (value >= 0.001) return value.toFixed(4);
    return value.toExponential(2);
  }

  return (
    <Card className="card-industrial">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Calculador SIL - IEC 61508
        </CardTitle>
        <CardDescription>
          Cálculo de PFDavg e verificação de nível SIL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required SIL Alert */}
        {requiredSIL && (
          <Alert className={cn(
            "border",
            calculations.meetsRequired 
              ? "border-success/30 bg-success/5" 
              : "border-destructive/30 bg-destructive/5"
          )}>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Nível requerido: <strong>{requiredSIL}</strong>
              </span>
              <Badge variant={calculations.meetsRequired ? "outline" : "destructive"}>
                {calculations.meetsRequired ? (
                  <><Check className="h-3 w-3 mr-1" /> Atende</>
                ) : (
                  <><AlertTriangle className="h-3 w-3 mr-1" /> Não Atende</>
                )}
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lambdaDU" className="text-sm">
              λdu - Taxa de Falhas Perigosas (por hora)
            </Label>
            <Input
              id="lambdaDU"
              type="number"
              step="0.000001"
              value={lambdaDU}
              onChange={(e) => setLambdaDU(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Típico: 1×10⁻⁶ a 1×10⁻⁵ /h
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testInterval" className="text-sm">
              TI - Intervalo de Teste (horas)
            </Label>
            <Input
              id="testInterval"
              type="number"
              value={testInterval}
              onChange={(e) => setTestInterval(parseInt(e.target.value) || 0)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              8760h = 1 ano, 4380h = 6 meses
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mttr" className="text-sm">
              MTTR - Tempo Médio de Reparo (horas)
            </Label>
            <Input
              id="mttr"
              type="number"
              value={mttr}
              onChange={(e) => setMttr(parseInt(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              β - Fator de Causa Comum: {(beta * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[beta * 100]}
              onValueChange={(v) => setBeta(v[0] / 100)}
              min={1}
              max={20}
              step={1}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Típico: 5-10% para sistemas redundantes
            </p>
          </div>
        </div>

        {/* Calculation Results */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-medium">Resultados do Cálculo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PFDavg */}
            <div className="bg-background rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground mb-1">PFDavg</p>
              <p className="text-lg font-mono font-bold">
                {formatScientific(calculations.pfdAvg)}
              </p>
            </div>

            {/* Achieved SIL */}
            <div className="bg-background rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground mb-1">Nível SIL Alcançado</p>
              <div className="flex items-center gap-2">
                {calculations.achievedSIL ? (
                  <Badge className={cn(
                    "text-white",
                    calculations.achievedSIL === 'SIL1' && 'bg-yellow-500',
                    calculations.achievedSIL === 'SIL2' && 'bg-orange-500',
                    calculations.achievedSIL === 'SIL3' && 'bg-red-500'
                  )}>
                    {calculations.achievedSIL}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Nenhum</Badge>
                )}
              </div>
            </div>

            {/* RRF */}
            <div className="bg-background rounded-lg p-3 border">
              <p className="text-xs text-muted-foreground mb-1">RRF (Fator de Redução)</p>
              <p className="text-lg font-mono font-bold">
                {calculations.rrf === Infinity ? '∞' : calculations.rrf.toFixed(0)}
              </p>
            </div>
          </div>

          {/* SIL Bands Visualization */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Faixas SIL (PFDavg)</p>
            <div className="flex h-6 rounded-full overflow-hidden">
              <div className="flex-1 bg-red-500 flex items-center justify-center text-xs text-white font-medium">
                SIL3
              </div>
              <div className="flex-1 bg-orange-500 flex items-center justify-center text-xs text-white font-medium">
                SIL2
              </div>
              <div className="flex-1 bg-yellow-500 flex items-center justify-center text-xs text-white font-medium">
                SIL1
              </div>
              <div className="flex-1 bg-gray-300 flex items-center justify-center text-xs text-gray-700 font-medium">
                N/A
              </div>
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="flex-1 text-center">10⁻⁴</span>
              <span className="flex-1 text-center">10⁻³</span>
              <span className="flex-1 text-center">10⁻²</span>
              <span className="flex-1 text-center">10⁻¹</span>
            </div>
          </div>
        </div>

        {/* Formula Reference */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium mb-1">Fórmula utilizada:</p>
          <p className="font-mono">
            PFDavg = (λdu × TI) / 2 + β × λdu × TI + λdu × MTTR
          </p>
          <p className="mt-2">
            Conforme IEC 61508-6 para arquitetura 1oo1
          </p>
        </div>

        {/* Validation Warning */}
        {requiredSIL && !calculations.meetsRequired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>BLOQUEIO:</strong> O nível SIL calculado ({calculations.achievedSIL || 'N/A'}) não atende 
              o requisito ({requiredSIL}). Sugestões:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Reduza o intervalo de teste (TI)</li>
                <li>Selecione componentes com menor λdu</li>
                <li>Implemente arquitetura redundante (1oo2)</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SILCalculator;
