import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-650"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {isLogin ? 'Sign in to access your study materials' : 'Start your study companion journey'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-655 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-white border border-slate-205 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-white border border-slate-205 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-white border border-slate-205 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-450 font-medium">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-indigo-650 hover:underline font-bold bg-transparent border-0 cursor-pointer">
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="text-indigo-650 hover:underline font-bold bg-transparent border-0 cursor-pointer">
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
