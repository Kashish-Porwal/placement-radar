import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Target, ArrowRight, Sparkles, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Background3D from '../components/Background3D';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email & password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] px-4 py-8 relative overflow-hidden select-none">
      {/* 3D Motion Interactive Background */}
      <Background3D />

      {/* Floating Ambient Glowing Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-pulse" />

      {/* Main Container - Split Screen 3D Motion */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Storyteller Intro */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 text-primary-cyan text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles size={14} className="animate-spin" />
            <span>Welcome Back Explorer</span>
          </div>

          <h1 className="text-4xl font-heading font-extrabold text-white leading-tight">
            Resume Your <br />
            <span className="bg-gradient-to-r from-primary via-primary-cyan to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              Placement Radar
            </span>
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed max-w-md">
            Track your progress, view AI match analytics, and stay 24h ahead of your interview schedules.
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-400" /> 2FA Protection</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary-cyan" /> Cloud Sync</span>
          </div>
        </motion.div>

        {/* Right Side: Glassmorphism Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden group">
            
            {/* Top Accent Neon Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-cyan to-purple-500 animate-pulse" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] transform group-hover:rotate-12 transition-transform duration-500">
                  <Target className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Account Login</h2>
                  <p className="text-xs text-gray-400">Enter your credentials</p>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all placeholder:text-gray-600"
                  placeholder="kashishporwal1702@gmail.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary via-primary-cyan to-purple-500 rounded-xl font-bold text-white text-sm flex justify-center items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transform hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 disabled:opacity-60"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-cyan font-bold hover:underline">
                  Create free account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
