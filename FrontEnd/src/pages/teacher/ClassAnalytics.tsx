import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Users, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const topicData = [
  { topic: "Thesis", avg: 85 }, { topic: "Evidence", avg: 79 }, { topic: "Organization", avg: 82 },
  { topic: "Grammar", avg: 88 }, { topic: "Citations", avg: 71 },
];

const classDistribution = [
  { range: "90-100", count: 8 }, { range: "80-89", count: 14 }, { range: "70-79", count: 6 },
  { range: "60-69", count: 3 }, { range: "<60", count: 1 },
];

const radarData = [
  { skill: "Analysis", A: 88, B: 76 }, { skill: "Writing", A: 85, B: 82 },
  { skill: "Research", A: 90, B: 70 }, { skill: "Critical Thinking", A: 82, B: 78 },
  { skill: "Creativity", A: 78, B: 85 },
];

const summaryStats = [
  { label: "Class Average", value: "82%", sub: "32 students", icon: Users, glow: "shadow-glow-primary" },
  { label: "Submissions", value: "156", sub: "This semester", icon: FileText, glow: "shadow-glow-accent" },
  { label: "AI Accuracy", value: "94%", sub: "Teacher agreement", icon: Sparkles, glow: "shadow-glow-success" },
];

const chartStyle = { borderRadius: 12, border: "1px solid hsl(240, 10%, 14%)", background: "hsl(240, 12%, 8%)", color: "hsl(240, 5%, 92%)" };

export default function ClassAnalytics() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Class Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive performance insights</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card overflow-hidden">
              <div className="h-1 gradient-primary" />
              <CardHeader className="pb-2"><CardTitle className="text-base font-display">Score Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="count" fill="hsl(250, 85%, 65%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card className="glass-card overflow-hidden">
              <div className="h-1 gradient-accent" />
              <CardHeader className="pb-2"><CardTitle className="text-base font-display">Skill Comparison (Sections A vs B)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(240, 10%, 14%)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(240, 5%, 50%)" }} />
                    <Radar name="Section A" dataKey="A" stroke="hsl(250, 85%, 65%)" fill="hsl(250, 85%, 65%)" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Section B" dataKey="B" stroke="hsl(200, 100%, 55%)" fill="hsl(200, 100%, 55%)" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip contentStyle={chartStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card overflow-hidden">
            <div className="h-1 gradient-warning" />
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Topic Performance Heatmap</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" />
                  <YAxis dataKey="topic" type="category" tick={{ fontSize: 12, fill: "hsl(240, 5%, 50%)" }} stroke="hsl(240, 10%, 14%)" width={90} />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar dataKey="avg" fill="hsl(200, 100%, 55%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
