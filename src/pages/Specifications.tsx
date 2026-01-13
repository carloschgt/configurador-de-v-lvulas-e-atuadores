import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  FileText, 
  Eye,
  Download,
  MoreHorizontal,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SpecificationsProps {
  onNavigate: (page: string) => void;
}

const mockSpecs = [
  { 
    id: "1",
    code: "SPEC-2024-001", 
    imexCode: "IMX-BV-8-600-RF",
    type: "ESFERA", 
    typeLabel: "Esfera",
    diameter: "8\"",
    class: "600",
    status: "APPROVED", 
    createdAt: "2024-01-12",
    createdBy: "João Silva"
  },
  { 
    id: "2",
    code: "SPEC-2024-002", 
    imexCode: null,
    type: "GAVETA", 
    typeLabel: "Gaveta",
    diameter: "10\"",
    class: "300",
    status: "SUBMITTED", 
    createdAt: "2024-01-11",
    createdBy: "Maria Santos"
  },
  { 
    id: "3",
    code: "SPEC-2024-003", 
    imexCode: null,
    type: "GLOBO", 
    typeLabel: "Globo",
    diameter: "4\"",
    class: "150",
    status: "DRAFT", 
    createdAt: "2024-01-10",
    createdBy: "Carlos Oliveira"
  },
  { 
    id: "4",
    code: "SPEC-2024-004", 
    imexCode: "IMX-BF-6-150-FF",
    type: "BORBOLETA", 
    typeLabel: "Borboleta",
    diameter: "6\"",
    class: "150",
    status: "PUBLISHED", 
    createdAt: "2024-01-09",
    createdBy: "Ana Costa"
  },
  { 
    id: "5",
    code: "SPEC-2024-005", 
    imexCode: "IMX-CV-3-600-RTJ",
    type: "CONTROLE", 
    typeLabel: "Controle",
    diameter: "3\"",
    class: "600",
    status: "APPROVED", 
    createdAt: "2024-01-08",
    createdBy: "Pedro Lima"
  },
];

const Specifications = ({ onNavigate }: SpecificationsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="badge-approved">Aprovado</Badge>;
      case "SUBMITTED":
        return <Badge className="badge-submitted">Submetido</Badge>;
      case "DRAFT":
        return <Badge className="badge-draft">Rascunho</Badge>;
      case "PUBLISHED":
        return <Badge className="badge-published">Publicado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ESFERA": return "⚙️";
      case "GLOBO": return "🔵";
      case "GAVETA": return "🚪";
      case "RETENCAO": return "↩️";
      case "BORBOLETA": return "🦋";
      case "CONTROLE": return "🎛️";
      default: return "📄";
    }
  };

  const filteredSpecs = mockSpecs.filter((spec) => {
    const matchesSearch = 
      spec.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.typeLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (spec.imexCode && spec.imexCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || spec.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Especificações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as especificações de válvulas
          </p>
        </div>
        <Button onClick={() => onNavigate("configurator")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Especificação
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-industrial">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, tipo ou código IMEX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="SUBMITTED">Submetido</SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications List */}
      <div className="space-y-3">
        {filteredSpecs.map((spec) => (
          <Card key={spec.id} className="card-industrial hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center text-2xl shrink-0">
                    {getTypeIcon(spec.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold mono text-sm">{spec.code}</span>
                      {spec.imexCode && (
                        <Badge variant="outline" className="mono text-xs">
                          {spec.imexCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Válvula {spec.typeLabel} • {spec.diameter} • Class {spec.class}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {spec.createdBy} em {spec.createdAt}
                    </p>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(spec.status)}
                  
                  <div className="hidden sm:flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {spec.status === "PUBLISHED" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {spec.status === "PUBLISHED" && (
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSpecs.length === 0 && (
          <Card className="card-industrial">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma especificação encontrada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Specifications;
