import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings2, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Plus
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const stats = [
    { label: "Especificações", value: "24", icon: FileText, color: "text-primary" },
    { label: "Aprovadas", value: "18", icon: CheckCircle, color: "text-success" },
    { label: "Pendentes", value: "6", icon: Clock, color: "text-warning" },
    { label: "Este Mês", value: "+12%", icon: TrendingUp, color: "text-info" },
  ];

  const recentSpecs = [
    { code: "SPEC-2024-001", type: "Esfera", status: "APPROVED", date: "2024-01-12" },
    { code: "SPEC-2024-002", type: "Gaveta", status: "SUBMITTED", date: "2024-01-11" },
    { code: "SPEC-2024-003", type: "Globo", status: "DRAFT", date: "2024-01-10" },
    { code: "SPEC-2024-004", type: "Borboleta", status: "APPROVED", date: "2024-01-09" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="badge-approved">Aprovado</Badge>;
      case "SUBMITTED":
        return <Badge className="badge-submitted">Submetido</Badge>;
      case "DRAFT":
        return <Badge className="badge-draft">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie suas especificações de válvulas e atuadores
          </p>
        </div>
        <Button onClick={() => onNavigate("configurator")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Especificação
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-industrial">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="card-industrial cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => onNavigate("configurator")}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Configurador</CardTitle>
                <CardDescription>
                  Crie novas especificações de válvulas
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="card-industrial cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => onNavigate("approval")}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Aprovações Pendentes</CardTitle>
                <CardDescription>
                  6 especificações aguardando revisão
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Specifications */}
      <Card className="card-industrial">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Especificações Recentes</CardTitle>
              <CardDescription>Últimas configurações criadas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("specs")}>
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSpecs.map((spec) => (
              <div
                key={spec.code}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mono">{spec.code}</p>
                    <p className="text-xs text-muted-foreground">
                      Válvula {spec.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(spec.status)}
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {spec.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
