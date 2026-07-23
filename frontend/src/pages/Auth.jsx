import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import logo from '../assets/logo.svg';

const inputClasses =
  "w-full rounded-xl px-3.5 py-2.5 text-sm text-[#2e2350] placeholder-[#b0a3d4] bg-white/55 backdrop-blur-md border border-white/80 focus:outline-none focus:border-[#a78bfa] focus:bg-white/85 focus:ring-4 focus:ring-[#a78bfa]/15 transition-all";

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      <div className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,139,250,0.35), rgba(168,139,250,0))' }}></div>
      <div className="pointer-events-none absolute bottom-0 right-1/3 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.3), rgba(110,231,183,0))' }}></div>

      <div className="max-w-sm w-full relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src={logo} alt="StudyAI logo" className="h-6 w-auto" />
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
                className={inputClasses}
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
              className={inputClasses}
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
              className={inputClasses}
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
  );
};

export default Auth;