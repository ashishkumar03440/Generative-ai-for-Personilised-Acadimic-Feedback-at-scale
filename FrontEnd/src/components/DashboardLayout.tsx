import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors: Record<string, string> = {
    student: "bg-primary/15 text-primary border-primary/20",
    teacher: "bg-accent/15 text-accent border-accent/20",
    admin: "bg-neon-violet/15 text-neon-violet border-neon-violet/20",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 glass px-4 gap-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-glow" />
            </Button>
            <Badge variant="outline" className={`capitalize text-xs rounded-lg border font-semibold ${roleColors[user.role] || ""}`}>
              {user.role === "teacher" ? "Faculty" : user.role}
            </Badge>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
