import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

import StepIndicator from "@/components/configurator/StepIndicator";
import Step1Basic from "@/components/configurator/Step1Basic";
import Step2Actuation from "@/components/configurator/Step2Actuation";
import Step3Materials from "@/components/configurator/Step3Materials";
import ConfigurationSummary from "@/components/configurator/ConfigurationSummary";
import NormSupremaGateway from "@/components/configurator/NormSupremaGateway";
import LiveConformityPanel from "@/components/configurator/LiveConformityPanel";
import TorqueCalculator from "@/components/configurator/TorqueCalculator";
import ImexDescriptionCard from "@/components/configurator/ImexDescriptionCard";
import FailClosedActions from "@/components/configurator/FailClosedActions";
import { useNormValidation } from "@/hooks/useNormValidation";
import { useFailClosedValidation, prepareForSave } from "@/hooks/useFailClosedValidation";
import { useConfiguracoesSalvas } from "@/hooks/useConfiguracoesSalvas";

import { ConstructionStandard, ValveConfiguration } from "@/types/valve";
import type { ImexSpec } from "@/lib/imex-description";

const mapNormCodeToConstructionStandard = (
  normCode: string | null | undefined,
): ConstructionStandard | null => {
  if (!normCode) return null;

  const code = normCode.toUpperCase();

  if (code.startsWith("API_6D") || code.includes("API 6D")) return "API 6D";
  if (code.startsWith("ISO_14313") || code.includes("ISO 14313")) return "ISO 14313";
  if (code.includes("NBR_15827") || code.includes("ABNT NBR 15827")) return "ABNT NBR 15827";

  return null;
};

const STEPS = [
  { id: 1, title: "Básico", description: "Tipo e dimensões" },
  { id: 2, title: "Acionamento", description: "Atuador e parâmetros" },
  { id: 3, title: "Materiais", description: "Materiais e especiais" },
];

const initialConfig: ValveConfiguration = {
  valveType: null,
  constructionStandard: null,
  diameterNPS: null,
  pressureClass: null,
  endType: null,
  flangeFace: null,
  actuationType: null,
  bodyMaterial: null,
  obturatorMaterial: null,
  seatMaterial: null,
  stemMaterial: null,
  fireTest: null,
  lowFugitiveEmission: false,
  silCertification: null,
  naceCompliant: false,
};

