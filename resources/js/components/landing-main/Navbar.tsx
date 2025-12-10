import { Button } from "@/components/ui/button";
import { QrCode, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { type SharedData } from "@/types";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = usePage<SharedData>().props;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-lg">HRMS</span>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {auth.user ? (
              <Link href={route('dashboard.index')}>
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href={route('login')}>
                <Button variant="main" size="sm" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors py-2">How it Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors py-2">Pricing</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {auth.user ? (
                  <Link href={route('dashboard.index')}>
                    <Button variant="ghost" size="sm" className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <Link href={route('login')}>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
