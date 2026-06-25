import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles, ArrowLeft, Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session has expired, please login again', { duration: 5000 });
      searchParams.delete('expired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ─── LEFT: Brand Panel ─── */}
      <div className="hidden lg:flex lg:w-[44%] bg-slate-950 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Gradient wash */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-950/40 to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[120px]" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/[0.08]">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <span className="text-white/90 font-semibold text-[15px] tracking-tight">ResumeScreen</span>
          </Link>
        </div>

        {/* Middle: Copy */}
        <div className="relative z-10 -mt-10">
          <h2 className="text-[2.5rem] xl:text-[2.8rem] font-bold text-white leading-[1.15] tracking-tight">
            Screen resumes<br />
            <span className="text-indigo-400">10× faster.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-[15px] leading-relaxed max-w-sm">
            AI-powered parsing, ranking, and analytics — so you can focus on hiring the right people, not reading PDFs.
          </p>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 border-t border-white/[0.06] pt-8">
          <p className="text-slate-300 text-[15px] leading-relaxed italic">
            "We cut our screening time by 80% and improved candidate quality across every role."
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">SM</div>
            <div>
              <div className="text-white text-sm font-medium">Sarah Mitchell</div>
              <div className="text-slate-500 text-xs">Head of Talent, TechCorp</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Form ─── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <ArrowLeft size={15} />
            <span>Home</span>
          </Link>
          <p className="text-sm text-slate-400">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-slate-900 dark:text-white">ResumeScreen</span>
            </div>

            <h1 className="text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-8">
              Sign in to your account to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <button type="button" className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Demo box */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Demo credentials</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Email: <code className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">test@gmail.com</code></span>
                <span>Pass: <code className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">123456</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 pb-6 sm:pb-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">&copy; 2026 ResumeScreen. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}