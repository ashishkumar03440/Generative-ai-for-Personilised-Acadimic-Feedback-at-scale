import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Brain, BarChart3, ShieldCheck, BookOpen, Users, ArrowRight, CheckCircle2, Sparkles, Zap, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";


const features = [
  { icon: Brain, title: "AI-Powered Grading", desc: "Instant, accurate feedback using advanced AI that understands rubrics and NCERT standards." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Detailed dashboards with topic heatmaps and concept mastery trackers." },
  { icon: BookOpen, title: "Smart Feedback", desc: "Actionable suggestions linked to NCERT chapters with improvement paths." },
  { icon: Users, title: "Faculty Tools", desc: "Bulk review queues, side-by-side editors, and class-wide analytics." },
];

const stats = [
  { value: "50K+", label: "Submissions Graded" },
  { value: "200+", label: "Faculty Members" },
  { value: "94%", label: "Grading Accuracy" },
  { value: "< 2 min", label: "Avg. Turnaround" },
];

const benefits = [
  "NCERT-aligned feedback & chapter references",
  "Supports PDF, images, code & text submissions",
  "Plagiarism detection built-in",
  "Role-based access for students, faculty & admins",
  "Institutional compliance & audit logs",
  "Bulk CSV user import for universities",
];

const testimonials = [
  { name: "Dr. Priya Sharma", role: "HOD, Computer Science", text: "GradeAI has transformed how we handle assessments. The AI feedback is remarkably accurate and saves us hours every week.", avatar: "PS" },
  { name: "Rahul Verma", role: "B.Tech Student", text: "The instant feedback with NCERT references helped me understand exactly where I need to improve. My scores have gone up significantly.", avatar: "RV" },
  { name: "Prof. Anita Desai", role: "Dean of Academics", text: "The analytics dashboard gives us unprecedented visibility into student performance trends across departments.", avatar: "AD" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white" : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-2xl ${
        isDark ? "bg-black/30 border-white/5" : "bg-white/70 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg ${
              isDark ? "from-white via-emerald-100 to-cyan-100" : "from-emerald-600 via-cyan-600 to-blue-600"
            }`}>GradeAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle
              variant="ghost"
              className={isDark ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}
            />
            <Button asChild variant="ghost" className={isDark ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900"}>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60">
              <Link to="/login?tab=register">Get Started <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </nav>

{/* Hero */}
<section className="relative overflow-hidden py-24 md:py-28">
  {/* Background image */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
    style={{
      backgroundImage: "url('/assets/download.jpg')", // path from /public
    }}
  />

  {/* Gradient overlay on top of image */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/70 to-cyan-900/40" />

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-gray-300 mb-8 shadow-xl">
        <Sparkles className="h-4 w-4 text-emerald-400" /> AI-Powered Academic Assessment Platform
      </div>

      <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
        AI-Powered Smart
        <br />
        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
          Assignment Evaluation
        </span>
      </h1>

      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Instant feedback, detailed analytics, and NCERT-aligned insights. Built for colleges across India.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button
          size="lg"
          asChild
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg px-10 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 backdrop-blur-sm"
        >
          <Link to="/login?tab=register">
            Get Started  <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          asChild
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white font-semibold text-lg px-10 backdrop-blur-sm"
        >
          <Link to="/login">Sign In to Dashboard</Link>
        </Button>
      </div>
    </motion.div>

    {/* Stats inside hero */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`backdrop-blur-xl border rounded-2xl p-6 text-center shadow-2xl transition-all hover:scale-[1.02] ${
              isDark
                ? "bg-black/40 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                : "bg-white/80 border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50/50"
            }`}
          >
            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              {s.value}
            </p>
            <p className={`text-xs md:text-sm mt-2 font-medium tracking-wide ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
</section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-xl ${
            isDark ? "from-white to-gray-300" : "from-slate-800 to-slate-600"
          }`}>Everything You Need</h2>
          <p className={`text-xl max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-slate-500"}`}>Complete ecosystem for AI-assisted academic assessment.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className={`h-full backdrop-blur-xl transition-all shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 group ${
                isDark ? "bg-black/40 border-white/10 hover:border-emerald-500/40 hover:bg-black/60" : "bg-white border-slate-200 hover:border-emerald-400/40 hover:bg-emerald-50/30"
              }`}>
                <CardContent className="p-8">
                  <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/50 group-hover:shadow-emerald-500/70 group-hover:scale-110 transition-all duration-300 mx-auto">
                    <f.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className={`font-bold text-2xl mb-4 drop-shadow-lg ${isDark ? "text-white" : "text-slate-800"}`}>{f.title}</h3>
                  <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-slate-500"}`}>{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={`border-y backdrop-blur-xl ${
        isDark ? "border-white/5 bg-black/10" : "border-slate-200 bg-slate-50/70"
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-xl ${
              isDark ? "from-white to-gray-300" : "from-slate-800 to-slate-600"
            }`}>How It Works</h2>
            <p className={`text-xl ${isDark ? "text-gray-400" : "text-slate-500"}`}>Three simple steps from submission to insight</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Upload Assignment", desc: "Students submit PDFs, images, code, or text via drag-and-drop." },
              { step: "02", title: "AI Grades & Analyzes", desc: "AI evaluates against rubrics, checks plagiarism, and generates feedback." },
              { step: "03", title: "Review & Improve", desc: "Faculty reviews AI feedback, students get NCERT-linked suggestions." },
            ].map((item, i) => (
              <motion.div key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center group">
                <div className="text-6xl font-black bg-gradient-to-br from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-6 group-hover:scale-110 transition-transform drop-shadow-2xl">{item.step}</div>
                <h3 className={`font-bold text-2xl mb-4 drop-shadow-lg ${isDark ? "text-white" : "text-slate-800"}`}>{item.title}</h3>
                <p className={`leading-relaxed text-lg ${isDark ? "text-gray-400" : "text-slate-500"}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-xl ${
              isDark ? "from-white to-gray-300" : "from-slate-800 to-slate-600"
            }`}>Built for Indian Universities</h2>
            <p className={`text-xl mb-8 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Designed for the Indian academic ecosystem.</p>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-4 text-lg">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 flex-shrink-0 mt-1 shadow-lg" />
                  <span className={isDark ? "text-gray-300" : "text-slate-600"}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: GraduationCap, label: "Students", desc: "Submit & track" },
              { icon: BookOpen, label: "Faculty", desc: "Review & grade" },
              { icon: ShieldCheck, label: "Admins", desc: "Monitor & manage" },
              { icon: Brain, label: "AI Engine", desc: "94% accuracy" },
            ].map((r) => (
              <Card key={r.label} className={`backdrop-blur-xl transition-all shadow-xl ${
                isDark ? "bg-black/40 border-white/10 hover:border-emerald-500/40 hover:bg-black/60" : "bg-white border-slate-200 hover:border-emerald-400/40"
              }`}>
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/50">
                    <r.icon className="h-8 w-8 text-white" />
                  </div>
                  <p className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>{r.label}</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className={`absolute inset-0 backdrop-blur-sm ${
          isDark ? "bg-gradient-to-br from-emerald-900/30 via-transparent to-cyan-900/30" : "bg-gradient-to-br from-emerald-100/60 via-transparent to-cyan-100/60"
        }`} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-2xl ${
            isDark ? "from-white to-gray-300" : "from-slate-800 to-slate-600"
          }`}>
            Ready to Transform Grading?
          </h2>
          <p className={`text-xl mb-12 ${isDark ? "text-gray-400" : "text-slate-500"}`}>Join 200+ faculty members already using GradeAI.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xl px-12 shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70">
              <Link to="/login?tab=register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className={`font-bold text-xl px-12 ${
              isDark ? "border-white/20 text-gray-300 hover:bg-white/10 hover:text-white" : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`backdrop-blur-xl border-t shadow-2xl ${
        isDark ? "bg-black/50 border-white/5" : "bg-white/80 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-12 text-sm">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg ${
                isDark ? "from-white to-gray-300" : "from-emerald-600 to-cyan-600"
              }`}>GradeAI</span>
            </div>
            <p className={`leading-relaxed ${isDark ? "text-gray-500" : "text-slate-400"}`}>
              AI-powered academic evaluation platform built for modern universities.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Analytics", "Pricing"] },
            { title: "Company", links: ["About", "Careers", "Contact"] },
            { title: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className={`font-bold mb-6 ${isDark ? "text-gray-300" : "text-slate-700"}`}>{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}><Link to="/" className={`hover:underline transition-all ${
                    isDark ? "text-gray-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  }`}>{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`border-t pt-8 mt-12 text-center text-xs ${
          isDark ? "border-white/5 text-gray-500" : "border-slate-200 text-slate-400"
        }`}>
          © 2026 GradeAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
