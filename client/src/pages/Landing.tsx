import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Upload, Brain, BarChart3, Users,
  ArrowRight, ChevronRight, Menu, X, Moon, Sun, Zap, Search, Layers,
  Shield, Star, TrendingUp, Award, Globe, Code2, Link2, Mail,
  Play, Check, ChevronDown, FileText, Target, Rocket,
} from 'lucide-react';

/* ─── SCROLL REVEAL HOOK ─── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); o.disconnect(); } },
      { threshold }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── ANIMATED COUNTER HOOK ─── */
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return count;
}

/* ─── TYPING EFFECT HOOK ─── */
function useTypingEffect(words: string[], typeSpeed = 100, deleteSpeed = 60, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? deleteSpeed : typeSpeed);
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseTime]);

  return text;
}

/* ─── DATA ─── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

const FEATURES = [
  { icon: Upload, title: 'Bulk Upload', desc: 'Drop up to 50 PDFs at once. Our engine processes each one in under 2 seconds with intelligent OCR.', color: 'from-blue-500 to-cyan-500' },
  { icon: Brain, title: 'AI Extraction', desc: 'Deep NLP extracts skills, experience, education, and contact data with 99% accuracy using transformer models.', color: 'from-violet-500 to-purple-500' },
  { icon: Search, title: 'Smart Search', desc: 'Filter 10,000+ candidates in milliseconds by skill, location, experience level, or AI match score.', color: 'from-emerald-500 to-teal-500' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time hiring pipeline stats, conversion funnels, and team performance metrics at a glance.', color: 'from-amber-500 to-orange-500' },
  { icon: Layers, title: 'Rank & Compare', desc: 'AI match scoring against job descriptions with side-by-side candidate comparison tools.', color: 'from-rose-500 to-pink-500' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant infrastructure with end-to-end encryption and role-based access controls.', color: 'from-indigo-500 to-blue-500' },
];

const STEPS = [
  { icon: Upload, title: 'Upload Resumes', desc: 'Drag and drop PDF resumes. We accept all standard formats and process them instantly.', num: '01' },
  { icon: Brain, title: 'AI Parses Everything', desc: 'Skills, experience, education, certifications — extracted and structured automatically.', num: '02' },
  { icon: Target, title: 'Match & Rank', desc: 'AI scores candidates against your job descriptions and ranks them by fit.', num: '03' },
  { icon: Users, title: 'Review & Hire', desc: 'Browse ranked candidates, shortlist top matches, collaborate with your team, and hire the best.', num: '04' },
];

const TESTIMONIALS = [
  {
    quote: "ResumeScreen cut our screening time by 80%. We went from spending 3 days reviewing applications to making shortlists in under an hour.",
    name: 'Sarah Mitchell',
    role: 'Head of Talent, TechCorp',
    avatar: 'SM',
    rating: 5,
  },
  {
    quote: "The AI parsing accuracy is incredible. It catches skills and qualifications that our team would sometimes miss during manual review.",
    name: 'James Rodriguez',
    role: 'VP Engineering, StartupXYZ',
    avatar: 'JR',
    rating: 5,
  },
  {
    quote: "We process over 5,000 resumes monthly now without breaking a sweat. The ROI has been phenomenal for our recruiting operations.",
    name: 'Emily Chen',
    role: 'Director of HR, GlobalScale',
    avatar: 'EC',
    rating: 5,
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for trying out AI-powered screening',
    features: ['50 resume uploads/month', 'Basic AI parsing', 'Email support', 'Single user', '7-day data retention'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    desc: 'For growing teams and active recruiters',
    features: ['Unlimited uploads', 'Advanced AI ranking', 'Job description matching', 'Team collaboration (5 users)', 'Priority support', 'Analytics dashboard', '90-day data retention'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations with custom needs',
    features: ['Everything in Professional', 'Unlimited team members', 'Custom integrations (ATS)', 'SSO & SAML', 'Dedicated account manager', 'SLA guarantee', 'Unlimited data retention'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const HERO_WORDS = ['in minutes', 'with AI', 'effortlessly', 'at scale'];

const STATS = [
  { value: 10000, suffix: '+', label: 'Resumes Processed' },
  { value: 99, suffix: '%', label: 'Parsing Accuracy' },
  { value: 80, suffix: '%', label: 'Time Saved' },
  { value: 500, suffix: '+', label: 'Happy Teams' },
];


/* ─── FLOATING PARTICLES ─── */
function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.3 + 0.1,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-500 dark:bg-indigo-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}


