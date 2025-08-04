import { Button } from "./ui/button";
import { Activity, Settings, Zap, Menu, X, Home, CreditCard } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth/AuthContext";
import { LogOut } from 'lucide-react'

interface SidebarProps {
  currentPage?: 'home' | 'dashboard' | 'workflows' | 'billing';
}

export function FuturisticSidebar({ currentPage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      description: 'Home',
      href: '/home'
    },
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: Activity,
      description: 'Runtime Metrics',
      href: '/dashboard'
    },
    {
      id: 'workflows' as const,
      label: 'Workflows',
      icon: Settings,
      description: 'Configuration',
      href: '/workflows'
    },
    {
      id: 'billing' as const,
      label: 'Billing',
      icon: CreditCard,
      description: 'Usage & Plans',
      href: '/billing'
    }
  ];

  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/workflows')) return 'workflows';
    if (pathname.startsWith('/billing')) return 'billing';
    return 'home';
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border
      transition-all duration-300 z-50
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-primary">
               Exosphere
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-accent/20 hover:text-primary transition-colors"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getCurrentPage() === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              className={`
                w-full justify-start gap-3 p-3 h-auto
                transition-all duration-200 hover-accent
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/30 subtle-glow' 
                  : 'hover:bg-accent/10 hover:text-primary'
                }
                ${isCollapsed ? 'px-3' : 'px-3'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              {!isCollapsed && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </div>

      
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 p-3 h-auto transition-all duration-200 hover-accent"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      

      {/* Status indicator */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              <span className="text-sm text-accent-green">System Online</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              All systems operational
            </div>
          </div>
        </div>
      )}
    </div>
  );
}