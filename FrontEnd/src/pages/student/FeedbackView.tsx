import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, TrendingUp, BookOpen, ExternalLink, Sparkles, Award, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE, authFetch } from "@/lib/api";

const mockTemplate = {
  score: 8.5, maxScore: 10,
  strengths: ["Excellent thesis statement with clear argument", "Strong use of textual evidence", "Well-organized paragraph structure"],
  weaknesses: ["Some citations missing proper MLA format", "Conclusion could be more impactful"],
  suggestions: [
    { text: "Review MLA citation format for plays", chapter: "NCERT English Elective – Ch. 5", link: "#" },
    { text: "Study effective conclusion techniques", chapter: "NCERT English Core – Ch. 8", link: "#" },
    { text: "Explore dramatic irony in more depth", chapter: "NCERT English Elective – Ch. 3", link: "#" },
  ],
  conceptMastery: [
    { topic: "Literary Analysis", progress: 88, trend: "+5%" },
    { topic: "Essay Structure", progress: 82, trend: "+3%" },
    { topic: "Citation & Referencing", progress: 65, trend: "+8%" },
    { topic: "Critical Thinking", progress: 90, trend: "+2%" },
    { topic: "Creative Writing", progress: 74, trend: "+6%" },
  ],
  aiComment: "This essay demonstrates a sophisticated understanding of the subject matter. The analysis is particularly strong. Focus on improving formatting and crafting a more resonant conclusion.",
  rubric: [
    { criteria: "Content", score: 9, max: 10 },
    { criteria: "Structure", score: 8, max: 10 }
  ]
};

const scoreColor = (pct: number) => pct >= 90 ? "text-success" : pct >= 80 ? "text-primary" : pct >= 70 ? "text-warning" : "text-destructive";
const barColor = (pct: number) => pct >= 85 ? "[&>div]:bg-success" : pct >= 70 ? "[&>div]:bg-primary" : "[&>div]:bg-warning";

export default function FeedbackView() {
  const { user } = useAuth();
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    authFetch(`${API_BASE}/feedback/student?studentId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.feedback && data.feedback.length > 0) {
          setAllFeedback(data.feedback);
          setFeedbackData(data.feedback[0]); // Show the most recent one by default
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const hasFeedback = !!feedbackData;

  if (!hasFeedback) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 max-w-md w-full">
            <div className="mx-auto h-20 w-20 rounded-full bg-secondary flex items-center justify-center neon-border">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">No Feedback Yet</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Your teacher has not graded this assignment or provided any feedback yet. Please check back later!
              </p>
            </div>
            <Button variant="outline" className="rounded-xl neon-border" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const feedback = {
    assignment: feedbackData?.assignmentId?.title || "Unknown Assignment",
    course: feedbackData?.assignmentId?.course || "Unknown Course",
    date: feedbackData?.createdAt ? new Date(feedbackData.createdAt).toLocaleDateString() : "Unknown Date",
    score: feedbackData?.score || mockTemplate.score,
    maxScore: feedbackData?.maxScore || mockTemplate.maxScore,
    strengths: feedbackData?.strengths?.length ? feedbackData.strengths : mockTemplate.strengths,
    weaknesses: feedbackData?.weaknesses?.length ? feedbackData.weaknesses : mockTemplate.weaknesses,
    suggestions: feedbackData?.suggestions?.length ? feedbackData.suggestions : mockTemplate.suggestions,
    conceptMastery: feedbackData?.conceptMastery?.length ? feedbackData.conceptMastery : mockTemplate.conceptMastery,
    aiComment: feedbackData?.aiComment || mockTemplate.aiComment,
    rubric: feedbackData?.rubric?.length ? feedbackData.rubric : mockTemplate.rubric
  };

  const pct = (feedback.score / feedback.maxScore) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assignment Selector Dropdown */}
        {allFeedback.length >= 1 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border neon-border shadow-sm gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-medium text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                View Feedback For:
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {allFeedback.length} assignment{allFeedback.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Select
              value={feedbackData?._id}
              onValueChange={(val) => {
                const selected = allFeedback.find(f => f._id === val);
                if (selected) setFeedbackData(selected);
              }}
            >
              <SelectTrigger className="w-full sm:w-[380px] bg-background">
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                {allFeedback.map((f, idx) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.assignmentId?.title || `Assignment ${idx + 1}`} — {new Date(f.createdAt).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Score Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl gradient-hero p-8 neon-border">
          <div className="absolute top-0 right-0 w-40 h-40 bg-success/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/8 rounded-full blur-[60px]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <Badge className="bg-primary/20 text-primary border-0 mb-3">{feedback.course}</Badge>
              <h1 className="text-2xl font-bold font-display mb-1">{feedback.assignment}</h1>
              <p className="text-sm text-muted-foreground">{feedback.date}</p>
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }} className="text-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-2 border-success/30 flex items-center justify-center bg-success/10 shadow-glow-success">
                  <div>
                    <p className="text-3xl font-bold font-display">{feedback.score}</p>
                    <p className="text-xs text-muted-foreground">/{feedback.maxScore}</p>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1">
                  <Award className="h-6 w-6 text-warning animate-float" />
                </div>
              </div>
              <Badge className="gradient-success text-primary-foreground mt-3 border-0">Excellent</Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Faculty Comment (If any) */}
        {feedbackData?.facultyComment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card overflow-hidden border-primary/20 bg-primary/5">
              <div className="h-1 gradient-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  Teacher's Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {feedbackData.facultyComment}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <Sparkles className="h-4 w-4 text-primary" /> AI Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{feedback.aiComment}"</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rubric */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Rubric Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {feedback.rubric.map((r: any, i: number) => {
                const p = (r.score / r.max) * 100;
                return (
                  <motion.div key={r.criteria} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{r.criteria}</span>
                      <span className={`font-bold ${scoreColor(p)}`}>{r.score}/{r.max}</span>
                    </div>
                    <Progress value={p} className={`h-2.5 rounded-full bg-secondary ${barColor(p)}`} />
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-l-2 border-l-success h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-success" /></div>
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.strengths.map((s: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                      className="text-sm flex items-start gap-3 p-2 rounded-lg hover:bg-success/5 transition-colors">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />{s}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card className="glass-card border-l-2 border-l-destructive h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-destructive" /></div>
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.weaknesses.map((w: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                      className="text-sm flex items-start gap-3 p-2 rounded-lg hover:bg-destructive/5 transition-colors">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />{w}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-accent" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center"><BookOpen className="h-4 w-4 text-accent" /></div>
                Suggested Study Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedback.suggestions.map((s: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-start justify-between gap-3 p-4 rounded-xl bg-accent/5 neon-border hover:shadow-glow-accent transition-all group">
                  <div className="space-y-1">
                    <p className="text-sm font-medium group-hover:text-accent transition-colors">{s.text}</p>
                    <p className="text-xs text-accent font-medium">{s.chapter}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0 text-accent hover:text-accent hover:bg-accent/10">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Concept Mastery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Concept Mastery</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {feedback.conceptMastery.map((c: any, i: number) => (
                <motion.div key={c.topic} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.06 }} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{c.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded">{c.trend}</span>
                      <span className={`font-bold ${scoreColor(c.progress)}`}>{c.progress}%</span>
                    </div>
                  </div>
                  <Progress value={c.progress} className={`h-3 rounded-full bg-secondary ${barColor(c.progress)}`} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
