import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Settings2, 
  FileText, 
  CheckCircle, 
  Database,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'configurator', label: 'Configurador', icon: Settings2 },
  { id: 'specs', label: 'Especificações', icon: FileText },
  { id: 'approval', label: 'Aprovações', icon: CheckCircle },
  { id: 'catalog', label: 'Catálogo', icon: Database },
];

const Sidebar = ({ isOpen, onClose, activePage, onNavigate }: SidebarProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs font-medium text-sidebar-accent-foreground">
                IMEX Solutions
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                Configurador v1.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
