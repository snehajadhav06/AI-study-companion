import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  BookOpen, 
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F7FA] text-slate-800 overflow-hidden">
      
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between bg-[#111827] text-white px-4 py-3.5 border-b border-gray-800 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#4F46E5] fill-[#4F46E5]/20 flex-shrink-0" />
            <span className="text-lg font-extrabold tracking-wider text-[#F9FAFB]">StudyAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.streak_count !== undefined && (
            <div className="flex items-center gap-1 text-[#F9FAFB] bg-gray-800 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-700">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streak_count}d</span>
            </div>
          )}
          <div className="h-7 w-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shadow-inner flex-shrink-0">
            {avatarLetter}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Content */}
          <aside className="relative flex flex-col justify-between w-64 max-w-xs bg-[#111827] h-full shadow-2xl z-50 transform transition-transform duration-305 ease-out">
            <div>
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                  <Sparkles className="h-5 w-5 text-[#4F46E5] fill-[#4F46E5]/20" />
                  <span className="text-lg font-extrabold tracking-wider text-[#F9FAFB]">StudyAI</span>
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
                          ? 'bg-[#4F46E5] text-[#F9FAFB] shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                          : 'text-[#E5E7EB] hover:text-white hover:bg-[#1F2937]'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-800 space-y-4">
              {user && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#F9FAFB] truncate max-w-[120px]">{user.full_name || user.email}</p>
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#E5E7EB] hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Left side) */}
      <aside className={`hidden md:flex border-r border-gray-800 bg-[#111827] flex-col justify-between transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6.5 bg-[#111827] border border-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full shadow-sm cursor-pointer z-10 transition-all hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div>
          <Link to="/dashboard" className={`p-6 flex items-center gap-2 border-b border-gray-800 hover:opacity-90 ${isCollapsed ? 'justify-center' : ''}`}>
            <Sparkles className="h-6 w-6 text-[#4F46E5] fill-[#4F46E5]/20 flex-shrink-0" />
            {!isCollapsed && <span className="text-xl font-extrabold tracking-wider text-[#F9FAFB]">StudyAI</span>}
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
                      ? 'bg-[#4F46E5] text-[#F9FAFB] shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                      : 'text-[#E5E7EB] hover:text-white hover:bg-[#1F2937]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-4">
          {user && (
            <div className={`flex items-center justify-between px-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                  {avatarLetter}
                </div>
                {!isCollapsed && (
                  <div>
                    <p className="text-sm font-extrabold text-[#F9FAFB] truncate max-w-[100px]">{user.full_name || user.email}</p>
                    <p className="text-xs text-gray-400 font-semibold">Student</p>
                  </div>
                )}
              </div>
              {user.streak_count !== undefined && !isCollapsed && (
                <div className="flex items-center gap-1 text-[#F9FAFB] bg-gray-800 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-700">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>{user.streak_count}d</span>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#E5E7EB] hover:text-white hover:bg-red-500/20 transition-all cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#F5F7FA] py-6 md:py-8 px-4 md:px-0 pb-20 md:pb-8">
        <div className="responsive-container">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Floating/Sleek design) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-around items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                  ? 'text-[#4F46E5] scale-105' 
                  : 'text-slate-500 hover:text-slate-700'
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
