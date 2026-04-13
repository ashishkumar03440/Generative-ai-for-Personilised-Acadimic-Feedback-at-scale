import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, XCircle, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const models = [
  { name: "Gemini (Grading)", usage: 78, latency: "1.2s" },
  { name: "Embeddings", usage: 45, latency: "0.3s" },
  { name: "Content Filter", usage: 92, latency: "0.1s" },
];

const errorLogs = [
  { time: "14:32", model: "Gemini", type: "Timeout", message: "Request exceeded 30s limit", severity: "warning" },
  { time: "12:15", model: "Gemini", type: "Rate Limit", message: "API rate limit reached, retrying", severity: "warning" },
  { time: "09:45", model: "Embeddings", type: "Error", message: "Failed to generate embedding for doc #4521", severity: "error" },
  { time: "08:20", model: "Gemini", type: "Success", message: "Batch processing completed", severity: "success" },
];

const barColor = (v: number) => v >= 90 ? "[&>div]:bg-destructive" : v >= 70 ? "[&>div]:bg-primary" : "[&>div]:bg-success";

export default function AIMonitor() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/admin/stats")
      .then(res => res.json())
      .then(data => setPendingCount(data.pendingCount ?? 0))
      .catch(console.error);
  }, []);

  const metrics = [
    { label: "Uptime", value: "99.97%", icon: Activity, status: "healthy", glow: "shadow-glow-success" },
    { label: "Avg Response", value: "1.2s", icon: CheckCircle, status: "healthy", glow: "shadow-glow-primary" },
    { label: "Error Rate", value: "0.3%", icon: AlertTriangle, status: "warning", glow: "shadow-glow-accent" },
    { label: "Queue Size", value: pendingCount !== null ? pendingCount.toString() : "…", icon: Activity, status: pendingCount && pendingCount > 10 ? "warning" : "healthy", glow: "shadow-glow-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">AI Monitor</h1>
              <p className="text-sm text-muted-foreground">Real-time AI system health</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08 }}>
              <Card className={`hover-lift glass-card ${m.glow}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <m.icon className={`h-5 w-5 ${m.status === "healthy" ? "text-success" : "text-warning"}`} />
                    </div>
                    <Badge variant={m.status === "healthy" ? "default" : "destructive"}
                      className={`text-xs capitalize rounded-lg ${m.status === "healthy" ? "gradient-success text-primary-foreground border-0" : ""}`}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold font-display">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Model Performance</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {models.map((model, i) => (
                <motion.div key={model.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-muted-foreground">{model.usage}% capacity · {model.latency}</span>
                  </div>
                  <Progress value={model.usage} className={`h-3 rounded-full bg-secondary ${barColor(model.usage)}`} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Recent Logs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {errorLogs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.06 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors neon-border">
                  {log.severity === "error" ? <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" /> :
                   log.severity === "warning" ? <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" /> :
                   <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{log.type}</span>
                      <Badge variant="outline" className="text-xs rounded-lg border-border">{log.model}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{log.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.message}</p>
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
