import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';

const QuizProgressSidebar = ({ questions, answers, activeIndex, onNavigate }) => {
  const completed = questions.filter((_, index) => answers[index] !== undefined && answers[index] !== '').length;
  const progressPercent = questions.length ? Math.round((completed / questions.length) * 100) : 0;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Quiz progress</p>
          <p className="text-xs text-slate-500">{completed} of {questions.length} answered</p>
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <svg viewBox="0 0 100 100" className="h-14 w-14 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              stroke="#4f46e5"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(progressPercent / 100) * 264} 264` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute text-sm font-semibold text-slate-900">{progressPercent}%</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Question navigator</p>
        <div className="mt-4 space-y-2">
          {questions.map((question, index) => {
            const answered = answers[index] !== undefined && answers[index] !== '';
            const isActive = activeIndex === index;
            return (
              <button
                key={question.id || index}
                onClick={() => onNavigate(index)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${isActive ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">
                  {answered ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  Q{index + 1}
                </span>
                <span className="text-xs font-medium text-slate-500">{answered ? 'Ready' : 'Pending'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default QuizProgressSidebar;
