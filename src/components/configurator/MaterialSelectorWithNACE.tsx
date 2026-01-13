import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Shield, Thermometer, HardHat, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNormValidation } from '@/hooks/useNormValidation';
import type { Database } from '@/integrations/supabase/types';

type ValveType = Database['public']['Enums']['valve_type_enum'];

interface Material {
  code: string;
  name: string;
  naceQualified: boolean;
  naceTemperatureMin: number | null;
  naceHardnessMax: number | null;
  fireTestCompatible: boolean;
  lowEmissionCompatible: boolean;
  compatibleWith: string[];
}

interface MaterialSelectorWithNACEProps {
  valveType: ValveType;
  constructionStandard: string;
  materials: {
    body: Material[];
    obturator: Material[];
    seat: Material[];
    stem: Material[];
  };
  naceRequired: boolean;
  fireTestRequired: boolean;
  lowEmissionRequired: boolean;
  selectedMaterials: {
    body: string | null;
    obturator: string | null;
    seat: string | null;
    stem: string | null;
  };
  onMaterialChange: (type: 'body' | 'obturator' | 'seat' | 'stem', value: string) => void;
  onNaceChange: (value: boolean) => void;
  onFireTestChange: (value: boolean) => void;
  onLowEmissionChange: (value: boolean) => void;
}

