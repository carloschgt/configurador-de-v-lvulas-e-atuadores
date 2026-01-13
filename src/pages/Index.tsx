import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Configurator from "@/pages/Configurator";
import Specifications from "@/pages/Specifications";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "configurator":
        return <Configurator />;
      case "specs":
        return <Specifications onNavigate={handleNavigate} />;
      case "approval":
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Aprovações</h2>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </div>
          </div>
        );
      case "catalog":
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Catálogo</h2>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </div>
          </div>
        );
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
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
