import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const logs = [
  { time: "Mar 10, 14:32", user: "Dr. Sarah Chen", action: "Grade Override", detail: "Changed score from 78 to 85 for submission #4521", category: "grading" },
  { time: "Mar 10, 12:15", user: "Jordan Lee", action: "Role Change", detail: "Promoted user emma@school.edu to teacher role", category: "access" },
  { time: "Mar 10, 09:45", user: "System", action: "AI Processing", detail: "Batch grading completed: 45 submissions processed", category: "system" },
  { time: "Mar 9, 16:20", user: "Prof. James Liu", action: "Assignment Created", detail: "New assignment: Research Paper - AI Ethics", category: "content" },
  { time: "Mar 9, 14:10", user: "Jordan Lee", action: "User Deactivated", detail: "Deactivated user john.doe@school.edu", category: "access" },
  { time: "Mar 9, 11:30", user: "System", action: "Backup", detail: "Daily backup completed successfully", category: "system" },
  { time: "Mar 8, 15:45", user: "Dr. Sarah Chen", action: "Rubric Update", detail: "Updated rubric for Climate Change Essay", category: "content" },
  { time: "Mar 8, 10:00", user: "System", action: "Security Scan", detail: "Automated security scan: 0 issues found", category: "system" },
];

const categoryColors: Record<string, string> = {
  grading: "bg-primary/15 text-primary border-primary/20",
  access: "bg-warning/15 text-warning border-warning/20",
  system: "bg-secondary text-muted-foreground",
  content: "bg-accent/15 text-accent border-accent/20",
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = logs.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || l.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Audit Log</h1>
              <p className="text-sm text-muted-foreground">Compliance & activity tracking</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 rounded-xl h-11 bg-secondary/30 border-border" />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px] rounded-xl h-11 bg-secondary/30 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="grading">Grading</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filtered.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors group neon-border">
                  <div className="shrink-0 text-xs text-muted-foreground w-[120px] pt-0.5 font-medium font-mono">{log.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{log.action}</span>
                      <Badge variant="outline" className={`capitalize text-xs rounded-lg border ${categoryColors[log.category] || ""}`}>{log.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-60">by {log.user}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
