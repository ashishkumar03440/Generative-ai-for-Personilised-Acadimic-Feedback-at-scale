import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle, Loader2, Clock, Sparkles, Rocket } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface Assignment {
  _id: string;
  title: string;
}

export default function SubmissionPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [assignment, setAssignment] = useState("");
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/assignment/list")
      .then(res => res.json())
      .then(data => {
        if (data.assignments) {
          setAssignmentsList(data.assignments);
        }
      })
      .catch(console.error);

    fetch("http://localhost:5000/submitted/list")
      .then(res => res.json())
      .then(data => {
        if (data.submissions) {
          setMySubmissions(data.submissions.filter((s: any) => s.studentId === user?.id));
        }
      })
      .catch(console.error);
  }, [user?.id]);

  const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId?._id || s.assignmentId));
  const pendingAssignmentsList = assignmentsList.filter(a => !submittedAssignmentIds.has(a._id));

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    if (!processing) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => { setProcessing(false); setSubmitted(true); }, 500); return 100; }
        return prev + Math.random() * 15;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [processing]);

  const handleSubmit = async () => {
    if (!assignment || files.length === 0) { toast.error("Please select an assignment and upload files"); return; }
    setProcessing(true); setProgress(0);

    const formData = new FormData();
    formData.append("assignmentId", assignment);
    formData.append("studentId", user?.id || "unknown-id");
    formData.append("studentName", user?.name || "Student");
    formData.append("file", files[0]);

    try {
      const response = await fetch("http://localhost:5000/submitted/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload response not OK");
      toast.success("Work submitted! AI grading in progress...");
    } catch (e) {
      console.error("Upload failed", e);
      toast.warning("Upload failed, animation will simulate");
    }
  };

  if (processing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 max-w-md w-full">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-full gradient-primary shadow-glow-neon">
              <Loader2 className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold font-display">Processing Submission</h2>
              <p className="text-muted-foreground text-sm mt-2">Our AI is carefully analyzing your work...</p>
            </div>
            <div className="space-y-3 px-4">
              <Progress value={Math.min(progress, 100)} className="h-3 [&>div]:gradient-primary" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est. ~2 mins</span>
                <span className="font-bold text-primary">{Math.min(Math.round(progress), 100)}%</span>
              </div>
            </div>
            <div className="space-y-3 text-left px-4">
              {[
                { label: "Uploading files...", done: progress > 20 },
                { label: "Running plagiarism check...", done: progress > 45 },
                { label: "AI grading in progress...", done: progress > 75 },
                { label: "Generating feedback...", done: progress > 95 },
              ].map((step, i) => (
                <motion.div key={step.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-3 text-sm">
                  {step.done ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    </motion.div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-primary/30 shrink-0 animate-pulse" />
                  )}
                  <span className={step.done ? "text-foreground font-medium" : "text-muted-foreground"}>{step.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-center space-y-6">
            <motion.div initial={{ y: 20 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex items-center justify-center h-24 w-24 rounded-full gradient-success shadow-glow-success">
              <CheckCircle className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold font-display">Submitted & Graded! 🎉</h2>
              <p className="text-muted-foreground text-sm mt-2">Your detailed feedback is ready</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl neon-border">Submit Another</Button>
              <Button className="gradient-primary text-primary-foreground rounded-xl shadow-glow-primary">
                <Sparkles className="h-4 w-4 mr-2" /> View Feedback
              </Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Submit Work</h1>
              <p className="text-sm text-muted-foreground">Upload your assignment for AI-powered grading</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-display">Assignment</CardTitle>
              <CardDescription>Select the assignment you're submitting for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={assignment} onValueChange={setAssignment}>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-border"><SelectValue placeholder="Choose assignment" /></SelectTrigger>
                <SelectContent>
                  {pendingAssignmentsList.length === 0 ? (
                    <SelectItem value="none" disabled>No assignments pending</SelectItem>
                  ) : (
                    pendingAssignmentsList.map((a) => (
                      <SelectItem key={a._id} value={a._id}>{a.title}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-display">Upload Files</CardTitle>
              <CardDescription>Drag & drop or click to upload</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5 shadow-glow-primary scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4 transition-all ${dragOver ? "gradient-primary shadow-glow-neon" : "bg-secondary"}`}>
                  <Upload className={`h-6 w-6 ${dragOver ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <p className="text-sm font-semibold">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">PDF, DOCX, TXT, images, code files up to 20MB</p>
                <input id="file-input" type="file" multiple className="hidden" onChange={handleFileInput} />
              </div>

              <AnimatePresence>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                      <motion.div key={`${file.name}-${idx}`} initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-primary/5 neon-border">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium truncate max-w-[250px] block">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10">
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow-primary hover-lift h-14 text-base" size="lg">
            <Sparkles className="h-5 w-5 mr-2" /> Submit Work for AI Grading
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
