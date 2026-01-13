import { AlertTriangle, Phone, Mail, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyModeProps {
  reason: string;
  contact: string;
  details?: string;
}

const EmergencyMode = ({ reason, contact, details }: EmergencyModeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-background rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-destructive/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-4">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              SISTEMA BLOQUEADO
            </h1>
            <p className="text-muted-foreground">
              Modo de Emergência Ativado
            </p>
          </div>
          
          {/* Reason Card */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <div className="text-destructive mr-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-destructive mb-2">Motivo do Bloqueio</h2>
                <p className="text-foreground">{reason}</p>
                {details && (
                  <div className="mt-3 p-3 bg-destructive/20 rounded">
                    <p className="text-sm font-mono text-destructive">{details}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Impact */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-3">Impacto no Sistema:</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-destructive mr-2">✗</span>
                <span className="text-foreground">Criação de novas especificações bloqueada</span>
              </li>
              <li className="flex items-center">
                <span className="text-destructive mr-2">✗</span>
                <span className="text-foreground">Alterações normativas bloqueadas</span>
              </li>
              <li className="flex items-center">
                <span className="text-warning mr-2">⚠</span>
                <span className="text-foreground">Especificações existentes em modo somente leitura</span>
              </li>
              <li className="flex items-center">
                <span className="text-success mr-2">✓</span>
                <span className="text-foreground">Sistema de auditoria ativo</span>
              </li>
            </ul>
          </div>
          
          {/* Contact & Actions */}
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-primary mr-3" />
                <div>
                  <div className="font-semibold text-primary">Contato de Emergência</div>
                  <div className="text-foreground">{contact}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Tentar Reconexão
              </Button>
              
              <Button
                variant="destructive"
                asChild
                className="flex-1"
              >
                <a
                  href={`mailto:${contact}?subject=IMEX%20Emergency%20Mode&body=Sistema%20bloqueado%20por:%20${encodeURIComponent(reason)}`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Notificar Engenharia
                </a>
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>IMEX Configurador • Sistema Fail-Closed v2.0</p>
              <p className="mt-1">
                Este bloqueio é intencional para prevenir especificações não conformes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;
