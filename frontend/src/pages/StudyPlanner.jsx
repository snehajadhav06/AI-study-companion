import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  BookOpen, 
  ChevronRight,
  ListTodo
} from 'lucide-react';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [subjects, setSubjects] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [targetDate, setTargetDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/planner/');
      setPlans(response.data);
      if (response.data.length > 0) {
        setSelectedPlan(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjects.trim() || !targetDate) return;
    
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/api/planner/generate', {
        subjects: subjects.split(',').map(s => s.trim()),
        hours_per_day: parseFloat(hoursPerDay),
        target_date: targetDate
      });
      setPlans((prev) => [response.data, ...prev]);
      setSelectedPlan(response.data);
      
      setSubjects('');
      setTargetDate('');
    } catch (error) {
      console.error('Failed to generate study plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const planData = selectedPlan ? JSON.parse(selectedPlan.plan_json) : null;

  return (
    <div className="space-y-8 text-white text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Study Planner</h1>
        <p className="text-gray-300 mt-1">Design automated study timelines to prepare for exams efficiently.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-6 h-fit space-y-6">
          <h3 className="text-lg font-bold mb-4">Create New Plan</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Topics (comma separated)</label>
              <input
                type="text"
                required
                placeholder="e.g. Linear Algebra, Calculus, Python"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Study Hours Per Day</label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#8B5CF6] focus-within:ring-4 focus-within:ring-[#8B5CF6]/15 transition-all">
                <Clock className="h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-full font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Exam / End Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 transition-all font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating Schedule...' : 'Generate Plan'}
            </button>
          </form>

          {plans.length > 0 && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Your Schedules</h4>
              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full text-left p-3 rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                      selectedPlan?.id === p.id
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate text-xs">{p.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 premium-card p-6 md:p-8">
          {planData ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold">{planData.title}</h2>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Study Load: {selectedPlan.hours_per_week} hours per week</p>
                </div>
                <span className="text-xs text-gray-400 font-bold">Duration: {planData.total_weeks} Weeks</span>
              </div>

              <div className="space-y-6">
                {planData.schedule.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="bg-[#6366F1]/10 text-[#A78BFA] font-bold px-3 py-1.5 rounded-xl text-sm mt-0.5 border border-[#6366F1]/20">
                      W{item.week}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-[#8B5CF6]" />
                          Topics to Master
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                          {item.topics.map((topic, tIdx) => (
                            <li key={tIdx} className="text-xs text-gray-200 font-medium flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {item.suggested_activities && (
                        <div className="border-t border-white/10 pt-3">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ListTodo className="h-3.5 w-3.5 text-gray-400" />
                            Suggested Milestones
                          </h4>
                          <p className="text-xs text-gray-300 leading-relaxed font-semibold">{item.suggested_activities}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-md font-bold text-gray-400">No Study Plan Active</h3>
              <p className="text-xs text-gray-400 mt-1">Configure subjects and hours on the left to generate your curriculum.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
