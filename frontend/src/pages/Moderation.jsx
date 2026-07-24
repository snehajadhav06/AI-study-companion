import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  Cpu, 
  Scroll, 
  HeartHandshake
} from 'lucide-react';

const Moderation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/documents/moderation/logs');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
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

  const logs = data?.logs || [];
  const safetyScore = data?.safety_score ?? 100;
  const totalSafe = data?.total_safe ?? 0;
  const totalBlocked = data?.total_blocked ?? 0;

  return (
    <div className="space-y-8 text-white text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-[#06B6D4] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          Content Safety Dashboard
        </h1>
        <p className="text-gray-300 mt-1">Review system compliance, study content guidelines, and system safety logs.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-300">Safety Score</p>
              <p className="text-3xl font-black mt-2 text-[#06B6D4]">{safetyScore}%</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-[#06B6D4]/10">
              <ShieldCheck className="h-6 w-6 text-[#06B6D4]" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-300">Safe Documents</p>
              <p className="text-3xl font-black mt-2 text-emerald-400">{totalSafe}</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-emerald-500/10">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-300">Blocked Uploads</p>
              <p className="text-3xl font-black mt-2 text-rose-400">{totalBlocked}</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-rose-500/10">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Guidelines */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Scroll className="h-5 w-5 text-[#8B5CF6]" />
            StudyAI Content Policy
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            The platform is designed exclusively for educational, study-related use. The moderation pipeline blocks and logs documents containing:
          </p>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Explicit Sexual Content & Pornography
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Graphic Violence & Self-Harm Encouragement
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Illegal Activities, Hacking & Malware
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Drug Manufacturing & Bomb Instructions
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Fraud, Identity Theft & Hate Speech
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
              Prompt Injection & System Overrides
            </li>
          </ul>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-rose-400" />
            Safety & Moderation Logs
          </h3>
          
          {logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <HeartHandshake className="h-10 w-10 text-emerald-400/60 mb-2" />
              <p className="text-sm font-semibold">Workspace is clean</p>
              <p className="text-xs">No documents have violated the platform safety policies.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2.5 px-2 font-bold uppercase">Timestamp</th>
                    <th className="py-2.5 px-2 font-bold uppercase">Filename</th>
                    <th className="py-2.5 px-2 font-bold uppercase">Category Detected</th>
                    <th className="py-2.5 px-2 font-bold uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-3 px-2 text-gray-300 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-bold truncate max-w-[150px]" title={log.filename}>
                        {log.filename}
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-rose-950/40 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                          {log.category_detected.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-300 max-w-[200px] truncate" title={log.reason}>
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Moderation;
