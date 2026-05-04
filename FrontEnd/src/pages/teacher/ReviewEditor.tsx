import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Sparkles, Send, Download, FileText, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE, authFetch } from "@/lib/api";

const DEFAULT_RUBRIC = [
  { criteria: "Thesis & Argument", score: 85, suggestion: "Evaluate the clarity and strength of the main argument" },
  { criteria: "Evidence & Analysis", score: 85, suggestion: "Assess how well evidence is used to support claims" },
  { criteria: "Organization", score: 85, suggestion: "Consider the logical flow and structure" },
  { criteria: "Grammar & Style", score: 85, suggestion: "Review language quality and writing conventions" },
];

const scoreColor = (v: number) =>
  v >= 90 ? "text-success" : v >= 75 ? "text-primary" : "text-warning";

export default function ReviewEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // All pending submissions (for navigation)
  const [allPending, setAllPending] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [scores, setScores] = useState<number[]>(DEFAULT_RUBRIC.map(r => r.score));
  const [rubric, setRubric] = useState(DEFAULT_RUBRIC);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load all pending submissions for navigation
  const loadAllPending = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/submitted/list`);
      const data = await res.json();
      const pending: any[] = (data.submissions || []).filter(
        (s: any) => s.status !== "reviewed" && s.status !== "rejected"
      );
      setAllPending(pending);
      return pending;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, []);

  // Load a specific submission and reset form
  const loadSubmission = useCallback(async (sub: any) => {
    setLoading(true);
    setComment("");
    try {
      // Fetch full populated submission
      const res = await authFetch(`${API_BASE}/submitted/${sub._id}`);
      const data = await res.json();
      const full = data.submission || sub;
      setSubmission(full);

      // Build rubric from assignment rubric if available, else default
      const assignmentRubric: any[] = full.assignmentId?.rubric;
      if (assignmentRubric && assignmentRubric.length > 0) {
        const newRubric = assignmentRubric.map((r: any) => ({
          criteria: r.criteria || r.name || "Criteria",
          score: r.score || 85,
          suggestion: r.suggestion || r.description || "Evaluate performance on this criteria",
        }));
        setRubric(newRubric);
        setScores(newRubric.map(r => r.score));
      } else {
        setRubric(DEFAULT_RUBRIC);
        setScores(DEFAULT_RUBRIC.map(r => r.score));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load submission details.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initLoad = async () => {
      const pending = await loadAllPending();
      if (pending.length === 0) {
        setLoading(false);
        setSubmission(null);
        return;
      }

      const idFromUrl = searchParams.get("id");
      let startIdx = 0;
      if (idFromUrl) {
        const idx = pending.findIndex((s: any) => s._id === idFromUrl);
        if (idx >= 0) startIdx = idx;
      }

      setCurrentIndex(startIdx);
      await loadSubmission(pending[startIdx]);
    };
    initLoad();
  }, []);

  const goTo = async (idx: number) => {
    if (idx < 0 || idx >= allPending.length) return;
    setCurrentIndex(idx);
    navigate(`/teacher/review?id=${allPending[idx]._id}`, { replace: true });
    await loadSubmission(allPending[idx]);
  };

  const handleReject = async () => {
    if (!submission) return;
    try {
      const res = await authFetch(`${API_BASE}/submitted/${submission._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) {
        toast.info("Submission rejected and sent back to student.");
        const pending = await loadAllPending();
        if (pending.length > 0) {
          const nextIdx = Math.min(currentIndex, pending.length - 1);
          setCurrentIndex(nextIdx);
          await loadSubmission(pending[nextIdx]);
        } else {
          setSubmission(null);
        }
      } else {
        toast.error("Failed to reject submission.");
      }
    } catch (e) {
      toast.error("Error rejecting submission.");
    }
  };

  const handleApprove = async () => {
    if (!submission) {
      toast.error("No submission loaded.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please add a faculty comment before submitting.");
      return;
    }

    setSubmitting(true);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const assignmentId = submission.assignmentId?._id || submission.assignmentId;

    const payload = {
      studentId: submission.studentId,
      assignmentId,
      teacherId: user?.id,
      facultyComment: comment,
      score: avgScore,
      maxScore: 100,
      strengths: ["Good engagement with the topic", "Well-structured response"],
      weaknesses: avgScore < 80 ? ["Could improve depth of analysis", "Review key concepts"] : ["Minor improvements possible"],
      suggestions: [
        { text: avgScore < 80 ? "Review course materials and revisit this topic" : "Continue the strong work", chapter: "Chapter Review", link: "#" }
      ],
      conceptMastery: [{ topic: submission.assignmentId?.title || "Assignment Topic", progress: avgScore, trend: "+0%" }],
      aiComment: `This submission received an average score of ${avgScore}%. ${avgScore >= 85 ? "Excellent work demonstrating strong understanding." : avgScore >= 70 ? "Good effort with room for improvement." : "Significant improvement is needed in key areas."}`,
      rubric: rubric.map((item, i) => ({
        criteria: item.criteria,
        score: scores[i],
        max: 100,
        suggestion: item.suggestion,
      })),
    };

    try {
      const res = await authFetch(`${API_BASE}/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("✅ Review submitted successfully!");
        const pending = await loadAllPending();
        if (pending.length > 0) {
          const nextIdx = Math.min(currentIndex, pending.length - 1);
          setCurrentIndex(nextIdx);
          await loadSubmission(pending[nextIdx]);
        } else {
          setSubmission(null);
        }
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to submit feedback.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const displayStudent = submission?.studentName || "—";
  const displayAssignment = submission?.assignmentId?.title || "—";
  const fileDownloadUrl = submission ? `${API_BASE}/submitted/download/${submission._id}` : "#";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow-primary">
              {displayStudent.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Review Submission</h1>
              <p className="text-sm text-muted-foreground">
                {displayStudent} · {displayAssignment}
                {allPending.length > 0 && (
                  <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full">
                    {currentIndex + 1} / {allPending.length} pending
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl neon-border"
              disabled={currentIndex <= 0 || allPending.length === 0}
              onClick={() => goTo(currentIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl neon-border"
              disabled={currentIndex >= allPending.length - 1 || allPending.length === 0}
              onClick={() => goTo(currentIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24 glass-card rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading submission…</span>
          </div>
        )}

        {/* All Caught Up */}
        {!loading && !submission && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass-card rounded-xl space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="text-lg font-semibold font-display">All caught up!</p>
            <p className="text-sm text-muted-foreground">No active submissions waiting for review.</p>
            <Button onClick={() => navigate("/teacher")} variant="outline" className="rounded-xl mt-2">Back to Dashboard</Button>
          </motion.div>
        )}

        {/* Main Review UI */}
        <AnimatePresence mode="wait">
          {!loading && submission && (
            <motion.div key={submission._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Submission Info */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="glass-card h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-display">Student Submission</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg neon-border gap-1.5"
                          onClick={() => window.open(fileDownloadUrl, "_blank")}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download File
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Submission metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/20 border border-border/50">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Submitted File</p>
                            <p className="text-sm font-medium truncate">{submission.fileName}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-0.5">Student</p>
                            <p className="font-medium truncate">{submission.studentName}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-0.5">Assignment</p>
                            <p className="font-medium truncate">{displayAssignment}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-0.5">Course</p>
                            <p className="font-medium truncate">{submission.assignmentId?.course || "—"}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                            <p className="font-medium">{new Date(submission.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assignment description */}
                      {submission.assignmentId?.description && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Assignment Brief</p>
                          <div className="text-sm text-foreground/80 leading-relaxed p-4 rounded-xl bg-secondary/20 border border-border/50 max-h-64 overflow-auto whitespace-pre-wrap">
                            {submission.assignmentId.description}
                          </div>
                        </div>
                      )}

                      {/* AI Confidence */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <span className="text-sm font-medium">AI Confidence Score</span>
                        <span className={`text-sm font-bold ${scoreColor(submission.confidence)}`}>
                          {submission.confidence}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right: Scoring + Comment */}
                <div className="space-y-4">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="glass-card overflow-hidden">
                      <div className="h-1 gradient-primary" />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2 font-display">
                            <Sparkles className="h-4 w-4 text-primary" /> Rubric Scoring
                          </CardTitle>
                          <div className={`text-lg font-bold font-display ${scoreColor(avg)} bg-primary/10 px-3 py-1 rounded-lg`}>
                            {avg}% avg
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {rubric.map((item, idx) => (
                          <motion.div
                            key={item.criteria}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.07 }}
                            className="space-y-2 p-3 rounded-xl hover:bg-secondary/20 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.criteria}</span>
                              <span className={`text-sm font-bold ${scoreColor(scores[idx])}`}>{scores[idx]}%</span>
                            </div>
                            <Slider
                              value={[scores[idx]]}
                              onValueChange={(v) => {
                                const next = [...scores];
                                next[idx] = v[0];
                                setScores(next);
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="py-1"
                            />
                            <p className="text-xs text-muted-foreground italic">{item.suggestion}</p>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-display">Faculty Comment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add your personalized feedback for this student…"
                          rows={4}
                          className="rounded-xl resize-none bg-secondary/30 border-border"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="rounded-xl h-14 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-5 w-5" /> Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={submitting}
                      className="gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow-primary hover-lift h-14 text-base"
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-5 w-5" />
                      )}
                      Approve & Submit
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
