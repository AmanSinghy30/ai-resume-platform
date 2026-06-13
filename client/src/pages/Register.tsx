import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-50 dark:auth-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-glow-md">
            AI
          </div>
          <h1 className="text-3xl font-bold gradient-text">RecruitAI</h1>
          <p className="text-slate-600 dark:text-slate-500 mt-2 text-sm">Create your recruiter account</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-glass-lg">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 tracking-tight">Create Account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary hover:shadow-glow-md disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-all duration-200 mt-2 hover:-translate-y-0.5"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark transition-colors font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}