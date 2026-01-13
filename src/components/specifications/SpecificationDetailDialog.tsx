import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, CheckCircle2, AlertCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";

interface SpecificationData {
  id: string;
  code: string;
  imexCode: string | null;
  type: string;
  typeLabel: string;
  diameter: string;
  class: string;
  status: string;
  createdAt: string;
  createdBy: string;
  // Extended data
  endType?: string;
  flangeFace?: string;
  actuationType?: string;
  bodyMaterial?: string;
  obturatorMaterial?: string;
  seatMaterial?: string;
  stemMaterial?: string;
  fireTest?: boolean;
  naceCompliant?: boolean;
  lowFugitiveEmission?: boolean;
  silCertification?: string | null;
  constructionStandard?: string;
  serviceType?: string;
  conformityScore?: number;
  conformityChecks?: { check: string; status: string; message?: string }[];
}

interface SpecificationDetailDialogProps {
  spec: SpecificationData | null;
  isOpen: boolean;
  onClose: () => void;
}

const SpecificationDetailDialog = ({ spec, isOpen, onClose }: SpecificationDetailDialogProps) => {
  if (!spec) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-success/10 text-success border-success/20">Aprovado</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Submetido</Badge>;
      case "DRAFT":
        return <Badge className="bg-muted text-muted-foreground">Rascunho</Badge>;
      case "PUBLISHED":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Publicado</Badge>;
      case "REJECTED":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownloadPDF = () => {
    toast.info("Gerando PDF...", {
      description: `Preparando documento para ${spec.code}`,
    });
    // Simulate PDF generation
    setTimeout(() => {
      toast.success("PDF gerado com sucesso!", {
        description: "O download iniciará automaticamente.",
      });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {spec.code}
              </DialogTitle>
              <DialogDescription>
                {spec.imexCode && (
                  <span className="font-mono text-primary">{spec.imexCode}</span>
                )}
              </DialogDescription>
            </div>
            {getStatusBadge(spec.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo de Válvula</p>
                <p className="font-medium">{spec.typeLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Diâmetro</p>
                <p className="font-medium">{spec.diameter}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Classe de Pressão</p>
                <p className="font-medium">Class {spec.class}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo de Extremidade</p>
                <p className="font-medium">{spec.endType || "Flangeado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Face do Flange</p>
                <p className="font-medium">{spec.flangeFace || "RF"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo de Serviço</p>
                <p className="font-medium">{spec.serviceType || "Pipeline"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Materiais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Material do Corpo</p>
                <p className="font-medium font-mono">{spec.bodyMaterial || "ASTM A216 WCB"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Material do Obturador</p>
                <p className="font-medium font-mono">{spec.obturatorMaterial || "ASTM A182 F316"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Material da Sede</p>
                <p className="font-medium font-mono">{spec.seatMaterial || "316SS"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Material da Haste</p>
                <p className="font-medium font-mono">{spec.stemMaterial || "ASTM A182 F6A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Requisitos Especiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {spec.naceCompliant && (
                  <Badge variant="outline" className="bg-success/5 border-success/30 text-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    NACE MR0175
                  </Badge>
                )}
                {spec.fireTest && (
                  <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Fire Test API 607
                  </Badge>
                )}
                {spec.lowFugitiveEmission && (
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Low Emission ISO 15848
                  </Badge>
                )}
                {spec.silCertification && (
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    SIL {spec.silCertification}
                  </Badge>
                )}
                {!spec.naceCompliant && !spec.fireTest && !spec.lowFugitiveEmission && !spec.silCertification && (
                  <span className="text-muted-foreground text-sm">Nenhum requisito especial</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acionamento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Acionamento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{spec.actuationType || "Manual"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Conformity Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Conformidade Normativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Score de Conformidade</span>
                <span className="font-bold text-lg text-success">
                  {spec.conformityScore ?? 100}%
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                {(spec.conformityChecks || [
                  { check: "Norma de construção aplicável", status: "passed" },
                  { check: "Materiais compatíveis", status: "passed" },
                  { check: "Requisitos NACE verificados", status: "passed" },
                  { check: "Documentação completa", status: "passed" }
                ]).map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {check.status === "passed" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : check.status === "warning" ? (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>{check.check}</span>
                    {check.message && (
                      <span className="text-muted-foreground">- {check.message}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado em:</span>
                <span>{spec.createdAt}</span>
                <span className="text-muted-foreground">por</span>
                <span>{spec.createdBy}</span>
              </div>
              {spec.status === "SUBMITTED" && (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Aguardando aprovação</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            {spec.status === "PUBLISHED" && (
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpecificationDetailDialog;
