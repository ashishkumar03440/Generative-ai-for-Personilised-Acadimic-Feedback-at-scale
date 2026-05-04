import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, TrendingUp, ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { API_BASE, authFetch } from "@/lib/api";

interface Assignment {
  _id: string;
  title: string;
  course: string;
  createdAt: string;
}

const subjectColors: Record<string, string> = {
  ENV: "bg-success/15 text-success",
  BIO: "bg-primary/15 text-primary",
  CS: "bg-accent/15 text-accent",
  Math: "bg-blue-500/15 text-blue-500",
  Physics: "bg-yellow-500/15 text-yellow-500",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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

  const stats = [
    { label: "Pending", value: pendingAssignments.length.toString(), icon: Clock, gradient: "card-gradient-accent", glow: "shadow-glow-accent" },
    { label: "Submitted", value: mySubmissions.length.toString(), icon: FileText, gradient: "card-gradient-blue", glow: "shadow-glow-primary" },
    { label: "Graded", value: gradedCount.toString(), icon: CheckCircle, gradient: "card-gradient-success", glow: "shadow-glow-success" },
    { label: "Avg Score", value: `${avgScoreCalc}%`, icon: TrendingUp, gradient: "card-gradient-blue", glow: "shadow-glow-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl gradient-hero p-8 neon-border"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/6 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-4 neon-border">
              <Sparkles className="h-3 w-3" /> Welcome back
            </div>
            <h1 className="text-3xl font-bold font-display mb-2">
              Hello, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
              You have {pendingAssignments.length} pending assignments to review.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <Card className={`hover-lift glass-card ${stat.glow}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold tracking-tight font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Assignments */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display">Active Assignments</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate("/student/assignments")}>
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingAssignments.slice(0, 3).map((assignment, i) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group neon-border"
                    onClick={() => navigate("/student/assignments")}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${subjectColors[assignment.course] || "bg-primary/15 text-primary"}`}>
                        {assignment.course}
                      </span>
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {new Date(assignment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
                {pendingAssignments.length === 0 && (
                   <div className="text-center p-4 text-muted-foreground text-sm">No active assignments</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate("/student/submit")}
                  className="w-full justify-between h-14 gradient-primary text-primary-foreground hover-lift rounded-xl text-base shadow-glow-primary"
                >
                  <span className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </div>
                    Submit New Work
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate("/student/assignments")}
                  variant="outline"
                  className="w-full justify-between h-14 rounded-xl text-base neon-border hover:bg-primary/5 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-accent" />
                    </div>
                    View Assignments
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button
                  onClick={() => navigate("/student/progress")}
                  variant="outline"
                  className="w-full justify-between h-14 rounded-xl text-base neon-border hover:bg-success/5 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    View Progress
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
