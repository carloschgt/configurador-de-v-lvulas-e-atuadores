// IMEX Export Utilities - CSV and PDF generation

import { buildDescricaoImex, type ImexSpec } from './imex-description';
import { 
  IMEX_CATALOG, 
  getLabel,
  getImexCode
} from '@/data/imex-catalog';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportData {
  model: string;
  nps: string;
  pressureClass: string;
  endConn: string;
  bodyMat: string;
  trim: string;
  actuation: string;
  suffixes: string;
  notes: string;
  descricao_imex: string;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

function escapeCSVField(field: string): string {
  if (!field) return '';
  // If field contains comma, newline, or quote, wrap in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function buildCSVContent(data: ExportData[]): string {
  const headers = [
    'model',
    'nps',
    'pressureClass',
    'endConn',
    'bodyMat',
    'trim',
    'actuation',
    'suffixes',
    'notes',
    'descricao_imex'
  ];
  
  const rows = data.map(row => [
    escapeCSVField(row.model),
    escapeCSVField(row.nps),
    escapeCSVField(row.pressureClass),
    escapeCSVField(row.endConn),
    escapeCSVField(row.bodyMat),
    escapeCSVField(row.trim),
    escapeCSVField(row.actuation),
    escapeCSVField(row.suffixes),
    escapeCSVField(row.notes),
    escapeCSVField(row.descricao_imex)
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(content: string, filename?: string): void {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').slice(0, 13).replace('T', '-');
  const defaultFilename = `spec-imex-${timestamp}.csv`;
  
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportSpecToCSV(spec: ImexSpec, notes: string = ''): void {
  const result = buildDescricaoImex(spec);
  
  const data: ExportData = {
    model: spec.valveType || '',
    nps: spec.diameterNPS || '',
    pressureClass: spec.pressureClass || '',
    endConn: spec.endType || '',
    bodyMat: spec.bodyMaterial || '',
    trim: spec.seatMaterial || '',
    actuation: spec.actuationType || '',
    suffixes: buildSuffixString(spec),
    notes: notes,
    descricao_imex: result.value
  };
  
  const content = buildCSVContent([data]);
  downloadCSV(content);
}

function buildSuffixString(spec: ImexSpec): string {
  const suffixes: string[] = [];
  
  if (spec.fireTest === 'TESTADA_A_FOGO') suffixes.push('FS');
  if (spec.lowFugitiveEmission) suffixes.push('LFE');
  if (spec.naceCompliant) suffixes.push('NACE');
  if (spec.silCertification && spec.silCertification !== 'NA') {
    suffixes.push(spec.silCertification);
  }
  
  return suffixes.length > 0 ? suffixes.join('-') : 'NEW';
}

// ============================================================================
// PDF EXPORT (HTML-based for browser printing)
// ============================================================================

export function generatePDFContent(spec: ImexSpec, notes: string = ''): string {
  const result = buildDescricaoImex(spec);
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const suffixes = buildSuffixString(spec);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMEX - Especificação de Válvula</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      color: #1a1a1a;
      background: #fff;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #1e40af;
      font-size: 28px;
      font-weight: 700;
    }
    
    .header .date {
      text-align: right;
      color: #666;
      font-size: 14px;
    }
    
    .imex-code-section {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .imex-code-section h2 {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
    }
    
    .imex-code {
      font-family: 'Courier New', monospace;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 3px;
      word-break: break-all;
    }
    
    .status-badge {
      display: inline-block;
      background: ${result.isComplete ? '#10b981' : '#f59e0b'};
      color: #fff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 15px;
    }
    
    .details-section {
      margin-bottom: 30px;
    }
    
    .details-section h3 {
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .details-table tr {
      border-bottom: 1px solid #f3f4f6;
    }
    
    .details-table tr:last-child {
      border-bottom: none;
    }
    
    .details-table td {
      padding: 12px 8px;
    }
    
    .details-table td:first-child {
      font-weight: 600;
      color: #374151;
      width: 40%;
    }
    
    .details-table td:last-child {
      color: #1f2937;
    }
    
    .segments-section {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 30px;
    }
    
    .segment-badge {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 13px;
    }
    
    .segment-badge .label {
      color: #64748b;
      font-weight: 500;
    }
    
    .segment-badge .value {
      color: #1e40af;
      font-weight: 700;
      font-family: monospace;
      margin-left: 6px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
      text-align: center;
    }
    
    .warning {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      font-size: 13px;
      color: #92400e;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .imex-code-section {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>IMEX – Configurador</h1>
    <div class="date">
      <div><strong>Data:</strong> ${dateStr}</div>
      <div><strong>Hora:</strong> ${timeStr}</div>
    </div>
  </div>
  
  <div class="imex-code-section">
    <h2>Descrição IMEX</h2>
    <div class="imex-code">${result.value}</div>
    <div class="status-badge">${result.isComplete ? '✓ COMPLETA' : '⚠ INCOMPLETA'}</div>
  </div>
  
  <div class="segments-section">
    ${result.segments.map(seg => `
      <div class="segment-badge">
        <span class="label">${seg.label}:</span>
        <span class="value">${seg.value}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="details-section">
    <h3>Especificação Técnica</h3>
    <table class="details-table">
      <tr>
        <td>Tipo de Válvula</td>
        <td>${spec.valveType || '—'}</td>
      </tr>
      <tr>
        <td>Diâmetro NPS</td>
        <td>${spec.diameterNPS ? `${spec.diameterNPS}"` : '—'}</td>
      </tr>
      <tr>
        <td>Classe de Pressão</td>
        <td>${spec.pressureClass ? `Class ${spec.pressureClass}` : '—'}</td>
      </tr>
      <tr>
        <td>Tipo de Conexão</td>
        <td>${spec.endType || '—'}</td>
      </tr>
      <tr>
        <td>Face do Flange</td>
        <td>${spec.flangeFace || '—'}</td>
      </tr>
      <tr>
        <td>Material do Corpo</td>
        <td>${spec.bodyMaterial || '—'}</td>
      </tr>
      <tr>
        <td>Material da Sede</td>
        <td>${spec.seatMaterial || '—'}</td>
      </tr>
      <tr>
        <td>Tipo de Atuação</td>
        <td>${spec.actuationType || '—'}</td>
      </tr>
      <tr>
        <td>Sufixos Especiais</td>
        <td>${suffixes}</td>
      </tr>
      ${notes ? `
      <tr>
        <td>Observações</td>
        <td>${notes}</td>
      </tr>
      ` : ''}
    </table>
  </div>
  
  ${!result.isComplete ? `
  <div class="warning">
    <strong>⚠ Campos Faltantes:</strong> ${result.missing.join(', ')}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Gerado pelo IMEX Configurador de Válvulas</p>
    <p>Esta especificação é baseada no banco normativo IMEX. Valide sempre com Engenharia/Qualidade.</p>
  </div>
</body>
</html>
  `;
}

export function exportSpecToPDF(spec: ImexSpec, notes: string = ''): void {
  const content = generatePDFContent(spec, notes);
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function downloadPDFAsHTML(spec: ImexSpec, notes: string = ''): void {
  const content = generatePDFContent(spec, notes);
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').slice(0, 13).replace('T', '-');
  const filename = `spec-imex-${timestamp}.html`;
  
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
