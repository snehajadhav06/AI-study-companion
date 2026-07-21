import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import {
  HelpCircle,
  Sparkles,
  ChevronRight,
  Award,
  RotateCcw,
  BarChart3,
  Eye,
  BookOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import QuizProgressSidebar from '../components/QuizProgressSidebar';
import useQuizTimer from '../hooks/useQuizTimer';

const Quizzes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);

  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const answersRef = useRef({});

  const quizTimer = useQuizTimer();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchQuizzes(selectedDocId);
    }
  }, [selectedDocId]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/documents/');
      setDocuments(response.data);

      const passedDocId = location.state?.docId;
      if (passedDocId) {
        setSelectedDocId(passedDocId);
      } else if (response.data.length > 0) {
        setSelectedDocId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchQuizzes = async (docId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/quizzes/?document_id=${docId}`);
      setQuizzes(response.data);
      if (response.data.length > 0) {
        handleSelectQuiz(response.data[0]);
      } else {
        setActiveQuiz(null);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleSelectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setUserAnswers({});
    answersRef.current = {};
    setQuizSubmitted(false);
    setSubmissionResult(null);
    setShowModal(false);
    setActiveQuestionIndex(0);
    quizTimer.resetTimer();
    quizTimer.startTimer();
  };

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/api/quizzes/generate', {
        document_id: parseInt(selectedDocId),
        num_questions: parseInt(numQuestions),
        difficulty: difficulty,
      });
      setQuizzes((prev) => [response.data, ...prev]);
      handleSelectQuiz(response.data);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (qIndex, answer) => {
    if (quizSubmitted) return;
    const nextAnswers = {
      ...userAnswers,
      [qIndex]: answer,
    };
    setUserAnswers(nextAnswers);
    answersRef.current = nextAnswers;
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const answersList = [];
    for (let i = 0; i < activeQuiz.questions.length; i += 1) {
      answersList.push(answersRef.current[i] ?? userAnswers[i] ?? '');
    }

    const timeTakenSeconds = quizTimer.stopTimer();

    try {
      const response = await axios.post(`http://localhost:8000/api/quizzes/${activeQuiz.id}/submit`, {
        answers: answersList,
      });
      setSubmissionResult({
        ...response.data,
        time_taken_seconds: timeTakenSeconds,
      });
      setQuizSubmitted(true);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
    }
  };

  const handleReviewAnswers = () => {
    setShowModal(false);
    setActiveQuestionIndex(0);
    requestAnimationFrame(() => {
      const firstQuestion = document.getElementById('question-1');
      if (firstQuestion) {
        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleGenerateAnother = () => {
    setShowModal(false);
    setQuizSubmitted(false);
    setSubmissionResult(null);
    setUserAnswers({});
    answersRef.current = {};
    quizTimer.resetTimer();
    if (selectedDocId) {
      void handleGenerate();
    }
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleNavigateQuestion = (index) => {
    setActiveQuestionIndex(index);
    const questionElement = document.getElementById(`question-${index + 1}`);
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const summaryStats = useMemo(() => {
    if (!submissionResult || !activeQuiz) return null;
    const accuracy = Math.round((submissionResult.score / submissionResult.total_questions) * 100);
    const timeTakenSeconds = submissionResult.time_taken_seconds ?? 0;
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    const formattedTime = minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
    return {
      score: submissionResult.score,
      total: submissionResult.total_questions,
      accuracy,
      correct: submissionResult.correct_answers ?? submissionResult.score,
      incorrect: submissionResult.incorrect_answers ?? submissionResult.total_questions - submissionResult.score,
      timeTaken: timeTakenSeconds,
      timeTakenFormatted: formattedTime,
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    };
  }, [submissionResult, activeQuiz, difficulty]);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Practice Quizzes</h1>
          <p className="mt-1 text-sm text-slate-500">Focused practice designed to sharpen understanding and retention.</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 sm:w-56"
          >
            <option value="">Select document...</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 sm:w-32"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 sm:w-24"
          >
            <option value="3">3 Qs</option>
            <option value="5">5 Qs</option>
            <option value="10">10 Qs</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!selectedDocId || generating}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Saved Tests</h3>
          {quizzes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No quizzes generated yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition ${activeQuiz?.id === quiz.id ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'}`}
                >
                  <span className="truncate">{quiz.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          {activeQuiz ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{activeQuiz.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">Answer each prompt carefully and review the results once you submit.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {activeQuiz.questions.length} questions
                  </div>
                  {!quizSubmitted && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">
                      <Clock3 className="mb-0.5 inline h-4 w-4" />
                      <span className="ml-1.5">{quizTimer.formattedLiveTime()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-6">
                  {activeQuiz.questions.map((question, idx) => {
                    const selectedValue = userAnswers[idx];
                    const normalizedSelected = selectedValue === undefined || selectedValue === null ? '' : String(selectedValue).trim().toLowerCase();
                    const normalizedCorrect = question.correct_answer === undefined || question.correct_answer === null ? '' : String(question.correct_answer).trim().toLowerCase();
                    const isCorrect = Boolean(normalizedSelected) && normalizedSelected === normalizedCorrect;
                    const review = submissionResult?.review_details?.[idx];

                    return (
                      <motion.div
                        key={`${question.id || idx}-${idx}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                      >
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Question {idx + 1}</p>
                              <h3 className="mt-2 text-lg font-semibold text-slate-900">{question.question}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {question.type?.toUpperCase() || 'Q'}
                              </span>
                              {quizSubmitted && (
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              )}
                            </div>
                          </div>

                          {question.type === 'mcq' && question.options?.length > 0 && (
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                              {question.options.map((option) => {
                                const isSelected = selectedValue === option;
                                const isCorrectOption = option === question.correct_answer;
                                const state = quizSubmitted ? (isCorrectOption ? 'correct' : isSelected && !isCorrect ? 'incorrect' : 'neutral') : isSelected ? 'selected' : 'neutral';
                                const baseClass = 'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all';
                                const classes = {
                                  selected: 'border-indigo-200 bg-indigo-50 text-indigo-700',
                                  correct: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                                  incorrect: 'border-rose-200 bg-rose-50 text-rose-800',
                                  neutral: 'border-slate-200 bg-white text-slate-600',
                                }[state];

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => handleAnswerChange(idx, option)}
                                    className={`${baseClass} ${classes} ${quizSubmitted ? 'cursor-default' : 'cursor-pointer hover:border-indigo-300'}`}
                                  >
                                    <span>{option}</span>
                                    {state === 'correct' ? <CheckCircle2 className="h-4 w-4" /> : state === 'incorrect' ? <AlertCircle className="h-4 w-4" /> : null}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {question.type === 'tf' && (
                            <div className="mt-6 flex flex-wrap gap-3">
                              {['True', 'False'].map((option) => {
                                const isSelected = selectedValue === option;
                                const isCorrectOption = option === question.correct_answer;
                                const state = quizSubmitted ? (isCorrectOption ? 'correct' : isSelected && !isCorrect ? 'incorrect' : 'neutral') : isSelected ? 'selected' : 'neutral';
                                const baseClass = 'rounded-2xl border px-4 py-3 text-sm transition-all';
                                const classes = {
                                  selected: 'border-indigo-200 bg-indigo-50 text-indigo-700',
                                  correct: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                                  incorrect: 'border-rose-200 bg-rose-50 text-rose-800',
                                  neutral: 'border-slate-200 bg-white text-slate-600',
                                }[state];

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => handleAnswerChange(idx, option)}
                                    className={`${baseClass} ${classes} ${quizSubmitted ? 'cursor-default' : 'cursor-pointer hover:border-indigo-300'}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {question.type === 'fitb' && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                              <input
                                type="text"
                                placeholder="Type your answer here..."
                                disabled={quizSubmitted}
                                value={selectedValue ?? ''}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
                              />
                            </div>
                          )}

                          {quizSubmitted && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                              <p className="font-semibold text-slate-900">Selected answer</p>
                              <p className="mt-2 text-slate-600">{selectedValue ?? 'No answer provided'}</p>
                            </div>
                          )}

                          {quizSubmitted && review?.explanation && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <BookOpen className="h-4 w-4" />
                                Explanation
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-600">{review.explanation}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <QuizProgressSidebar questions={activeQuiz.questions} answers={userAnswers} activeIndex={activeQuestionIndex} onNavigate={handleNavigateQuestion} />
              </div>

              {!quizSubmitted ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <Award className="h-4 w-4" />
                    Submit Quiz
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-20 text-center">
              <HelpCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700">No Quiz Loaded</h3>
              <p className="mt-2 text-sm text-slate-500">Select a document and generate a quiz to begin.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && summaryStats && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Quiz completed</p>
                    <h3 className="mt-3 text-3xl font-semibold text-slate-900">{summaryStats.score} / {summaryStats.total}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">Your submission is ready for review. Each result is now surfaced clearly so you can see what to revisit.</p>
                  </div>
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
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
                        animate={{ strokeDasharray: `${(summaryStats.accuracy / 100) * 264} 264` }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                      />
                    </svg>
                    <span className="absolute text-lg font-semibold text-slate-900">{summaryStats.accuracy}%</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Correct
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.correct}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      Incorrect
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.incorrect}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Clock3 className="h-4 w-4 text-indigo-600" />
                      Time
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.timeTakenFormatted}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                      Difficulty
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{summaryStats.difficulty}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={handleReviewAnswers} className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    <Eye className="h-4 w-4" />
                    Review Answers
                  </button>
                  <button type="button" onClick={handleGenerateAnother} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <RotateCcw className="h-4 w-4" />
                    Generate Another Quiz
                  </button>
                  <button type="button" onClick={handleViewAnalytics} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quizzes;