const MaterialSelectorWithNACE = ({
  valveType,
  constructionStandard,
  materials,
  naceRequired,
  fireTestRequired,
  lowEmissionRequired,
  selectedMaterials,
  onMaterialChange,
  onNaceChange,
  onFireTestChange,
  onLowEmissionChange
}: MaterialSelectorWithNACEProps) => {
  const { validateMaterialNACE, validateFireTestCompatibility } = useNormValidation();
  const [naceValidation, setNaceValidation] = useState<Record<string, { isValid: boolean; message: string }>>({});
  const [fireTestValidation, setFireTestValidation] = useState<{ isValid: boolean; message: string; applicableNorms: string[] } | null>(null);

  // Filter materials based on requirements
  const filterMaterials = (materialList: Material[]) => {
    let filtered = [...materialList];
    
    if (naceRequired) {
      filtered = filtered.filter(m => m.naceQualified);
    }
    
    if (fireTestRequired) {
      filtered = filtered.filter(m => m.fireTestCompatible);
    }
    
    if (lowEmissionRequired) {
      filtered = filtered.filter(m => m.lowEmissionCompatible);
    }
    
    return filtered;
  };

  // Filter compatible seat materials based on obturator selection
  const getCompatibleSeatMaterials = () => {
    if (!selectedMaterials.obturator) return filterMaterials(materials.seat);
    
    const obturatorMaterial = materials.obturator.find(m => m.code === selectedMaterials.obturator);
    if (!obturatorMaterial) return filterMaterials(materials.seat);
    
    return filterMaterials(materials.seat).filter(seat => 
      obturatorMaterial.compatibleWith.includes(seat.code) ||
      seat.compatibleWith.includes(obturatorMaterial.code)
    );
  };

  // Validate fire test compatibility when materials change
  useEffect(() => {
    const validate = async () => {
      if (fireTestRequired && selectedMaterials.body && selectedMaterials.seat) {
        const result = await validateFireTestCompatibility(
          valveType,
          selectedMaterials.body,
          selectedMaterials.seat,
          600 // TODO: Get actual pressure class
        );
        setFireTestValidation(result);
      }
    };
    validate();
  }, [fireTestRequired, selectedMaterials.body, selectedMaterials.seat, valveType]);

  const renderMaterialSelect = (
    type: 'body' | 'obturator' | 'seat' | 'stem',
    label: string,
    materialList: Material[]
  ) => {
    const filteredMaterials = type === 'seat' ? getCompatibleSeatMaterials() : filterMaterials(materialList);
    const isBlocked = filteredMaterials.length === 0;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`material-${type}`} className="flex items-center gap-2">
            {label}
            {naceRequired && (
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                NACE
              </Badge>
            )}
          </Label>
          {type === 'seat' && selectedMaterials.obturator && (
            <span className="text-xs text-muted-foreground">
              Compatível com {selectedMaterials.obturator}
            </span>
          )}
        </div>
        
        {isBlocked ? (
          <Alert variant="destructive" className="py-2">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Nenhum material disponível com os requisitos atuais
            </AlertDescription>
          </Alert>
        ) : (
          <Select
            value={selectedMaterials[type] || ''}
            onValueChange={(value) => onMaterialChange(type, value)}
          >
            <SelectTrigger id={`material-${type}`} className={cn(
              selectedMaterials[type] ? 'border-success/50' : ''
            )}>
              <SelectValue placeholder="Selecione o material" />
            </SelectTrigger>
            <SelectContent>
              {filteredMaterials.map((material) => (
                <SelectItem key={material.code} value={material.code}>
                  <div className="flex items-center gap-2">
                    <span>{material.name}</span>
                    {material.naceQualified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            NACE
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p>Qualificado NACE MR0175</p>
                            {material.naceTemperatureMin && (
                              <p>Temp. Mín: {material.naceTemperatureMin}°C</p>
                            )}
                            {material.naceHardnessMax && (
                              <p>Dureza Máx: {material.naceHardnessMax} HRC</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Special Requirements Toggles */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Requisitos Especiais
          </CardTitle>
          <CardDescription>
            Ative os requisitos especiais - os materiais serão filtrados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* NACE Compliance */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="nace" className="font-medium">Serviço Ácido (NACE)</Label>
                <p className="text-xs text-muted-foreground">NACE MR0175 / ISO 15156</p>
              </div>
            </div>
            <Switch
              id="nace"
              checked={naceRequired}
              onCheckedChange={onNaceChange}
            />
          </div>

          {/* Fire Test */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <HardHat className="h-5 w-5 text-warning" />
              <div>
                <Label htmlFor="firetest" className="font-medium">Teste a Fogo</Label>
                <p className="text-xs text-muted-foreground">API 607 / API 6FA</p>
              </div>
            </div>
            <Switch
              id="firetest"
              checked={fireTestRequired}
              onCheckedChange={onFireTestChange}
            />
          </div>

          {/* Low Fugitive Emission */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-info" />
              <div>
                <Label htmlFor="emission" className="font-medium">Baixa Emissão Fugitiva</Label>
                <p className="text-xs text-muted-foreground">ISO 15848-1</p>
              </div>
            </div>
            <Switch
              id="emission"
              checked={lowEmissionRequired}
              onCheckedChange={onLowEmissionChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fire Test Validation Alert */}
      {fireTestRequired && fireTestValidation && (
        <Alert className={cn(
          fireTestValidation.isValid 
            ? "border-success/50 bg-success/5" 
            : "border-destructive"
        )} variant={fireTestValidation.isValid ? "default" : "destructive"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p>{fireTestValidation.message}</p>
            {fireTestValidation.applicableNorms.length > 0 && (
              <p className="text-xs mt-1">
                Normas aplicáveis: {fireTestValidation.applicableNorms.join(', ')}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Material Selection */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Materiais de Construção</CardTitle>
          <CardDescription>
            {naceRequired && (
              <span className="text-primary">Mostrando apenas materiais qualificados NACE</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderMaterialSelect('body', 'Material do Corpo', materials.body)}
            {renderMaterialSelect('obturator', 'Material do Obturador', materials.obturator)}
            {renderMaterialSelect('seat', 'Material da Sede', materials.seat)}
            {renderMaterialSelect('stem', 'Material da Haste', materials.stem)}
          </div>
        </CardContent>
      </Card>

      {/* NACE Qualification Info */}
      {naceRequired && selectedMaterials.body && (
        <Alert className="border-primary/30 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Conformidade NACE Ativa</strong>
            <p className="text-xs mt-1">
              Todos os materiais selecionados são qualificados para serviço ácido conforme NACE MR0175 / ISO 15156.
              Verifique as condições de temperatura e dureza no tooltip de cada material.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MaterialSelectorWithNACE;
