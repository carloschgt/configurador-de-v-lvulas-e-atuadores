import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  FileDown, 
  FileText, 
  Copy, 
  Check 
} from "lucide-react";
import { buildDescricaoImex, type ImexSpec } from "@/lib/imex-description";
import { exportSpecToCSV, exportSpecToPDF } from "@/lib/imex-export";
import { toast } from "sonner";

interface ImexDescriptionCardProps {
  spec: ImexSpec;
}

const SEGMENT_COLORS: Record<string, string> = {
  modelo: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
  diamClasse: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  conexao: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
  corpo: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400",
  trim: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400",
  atuacao: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:text-cyan-400",
  sufixos: "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:text-slate-400",
};

const ImexDescriptionCard = ({ spec }: ImexDescriptionCardProps) => {
  const result = useMemo(() => buildDescricaoImex(spec), [spec]);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      toast.success("Código IMEX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar");
    }
  };

  const handleExportCSV = () => {
    exportSpecToCSV(spec);
    toast.success("CSV exportado com sucesso!");
  };

  const handleExportPDF = () => {
    exportSpecToPDF(spec);
  };

  return (
    <Card className="card-industrial border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5 text-primary" />
          Descrição IMEX
          {result.isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Read-only input with the full IMEX code */}
        <div className="flex gap-2">
          <Input
            value={result.value}
            readOnly
            className="font-mono text-lg font-semibold bg-muted/50 border-2 text-center tracking-wider flex-1"
            aria-label="Código IMEX gerado"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyToClipboard}
            title="Copiar código"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Segment badges */}
        <div className="flex flex-wrap gap-2">
          {result.segments.map((segment) => (
            <Badge
              key={segment.key}
              variant="outline"
              className={`${SEGMENT_COLORS[segment.key] || ""} text-xs px-2 py-1`}
              title={`${segment.label}: ${segment.source || "N/A"}`}
            >
              <span className="font-medium">{segment.label}:</span>
              <span className="ml-1 font-mono">{segment.value}</span>
            </Badge>
          ))}
        </div>

        {/* Missing fields alert */}
        {result.missing.length > 0 && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <span className="font-medium">Faltando:</span>{" "}
              {result.missing.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Complete indicator */}
        {result.isComplete && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 rounded-md px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Especificação IMEX completa</span>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImexDescriptionCard;
