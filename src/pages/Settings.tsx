import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, Bell, Database, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, roles } = useAuth();
  const systemHealth = useSystemHealth();

  const isAdmin = roles.includes('ADMIN') || roles.includes('ENGINEER_CHIEF');

  const handleRefreshHealth = async () => {
    await systemHealth.refresh();
    toast.success("Status do sistema atualizado");
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as preferências do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Profile */}
        <Card className="card-industrial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Funções</Label>
                <div className="flex gap-2 mt-1">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="card-industrial">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
                <CardDescription>Saúde do sistema normativo</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshHealth}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Status Geral</Label>
              {systemHealth.isHealthy ? (
                <Badge className="bg-success/10 text-success border-success/20">
                  Operacional
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  Degradado
                </Badge>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Catálogos Ativos</Label>
                <p className="font-mono">{systemHealth.activeCatalogCount || 0}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cobertura de Normas</Label>
                <p className="font-mono">{systemHealth.normCoveragePercent?.toFixed(1) || 0}%</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cobertura de Domínios</Label>
                <p className="font-mono">{systemHealth.domainCoveragePercent?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings (Admin only) */}
        {isAdmin && (
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>Configurações de segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Fail-Closed</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloquear criação de specs se sistema degradado
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Validação NACE Obrigatória</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir conformidade NACE para serviços sour
                  </p>
                </div>
                <Switch checked disabled />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="card-industrial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Aprovações Pendentes</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar quando houver specs para aprovar
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas do Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre problemas no sistema normativo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
