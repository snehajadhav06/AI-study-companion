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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="flex h-screen bg-[#F5F7FA] text-slate-800">
      <aside className={`border-r border-gray-800 bg-[#111827] flex flex-col justify-between transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
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

      <main className="flex-1 overflow-y-auto bg-[#F5F7FA] py-8">
        <div className="responsive-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
