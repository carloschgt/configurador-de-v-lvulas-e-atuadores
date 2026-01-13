import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthStatus {
  isHealthy: boolean;
  isLoading: boolean;
  activeCatalogCount: number;
  normCoveragePercent: number;
  domainCoveragePercent: number;
  issues: string[];
  lastCheck: Date | null;
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealthStatus>({
    isHealthy: true,
    isLoading: true,
    activeCatalogCount: 0,
    normCoveragePercent: 0,
    domainCoveragePercent: 0,
    issues: [],
    lastCheck: null
  });

  const checkHealth = async () => {
    const issues: string[] = [];
    
    try {
      // Check 1: Exactly 1 ACTIVE catalog version
      const { data: catalogs, error: catalogError } = await supabase
        .from('rule_catalog_version')
        .select('*')
        .eq('status', 'ACTIVE');
      
      if (catalogError) throw catalogError;
      
      const activeCatalogCount = catalogs?.length || 0;
      
      if (activeCatalogCount === 0) {
        issues.push('Nenhuma versão de catálogo ACTIVE encontrada');
      } else if (activeCatalogCount > 1) {
        issues.push(`${activeCatalogCount} versões de catálogo ACTIVE (deve haver apenas 1)`);
      }

      // Check 2: All standards have valve types defined
      const { data: standards, error: standardsError } = await supabase
        .from('standards_hierarchy')
        .select('*')
        .eq('is_active', true);
      
      if (standardsError) throw standardsError;
      
      const standardsWithoutTypes = standards?.filter(s => !s.applies_to_valve_types) || [];
      if (standardsWithoutTypes.length > 0) {
        issues.push(`${standardsWithoutTypes.length} normas sem tipos de válvula definidos`);
      }

      // Check 3: All domains are populated
      const { data: domains, error: domainsError } = await supabase
        .from('norm_controlled_domains')
        .select('*')
        .eq('is_active', true);
      
      if (domainsError) throw domainsError;
      
      const emptyDomains = domains?.filter(d => {
        const values = d.allowed_values as string[];
        return !values || values.length === 0;
      }) || [];
      
      if (emptyDomains.length > 0) {
        issues.push(`${emptyDomains.length} domínios sem valores permitidos`);
      }

      // Calculate coverage
      const normCoverage = standards && standards.length > 0 
        ? ((standards.length - standardsWithoutTypes.length) / standards.length) * 100 
        : 0;
      
      const domainCoverage = domains && domains.length > 0
        ? ((domains.length - emptyDomains.length) / domains.length) * 100
        : 0;

      const isHealthy = issues.length === 0;

      setHealth({
        isHealthy,
        isLoading: false,
        activeCatalogCount,
        normCoveragePercent: normCoverage,
        domainCoveragePercent: domainCoverage,
        issues,
        lastCheck: new Date()
      });

      // Log health check to database
      await supabase.from('system_health_log').insert({
        is_healthy: isHealthy,
        active_catalog_count: activeCatalogCount,
        norm_coverage_percent: normCoverage,
        domain_coverage_percent: domainCoverage,
        issues: issues
      });

    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        ...prev,
        isHealthy: false,
        isLoading: false,
        issues: ['Falha ao verificar saúde do sistema']
      }));
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Re-check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { ...health, refresh: checkHealth };
};
