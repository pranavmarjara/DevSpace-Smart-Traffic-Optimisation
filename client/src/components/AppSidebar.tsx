import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  BarChart3,
  Settings,
  AlertCircle,
  Activity,
  Clock,
  Zap,
  Play
} from "lucide-react";
import { useLocation, Link } from "wouter";

const navigationItems = [
  {
    title: "Traffic Overview",
    url: "/",
    icon: MapPin,
    badge: null
  },
  {
    title: "Analytics",
    url: "/analytics", 
    icon: BarChart3,
    badge: null
  },
  {
    title: "Real-time Monitor",
    url: "/monitor",
    icon: Activity,
    badge: "LIVE"
  },
  {
    title: "System Alerts",
    url: "/alerts",
    icon: AlertCircle,
    badge: "3"
  },
  {
    title: "Signal Control",
    url: "/control",
    icon: Clock,
    badge: null
  },
  {
    title: "AI Optimization",
    url: "/optimization",
    icon: Zap,
    badge: "NEW"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    badge: null
  },
  {
    title: "Try Demo",
    url: "/try-us",
    icon: Play,
    badge: "DEMO"
  }
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground" data-testid="text-app-title">
            Smart Traffic Management
          </h2>
          <p className="text-sm text-sidebar-foreground/60" data-testid="text-app-subtitle">
            Government of Odisha
          </p>
          <Badge variant="outline" className="w-fit">
            Electronics & IT Dept
          </Badge>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === "LIVE" ? "default" : item.badge === "NEW" ? "secondary" : "destructive"} 
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-sidebar-foreground/60 space-y-1">
          <p data-testid="text-system-status">System Status: <span className="text-chart-1 font-medium">Active</span></p>
          <p data-testid="text-last-update">Last Update: 2 minutes ago</p>
          <p data-testid="text-version">Version 2.1.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}