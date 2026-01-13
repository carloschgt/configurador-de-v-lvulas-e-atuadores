import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileDown, FileText, Loader2, AlertTriangle, Check, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface GeradorPDFProps {
  configuracao: {
    codigo?: string;
    tipo_valvula: string;
    servico?: string;
    dados: Record<string, any>;
  };
  normasAplicaveis?: string[];
  disabled?: boolean;
}

const GeradorPDF = ({ configuracao, normasAplicaveis = [], disabled = false }: GeradorPDFProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePreview = () => {
    setIsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Gerar HTML para impressão/PDF
      const htmlContent = gerarHTMLEspecificacao();
      
      // Criar blob e download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `especificacao_${configuracao.codigo || 'nova'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Especificação exportada!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar especificação');
    } finally {
      setIsGenerating(false);
    }
  };

  const gerarHTMLEspecificacao = () => {
    const { dados, tipo_valvula, codigo, servico } = configuracao;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Especificação Técnica - ${codigo || 'Nova'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      color: #333;
      line-height: 1.6;
    }
    .header { 
      text-align: center; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #1a5276;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #1a5276; 
      font-size: 24px;
      margin-bottom: 10px;
    }
    .header .info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      margin-top: 15px;
    }
    .section { 
      margin-bottom: 25px; 
      page-break-inside: avoid;
    }
    .section h2 { 
      background: #1a5276; 
      color: white; 
      padding: 8px 15px; 
      font-size: 14px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 10px 30px; 
    }
    .item { 
      display: flex; 
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px dotted #ddd;
    }
    .item .label { 
      color: #666; 
      font-size: 12px;
    }
    .item .value { 
      font-weight: 600; 
      font-size: 12px;
      text-align: right;
    }
    .normas {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #27ae60;
    }
    .normas h3 {
      color: #27ae60;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .normas ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .normas li {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 11px;
      font-family: monospace;
    }
    .avisos {
      background: #fff3cd;
      border-left: 4px solid #f39c12;
      padding: 15px;
      margin-top: 30px;
      font-size: 11px;
    }
    .avisos h3 {
      color: #856404;
      margin-bottom: 8px;
    }
    .avisos ul {
      margin-left: 20px;
      color: #856404;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚙️ ESPECIFICAÇÃO TÉCNICA DE VÁLVULA</h1>
    <p style="font-size: 18px; font-weight: bold; color: #e67e22;">
      ${tipo_valvula.toUpperCase()}
    </p>
    <div class="info">
      <span>Código: <strong>${codigo || 'Pendente'}</strong></span>
      <span>Data: <strong>${dataAtual}</strong></span>
      <span>Serviço: <strong>${servico || 'N/A'}</strong></span>
    </div>
  </div>

  <div class="section">
    <h2>📋 DADOS BÁSICOS</h2>
    <div class="grid">
      <div class="item">
        <span class="label">Tipo de Válvula</span>
        <span class="value">${tipo_valvula}</span>
      </div>
      <div class="item">
        <span class="label">Diâmetro NPS</span>
        <span class="value">${dados.diameterNPS || dados.nps || 'N/A'}"</span>
      </div>
      <div class="item">
        <span class="label">Classe de Pressão</span>
        <span class="value">Class ${dados.pressureClass || dados.classe_pressao || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Norma Construção</span>
        <span class="value">${dados.constructionStandard || dados.norma_construcao || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Extremidade</span>
        <span class="value">${dados.endType || dados.extremidade || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Face do Flange</span>
        <span class="value">${dados.flangeFace || dados.face_flange || 'N/A'}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🔧 ACIONAMENTO</h2>
    <div class="grid">
      <div class="item">
        <span class="label">Tipo</span>
        <span class="value">${dados.actuationType || dados.tipo_acionamento || 'Manual'}</span>
      </div>
      ${dados.torque ? `
      <div class="item">
        <span class="label">Torque</span>
        <span class="value">${dados.torque} Nm</span>
      </div>` : ''}
      ${dados.thrust ? `
      <div class="item">
        <span class="label">Força</span>
        <span class="value">${dados.thrust} kN</span>
      </div>` : ''}
      ${dados.travel ? `
      <div class="item">
        <span class="label">Curso</span>
        <span class="value">${dados.travel} mm</span>
      </div>` : ''}
    </div>
  </div>

  <div class="section">
    <h2>🧱 MATERIAIS</h2>
    <div class="grid">
      <div class="item">
        <span class="label">Corpo/Tampa</span>
        <span class="value">${dados.bodyMaterial || dados.material_corpo || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Obturador</span>
        <span class="value">${dados.obturatorMaterial || dados.material_obturador || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Sede</span>
        <span class="value">${dados.seatMaterial || dados.material_sede || 'N/A'}</span>
      </div>
      <div class="item">
        <span class="label">Haste</span>
        <span class="value">${dados.stemMaterial || dados.material_haste || 'N/A'}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>⚡ REQUISITOS ESPECIAIS</h2>
    <div class="grid">
      <div class="item">
        <span class="label">Fire Safe</span>
        <span class="value">${dados.fireTest === 'TESTADA_A_FOGO' || dados.fire_safe === 'Sim' ? '✅ Sim' : '❌ Não'}</span>
      </div>
      <div class="item">
        <span class="label">Low Emission</span>
        <span class="value">${dados.lowFugitiveEmission || dados.low_emission ? '✅ Sim' : '❌ Não'}</span>
      </div>
      <div class="item">
        <span class="label">NACE MR0175</span>
        <span class="value">${dados.naceCompliant || dados.nace_compliant ? '✅ Sim' : '❌ Não'}</span>
      </div>
      <div class="item">
        <span class="label">Certificação SIL</span>
        <span class="value">${dados.silCertification || dados.sil || 'N/A'}</span>
      </div>
    </div>
  </div>

  ${normasAplicaveis.length > 0 ? `
  <div class="section">
    <div class="normas">
      <h3>✅ NORMAS APLICÁVEIS</h3>
      <ul>
        ${normasAplicaveis.map(n => `<li>${n.replace(/_/g, ' ')}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}

  <div class="avisos">
    <h3>⚠️ AVISOS IMPORTANTES</h3>
    <ul>
      <li>Esta especificação é baseada no banco normativo IMEX.</li>
      <li>Valide sempre com a Engenharia/Qualidade e com o datasheet específico do cliente/EPC.</li>
      <li>Não substitui especificações internas do projeto.</li>
      <li>Verifique a compatibilidade de materiais com o fluido e condições de operação.</li>
    </ul>
  </div>

  <div class="footer">
    <p>IMEX Solutions • Configurador de Válvulas v1.0</p>
    <p>Gerado em ${dataAtual} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    <p>Este documento é confidencial e de uso interno.</p>
  </div>
</body>
</html>
    `;
  };

  const categorizarDados = () => {
    const { dados } = configuracao;
    
    return {
      basicos: [
        { label: 'Tipo de Válvula', valor: configuracao.tipo_valvula },
        { label: 'Diâmetro NPS', valor: dados.diameterNPS ? `${dados.diameterNPS}"` : null },
        { label: 'Classe de Pressão', valor: dados.pressureClass ? `Class ${dados.pressureClass}` : null },
        { label: 'Norma Construção', valor: dados.constructionStandard },
        { label: 'Extremidade', valor: dados.endType },
        { label: 'Face do Flange', valor: dados.flangeFace },
      ].filter(i => i.valor),
      acionamento: [
        { label: 'Tipo', valor: dados.actuationType },
        { label: 'Torque', valor: dados.torque ? `${dados.torque} Nm` : null },
        { label: 'Força', valor: dados.thrust ? `${dados.thrust} kN` : null },
        { label: 'Curso', valor: dados.travel ? `${dados.travel} mm` : null },
      ].filter(i => i.valor),
      materiais: [
        { label: 'Corpo/Tampa', valor: dados.bodyMaterial },
        { label: 'Obturador', valor: dados.obturatorMaterial },
        { label: 'Sede', valor: dados.seatMaterial },
        { label: 'Haste', valor: dados.stemMaterial },
      ].filter(i => i.valor),
      especiais: [
        { label: 'Fire Safe', valor: dados.fireTest === 'TESTADA_A_FOGO' ? 'Sim' : null },
        { label: 'Low Emission', valor: dados.lowFugitiveEmission ? 'Sim' : null },
        { label: 'NACE MR0175', valor: dados.naceCompliant ? 'Sim' : null },
        { label: 'SIL', valor: dados.silCertification !== 'NA' ? dados.silCertification : null },
      ].filter(i => i.valor),
    };
  };

  const dadosCategorias = categorizarDados();

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePreview}
        disabled={disabled}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Visualizar Especificação
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Especificação Técnica
            </DialogTitle>
            <DialogDescription>
              Código: {configuracao.codigo || 'Pendente'} | Tipo: {configuracao.tipo_valvula}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Dados Básicos */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Dados Básicos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {dadosCategorias.basicos.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 px-2 rounded bg-muted/50">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium">{item.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Acionamento */}
              {dadosCategorias.acionamento.length > 0 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-info rounded-full" />
                      Acionamento
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dadosCategorias.acionamento.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 px-2 rounded bg-muted/50">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-medium">{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Materiais */}
              {dadosCategorias.materiais.length > 0 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-success rounded-full" />
                      Materiais
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dadosCategorias.materiais.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 px-2 rounded bg-muted/50">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-medium">{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Requisitos Especiais */}
              {dadosCategorias.especiais.length > 0 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-warning rounded-full" />
                      Requisitos Especiais
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dadosCategorias.especiais.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          {item.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Normas Aplicáveis */}
              {normasAplicaveis.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full" />
                    Normas Aplicáveis
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {normasAplicaveis.map((norma, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono text-xs">
                        {norma.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Avisos */}
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-warning">Avisos Importantes</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Esta especificação é baseada no banco normativo IMEX.</li>
                      <li>Valide com Engenharia/Qualidade e datasheet do cliente.</li>
                      <li>Não substitui especificações internas do projeto.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Exportar HTML
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeradorPDF;
