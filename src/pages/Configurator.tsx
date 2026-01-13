import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, FileDown } from "lucide-react";
import { toast } from "sonner";

import StepIndicator from "@/components/configurator/StepIndicator";
import Step1Basic from "@/components/configurator/Step1Basic";
import Step2Actuation from "@/components/configurator/Step2Actuation";
import Step3Materials from "@/components/configurator/Step3Materials";
import ConfigurationSummary from "@/components/configurator/ConfigurationSummary";
import NormSupremaGateway from "@/components/configurator/NormSupremaGateway";
import LiveConformityPanel from "@/components/configurator/LiveConformityPanel";
import TorqueCalculator from "@/components/configurator/TorqueCalculator";
import { useNormValidation } from "@/hooks/useNormValidation";

import { ValveConfiguration } from "@/types/valve";

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
  const { validateCombination, isValidating } = useNormValidation();

  const handleConfigChange = (updates: Partial<ValveConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

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

  const handleSave = () => {
    toast.success("Especificação salva como rascunho!", {
      description: "Você pode continuar editando a qualquer momento.",
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!canProceed()) {
      toast.error("Configuração incompleta", {
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }
    toast.success("Especificação enviada para aprovação!", {
      description: "Você será notificado quando for revisada.",
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
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
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
      <NormSupremaGateway>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!canProceed() || isValidating}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {isValidating ? "Validando..." : "Enviar para Aprovação"}
                  </Button>
                </div>
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
