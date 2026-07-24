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
  Flame,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';

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
    { name: 'Summaries', path: '/summaries', icon: BookOpen },
    { name: 'Safety', path: '/moderation', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarLetter = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const glassStyle = "bg-white/5 border border-white/10 backdrop-blur-[20px] rounded-2xl shadow-lg";
  const activeStyle = "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]";

  return (
    <div className="flex flex-col md:flex-row h-screen text-white overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <header className="flex md:hidden items-center justify-between px-4 py-3.5 z-30 relative bg-[#071020]/80 border-b border-white/10 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="StudyAI logo" className="h-6 w-auto filter drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]" />
            <span className="text-lg font-black tracking-wide text-white">StudyAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.streak_count !== undefined && (
            <div className="flex items-center gap-1 text-[#A78BFA] px-2 py-0.5 rounded-full text-xs font-bold border border-white/10 bg-white/5">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streak_count}d</span>
            </div>
          )}
          <div className="h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
            {avatarLetter}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-[#071020]/60 backdrop-blur-sm transition-opacity duration-300"
          />

          <aside className="relative flex flex-col justify-between w-64 max-w-xs h-full z-50 bg-[#0A0F24]/95 border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                  <img src={logo} alt="StudyAI logo" className="h-6 w-auto" />
                  <span className="text-lg font-black text-white">StudyAI</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
                          ? activeStyle 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 space-y-4 border-t border-white/10">
              {user && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white truncate max-w-[120px]">{user.full_name || user.email}</p>
                      <p className="text-xs text-gray-400 font-semibold">Student</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col justify-between transition-all duration-300 relative z-20 bg-[#0A0F24]/95 border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6.5 text-gray-300 hover:text-white p-1.5 rounded-full cursor-pointer z-30 transition-all hover:scale-110 bg-[#071020] border border-white/10 shadow-md"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div>
          <Link to="/dashboard" className={`p-6 flex items-center gap-2 hover:opacity-90 border-b border-white/10 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src={logo} alt="StudyAI logo" className="h-6 w-auto flex-shrink-0 filter drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]" />
            {!isCollapsed && <span className="text-lg font-black tracking-wide text-white">StudyAI</span>}
          </Link>
          
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? activeStyle 
                      : 'text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 space-y-4 border-t border-white/10">
          {user && (
            <div className={`flex items-center justify-between px-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                  {avatarLetter}
                </div>
                {!isCollapsed && (
                  <div>
                    <p className="text-sm font-extrabold text-white truncate max-w-[100px]">{user.full_name || user.email}</p>
                    <p className="text-xs text-gray-400 font-semibold">Student</p>
                  </div>
                )}
              </div>
              {user.streak_count !== undefined && !isCollapsed && (
                <div className="flex items-center gap-1 text-[#A78BFA] px-2 py-0.5 rounded-full text-xs font-bold border border-white/10 bg-white/5">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{user.streak_count}d</span>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 transition-all cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto py-6 md:py-8 px-4 md:px-0 pb-24 md:pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Bar Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 py-2 px-6 flex justify-around items-center z-30 bg-[#071020]/90 border-t border-white/10 backdrop-blur-lg">
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
                  ? 'text-[#A78BFA] scale-105' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarLayout;