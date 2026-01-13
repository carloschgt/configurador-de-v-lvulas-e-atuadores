import logoImex from "@/assets/logo-imex.png";
import { Button } from "@/components/ui/button";
import { Settings, User, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <img
              src={logoImex}
              alt="IMEX Solutions"
              className="h-10 w-auto"
            />
            <div className="hidden sm:block border-l border-border pl-3">
              <span className="text-sm font-medium text-muted-foreground">
                Configurador de Válvulas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
