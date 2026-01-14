import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Save, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Lock 
} from "lucide-react";
import type { FailClosedValidation } from "@/hooks/useFailClosedValidation";

interface FailClosedActionsProps {
  validation: FailClosedValidation;
  onSaveDraft: () => void;
  onPublish: () => void;
  isLoading?: boolean;
}

const FailClosedActions = ({ 
  validation, 
  onSaveDraft, 
  onPublish,
  isLoading = false 
}: FailClosedActionsProps) => {
  const { canSaveDraft, canPublish, missingFields, status, completionPercent } = validation;

  return (
    <div className="space-y-4">
      {/* Status and Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso da configuração</span>
          <span className={`font-medium ${completionPercent === 100 ? 'text-green-600' : 'text-amber-600'}`}>
            {completionPercent}%
          </span>
        </div>
        <Progress 
          value={completionPercent} 
          className="h-2"
        />
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {status === 'INCOMPLETO' ? (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Status: INCOMPLETO</span>
          </>
        ) : status === 'DRAFT' ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Status: RASCUNHO</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Status: {status}</span>
          </>
        )}
      </div>

      {/* Missing Fields Alert */}
      {missingFields.length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/30">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Publicação Bloqueada</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">
              Preencha os campos obrigatórios para habilitar a publicação:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {missingFields.map((field) => (
                <li key={field} className="text-destructive/80">{field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Complete Alert */}
      {missingFields.length === 0 && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-sm font-semibold text-green-700 dark:text-green-400">
            Configuração Completa
          </AlertTitle>
          <AlertDescription className="text-sm text-green-600 dark:text-green-300">
            Todos os campos obrigatórios foram preenchidos. Você pode publicar a especificação.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Save Draft - Always enabled */}
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isLoading}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {missingFields.length > 0 ? 'Salvar Incompleto' : 'Salvar Rascunho'}
        </Button>

        {/* Publish - Disabled if missing fields */}
        <Button
          onClick={onPublish}
          disabled={!canPublish || isLoading}
          className="flex-1"
          variant={canPublish ? "default" : "secondary"}
        >
          {canPublish ? (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Enviar para Aprovação
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Publicação Bloqueada
            </>
          )}
        </Button>
      </div>

      {/* Workflow Info */}
      <p className="text-xs text-muted-foreground text-center">
        Fluxo: INCOMPLETO → RASCUNHO → SUBMETIDO → APROVADO → PUBLICADO
      </p>
    </div>
  );
};

export default FailClosedActions;
