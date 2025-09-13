import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Monitor from "@/pages/Monitor";
import Alerts from "@/pages/Alerts";
import Control from "@/pages/Control";
import Optimization from "@/pages/Optimization";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/monitor" component={Monitor} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/control" component={Control} />
      <Route path="/optimization" component={Optimization} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold" data-testid="text-header-title">
                      Smart Traffic Management System
                    </h1>
                    <p className="text-sm text-muted-foreground" data-testid="text-header-subtitle">
                      Real-time urban congestion optimization
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                    <span data-testid="text-status-live">System Live</span>
                  </div>
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto bg-background">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
