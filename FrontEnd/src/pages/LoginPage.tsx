import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, ShieldCheck, Sparkles, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";


const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Submit & track" },
  { value: "teacher", label: "Faculty", icon: BookOpen, desc: "Grade & review" },
  { value: "admin", label: "Admin", icon: ShieldCheck, desc: "Manage platform" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"login" | "register">("login");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const endpoint = selectedRole === "student" ? "user" : selectedRole;
    const routeAction = tab === "register" ? "signup" : "login";

    const bodyData: any = {
      email: email,
      password: password,
    };

    if (tab === "register") {
      const nameInput = document.getElementById("name") as HTMLInputElement;
      bodyData.userName = nameInput ? nameInput.value : "User";
      bodyData.phoneNumber = "0000000000"; // Dummy because no phone field is on the form right now
      bodyData.role = selectedRole;
      bodyData.institution = "65b9e8432a1f812b1d7d2c3e"; // Dummy valid MongoDB ObjectId for DB constraints
    }

    const res = await fetch(`http://localhost:5000/${endpoint}/${routeAction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();

    if (res.ok) {
      if (routeAction === "signup") {
        alert("Account created successfully! Please sign in.");
        setTab("login");
      } else {
        console.log("Token:", data.token);
        localStorage.setItem("token", data.token);
        login(data.user);
        navigate(`/${selectedRole}`);
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="min-h-screen flex gradient-hero relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/8 rounded-full blur-[120px] animate-glow" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/6 rounded-full blur-[100px] animate-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-violet/5 rounded-full blur-[150px]" />

      {/* Theme toggle — fixed top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle className="text-muted-foreground hover:text-foreground" />
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-16 xl:px-24 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-neon">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">GradeAI</h1>
          </div>
          <h2 className="text-5xl xl:text-6xl font-display font-bold leading-tight mb-6">
            AI-Powered Smart<br />
            <span className="bg-gradient-to-r from-primary via-neon-violet to-accent bg-clip-text text-transparent">
              Evaluation
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            AI-powered academic assessment platform. Instant feedback, detailed rubrics, and NCERT-aligned insights.
          </p>
          <div className="mt-12 flex gap-10">
            {[
              { num: "50K+", label: "Submissions" },
              { num: "200+", label: "Faculty" },
              { num: "94%", label: "Accuracy" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.15 }}>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{s.num}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-neon">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold">GradeAI</h1>
            </div>
            <p className="text-sm text-muted-foreground">AI-Powered Academic Grading</p>
          </div>

          <Card className="glass-card shadow-elevated rounded-2xl overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardContent className="p-8">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Register</TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                    I am a
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const active = selectedRole === role.value;
                      return (
                        <motion.button
                          key={role.value}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedRole(role.value)}
                          className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all text-center ${
                            active
                              ? "border-primary/40 bg-primary/10 text-primary shadow-glow-primary"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/20 hover:bg-primary/5"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{role.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {tab === "register" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Dr. Jane Smith" className="h-11 rounded-xl bg-secondary/30 border-border" />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">College Email</Label>
                  <Input
                    id="email" type="email" placeholder="you@university.edu"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-secondary/30 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {tab === "login" && (
                      <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                    )}
                  </div>
                  <Input
                    id="password" type="password" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-secondary/30 border-border"
                  />
                </div>

                {tab === "register" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                    <Label htmlFor="college">College / University</Label>
                    <Input id="college" placeholder="e.g. GLA University" className="h-11 rounded-xl bg-secondary/30 border-border" />
                  </motion.div>
                )}

                <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow-primary hover-lift h-12 text-base" size="lg">
                  {tab === "login" ? "Sign In" : "Create Account"} as {roles.find(r => r.value === selectedRole)?.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-center text-muted-foreground">
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
