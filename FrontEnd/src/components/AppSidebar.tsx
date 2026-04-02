import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, MessageSquare, Upload, PenTool, Users,
  Activity, Shield, BookOpen, LogOut, GraduationCap, Brain, Zap,
} from "lucide-react";

const studentLinks = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Assignments", url: "/student/assignments", icon: FileText },
  { title: "Submit Work", url: "/student/submit", icon: Upload },
  { title: "Feedback", url: "/student/feedback", icon: MessageSquare },
  { title: "Progress", url: "/student/progress", icon: BarChart3 },
];

const teacherLinks = [
  { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
  { title: "Create Assignment", url: "/teacher/create", icon: PenTool },
  { title: "Review Work", url: "/teacher/review", icon: BookOpen },
  { title: "Analytics", url: "/teacher/analytics", icon: BarChart3 },
];

const adminLinks = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "AI Monitor", url: "/admin/ai", icon: Brain },
  { title: "Audit Log", url: "/admin/audit", icon: Shield },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = user.role === "student" ? studentLinks : user.role === "teacher" ? teacherLinks : adminLinks;
  const roleLabel = user.role === "student" ? "Student" : user.role === "teacher" ? "Faculty" : "Admin";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          {!collapsed && (
            <div className="px-3 py-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-sidebar-accent-foreground font-display tracking-tight">GradeAI</h2>
                  <p className="text-[10px] text-sidebar-foreground uppercase tracking-widest">{roleLabel}</p>
                </div>
              </div>
            </div>
          )}
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-medium neon-border"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar">
        {!collapsed && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl glass-card">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
