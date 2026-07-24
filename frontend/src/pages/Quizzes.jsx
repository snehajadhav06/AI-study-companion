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
      setShowModal(true);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleNavigateQuestion = (index) => {
    setActiveQuestionIndex(index);
    const element = document.getElementById(`question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReviewAnswers = () => {
    setShowModal(false);
  };

  const handleGenerateAnother = () => {
    setShowModal(false);
    handleGenerate();
  };

  const handleViewAnalytics = () => {
    setShowModal(false);
    navigate('/dashboard');
  };

  const summaryStats = useMemo(() => {
    if (!submissionResult || !activeQuiz) return null;
    const correct = submissionResult.score;
    const total = activeQuiz.questions.length;
    const incorrect = total - correct;
    const accuracy = Math.round((correct / total) * 100);
    const timeTaken = submissionResult.time_taken_seconds;
    const timeTakenFormatted =
      timeTaken < 60
        ? `${timeTaken}s`
        : `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;

    return {
      correct,
      incorrect,
      total,
      accuracy,
      score: `${correct} / ${total}`,
      timeTakenFormatted,
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    };
  }, [submissionResult, activeQuiz, difficulty]);

  return (
    <div className="space-y-8 text-white text-left">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Practice Quizzes</h1>
          <p className="mt-1 text-sm text-gray-300">Focused practice designed to sharpen understanding and retention.</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#071020]/45 backdrop-blur-md px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 sm:w-56"
          >
            <option value="" className="bg-[#071020] text-white">Select document...</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-[#071020] text-white">{doc.filename}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#071020]/45 backdrop-blur-md px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 sm:w-32"
          >
            <option value="easy" className="bg-[#071020]">Easy</option>
            <option value="medium" className="bg-[#071020]">Medium</option>
            <option value="hard" className="bg-[#071020]">Hard</option>
          </select>

          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#071020]/45 backdrop-blur-md px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 sm:w-24"
          >
            <option value="3" className="bg-[#071020]">3 Qs</option>
            <option value="5" className="bg-[#071020]">5 Qs</option>
            <option value="10" className="bg-[#071020]">10 Qs</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!selectedDocId || generating}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="premium-card p-6">
          <h3 className="text-base font-bold mb-4">Saved Tests</h3>
          {quizzes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No quizzes generated yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition-all cursor-pointer ${
                    activeQuiz?.id === quiz.id 
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-transparent text-white shadow-md' 
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{quiz.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="premium-card p-6 lg:p-8">
          {activeQuiz ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                  <p className="mt-1 text-sm text-gray-300">Answer each prompt carefully and review the results once you submit.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
                    {activeQuiz.questions.length} questions
                  </div>
                  {!quizSubmitted && (
                    <div className="rounded-2xl border border-[#6366F1]/30 bg-[#6366F1]/10 px-4 py-2.5 text-sm font-semibold text-[#A78BFA]">
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
                        id={`question-${idx}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                      >
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-400">Question {idx + 1}</p>
                              <h3 className="mt-2 text-lg font-semibold">{question.question}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-300">
                                {question.type?.toUpperCase() || 'Q'}
                              </span>
                              {quizSubmitted && (
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCorrect ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-500/20' : 'bg-rose-950/20 text-rose-300 border border-rose-500/20'}`}>
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
                                const baseClass = 'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all w-full text-left';
                                const classes = {
                                  selected: 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white',
                                  correct: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
                                  incorrect: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
                                  neutral: 'border-white/10 bg-white/3 text-gray-300 hover:bg-white/5 hover:border-white/20',
                                }[state];

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => handleAnswerChange(idx, option)}
                                    className={`${baseClass} ${classes} ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                                  >
                                    <span>{option}</span>
                                    {state === 'correct' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : state === 'incorrect' ? <AlertCircle className="h-4 w-4 text-rose-400" /> : null}
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
                                const baseClass = 'rounded-2xl border px-5 py-3 text-sm transition-all';
                                const classes = {
                                  selected: 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white',
                                  correct: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
                                  incorrect: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
                                  neutral: 'border-white/10 bg-white/3 text-gray-300 hover:bg-white/5 hover:border-white/20',
                                }[state];

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => handleAnswerChange(idx, option)}
                                    className={`${baseClass} ${classes} ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {question.type === 'fitb' && (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
                              <input
                                type="text"
                                placeholder="Type your answer here..."
                                disabled={quizSubmitted}
                                value={selectedValue ?? ''}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-[#071020]/45 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15"
                              />
                            </div>
                          )}

                          {quizSubmitted && (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4 text-sm">
                              <p className="font-bold text-gray-300">Selected answer</p>
                              <p className="mt-2 text-white">{selectedValue ?? 'No answer provided'}</p>
                            </div>
                          )}

                          {quizSubmitted && review?.explanation && (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-[#6366F1]/5 p-4">
                              <div className="flex items-center gap-2 text-sm font-bold text-white">
                                <BookOpen className="h-4 w-4 text-[#A78BFA]" />
                                Explanation
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-200">{review.explanation}</p>
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
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Award className="h-4 w-4" />
                    Submit Quiz
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-20 text-center">
              <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-300">No Quiz Loaded</h3>
              <p className="mt-2 text-sm text-gray-400">Select a document and generate a quiz to begin.</p>
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
              className="fixed inset-0 z-55 flex items-center justify-center bg-[#071020]/60 px-4 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-3xl rounded-[28px] border border-white/15 bg-[#071020]/95 p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#A78BFA]">Quiz completed</p>
                    <h3 className="mt-3 text-3xl font-black text-white">{summaryStats.score}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-300">Your submission is ready for review. Each result is now surfaced clearly so you can see what to revisit.</p>
                  </div>
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#8B5CF6"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 264' }}
                        animate={{ strokeDasharray: `${(summaryStats.accuracy / 100) * 264} 264` }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                      />
                    </svg>
                    <span className="absolute text-lg font-bold text-white">{summaryStats.accuracy}%</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-300 justify-center sm:justify-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Correct
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{summaryStats.correct}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-300 justify-center sm:justify-start">
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      Incorrect
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{summaryStats.incorrect}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-300 justify-center sm:justify-start">
                      <Clock3 className="h-4 w-4 text-[#60A5FA]" />
                      Time
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{summaryStats.timeTakenFormatted}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-300 justify-center sm:justify-start">
                      <BookOpen className="h-4 w-4 text-[#A78BFA]" />
                      Difficulty
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{summaryStats.difficulty}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={handleReviewAnswers} className="flex items-center gap-2 rounded-2xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5356df] cursor-pointer">
                    <Eye className="h-4 w-4" />
                    Review Answers
                  </button>
                  <button type="button" onClick={handleGenerateAnother} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 cursor-pointer">
                    <RotateCcw className="h-4 w-4" />
                    Generate Another Quiz
                  </button>
                  <button type="button" onClick={handleViewAnalytics} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 cursor-pointer">
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
