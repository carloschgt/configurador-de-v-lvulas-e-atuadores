import { AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSystemHealth } from '@/hooks/useSystemHealth';

const EmergencyModeBanner = () => {
  const { isHealthy, isLoading, issues, refresh } = useSystemHealth();

  if (isLoading) return null;
  if (isHealthy) return null;

  return (
    <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10 mb-6">
      <ShieldAlert className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2 text-lg font-bold">
        <AlertTriangle className="h-5 w-5" />
        SISTEMA EM MODO DE EMERGÊNCIA
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          O sistema normativo detectou problemas críticos. A criação de novas especificações está temporariamente bloqueada.
        </p>
        
        {issues.length > 0 && (
          <div className="bg-destructive/20 rounded-lg p-3 mt-2">
            <p className="text-sm font-semibold mb-2">Problemas detectados:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="border-destructive/50 hover:bg-destructive/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Novamente
          </Button>
          <p className="text-xs text-muted-foreground">
            Contate o Engenheiro Chefe: engenharia@imexsolutions.com.br
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmergencyModeBanner;
