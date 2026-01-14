import { useMemo } from 'react';
import { buildDescricaoImex, type ImexSpec, type BuildResult } from '@/lib/imex-description';

export type ValidationStatus = 'INCOMPLETO' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

export interface FailClosedValidation {
  canSaveDraft: boolean;
  canPublish: boolean;
  missingFields: string[];
  status: ValidationStatus;
  imexResult: BuildResult;
  completionPercent: number;
}

/**
 * Hook para validação fail-closed do configurador
 * - Permite salvar rascunho mesmo incompleto (com status INCOMPLETO)
 * - Bloqueia publicação se houver campos faltando
 */
export function useFailClosedValidation(spec: ImexSpec): FailClosedValidation {
  return useMemo(() => {
    const imexResult = buildDescricaoImex(spec);
    const missingFields = imexResult.missing;
    
    // Total de campos obrigatórios (baseado nos segmentos esperados)
    const totalRequired = 6; // modelo, diamClasse, conexao, corpo, trim, atuacao
    const filledCount = totalRequired - missingFields.length;
    const completionPercent = Math.round((filledCount / totalRequired) * 100);
    
    // Regra fail-closed:
    // - Salvar rascunho: sempre permitido
    // - Publicar: só se isComplete === true
    const canSaveDraft = true;
    const canPublish = imexResult.isComplete;
    
    // Determinar status baseado na completude
    let status: ValidationStatus = 'DRAFT';
    if (missingFields.length > 0) {
      status = 'INCOMPLETO';
    }
    
    return {
      canSaveDraft,
      canPublish,
      missingFields,
      status,
      imexResult,
      completionPercent,
    };
  }, [spec]);
}

/**
 * Prepara dados para salvar no banco com campos de validação
 */
export function prepareForSave(
  spec: ImexSpec,
  validation: FailClosedValidation,
  existingStatus?: ValidationStatus
): {
  status: string;
  missing_fields: string[];
  imex_code: string;
  is_complete: boolean;
} {
  // Manter status existente se já submetido/aprovado/publicado
  let status: string = validation.status;
  if (existingStatus && ['SUBMITTED', 'APPROVED', 'PUBLISHED'].includes(existingStatus)) {
    status = existingStatus;
  } else if (validation.missingFields.length > 0) {
    status = 'INCOMPLETO';
  } else {
    status = 'DRAFT';
  }
  
  return {
    status,
    missing_fields: validation.missingFields,
    imex_code: validation.imexResult.value,
    is_complete: validation.imexResult.isComplete,
  };
}