const Configurator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ValveConfiguration>(initialConfig);
  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);
  const { validateCombination, isValidating } = useNormValidation();
  const { salvarConfiguracao, isLoading: isSaving } = useConfiguracoesSalvas();

  // Build IMEX spec from current configuration
  const imexSpec: ImexSpec = useMemo(() => ({
    valveType: config.valveType,
    diameterNPS: config.diameterNPS,
    pressureClass: config.pressureClass,
    endType: config.endType,
    flangeFace: config.flangeFace,
    bodyMaterial: config.bodyMaterial,
    seatMaterial: config.seatMaterial,
    obturatorMaterial: config.obturatorMaterial,
    stemMaterial: config.stemMaterial,
    actuationType: config.actuationType,
    fireTest: config.fireTest,
    lowFugitiveEmission: config.lowFugitiveEmission,
    silCertification: config.silCertification,
    naceCompliant: config.naceCompliant,
  }), [config]);

  // Fail-closed validation
  const failClosedValidation = useFailClosedValidation(imexSpec);

  const handleConfigChange = (updates: Partial<ValveConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleGatewayValidSelection = useCallback(
    (data: { valveType: unknown; constructionStandard: string }) => {
      const mapped = mapNormCodeToConstructionStandard(data.constructionStandard);

      setConfig((prev) => {
        const next: ValveConfiguration = {
          ...prev,
          valveType: (data.valveType as any) ?? prev.valveType,
          constructionStandard: mapped ?? prev.constructionStandard,
        };

        // evita re-render/efeitos quando nada mudou
        if (
          next.valveType === prev.valveType &&
          next.constructionStandard === prev.constructionStandard
        ) {
          return prev;
        }

        return next;
      });
    },
    [],
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          config.valveType &&
          config.constructionStandard &&
          config.diameterNPS &&
          config.pressureClass &&
          config.endType &&
          (config.endType !== "FLANGEADO" || config.flangeFace)
        );
      case 2:
        return config.actuationType;
      case 3:
        return (
          config.bodyMaterial &&
          config.obturatorMaterial &&
          config.seatMaterial &&
          config.stemMaterial
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!config.valveType) {
      toast.error("Selecione um tipo de válvula");
      return;
    }

    // Prepare data with fail-closed validation info
    const saveData = prepareForSave(imexSpec, failClosedValidation);
    
    const result = await salvarConfiguracao(
      config.valveType,
      {
        ...config,
        imex_code: saveData.imex_code,
        missing_fields: saveData.missing_fields,
        is_complete: saveData.is_complete,
      },
      undefined, // tagCliente
      savedConfigId || undefined
    );

    if (result.sucesso) {
      setSavedConfigId(result.id || null);
      if (saveData.missing_fields.length > 0) {
        toast.warning(`Salvo como INCOMPLETO`, {
          description: `Faltando: ${saveData.missing_fields.join(', ')}`,
        });
      } else {
        toast.success("Rascunho salvo com sucesso!", {
          description: `Código: ${result.codigo}`,
        });
      }
    }
  };

  const handlePublish = async () => {
    // Fail-closed: Block if not complete
    if (!failClosedValidation.canPublish) {
      toast.error("Publicação bloqueada", {
        description: `Campos faltando: ${failClosedValidation.missingFields.join(', ')}`,
      });
      return;
    }

    // Save first if not saved
    if (!savedConfigId) {
      await handleSaveDraft();
    }

    // TODO: Implement actual submission to approval workflow
    toast.success("Especificação enviada para aprovação!", {
      description: "Status atualizado para SUBMITTED. Você será notificado quando for revisada.",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Basic config={config} onChange={handleConfigChange} />;
      case 2:
        return <Step2Actuation config={config} onChange={handleConfigChange} />;
      case 3:
        return <Step3Materials config={config} onChange={handleConfigChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configurador de Válvulas</h1>
          <p className="text-muted-foreground">
            Configure as especificações técnicas da válvula
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {failClosedValidation.missingFields.length > 0 ? 'Salvar Incompleto' : 'Salvar Rascunho'}
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="card-industrial">
        <CardContent className="pt-6">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Main Content wrapped in NormSupremaGateway */}
      <NormSupremaGateway onValidSelection={handleGatewayValidSelection}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {renderStep()}

            {/* Torque Calculator - shown in step 2 for actuated valves */}
            {currentStep === 2 && config.actuationType && config.actuationType !== "MANUAL" && (
              <TorqueCalculator 
                valveSize={config.diameterNPS ? parseInt(config.diameterNPS) : undefined}
                pressureClass={config.pressureClass ? parseInt(config.pressureClass) : undefined}
                seatMaterial={config.seatMaterial || undefined}
              />
            )}

            {/* IMEX Description Card - Above navigation/save buttons */}
            <ImexDescriptionCard spec={imexSpec} />

            {/* Fail-Closed Actions - Shown on last step */}
            {currentStep === 3 && (
              <Card className="card-industrial">
                <CardContent className="pt-6">
                  <FailClosedActions
                    validation={failClosedValidation}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                    isLoading={isSaving || isValidating}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar e Sair
                </Button>
              )}
            </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            <ConfigurationSummary config={config} />
            <LiveConformityPanel 
              valveType={config.valveType as any}
              constructionStandard={config.constructionStandard}
              naceRequired={config.naceCompliant}
              fireTestRequired={config.fireTest !== null}
              lowEmissionRequired={config.lowFugitiveEmission}
              silLevel={config.silCertification}
              selectedMaterials={{
                body: config.bodyMaterial,
                obturator: config.obturatorMaterial,
                seat: config.seatMaterial,
                stem: config.stemMaterial
              }}
            />
          </div>
        </div>
      </NormSupremaGateway>
    </div>
  );
};

export default Configurator;
