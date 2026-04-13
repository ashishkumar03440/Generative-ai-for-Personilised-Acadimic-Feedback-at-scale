import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, GripVertical, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RubricItem { id: string; criteria: string; maxScore: number; description: string; }

export default function AssignmentCreator() {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rubric, setRubric] = useState<RubricItem[]>([
    { id: "1", criteria: "Content & Analysis", maxScore: 30, description: "Depth of analysis and understanding" },
    { id: "2", criteria: "Organization", maxScore: 25, description: "Logical flow and structure" },
    { id: "3", criteria: "Evidence", maxScore: 25, description: "Use of supporting evidence" },
    { id: "4", criteria: "Grammar & Style", maxScore: 20, description: "Writing quality and mechanics" },
  ]);

  const addCriteria = () => setRubric(prev => [...prev, { id: Date.now().toString(), criteria: "", maxScore: 10, description: "" }]);
  const removeCriteria = (id: string) => setRubric(prev => prev.filter(r => r.id !== id));
  const updateCriteria = (id: string, field: keyof RubricItem, value: string | number) => setRubric(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  const handleCreate = async () => {
    if (!title || !course || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("course", course);
      formData.append("description", description);
      formData.append("rubric", JSON.stringify(rubric));
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("http://localhost:5000/assignment/create", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Assignment created successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Failed to create assignment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    }
  };
  const totalPoints = rubric.reduce((sum, r) => sum + r.maxScore, 0);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Create Assignment</h1>
              <p className="text-sm text-muted-foreground">Design a new assignment with custom rubric</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base font-display">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="h-11 rounded-xl bg-secondary/30 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-border"><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="env101">ENV 101</SelectItem>
                      <SelectItem value="chem201">CHEM 201</SelectItem>
                      <SelectItem value="cs301">CS 301</SelectItem>
                      <SelectItem value="eng102">ENG 102</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Assignment instructions..." rows={4} className="rounded-xl resize-none bg-secondary/30 border-border" />
              </div>
              <div className="space-y-2">
                <Label>Attach File (optional)</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="h-11 rounded-xl bg-secondary/30 border-border file:text-primary file:font-semibold file:border-0 file:bg-primary/10 file:mr-4 file:px-4 file:py-2 file:rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-display">Rubric</CardTitle>
                  <CardDescription>Total: <span className="font-bold text-primary">{totalPoints}</span> points</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addCriteria} className="rounded-xl neon-border">
                  <Plus className="h-4 w-4 mr-1" /> Add Criteria
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {rubric.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 neon-border hover:bg-secondary/30 transition-colors group">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0 cursor-grab opacity-30 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 grid gap-3">
                      <div className="grid grid-cols-[1fr_80px] gap-3">
                        <Input value={item.criteria} onChange={(e) => updateCriteria(item.id, "criteria", e.target.value)} placeholder="Criteria name" className="text-sm rounded-lg bg-secondary/30 border-border" />
                        <Input type="number" value={item.maxScore} onChange={(e) => updateCriteria(item.id, "maxScore", parseInt(e.target.value) || 0)} className="text-sm rounded-lg font-bold text-center bg-secondary/30 border-border" />
                      </div>
                      <Input value={item.description} onChange={(e) => updateCriteria(item.id, "description", e.target.value)} placeholder="Description" className="text-sm text-muted-foreground rounded-lg bg-secondary/30 border-border" />
                    </div>
                    <button onClick={() => removeCriteria(item.id)} className="text-muted-foreground hover:text-destructive mt-1 p-1 rounded-lg hover:bg-destructive/10 transition-all opacity-30 group-hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={handleCreate} className="w-full gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow-primary hover-lift h-14 text-base" size="lg">
            <Sparkles className="h-5 w-5 mr-2" /> Create Assignment
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
