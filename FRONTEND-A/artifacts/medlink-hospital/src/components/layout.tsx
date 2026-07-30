import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, Building2, LayoutDashboard, Plus } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/hospitals", label: "Hospitals", icon: Building2 },
    { href: "/inventory", label: "Global Inventory", icon: Activity },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex-shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-bold tracking-tight text-sidebar-primary">
            <Activity className="w-5 h-5" />
            <span className="uppercase tracking-widest text-sidebar-foreground">MedLink</span>
            <span className="text-sidebar-primary/80">CTRL</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center font-bold text-xs text-sidebar-primary-foreground">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">System Admin</span>
              <span className="text-xs text-sidebar-foreground/50">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-14 flex items-center justify-between px-8 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span>SYS.STATUS:</span>
            <span className="text-green-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block animate-pulse"></span>
              NOMINAL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/hospitals/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-4 h-4" />
              Register Hospital
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
