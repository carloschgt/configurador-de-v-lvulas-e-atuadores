import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type DecisionType = Database['public']['Enums']['decision_type'];

interface LogDecisionParams {
  specId?: string;
  decisionType: DecisionType;
  parameterName?: string;
  selectedValue?: string;
  applicableNorms?: string[];
  rejectedNorms?: { norm: string; reason: string }[];
  rejectionReason?: string;
  calculationInputs?: Record<string, any>;
  calculationResults?: Record<string, any>;
  systemRuleId?: string;
}

export const useNormDecisionLog = () => {
  const { user } = useAuth();

  const logDecision = useCallback(async ({
    specId,
    decisionType,
    parameterName,
    selectedValue,
    applicableNorms,
    rejectedNorms,
    rejectionReason,
    calculationInputs,
    calculationResults,
    systemRuleId
  }: LogDecisionParams) => {
    if (!user) {
      console.warn('Cannot log decision: No authenticated user');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('norm_decision_log')
        .insert({
          spec_id: specId || null,
          user_id: user.id,
          decision_type: decisionType,
          parameter_name: parameterName,
          selected_value: selectedValue,
          applicable_norms: applicableNorms || [],
          rejected_norms: rejectedNorms || [],
          rejection_reason: rejectionReason,
          calculation_inputs: calculationInputs || {},
          calculation_results: calculationResults || {},
          system_rule_id: systemRuleId
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to log decision:', error);
        return null;
      }

      console.log('Decision logged:', data.id);
      return data;
    } catch (error) {
      console.error('Error logging decision:', error);
      return null;
    }
  }, [user]);

  const logNormSelection = useCallback(async (
    specId: string | undefined,
    valveType: string,
    serviceType: string,
    selectedNorm: string,
    applicableNorms: string[],
    rejectedNorms: { norm: string; reason: string }[]
  ) => {
    return logDecision({
      specId,
      decisionType: 'NORM_SELECTION',
      parameterName: 'PRIMARY_NORM',
      selectedValue: selectedNorm,
      applicableNorms,
      rejectedNorms,
      calculationInputs: { valveType, serviceType }
    });
  }, [logDecision]);

  const logMaterialChoice = useCallback(async (
    specId: string | undefined,
    materialType: string,
    selectedMaterial: string,
    applicableNorms: string[],
    wasBlocked: boolean,
    blockReason?: string
  ) => {
    return logDecision({
      specId,
      decisionType: 'MATERIAL_CHOICE',
      parameterName: materialType,
      selectedValue: selectedMaterial,
      applicableNorms,
      rejectionReason: wasBlocked ? blockReason : undefined
    });
  }, [logDecision]);

  const logTestRequirement = useCallback(async (
    specId: string | undefined,
    testType: string,
    isRequired: boolean,
    applicableNorms: string[],
    requirements?: Record<string, any>
  ) => {
    return logDecision({
      specId,
      decisionType: 'TEST_REQUIREMENT',
      parameterName: testType,
      selectedValue: isRequired ? 'REQUIRED' : 'NOT_REQUIRED',
      applicableNorms,
      calculationResults: requirements
    });
  }, [logDecision]);

  const logCalculation = useCallback(async (
    specId: string | undefined,
    calculationType: string,
    inputs: Record<string, any>,
    results: Record<string, any>,
    applicableNorms: string[]
  ) => {
    return logDecision({
      specId,
      decisionType: 'CALCULATION',
      parameterName: calculationType,
      applicableNorms,
      calculationInputs: inputs,
      calculationResults: results
    });
  }, [logDecision]);

  const logValidation = useCallback(async (
    specId: string | undefined,
    validationType: string,
    isValid: boolean,
    applicableNorms: string[],
    errors?: string[]
  ) => {
    return logDecision({
      specId,
      decisionType: 'VALIDATION',
      parameterName: validationType,
      selectedValue: isValid ? 'VALID' : 'INVALID',
      applicableNorms,
      rejectionReason: errors?.join('; ')
    });
  }, [logDecision]);

  return {
    logDecision,
    logNormSelection,
    logMaterialChoice,
    logTestRequirement,
    logCalculation,
    logValidation
  };
};
