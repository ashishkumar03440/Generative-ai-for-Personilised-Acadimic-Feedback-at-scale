import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Award, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE, authFetch } from "@/lib/api";

const mockScoreData = [
  { month: "Sep", score: 72 }, { month: "Oct", score: 76 }, { month: "Nov", score: 80 },
  { month: "Dec", score: 78 }, { month: "Jan", score: 84 }, { month: "Feb", score: 87 }, { month: "Mar", score: 91 },
];

export default function ProgressDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  useEffect(() => {
    authFetch(`${API_BASE}/assignment/list`)
      .then(res => res.json())
      .then(data => {
        if (data.assignments) {
          setAssignments(data.assignments);
        }
      })
      .catch(console.error);

    authFetch(`${API_BASE}/submitted/list`)
      .then(res => res.json())
      .then(data => {
        if (data.submissions) {
          setMySubmissions(data.submissions.filter((s: any) => s.studentId === user?.id));
        }
      })
      .catch(console.error);

    if (user?.id) {
      authFetch(`${API_BASE}/feedback/student?studentId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.feedback) {
            setFeedbackData(data.feedback);
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId?._id || s.assignmentId));
  const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.has(a._id));

  const gradedCount = feedbackData.length;
  const avgScoreCalc = gradedCount > 0 
    ? Math.round((feedbackData.reduce((acc, f) => acc + ((f.score / f.maxScore) * 100), 0)) / gradedCount) 
    : 0;

  let gpaCalc = "0.0";
  if (avgScoreCalc > 0) {
     gpaCalc = Math.max(0, (avgScoreCalc / 20) - 1).toFixed(1);
  }

  const summaryStats = [
    { label: "Overall GPA", value: gpaCalc, sub: gradedCount > 0 ? "Calculated from averages" : "No grades available yet", icon: Award, glow: "shadow-glow-primary" },
    { label: "Pending Assignments", value: pendingAssignments.length.toString(), sub: "Waiting to be submitted", icon: FileText, glow: "shadow-glow-accent" },
    { label: "Avg Score", value: `${avgScoreCalc}%`, sub: gradedCount > 0 ? "Cumulative performance" : "Waiting for grades", icon: TrendingUp, glow: "shadow-glow-success" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyGroups: Record<string, { total: number, count: number }> = {};
  const subjectGroups: Record<string, { total: number, count: number }> = {};

  feedbackData.forEach(f => {
     const date = f.createdAt ? new Date(f.createdAt) : new Date();
     const month = months[date.getMonth()];
     const pct = (f.score / f.maxScore) * 100;

     if (!monthlyGroups[month]) monthlyGroups[month] = { total: 0, count: 0 };
     monthlyGroups[month].total += pct;
     monthlyGroups[month].count += 1;

     const course = f.assignmentId?.course || "Other";
     if (!subjectGroups[course]) subjectGroups[course] = { total: 0, count: 0 };
     subjectGroups[course].total += pct;
     subjectGroups[course].count += 1;
  });

  let dynamicScoreData = Object.keys(monthlyGroups).map(m => ({
     month: m,
     score: Math.round(monthlyGroups[m].total / monthlyGroups[m].count)
  })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

  let finalSubjectData = Object.keys(subjectGroups).map(c => ({
     subject: c,
     avg: Math.round(subjectGroups[c].total / subjectGroups[c].count)
  }));

  if (dynamicScoreData.length === 0) dynamicScoreData = mockScoreData;
  if (finalSubjectData.length === 0) finalSubjectData = [{ subject: "No Data", avg: 0 }];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Progress Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your academic growth over time</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className={`hover-lift glass-card ${s.glow}`}>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold font-display">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-success mt-1 font-semibold">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Score Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dynamicScoreData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(250, 85%, 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240, 10%, 14%)", background: "hsl(240, 12%, 8%)", color: "hsl(240, 5%, 92%)" }} />
                  <Area type="monotone" dataKey="score" stroke="hsl(250, 85%, 65%)" strokeWidth={3} fill="url(#scoreGradient)" dot={{ fill: "hsl(250, 85%, 65%)", r: 5, strokeWidth: 2, stroke: "hsl(240, 12%, 8%)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-accent" />
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Performance by Subject</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={finalSubjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240, 10%, 14%)", background: "hsl(240, 12%, 8%)", color: "hsl(240, 5%, 92%)" }} />
                  <Bar dataKey="avg" fill="hsl(200, 100%, 55%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
