import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Flame, 
  Percent, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeTick, setTimeTick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const getDayLabel = (offset) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return days[d.getDay()];
  };

  const chartData = {
    labels: [
      getDayLabel(6),
      getDayLabel(5),
      getDayLabel(4),
      getDayLabel(3),
      getDayLabel(2),
      getDayLabel(1),
      getDayLabel(0)
    ],
    datasets: [
      {
        fill: true,
        label: 'Study Hours',
        data: stats?.study_hours_history || [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(167, 139, 250)',
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#cbd5e1',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1',
        },
      },
    },
  };

  const cards = [
    { title: 'Documents Uploaded', value: stats?.total_documents, icon: FileText, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10' },
    { title: 'Study Streak', value: `${stats?.study_streak} Days`, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Quiz Accuracy', value: `${Math.round(stats?.quiz_accuracy || 0)}%`, icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Flashcards Done', value: stats?.flashcards_completed, icon: CheckCircle, color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
  ];

  return (
    <div className="space-y-8 text-white text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Study Dashboard</h1>
        <p className="text-gray-300 mt-1">Review your metrics, progress, and study suggestions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="premium-card p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-300">{card.title}</p>
                  <p className="text-3xl font-extrabold mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl border border-white/5 ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
              Weekly Progress
            </h3>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Focus Areas
            </h3>
            <p className="text-sm text-gray-300 mb-6">Topics where your accuracy or recall needs improvement.</p>
            <div className="space-y-3">
              {stats?.weak_topics && stats.weak_topics.length > 0 ? (
                stats.weak_topics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-950/20 border border-red-500/20 rounded-xl">
                    <span className="text-sm font-semibold text-gray-200">{topic}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-900/40 text-red-300">Review Needs</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 py-2">No current focus areas identified. Keep it up!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {stats?.ai_recommendations && stats.ai_recommendations.length > 0 ? (
              stats.ai_recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-4 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl items-start">
                  <span className="flex-shrink-0 h-5 w-5 bg-[#6366F1]/20 text-[#A78BFA] rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-200 font-medium">{rec}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-2">No recommendations available. Upload more study materials!</div>
            )}
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          {!stats?.recent_activity || stats.recent_activity.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No recent activity logged.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_activity.map((act, i) => {
                const formatActivityTime = (dateStr) => {
                  if (!dateStr) return '';
                  const hasOffset = dateStr.includes('Z') || dateStr.includes('+') || (dateStr.lastIndexOf('-') > 10);
                  const utcDateStr = hasOffset ? dateStr : `${dateStr}Z`;
                  const date = new Date(utcDateStr);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffSec = Math.floor(diffMs / 1000);
                  const diffMin = Math.floor(diffSec / 60);
                  const diffHr = Math.floor(diffMin / 60);
                  const diffDays = Math.floor(diffHr / 24);

                  if (diffSec < 10) {
                    return 'Just now';
                  } else if (diffSec < 60) {
                    return `${diffSec}s ago`;
                  } else if (diffMin < 60) {
                    return `${diffMin}m ago`;
                  } else if (diffHr < 24) {
                    return `${diffHr}h ago`;
                  } else if (diffDays === 1) {
                    return 'Yesterday';
                  } else if (diffDays < 7) {
                    return `${diffDays}d ago`;
                  } else {
                    return date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }
                };

                const handleActivityClick = () => {
                  if (act.type === 'upload') {
                    navigate('/upload');
                  } else if (act.type === 'quiz') {
                    navigate('/quiz');
                  }
                };

                return (
                  <div 
                    key={i} 
                    onClick={handleActivityClick}
                    className="flex justify-between items-center py-2.5 px-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-200 group-hover:text-[#A78BFA] transition-colors">{act.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatActivityTime(act.date)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#A78BFA] group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
