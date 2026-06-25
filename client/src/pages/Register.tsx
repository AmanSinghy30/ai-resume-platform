import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-violet-950/40 to-transparent" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/[0.08] rounded-full blur-[120px]" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/[0.08]">
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <span className="text-white/90 font-semibold text-[15px] tracking-tight">ResumeScreen</span>
          </Link>
        </div>

        {/* Middle: Copy */}
        <div className="relative z-10 -mt-10">
          <h2 className="text-[2.5rem] xl:text-[2.8rem] font-bold text-white leading-[1.15] tracking-tight">
            Start screening<br />
            <span className="text-violet-400">in minutes.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Create a free account and start uploading resumes. No credit card required.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-3.5">
            {[
              '50 free resume uploads per month',
              'AI parsing with 99% accuracy',
              'Smart candidate ranking',
              'Team collaboration tools',
              'Cancel anytime, no lock-in',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-emerald-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 border-t border-white/[0.06] pt-8 grid grid-cols-3 gap-6">
          {[
            { value: '10K+', label: 'Resumes parsed' },
            { value: '500+', label: 'Teams active' },
            { value: '99%', label: 'Accuracy rate' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
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
            Have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-slate-900 dark:text-white">ResumeScreen</span>
            </div>

            <h1 className="text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-8">
              Free to get started. No credit card required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all"
                />
              </div>

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
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
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

                {/* Strength meter */}
                {password && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 w-10">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <a href="/" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</a>{' '}
                and{' '}
                <a href="/" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : 'Create account'}
              </button>
            </form>
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