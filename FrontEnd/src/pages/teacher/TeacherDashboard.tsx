import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Clock, Users, CheckCircle, ThumbsUp, ThumbsDown, Plus, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE, authFetch } from "@/lib/api";

const priorityColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/20",
  medium: "bg-warning/15 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground",
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const fetchSubmissions = () =>
    authFetch(`${API_BASE}/submitted/list`)
      .then(res => res.json())
      .then(data => { if (data.submissions) setSubmissions(data.submissions); })
      .catch(console.error);

  useEffect(() => {
    authFetch(`${API_BASE}/assignment/list`)
      .then(res => res.json())
      .then(data => { if (data.assignments) setAssignments(data.assignments); })
      .catch(console.error);

    fetchSubmissions();
  }, []);

  const pendingSubmissions = submissions.filter(s => s.status !== "reviewed" && s.status !== "rejected");
  const reviewedSubmissions = submissions.filter(s => s.status === "reviewed");

  const uniqueClasses = Array.from(new Set(assignments.map(a => a.course))).length;

  const stats = [
    { label: "Pending Reviews", value: pendingSubmissions.length.toString(), icon: Clock, glow: "shadow-glow-accent" },
    { label: "Reviewed", value: reviewedSubmissions.length.toString(), icon: CheckCircle, glow: "shadow-glow-success" },
    { label: "Active Classes", value: uniqueClasses.toString(), icon: Users, glow: "shadow-glow-primary" },
    { label: "Assignments", value: assignments.length.toString(), icon: FileText, glow: "shadow-glow-primary" },
  ];

  const queue = pendingSubmissions.map((s, i) => ({
    id: s._id,
    student: s.studentName || "Anonymous",
    assignment: s.assignmentId?.title || "Unknown Assignment",
    submitted: new Date(s.createdAt).toLocaleDateString(),
    priority: i % 3 === 0 ? "high" : "medium",
    confidence: s.confidence || 90,
  }));

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === queue.length ? [] : queue.map(q => q.id));

  const bulkUpdateStatus = async (status: "reviewed" | "rejected") => {
    const label = status === "reviewed" ? "approved" : "rejected";
    try {
      await Promise.all(
        selected.map(id =>
          authFetch(`${API_BASE}/submitted/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      toast.success(`${selected.length} submission(s) ${label}`);
      setSelected([]);
      fetchSubmissions();
    } catch (e) {
      toast.error("Failed to update submissions.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Faculty Dashboard</h1>
            <p className="text-muted-foreground text-sm">Review queue & class overview</p>
          </div>
          <Button onClick={() => navigate("/teacher/create")} className="gradient-primary text-primary-foreground rounded-xl shadow-glow-primary hover-lift">
            <Plus className="h-4 w-4 mr-2" /> Create Assignment
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className={`hover-lift glass-card ${stat.glow}`}>
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <Sparkles className="h-4 w-4 text-primary" /> Feedback Review Queue
                </CardTitle>
                {selected.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold bg-secondary px-2 py-1 rounded-lg">{selected.length} selected</span>
                    <Button size="sm" onClick={() => bulkUpdateStatus("reviewed")} className="gradient-success text-primary-foreground rounded-lg">
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("rejected")} className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg">
                      <ThumbsDown className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {queue.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  🎉 All caught up! No pending submissions to review.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50">
                    <Checkbox checked={selected.length === queue.length && queue.length > 0} onCheckedChange={toggleAll} />
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Select all</span>
                  </div>
                  {queue.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-glow-primary">
                          {item.student.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.student}</p>
                          <p className="text-xs text-muted-foreground">{item.assignment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${item.confidence >= 90 ? "bg-success" : item.confidence >= 80 ? "bg-primary" : "bg-warning"}`} />
                            <p className={`text-xs font-bold ${item.confidence >= 90 ? "text-success" : item.confidence >= 80 ? "text-primary" : "text-warning"}`}>{item.confidence}%</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.submitted}</p>
                        </div>
                        <Badge variant="outline" className={`capitalize text-xs border rounded-lg ${priorityColors[item.priority]}`}>{item.priority}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/teacher/review?id=${item.id}`)}
                          className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity neon-border"
                        >
                          Review <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
