import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  Check, 
  X, 
  Award,
  BookOpen
} from 'lucide-react';

const Quizzes = () => {
  const location = useLocation();
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchQuizzes(selectedDocId);
    }
  }, [selectedDocId]);

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
    setQuizSubmitted(false);
    setSubmissionResult(null);
  };

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/api/quizzes/generate', {
        document_id: parseInt(selectedDocId),
        num_questions: parseInt(numQuestions),
        difficulty: difficulty
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
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    
    const answersList = [];
    for (let i = 0; i < activeQuiz.questions.length; i++) {
      answersList.push(userAnswers[i] || '');
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/quizzes/${activeQuiz.id}/submit`, {
        answers: answersList
      });
      setSubmissionResult(response.data);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Practice Quizzes</h1>
          <p className="text-slate-500 mt-1">Challenge your comprehension levels with practice tests.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-805 focus:outline-none focus:border-indigo-500 text-sm w-full sm:w-56"
          >
            <option value="">Select document...</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-805 focus:outline-none focus:border-indigo-500 text-sm w-full sm:w-32"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-805 focus:outline-none focus:border-indigo-500 text-sm w-full sm:w-24"
          >
            <option value="3">3 Qs</option>
            <option value="5">5 Qs</option>
            <option value="10">10 Qs</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!selectedDocId || generating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all text-sm disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-100"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="premium-card p-6 h-fit">
          <h3 className="text-md font-bold text-slate-800 mb-4">Saved Tests</h3>
          {quizzes.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">No quizzes generated yet.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz)}
                  className={`w-full text-left p-3 rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                    activeQuiz?.id === quiz.id
                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold'
                      : 'bg-slate-50/50 border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="truncate text-xs">{quiz.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 premium-card p-8">
          {activeQuiz ? (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">{activeQuiz.title}</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Answer the following questions carefully.</p>
              </div>

              <div className="space-y-8">
                {activeQuiz.questions.map((q, idx) => {
                  const hasAnswered = userAnswers[idx] !== undefined;
                  const isCorrect = userAnswers[idx]?.toString().toLowerCase() === q.correct_answer?.toString().toLowerCase();

                  return (
                    <div key={idx} className="space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                      <div className="flex gap-2.5 items-start">
                        <span className="font-bold text-indigo-600 text-sm mt-0.5">{idx + 1}.</span>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.question}</p>
                      </div>

                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                          {q.options.map((opt) => {
                            const isSelected = userAnswers[idx] === opt;
                            let btnStyle = "bg-white border-slate-205 hover:border-indigo-400/50 text-slate-700";
                            
                            if (isSelected) {
                              btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-600 font-bold";
                            }
                            
                            if (quizSubmitted) {
                              const isOptionCorrect = opt.toString().toLowerCase() === q.correct_answer?.toString().toLowerCase();
                              if (isOptionCorrect) {
                                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
                              } else if (isSelected && !isCorrect) {
                                btnStyle = "bg-red-50 border-red-500 text-red-700";
                              } else {
                                btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => handleAnswerChange(idx, opt)}
                                className={`text-left p-3.5 border rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && opt.toString().toLowerCase() === q.correct_answer?.toString().toLowerCase() && (
                                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'tf' && (
                        <div className="flex gap-4 pl-6">
                          {['True', 'False'].map((opt) => {
                            const isSelected = userAnswers[idx] === opt;
                            let btnStyle = "bg-white border-slate-205 hover:border-indigo-400/50 text-slate-700";
                            
                            if (isSelected) {
                              btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-600 font-bold";
                            }
                            
                            if (quizSubmitted) {
                              const isOptionCorrect = opt.toLowerCase() === q.correct_answer?.toLowerCase();
                              if (isOptionCorrect) {
                                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
                              } else if (isSelected && !isCorrect) {
                                btnStyle = "bg-red-50 border-red-500 text-red-700";
                              } else {
                                btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => handleAnswerChange(idx, opt)}
                                className={`px-6 py-2.5 border rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'fitb' && (
                        <div className="pl-6 space-y-2">
                          <input
                            type="text"
                            placeholder="Type your answer here..."
                            disabled={quizSubmitted}
                            value={userAnswers[idx] || ''}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400"
                          />
                          {quizSubmitted && (
                            <p className="text-xs text-emerald-600 font-bold">
                              Correct answer: <span className="underline">{q.correct_answer}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {quizSubmitted && q.explanation && (
                        <div className="mt-3 pl-6 py-2.5 border-l-2 border-indigo-500/50 text-xs text-slate-500 bg-indigo-50/50 px-3 rounded-r-xl">
                          <span className="font-bold text-slate-800 block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-100"
                >
                  <Award className="h-5 w-5" />
                  Submit Answers
                </button>
              ) : (
                submissionResult && (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2">
                    <h3 className="text-lg font-bold text-emerald-950">Quiz Completed!</h3>
                    <p className="text-3xl font-extrabold text-emerald-600">
                      {submissionResult.score} / {submissionResult.total_questions}
                    </p>
                    <p className="text-xs text-slate-500">
                      Your score has been saved to your analytics profile. You achieved {Math.round((submissionResult.score/submissionResult.total_questions)*100)}% accuracy.
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <HelpCircle className="h-12 w-12 text-slate-305 mx-auto mb-4" />
              <h3 className="text-md font-bold text-slate-400">No Quiz Loaded</h3>
              <p className="text-xs text-slate-400 mt-1">Select a document and click Generate above to create a test.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