/* ─── MAIN COMPONENT ─── */
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const typedText = useTypingEffect(HERO_WORDS, 90, 50, 2200);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white antialiased overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.06] shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-glow-sm transition-shadow duration-300">
                <Sparkles size={16} className="group-hover:animate-spin-slow" />
              </div>
              <span className="font-semibold text-sm tracking-tight">ResumeScreen</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={(e) => scrollTo(e, link.href)}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                aria-label="Toggle theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>

              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-glow-sm">
                    Dashboard <ArrowRight size={15} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Sign in</Link>
                    <Link to="/register"
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-glow-sm">Get started</Link>
                  </>
                )}
              </div>

              <button onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5" aria-label="Menu">
                <Menu size={19} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-0 right-0 h-full w-72 z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/5">
              <span className="font-semibold text-sm">ResumeScreen</span>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><X size={18} /></button>
            </div>
            <div className="p-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={(e) => scrollTo(e, link.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  <ChevronRight size={15} className="text-indigo-500" /> {link.label}
                </a>
              ))}
            </div>
            <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-200 dark:border-white/5">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Dashboard</Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Get started</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}


      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-indigo-500/[0.07] dark:bg-indigo-500/[0.12] rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-violet-500/[0.07] dark:bg-violet-500/[0.12] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '-1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
            style={{ backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-8 shadow-sm animate-fade-in">
              <Sparkles size={14} className="animate-pulse" />
              <span>AI-Powered Resume Screening Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Hire the best talent{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                {typedText}
              </span>
              <span className="inline-block w-[3px] h-[0.8em] bg-indigo-500 dark:bg-indigo-400 ml-1 animate-pulse align-text-bottom" />
            </h1>

            <p className="mt-7 text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Stop drowning in resumes. Our AI automatically parses, analyzes, and ranks every applicant so you can focus on what matters — <span className="text-slate-700 dark:text-slate-200 font-medium">hiring the right people.</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              {isAuthenticated ? (
                <Link to="/dashboard"
                  className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-glow-md overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">Dashboard <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              ) : (
                <Link to="/register"
                  className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-glow-md overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">Start free trial <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              )}
              <a href="#features" onClick={(e) => scrollTo(e, '#features')}
                className="group px-8 py-3.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2">
                <Play size={15} className="group-hover:scale-110 transition-transform" /> See how it works
              </a>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-sm animate-fade-in" style={{ animationDelay: '0.45s' }}>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Zap size={14} /> Demo
              </span>
              <span className="text-slate-400 hidden sm:inline">·</span>
              <span className="text-slate-500 dark:text-slate-400">Email: <code className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-medium border border-slate-200 dark:border-white/5">test@gmail.com</code></span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <span className="text-slate-500 dark:text-slate-400">Pass: <code className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-medium border border-slate-200 dark:border-white/5">123456</code></span>
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs">Sign in &rarr;</Link>
            </div>
          </div>

          {/* ─── HERO STATS ─── */}
          <HeroStats />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Scroll</span>
          <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />
        </div>
      </section>


      {/* ─── TRUSTED BY ─── */}
      <section className="py-16 border-y border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-10">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 dark:opacity-30">
            {['TechCorp', 'StartupXYZ', 'GlobalScale', 'InnovateCo', 'DataDriven', 'FutureHire'].map((name) => (
              <div key={name} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <Globe size={20} />
                <span className="text-lg font-semibold tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-5">
              <Rocket size={13} /> Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                hire smarter
              </span>
            </h2>
            <p className="mt-5 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              From AI parsing to team collaboration — one platform that covers your entire recruitment workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>


      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 md:py-32 relative bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-5">
              <FileText size={13} /> Simple Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Four steps to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                faster hiring
              </span>
            </h2>
            <p className="mt-5 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Simple workflow, powerful results. From upload to offer in record time.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 md:gap-4 max-w-6xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 dark:from-indigo-800 dark:via-violet-800 dark:to-purple-800" />
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>


      {/* ─── DASHBOARD PREVIEW ─── */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-medium mb-5">
              <BarChart3 size={13} /> Live Preview
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              A dashboard you'll{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                actually enjoy
              </span>
            </h2>
            <p className="mt-5 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Clean, fast, and built for recruiters who need to move quickly.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Glow behind preview */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 dark:opacity-30" />
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
                <div className="flex-1 max-w-md mx-auto"><div className="bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 text-center font-mono">app.resumescreen.ai/dashboard</div></div>
              </div>
              <div className="p-5 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    { label: 'Total candidates', value: '1,284', change: '+12%', up: true },
                    { label: 'Shortlisted', value: '342', change: '+8%', up: true },
                    { label: 'Interviews', value: '89', change: '+24%', up: true },
                    { label: 'Avg. match', value: '87%', change: '+3%', up: true },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 md:p-4 group hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                      <div className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">{s.label}</div>
                      <div className="flex items-end gap-2 mt-1">
                        <div className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mb-0.5">
                          <TrendingUp size={10} />{s.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 px-3 md:px-4 py-2.5 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                    <div>Name</div><div>Skills</div><div className="hidden md:block">Experience</div><div className="hidden md:block">Match</div><div>Status</div>
                  </div>
                  {[
                    { name: 'Sarah Johnson', skills: 'React, TS, Node', exp: '5 yrs', match: 96, status: 'Top Match' },
                    { name: 'Mike Chen', skills: 'Python, AWS, Go', exp: '7 yrs', match: 91, status: 'Shortlisted' },
                    { name: 'Emily Davis', skills: 'Java, Spring, SQL', exp: '4 yrs', match: 85, status: 'Reviewed' },
                    { name: 'Alex Thompson', skills: 'ML, Python, TF', exp: '6 yrs', match: 93, status: 'Top Match' },
                  ].map((r) => (
                    <div key={r.name} className="grid grid-cols-3 md:grid-cols-5 gap-3 px-3 md:px-4 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-white/5 last:border-0 items-center hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                      <div className="font-medium text-slate-900 dark:text-white truncate">{r.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 truncate text-[10px] md:text-xs">{r.skills}</div>
                      <div className="hidden md:block text-slate-500 dark:text-slate-400">{r.exp}</div>
                      <div className="hidden md:flex items-center gap-2">
                        <div className="h-1.5 w-12 md:w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${r.match >= 90 ? 'bg-emerald-500' : r.match >= 80 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${r.match}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{r.match}%</span>
                      </div>
                      <div>
                        <span className={`text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.status === 'Top Match' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                          r.status === 'Shortlisted' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 md:py-32 relative bg-slate-50/50 dark:bg-slate-900/30">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.04] dark:bg-violet-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium mb-5">
              <Star size={13} /> Simple Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Plans that{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                scale with you
              </span>
            </h2>
            <p className="mt-5 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} index={i} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        </div>
      </section>


      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 md:py-32 relative">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium mb-5">
              <Award size={13} /> Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                hiring teams
              </span>
            </h2>
          </div>

          <div className="relative">
            <div className="glass rounded-3xl p-10 md:p-16 shadow-sm border border-slate-200 dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full" />
              {TESTIMONIALS.map((t, i) => (
                <div key={t.name} className={`transition-all duration-500 ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 p-10 md:p-16 pointer-events-none'}`}>
                  <div className="flex gap-1 justify-center mb-6">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={18} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-center max-w-3xl mx-auto">
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ─── FINAL CTA ─── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-glow-md">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Ready to hire{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">at lightning speed?</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of recruiters who have already transformed their hiring process with AI-powered resume screening.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard"
                className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-glow-md overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">Go to Dashboard <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-glow-md overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">Start free trial <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></span>
                </Link>
                <Link to="/login"
                  className="px-10 py-4 rounded-xl font-semibold text-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-14 md:py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                  <Sparkles size={14} />
                </div>
                <span className="font-semibold text-sm tracking-tight">ResumeScreen</span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                AI-powered resume screening that helps recruiters find the best candidates faster with intelligent parsing, ranking, and analytics.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Mail, label: 'Email' },
                  { icon: Link2, label: 'LinkedIn' },
                  { icon: Code2, label: 'GitHub' },
                ].map(({ icon: SIcon, label }) => (
                  <a key={label} href="/" aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                    <SIcon size={17} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" onClick={(e) => scrollTo(e, "#features")} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => scrollTo(e, "#how-it-works")} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</a></li>
                <li><a href="#pricing" onClick={(e) => scrollTo(e, "#pricing")} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#testimonials" onClick={(e) => scrollTo(e, "#testimonials")} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-2.5">
                {isAuthenticated ? (
                  <li><Link to="/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link></li>
                ) : (
                  <>
                    <li><Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign in</Link></li>
                    <li><Link to="/register" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Register</Link></li>
                  </>
                )}
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; 2026 ResumeScreen. All rights reserved.</p>
            <p>Built with <span className="text-red-500">&hearts;</span> by Aman Kumar Singh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ═══════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════ */

function HeroStats() {
  const { ref, visible } = useScrollReveal(0.3);
  return (
    <div ref={ref} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
      {STATS.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} index={i} visible={visible} />
      ))}
    </div>
  );
}

function StatItem({ stat, index, visible }: { stat: typeof STATS[number]; index: number; visible: boolean }) {
  const count = useCounter(stat.value, 2000, visible);
  return (
    <div className={`text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 backdrop-blur-sm transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`} style={{ transitionDelay: `${index * 100}ms` }}>
      <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  const Icon = feature.icon;
  return (
    <div ref={ref} className={`group rounded-2xl p-6 md:p-7 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 relative overflow-hidden ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`} style={{ transitionDelay: `${index * 80}ms` }}>
      {/* Hover glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full opacity-0 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.08] blur-2xl transition-opacity duration-500`} />
      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="relative text-base font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="relative text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

function StepCard({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  const Icon = step.icon;
  return (
    <div ref={ref} className={`text-center relative transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`} style={{ transitionDelay: `${index * 120}ms` }}>
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg group">
        <Icon size={24} className="text-white" />
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center">{step.num}</span>
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
    </div>
  );
}

function PricingCard({ plan, index, isAuthenticated }: { plan: typeof PRICING[number]; index: number; isAuthenticated: boolean }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`relative rounded-2xl p-7 md:p-8 border transition-all duration-700 ${
      plan.popular
        ? 'border-indigo-300 dark:border-indigo-500/30 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/5 scale-[1.02] md:scale-105'
        : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-white/10'
    } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${index * 100}ms` }}>
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
        {plan.period && <span className="text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to={isAuthenticated ? '/dashboard' : '/register'}
        className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
          plan.popular
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md hover:shadow-glow-sm'
            : 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}