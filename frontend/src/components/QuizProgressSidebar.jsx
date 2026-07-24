import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

const QuizProgressSidebar = ({ questions, answers, activeIndex, onNavigate }) => {
  const completed = questions.filter((_, index) => answers[index] !== undefined && answers[index] !== '').length;
  const progressPercent = questions.length ? Math.round((completed / questions.length) * 100) : 0;

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Quiz progress</p>
          <p className="text-xs text-gray-300">{completed} of {questions.length} answered</p>
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <svg viewBox="0 0 100 100" className="h-14 w-14 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              stroke="#8B5CF6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(progressPercent / 100) * 264} 264` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute text-xs font-bold text-white">{progressPercent}%</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Question navigator</p>
        <div className="mt-4 space-y-2">
          {questions.map((question, index) => {
            const answered = answers[index] !== undefined && answers[index] !== '';
            const isActive = activeIndex === index;
            return (
              <button
                key={question.id || index}
                onClick={() => onNavigate(index)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-transparent text-white shadow-md' 
                    : 'border-white/10 bg-white/3 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  {answered ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
                  Q{index + 1}
                </span>
                <span className="text-xs font-semibold text-gray-400">{answered ? 'Ready' : 'Pending'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default QuizProgressSidebar;
