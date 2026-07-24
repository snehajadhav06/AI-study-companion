import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import logo from '../assets/logo.svg';
import neuralBg from '../assets/neural-bg.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/55 bg-white/8 backdrop-blur-md border border-white/12 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/12 focus:ring-4 focus:ring-[#8B5CF6]/15 transition-all duration-200";

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 4px rgba(167, 139, 250, 0.4)); }
          50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.7)); }
        }
        .bg-zoom {
          animation: slowZoom 50s ease-in-out infinite;
        }
        .card-slide-up {
          animation: fadeSlideUp 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .logo-pulse {
          animation: softPulse 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-zoom {
            animation: none !important;
          }
          .card-slide-up {
            animation: none !important;
          }
          .logo-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* Full-screen background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-zoom pointer-events-none"
        style={{
          backgroundImage: `url(${neuralBg})`,
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Dark translucent gradient overlay */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(8, 12, 30, 0.65), rgba(15, 23, 42, 0.55), rgba(12, 18, 38, 0.70))'
        }}
      />

      {/* Auth Card wrapper */}
      <div
        className="max-w-[430px] w-full relative z-10 card-slide-up bg-white/8 backdrop-blur-[20px] rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_20px_60px_rgba(0,0,0,0.35)] p-8 md:p-10 mx-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6 hover:scale-105 transition-transform duration-200">
            <img src={logo} alt="StudyAI logo" className="h-7 w-auto logo-pulse" />
            <span className="text-xl font-extrabold text-white tracking-wide">StudyAI</span>
          </Link>
          <h2 className="text-2xl font-bold text-white text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-[#D1D5DB] mt-2 text-center">
            {isLogin ? 'Sign in to access your study materials' : 'Start your study companion journey'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl text-xs text-red-200 border border-red-500/30 bg-red-950/40 backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Full name</label>
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="Jordan Lee"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Email address</label>
            <input
              type="email"
              required
              className={inputClasses}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              className={inputClasses}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 transition-all duration-300 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#D1D5DB]">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-[#A78BFA] hover:underline font-bold bg-transparent border-0 cursor-pointer transition-colors duration-200">
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="text-[#A78BFA] hover:underline font-bold bg-transparent border-0 cursor-pointer transition-colors duration-200">
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;