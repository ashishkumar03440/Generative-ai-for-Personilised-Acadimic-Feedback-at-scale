import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, FileText, ArrowRight, Upload, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface RubricItem { id: string; criteria: string; maxScore: number; description: string; }
interface Assignment {
  _id: string;
  title: string;
  course: string;
  description: string;
  rubric: RubricItem[];
  fileName?: string;
  filePath?: string;
  createdAt: string;
}

function AssignmentCard({ a, index, isSubmitted }: { a: Assignment; index: number; isSubmitted: boolean }) {
  const navigate = useNavigate();
  
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }}>
      <div 
        className={`group flex items-center justify-between p-5 rounded-xl glass-card transition-all cursor-pointer ${
          isSubmitted ? "hover:shadow-glow-success/30 border-success/20" : "hover:shadow-glow-primary/30 border-primary/20"
        }`} 
        onClick={() => navigate(isSubmitted ? "/student/feedback" : "/student/submit")}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isSubmitted ? 'bg-success/10' : 'bg-primary/10'}`}>
            {isSubmitted ? <CheckCircle className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-primary" />}
          </div>
          <div className="space-y-1">
            <p className={`font-medium text-sm transition-colors ${isSubmitted ? 'group-hover:text-success' : 'group-hover:text-primary'}`}>{a.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs border ${isSubmitted ? 'bg-success/15 text-success border-success/20' : 'bg-primary/15 text-primary border-primary/20'}`}>
                {a.course}
              </Badge>
              <span className="text-xs text-muted-foreground">Due {new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {a.filePath && (
            <Button size="sm" variant="secondary" className="mr-2" onClick={(e) => {
              e.stopPropagation(); // prevent navigating
              window.open(`http://localhost:5000/assignment/download/${a._id}`, '_blank');
            }}>
              <Download className="h-4 w-4 mr-1"/> Download
            </Button>
          )}
          {isSubmitted ? (
            <Badge className="bg-success/20 text-success border-0 hover:bg-success/30 transition-colors">
              <Sparkles className="h-3 w-3 mr-1" /> View Feedback
            </Badge>
          ) : (
            <Badge className="bg-primary/20 text-primary border-0 hover:bg-primary/30 transition-colors">
              <Upload className="h-3 w-3 mr-1" /> Submit
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AssignmentList() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all assignments
    fetch("http://localhost:5000/assignment/list")
      .then(res => res.json())
      .then(data => {
        if (data.assignments) {
          setAssignments(data.assignments);
        }
      })
      .catch(console.error);

    // Fetch this user's submissions
    fetch("http://localhost:5000/submitted/list")
      .then(res => res.json())
      .then(data => {
        if (data.submissions) {
          setMySubmissions(data.submissions.filter((s: any) => s.studentId === user?.id));
        }
      })
      .catch(console.error);
  }, [user?.id]);

  // Compute pending vs submitted sets
  const submittedAssignmentIds = new Set(mySubmissions.map(s => s.assignmentId?._id || s.assignmentId));
  const pending = assignments.filter(a => !submittedAssignmentIds.has(a._id));
  const submitted = assignments.filter(a => submittedAssignmentIds.has(a._id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Assignments</h1>
              <p className="text-sm text-muted-foreground">{pending.length} active assignments taking precedence</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="pending">
          <TabsList className="bg-secondary/50 p-1 mb-2">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Clock className="h-3.5 w-3.5 mr-1.5" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-success/20 data-[state=active]:text-success">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Submitted ({submitted.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.length === 0 ? (
               <div className="text-center p-12 text-muted-foreground text-sm glass-card rounded-xl">
                 No pending assignments. Great job!
               </div>
            ) : (
              pending.map((a, i) => <AssignmentCard key={a._id} a={a} index={i} isSubmitted={false} />)
            )}
          </TabsContent>
          
          <TabsContent value="submitted" className="space-y-3 mt-4">
            {submitted.length === 0 ? (
               <div className="text-center p-12 text-muted-foreground text-sm glass-card rounded-xl">
                 You haven't submitted any assignments yet.
               </div>
            ) : (
              submitted.map((a, i) => <AssignmentCard key={a._id} a={a} index={i} isSubmitted={true} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
