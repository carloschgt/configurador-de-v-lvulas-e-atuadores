import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Configurator from "@/pages/Configurator";
import Specifications from "@/pages/Specifications";
import ApprovalsPage from "@/pages/Approvals";
import CatalogPage from "@/pages/Catalog";
import SettingsPage from "@/pages/Settings";
import EmergencyModeBanner from "@/components/EmergencyModeBanner";
import { useSystemHealth } from "@/hooks/useSystemHealth";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { isHealthy } = useSystemHealth();

  const handleNavigate = (page: string) => {
    // FAIL-CLOSED: Block new spec creation if system is unhealthy
    if (page === "configurator" && !isHealthy) {
      return;
    }
    setActivePage(page);
  };

  // Listen for navigation events from header
  useEffect(() => {
    const handleNavEvent = (e: CustomEvent) => {
      handleNavigate(e.detail);
    };
    window.addEventListener('navigate', handleNavEvent as EventListener);
    return () => window.removeEventListener('navigate', handleNavEvent as EventListener);
  }, [isHealthy]);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "configurator":
        return isHealthy ? <Configurator /> : <Dashboard onNavigate={handleNavigate} />;
      case "specs":
        return <Specifications onNavigate={handleNavigate} />;
      case "approval":
        return <ApprovalsPage />;
      case "catalog":
        return <CatalogPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main className="md:ml-64 min-h-[calc(100vh-4rem)]">
        <div className="container py-6 px-4 md:px-6 max-w-7xl">
          <EmergencyModeBanner />
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
