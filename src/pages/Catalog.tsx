import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, FileText, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CatalogVersion {
  id: string;
  version: string;
  status: string;
  release_date: string;
  created_at: string;
}

interface Norm {
  id: string;
  norm_code: string;
  norm_title: string;
  norm_type: string;
  is_active: boolean;
  is_mandatory: boolean;
}

const CatalogPage = () => {
  const [catalogs, setCatalogs] = useState<CatalogVersion[]>([]);
  const [norms, setNorms] = useState<Norm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catalogsRes, normsRes] = await Promise.all([
        supabase.from('rule_catalog_version').select('*').order('created_at', { ascending: false }),
        supabase.from('standards_hierarchy').select('*').order('norm_code')
      ]);

      if (catalogsRes.error) throw catalogsRes.error;
      if (normsRes.error) throw normsRes.error;

      setCatalogs(catalogsRes.data || []);
      setNorms(normsRes.data || []);
    } catch (error) {
      console.error('Error fetching catalog data:', error);
      toast.error("Erro ao carregar catálogo");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>;
      case 'DRAFT':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Rascunho</Badge>;
      case 'DEPRECATED':
        return <Badge className="bg-muted text-muted-foreground">Depreciado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNormTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      CONSTRUCTION: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      PERFORMANCE: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      MATERIAL: 'bg-green-500/10 text-green-600 border-green-500/20',
      INTERFACE: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      SAFETY: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return <Badge className={colors[type] || ''}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catálogo Normativo</h1>
          <p className="text-muted-foreground">
            Gerencie versões do catálogo e normas aplicáveis
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="catalogs" className="w-full">
        <TabsList>
          <TabsTrigger value="catalogs">Versões ({catalogs.length})</TabsTrigger>
          <TabsTrigger value="norms">Normas ({norms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogs" className="space-y-4">
          {catalogs.length === 0 ? (
            <Card className="card-industrial">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma versão do catálogo encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {catalogs.map((catalog) => (
                <Card key={catalog.id} className="card-industrial">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg font-mono">
                            Versão {catalog.version}
                          </CardTitle>
                          <CardDescription>
                            Criado em {new Date(catalog.created_at || '').toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(catalog.status || '')}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="norms" className="space-y-4">
          {norms.length === 0 ? (
            <Card className="card-industrial">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma norma cadastrada
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {norms.map((norm) => (
                <Card key={norm.id} className="card-industrial">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${norm.is_active ? 'bg-success/10' : 'bg-muted'}`}>
                          {norm.is_active ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono font-semibold text-sm truncate">
                            {norm.norm_code.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {norm.norm_title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getNormTypeBadge(norm.norm_type)}
                        {norm.is_mandatory && (
                          <Badge variant="outline" className="text-xs">
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogPage;
