import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex relative overflow-hidden">

      <div className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,139,250,0.35), rgba(168,139,250,0))' }}></div>
      <div className="pointer-events-none absolute bottom-0 right-1/3 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.3), rgba(110,231,183,0))' }}></div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="max-w-sm w-full">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}></div>
              <span className="text-lg font-extrabold text-[#3730a3]">StudyAI</span>
            </Link>
            <h2 className="text-xl font-extrabold text-[#3730a3]">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-xs text-[#6d5b9c] mt-1.5">
              {isLogin ? 'Sign in to access your study materials' : 'Start your study companion journey'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-xs text-[#a33]" style={{ background: 'rgba(254,226,226,0.6)', border: '1px solid rgba(252,165,165,0.5)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-[#6d5b9c] mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#2e2350] placeholder-[#b0a3d4] focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)' }}
                  placeholder="Jordan Lee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#6d5b9c] mb-1.5">Email address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#2e2350] placeholder-[#b0a3d4] focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6d5b9c] mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#2e2350] placeholder-[#b0a3d4] focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6d5b9c]">
            {isLogin ? (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-[#7c3aed] hover:underline font-bold bg-transparent border-0 cursor-pointer">
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-[#7c3aed] hover:underline font-bold bg-transparent border-0 cursor-pointer">
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10" style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(6px)', borderLeft: '1px solid rgba(255,255,255,0.6)' }}>
        <div className="relative w-3/4 max-w-md h-80">
          <div className="absolute top-0 left-0 w-56 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(124,58,237,0.12)' }}>
            <div className="h-2.5 rounded-full mb-3 w-3/4" style={{ background: 'rgba(167,139,250,0.35)' }}></div>
            <div className="h-2 rounded-full mb-2 w-full" style={{ background: 'rgba(46,35,80,0.1)' }}></div>
            <div className="h-2 rounded-full mb-2 w-full" style={{ background: 'rgba(46,35,80,0.1)' }}></div>
            <div className="h-2 rounded-full mb-4 w-2/3" style={{ background: 'rgba(46,35,80,0.1)' }}></div>
            <div className="h-7 w-24 rounded-lg" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}></div>
          </div>

          <div className="absolute bottom-0 left-4 w-44 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(124,58,237,0.1)' }}>
            <div className="h-2 rounded-full mb-2 w-3/4" style={{ background: 'rgba(46,35,80,0.1)' }}></div>
            <div className="h-2 rounded-full w-1/2" style={{ background: 'rgba(46,35,80,0.1)' }}></div>
          </div>

          <div className="absolute bottom-6 right-0 w-52 rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', boxShadow: '0 8px 32px rgba(124,58,237,0.25)' }}>
            <div className="h-2.5 rounded-full mb-3 w-2/3 bg-white/70"></div>
            <div className="h-2 rounded-full mb-2 w-full bg-white/40"></div>
            <div className="h-2 rounded-full mb-3 w-4/5 bg-white/40"></div>
            <div className="h-6 w-16 rounded-lg bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;