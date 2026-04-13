import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FileText, Clock, CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  assignmentCount: number;
  submissionCount: number;
  reviewedCount: number;
  pendingCount: number;
  feedbackCount: number;
  approvalRate: string;
  trendData: { day: string; submissions: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/admin/stats")
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers.toString(), sub: `${stats.studentCount} students · ${stats.teacherCount} faculty`, icon: Users, glow: "shadow-glow-primary" },
    { label: "Total Submissions", value: stats.submissionCount.toString(), sub: `${stats.pendingCount} pending review`, icon: FileText, glow: "shadow-glow-success" },
    { label: "Reviewed", value: stats.reviewedCount.toString(), sub: `${stats.approvalRate} approval rate`, icon: CheckCircle, glow: "shadow-glow-primary" },
    { label: "Pending", value: stats.pendingCount.toString(), sub: "awaiting faculty review", icon: Clock, glow: "shadow-glow-accent" },
    { label: "Assignments", value: stats.assignmentCount.toString(), sub: "created by faculty", icon: BookOpen, glow: "shadow-glow-primary" },
    { label: "Feedback Given", value: stats.feedbackCount.toString(), sub: "AI + faculty combined", icon: Activity, glow: "shadow-glow-success" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Institution Overview</h1>
          <p className="text-muted-foreground text-sm">Platform health & key metrics</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading platform stats…</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08 }}>
                  <Card className={`hover-lift glass-card ${stat.glow}`}>
                    <CardContent className="p-5">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold font-display">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      <p className="text-xs text-primary/70 mt-1 font-medium">{stat.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="glass-card overflow-hidden">
                <div className="h-1 gradient-primary" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display">Submission Trends (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats?.trendData || []}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240, 10%, 14%)", background: "hsl(240, 12%, 8%)", color: "hsl(240, 5%, 92%)" }} />
                      <Area type="monotone" dataKey="submissions" stroke="hsl(250, 85%, 65%)" strokeWidth={3} fill="url(#trendGradient)" dot={{ fill: "hsl(250, 85%, 65%)", r: 5, strokeWidth: 2, stroke: "hsl(240, 12%, 8%)" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
