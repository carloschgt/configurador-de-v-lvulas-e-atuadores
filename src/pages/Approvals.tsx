import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, Eye, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface PendingSpec {
  id: string;
  spec_code: string;
  valve_type: string;
  configuration: any;
  status: string;
  created_at: string;
  created_by: string;
}

const ApprovalsPage = () => {
  const [pendingSpecs, setPendingSpecs] = useState<PendingSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useAuth();

  const canApprove = roles.includes('ENGINEER_CHIEF') || roles.includes('QA_MANAGER') || roles.includes('ADMIN');

  useEffect(() => {
    fetchPendingSpecs();
  }, []);

  const fetchPendingSpecs = async () => {
    try {
      const { data, error } = await supabase
        .from('specifications')
        .select('*')
        .eq('status', 'SUBMITTED')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingSpecs(data || []);
    } catch (error) {
      console.error('Error fetching specs:', error);
      toast.error("Erro ao carregar especificações pendentes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (specId: string, specCode: string) => {
    try {
      const { error } = await supabase
        .from('specifications')
        .update({ 
          status: 'APPROVED',
          approved_at: new Date().toISOString()
        })
        .eq('id', specId);

      if (error) throw error;
      
      toast.success(`Especificação ${specCode} aprovada!`);
      fetchPendingSpecs();
    } catch (error) {
      console.error('Error approving spec:', error);
      toast.error("Erro ao aprovar especificação");
    }
  };

  const handleReject = async (specId: string, specCode: string) => {
    try {
      const { error } = await supabase
        .from('specifications')
        .update({ 
          status: 'REJECTED',
          rejection_reason: 'Rejeitado pelo revisor'
        })
        .eq('id', specId);

      if (error) throw error;
      
      toast.info(`Especificação ${specCode} rejeitada`);
      fetchPendingSpecs();
    } catch (error) {
      console.error('Error rejecting spec:', error);
      toast.error("Erro ao rejeitar especificação");
    }
  };

  const getValveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ESFERA: 'Esfera',
      GLOBO: 'Globo',
      GAVETA: 'Gaveta',
      RETENCAO: 'Retenção',
      BORBOLETA: 'Borboleta',
      CONTROLE: 'Controle'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Aprovações</h1>
          <p className="text-muted-foreground">
            Gerencie as especificações pendentes de aprovação
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Clock className="h-4 w-4" />
          {pendingSpecs.length} pendente(s)
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pendingSpecs.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card className="card-industrial">
              <CardContent className="py-12 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground mt-4">Carregando...</p>
              </CardContent>
            </Card>
          ) : pendingSpecs.length === 0 ? (
            <Card className="card-industrial">
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma especificação pendente de aprovação
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingSpecs.map((spec) => (
                <Card key={spec.id} className="card-industrial">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-mono">
                          {spec.spec_code}
                        </CardTitle>
                        <CardDescription>
                          Válvula {getValveTypeLabel(spec.valve_type || '')} • 
                          Enviado em {new Date(spec.created_at || '').toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Aguardando
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>

                      {canApprove ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleReject(spec.id, spec.spec_code)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(spec.id, spec.spec_code)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Sem permissão para aprovar
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="card-industrial">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Histórico de aprovações estará disponível em breve
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalsPage;
