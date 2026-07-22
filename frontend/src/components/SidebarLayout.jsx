import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Copy, 
  HelpCircle, 
  Calendar, 
  LogOut, 
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Upload', path: '/upload', icon: FileText },
    { name: 'Flashcards', path: '/flashcards', icon: Copy },
    { name: 'Quiz', path: '/quiz', icon: HelpCircle },
    { name: 'Planner', path: '/planner', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarLetter = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const glassPanel = { background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' };

  return (
    <div className="flex flex-col md:flex-row h-screen text-[#2e2350] overflow-hidden relative">

      <div className="pointer-events-none fixed -top-16 -left-10 w-56 h-56 rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(168,139,250,0.3), rgba(168,139,250,0))' }}></div>
      <div className="pointer-events-none fixed bottom-0 right-0 w-72 h-72 rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.25), rgba(110,231,183,0))' }}></div>

      <header className="flex md:hidden items-center justify-between px-4 py-3.5 z-30 relative" style={{ ...glassPanel, borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 text-[#6d5b9c] hover:text-[#3730a3] transition-colors cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}></div>
            <span className="text-lg font-extrabold text-[#3730a3]">StudyAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.streak_count !== undefined && (
            <div className="flex items-center gap-1 text-[#3730a3] px-2 py-0.5 rounded-full text-xs font-bold border" style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.7)' }}>
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streak_count}d</span>
            </div>
          )}
          <div className="h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
            {avatarLetter}
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-[#2e2350]/30 backdrop-blur-sm transition-opacity duration-300"
          />

          <aside className="relative flex flex-col justify-between w-64 max-w-xs h-full z-50" style={{ ...glassPanel, borderRight: '1px solid rgba(255,255,255,0.6)' }}>
            <div>
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                  <div className="w-5 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}></div>
                  <span className="text-lg font-extrabold text-[#3730a3]">StudyAI</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 text-[#6d5b9c] hover:text-[#3730a3] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive 
                          ? 'sidebar-active' 
                          : 'text-[#4b3a6b] hover:text-[#3730a3] hover:bg-white/40'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.6)' }}>
              {user && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#3730a3] truncate max-w-[120px]">{user.full_name || user.email}</p>
                      <p className="text-xs text-[#6d5b9c] font-semibold">Student</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#4b3a6b] hover:text-red-600 hover:bg-red-50/60 transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex flex-col justify-between transition-all duration-300 relative z-10 ${isCollapsed ? 'w-20' : 'w-64'}`} style={{ ...glassPanel, borderRight: '1px solid rgba(255,255,255,0.6)' }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6.5 text-[#6d5b9c] hover:text-[#3730a3] p-1.5 rounded-full cursor-pointer z-10 transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)' }}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div>
          <Link to="/dashboard" className={`p-6 flex items-center gap-2 hover:opacity-90 ${isCollapsed ? 'justify-center' : ''}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}></div>
            {!isCollapsed && <span className="text-xl font-extrabold text-[#3730a3]">StudyAI</span>}
          </Link>
          
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'sidebar-active' 
                      : 'text-[#4b3a6b] hover:text-[#3730a3] hover:bg-white/40'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.6)' }}>
          {user && (
            <div className={`flex items-center justify-between px-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
                  {avatarLetter}
                </div>
                {!isCollapsed && (
                  <div>
                    <p className="text-sm font-extrabold text-[#3730a3] truncate max-w-[100px]">{user.full_name || user.email}</p>
                    <p className="text-xs text-[#6d5b9c] font-semibold">Student</p>
                  </div>
                )}
              </div>
              {user.streak_count !== undefined && !isCollapsed && (
                <div className="flex items-center gap-1 text-[#3730a3] px-2.5 py-1 rounded-full text-xs font-bold border" style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.7)' }}>
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>{user.streak_count}d</span>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#4b3a6b] hover:text-red-600 hover:bg-red-50/60 transition-all cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto py-6 md:py-8 px-4 md:px-0 pb-20 md:pb-8 relative z-10">
        <div className="responsive-container">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 py-2 px-6 flex justify-around items-center z-30" style={{ ...glassPanel, borderTop: '1px solid rgba(255,255,255,0.6)' }}>
        {[
          { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Chat', path: '/chat', icon: MessageSquare },
          { name: 'Upload', path: '/upload', icon: FileText },
          { name: 'Quiz', path: '/quiz', icon: HelpCircle },
          { name: 'Planner', path: '/planner', icon: Calendar }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? 'text-[#7c3aed] scale-105' 
                  : 'text-[#8b7bb0] hover:text-[#3730a3]'
              }`}
            >
              <Icon className="h-5.5 w-5.5" />
              <span className="text-[10px] font-extrabold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarLayout;