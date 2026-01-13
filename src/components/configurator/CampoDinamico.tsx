import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Lightbulb, Check, Loader2 } from 'lucide-react';

interface Atributo {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'lista' | 'texto' | 'numero' | 'simnao' | 'multiselect';
  unidade: string | null;
  obrigatorio: boolean;
  observacoes: string | null;
  opcoes?: string[];
}

interface CampoDinamicoProps {
  atributo: Atributo;
  valor: any;
  onChange: (codigo: string, valor: any) => void;
  erro?: string;
  aviso?: string;
  sugestao?: { valor: string; mensagem: string };
  valoresPermitidos?: string[] | null;
  disabled?: boolean;
  onAplicarSugestao?: () => void;
}

const CampoDinamico = ({
  atributo,
  valor,
  onChange,
  erro,
  aviso,
  sugestao,
  valoresPermitidos,
  disabled = false,
  onAplicarSugestao
}: CampoDinamicoProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // Filtrar opções se houver valores permitidos
  const opcoesDisponiveis = valoresPermitidos 
    ? atributo.opcoes?.filter(o => valoresPermitidos.includes(o))
    : atributo.opcoes;

  const handleChange = (novoValor: any) => {
    onChange(atributo.codigo, novoValor);
  };

  const renderCampo = () => {
    switch (atributo.tipo) {
      case 'lista':
        return (
          <Select
            value={valor || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger 
              className={cn(
                'w-full',
                erro && 'border-destructive bg-destructive/5',
                aviso && !erro && 'border-warning bg-warning/5'
              )}
            >
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {opcoesDisponiveis?.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'texto':
        return (
          <Input
            value={valor || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={atributo.observacoes || `Digite ${atributo.nome.toLowerCase()}`}
            className={cn(
              erro && 'border-destructive bg-destructive/5',
              aviso && !erro && 'border-warning bg-warning/5'
            )}
          />
        );

      case 'numero':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={valor || ''}
              onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder="0"
              className={cn(
                'flex-1',
                erro && 'border-destructive bg-destructive/5',
                aviso && !erro && 'border-warning bg-warning/5'
              )}
            />
            {atributo.unidade && (
              <span className="text-sm text-muted-foreground min-w-[40px]">
                {atributo.unidade}
              </span>
            )}
          </div>
        );

      case 'simnao':
        return (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <span className="text-sm">{atributo.nome}</span>
            <Switch
              checked={valor === true || valor === 'Sim'}
              onCheckedChange={(checked) => handleChange(checked)}
              disabled={disabled}
            />
          </div>
        );

      case 'multiselect':
        // Simplificado - usar checkboxes ou tags no futuro
        return (
          <Select
            value={valor || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {opcoesDisponiveis?.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  // Para campos simnao, o label já está no componente
  if (atributo.tipo === 'simnao') {
    return (
      <div className={cn('space-y-2', disabled && 'opacity-50')}>
        {renderCampo()}
        
        {erro && (
          <div className="flex items-center gap-2 text-destructive text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{erro}</span>
          </div>
        )}

        {aviso && !erro && (
          <div className="flex items-center gap-2 text-warning text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span>{aviso}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', disabled && 'opacity-50')}>
      <div className="flex items-center gap-2">
        <Label htmlFor={atributo.codigo} className="text-sm font-medium">
          {atributo.nome}
        </Label>
        {atributo.obrigatorio && (
          <span className="text-destructive text-xs">*</span>
        )}
        {valor && !erro && (
          <Check className="h-3 w-3 text-success ml-auto" />
        )}
      </div>

      {renderCampo()}

      {/* Mensagens de erro */}
      {erro && (
        <div className="flex items-center gap-2 text-destructive text-xs p-2 rounded bg-destructive/10">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Mensagens de aviso */}
      {aviso && !erro && (
        <div className="flex items-center gap-2 text-warning text-xs p-2 rounded bg-warning/10">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      {/* Sugestões */}
      {sugestao && !valor && (
        <div className="flex items-center gap-2 text-success text-xs p-2 rounded bg-success/10 border border-success/20">
          <Lightbulb className="h-3 w-3 shrink-0" />
          <span className="flex-1">{sugestao.mensagem}</span>
          {onAplicarSugestao && (
            <button
              onClick={onAplicarSugestao}
              className="px-2 py-0.5 text-xs bg-success text-success-foreground rounded hover:bg-success/90 transition-colors"
            >
              Aplicar
            </button>
          )}
        </div>
      )}

      {/* Observações/Help text */}
      {atributo.observacoes && !erro && !aviso && !sugestao && (
        <p className="text-xs text-muted-foreground">{atributo.observacoes}</p>
      )}
    </div>
  );
};

export default CampoDinamico;
