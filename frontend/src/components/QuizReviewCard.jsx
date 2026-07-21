import React from 'react';
import { Check, X, CircleAlert, BookOpen } from 'lucide-react';

const QuizReviewCard = ({ question, index, answer, isCorrect, review }) => {
  const options = question.options || [];
  const selectedAnswer = answer ?? '';
  const correctAnswer = question.correct_answer ?? '';

  const normalize = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
  };

  const optionState = (option) => {
    const normalizedOption = normalize(option);
    const normalizedCorrect = normalize(correctAnswer);
    const normalizedSelected = normalize(selectedAnswer);

    if (normalizedOption === normalizedCorrect) {
      return 'correct';
    }

    if (normalizedOption === normalizedSelected && !isCorrect) {
      return 'incorrect';
    }

    return 'neutral';
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300" id={`question-${index + 1}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Question {index + 1}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{question.question}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {question.type?.toUpperCase() || 'Q'}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        </div>
      </div>

      {question.type === 'mcq' && options.length > 0 && (
        <div className="mt-6 grid gap-3">
          {options.map((option) => {
            const state = optionState(option);
            const baseClass = 'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all';
            const classes = {
              correct: 'border-emerald-200 bg-emerald-50 text-emerald-800',
              incorrect: 'border-rose-200 bg-rose-50 text-rose-800',
              neutral: 'border-slate-200 bg-slate-50 text-slate-600',
            }[state];

            return (
              <div key={option} className={`${baseClass} ${classes}`}>
                <span>{option}</span>
                {state === 'correct' ? (
                  <Check className="h-4 w-4" />
                ) : state === 'incorrect' ? (
                  <X className="h-4 w-4" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'tf' && (
        <div className="mt-6 flex gap-3">
          {['True', 'False'].map((option) => {
            const state = optionState(option);
            const baseClass = 'rounded-2xl border px-4 py-3 text-sm';
            const classes = {
              correct: 'border-emerald-200 bg-emerald-50 text-emerald-800',
              incorrect: 'border-rose-200 bg-rose-50 text-rose-800',
              neutral: 'border-slate-200 bg-slate-50 text-slate-600',
            }[state];

            return (
              <div key={option} className={`${baseClass} ${classes}`}>
                {option}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'fitb' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Your answer</p>
          <p className="mt-2">{selectedAnswer || 'No answer provided'}</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">Selected answer</p>
          <p className="mt-2 text-slate-600">{selectedAnswer || 'No answer provided'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-semibold text-emerald-800">Correct answer</p>
          <p className="mt-2 text-emerald-700">{correctAnswer || 'No correct answer available'}</p>
        </div>
      </div>

      {review?.explanation && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookOpen className="h-4 w-4" />
            Explanation
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{review.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizReviewCard;
