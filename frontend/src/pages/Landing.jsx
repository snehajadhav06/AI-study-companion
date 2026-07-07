import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Copy, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Info,
  Check,
  AlertTriangle,
  Lightbulb,
  Play,
  RotateCw,
  Award,
  ListTodo,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const { token } = useAuth();
  const [activePreviewTab, setActivePreviewTab] = useState('chat');
  const [faqOpen, setFaqOpen] = useState({});
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [plannerTaskDone, setPlannerTaskDone] = useState({ 1: true, 2: false });

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const whyChooseFeatures = [
    { title: 'Upload PDFs', desc: 'Upload textbooks, notes, assignments, and lecture slides.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'AI Chat', desc: 'Ask unlimited questions based on your own study materials.', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Smart Summaries', desc: 'Generate chapter-wise summaries in seconds.', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Flashcards', desc: 'Automatically create flashcards for active recall.', icon: Copy, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'AI Quiz Generator', desc: 'Practice with personalized quizzes and instant feedback.', icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Study Planner', desc: 'Generate an intelligent study schedule based on deadlines.', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Learning Analytics', desc: 'Track strengths, weaknesses, streaks, and overall progress.', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Adaptive Revision', desc: 'Receive personalized recommendations on what to study next.', icon: Lightbulb, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex flex-col selection:bg-indigo-500/10 selection:text-indigo-650 font-sans">
      <header className="w-full bg-[#111827] border-b border-gray-800 sticky top-0 z-50">
        <div className="responsive-container py-4 flex justify-between items-center">
          <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-90">
            <Sparkles className="h-6 w-6 text-[#4F46E5] fill-[#4F46E5]/20" />
            <span className="text-xl font-extrabold tracking-wider text-white">StudyAI</span>
          </Link>
          {!token && (
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-300">
              <a href="#features" className="hover:text-white transition-all">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-all">How It Works</a>
              <a href="#tech-stack" className="hover:text-white transition-all">Tech Stack</a>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              {token ? "Dashboard" : "Get Started Free"}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-20 pb-16 bg-[#111827] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="responsive-container grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#4F46E5]/15 border border-[#4F46E5]/30 text-[#818CF8] rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Supercharge Your Academic Success
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
              Study Smarter. <br />
              Learn Faster. <br />
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">Powered by AI.</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed font-medium">
              Upload PDFs, textbooks, slides, and notes. Instantly ask questions cited from your documents, practice with quizzes, study via Leitner flashcards, and track progress on a custom study plan.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to={token ? "/dashboard" : "/login"}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#4F46E5]/30 cursor-pointer text-base"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href="#how-it-works"
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-base"
              >
                <Play className="h-4 w-4 fill-white" />
                How It Works
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="bg-[#1F2937]/80 backdrop-blur-md border border-gray-700/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-700/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-400 font-bold">Interactive System Preview</span>
              </div>
              
              <div className="flex gap-2 border-b border-gray-700/40 pb-3 mb-4">
                {['chat', 'flashcards', 'quiz', 'planner'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePreviewTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePreviewTab === tab
                        ? 'bg-[#4F46E5] text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {activePreviewTab === 'chat' && (
                <div className="space-y-4 text-left min-h-[220px] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700/40 text-xs">
                      <p className="text-[#818CF8] font-bold mb-1">Student</p>
                      <p className="text-gray-300">What is backpropagation in neural networks?</p>
                    </div>
                    <div className="bg-[#4F46E5]/10 p-3.5 border border-[#4F46E5]/20 rounded-xl text-xs space-y-2">
                      <p className="text-[#06B6D4] font-bold">AI Assistant</p>
                      <p className="text-gray-300 leading-relaxed">
                        Backpropagation is an algorithm used to train neural networks by calculating the gradient of the loss function.
                      </p>
                      <span className="inline-block bg-[#4F46E5]/20 text-[#818CF8] px-2 py-0.5 rounded text-[10px] font-bold">
                        Source: Page 42, Deep Learning textbook.pdf
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-700/40 pt-3">
                    <input readOnly value="Ask a question..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 outline-none" />
                    <button className="bg-[#4F46E5] p-2 rounded-lg text-white"><ArrowRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}

              {activePreviewTab === 'flashcards' && (
                <div className="min-h-[220px] flex flex-col justify-between items-center py-4">
                  <div 
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    className="w-full max-w-[280px] h-36 bg-gray-800 border border-gray-700 rounded-xl flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden transition-all hover:border-indigo-400"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                      <span>Recall Card</span>
                      <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded">Hard</span>
                    </div>
                    <div className="text-center font-bold text-sm text-white">
                      {flashcardFlipped 
                        ? "Gradient descent optimization algorithm" 
                        : "What algorithm updates neural network weights?"
                      }
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-400 font-semibold">
                      <RotateCw className="h-3 w-3" />
                      <span>{flashcardFlipped ? "Click to view question" : "Click to view answer"}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">Interactive: click the card to flip it</span>
                </div>
              )}

              {activePreviewTab === 'quiz' && (
                <div className="min-h-[220px] text-left flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                      <span>Quiz Mode</span>
                      <span>Timer: 0:42</span>
                    </div>
                    <p className="text-xs font-bold text-white">Which loss function is best for binary classification?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'a', text: 'Mean Squared Error' },
                        { id: 'b', text: 'Binary Cross-Entropy' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setSelectedQuizOption(opt.id); setQuizSubmitted(true); }}
                          className={`p-3 border rounded-xl text-left text-[11px] font-semibold transition-all cursor-pointer ${
                            selectedQuizOption === opt.id
                              ? opt.id === 'b'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-red-500/20 border-red-500 text-red-400'
                              : 'bg-gray-800 border-gray-700 text-gray-300'
                          }`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        Binary Cross-Entropy penalizes wrong predictions strictly for 0/1 classes.
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 text-center">Interactive: choose an option</span>
                </div>
              )}

              {activePreviewTab === 'planner' && (
                <div className="min-h-[220px] text-left flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-1">
                      <span>Study Planner</span>
                      <span>Estimated: 2.5 hours</span>
                    </div>
                    {[
                      { id: 1, text: 'Review page 10-25 of Deep Learning notes', tag: 'High' },
                      { id: 2, text: 'Practice 5 binary cross-entropy quiz questions', tag: 'Medium' }
                    ].map((task) => (
                      <div key={task.id} className="p-3 bg-gray-800 border border-gray-700/60 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={plannerTaskDone[task.id]} 
                            onChange={() => setPlannerTaskDone(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                            className="cursor-pointer"
                          />
                          <span className={`text-xs ${plannerTaskDone[task.id] ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {task.text}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          task.tag === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {task.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 text-center">Interactive: toggle the tasks</span>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-10">
        <div className="responsive-container text-center space-y-6">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Helping thousands of learners study more efficiently
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-20 text-slate-400 font-bold text-sm">
            <span>Engineering Students</span>
            <span>MIT Researchers</span>
            <span>AI Enthusiasts</span>
            <span>Medical Learners</span>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 responsive-container text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Why Choose AI Study Companion</h2>
          <p className="text-slate-500 font-medium">An all-in-one suite designed to extract wisdom from notes and fast-track learning.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="premium-card p-6 text-left flex flex-col justify-between">
                <div>
                  <div className={`p-3.5 rounded-2xl ${item.bg} w-fit mb-5`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#EEF2F7] py-20">
        <div className="responsive-container text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 font-medium">Six simple steps to master any complex subject with RAG intelligence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            {[
              { step: '1', title: 'Upload Notes', desc: 'Drag-and-drop PDFs, textbooks, or slides.' },
              { step: '2', title: 'AI Extraction', desc: 'AI indexing parses layout and terms.' },
              { step: '3', title: 'Ask Naturally', desc: 'Type queries in normal language.' },
              { step: '4', title: 'Get Answers', desc: 'Receive response cited page-by-page.' },
              { step: '5', title: 'Quiz & Recall', desc: 'Review flashcards and custom tests.' },
              { step: '6', title: 'Track Stats', desc: 'Check streaks and weak analytics.' }
            ].map((node, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-left space-y-4 relative flex flex-col justify-between">
                <div>
                  <span className="flex-shrink-0 h-6 w-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{node.step}</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-3">{node.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 responsive-container text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Traditional vs AI Study Companion</h2>
          <p className="text-slate-500 font-medium">Compare the difference in efficiency and recall.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          <div className="premium-card p-8 bg-white border-rose-200/60 text-left space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Traditional Studying</span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Inefficient</span>
            </h3>
            <ul className="space-y-3.5">
              {[
                'Reading entire textbooks cover-to-cover',
                'Manual, time-consuming note-taking',
                'Random, unstructured revision schedules',
                'No progress logs or weakness identification'
              ].map((item, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 font-medium">
                  <ThumbsDown className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="premium-card p-8 bg-white border-indigo-200 text-left space-y-6 shadow-indigo-100/40 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>AI Study Companion</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Adaptive</span>
            </h3>
            <ul className="space-y-3.5">
              {[
                'Instant AI explanations directly from specific pages',
                'Smart chapter summaries and auto-generated terms',
                'Intelligent custom practice tests and explanations',
                'Adaptive study plans tailored to deadlines and goals'
              ].map((item, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700 font-bold">
                  <ThumbsUp className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#111827] text-white py-20">
        <div className="responsive-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { metric: '10,000+', label: 'Questions Answered' },
            { metric: '500+', label: 'Study Hours Saved' },
            { metric: '95%', label: 'Student Satisfaction' },
            { metric: '1,000+', label: 'Documents Processed' }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">{stat.metric}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tech-stack" className="py-20 responsive-container text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Security & Privacy</h2>
          <p className="text-slate-500 font-medium">Your data belongs to you. Fully sandboxed and private.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Encrypted Uploads', desc: 'Secure transit with full TLS configurations and safe database instances.' },
            { title: 'Private Indexing', desc: 'Your PDFs are processed in secure isolated environments, never shared.' },
            { title: 'Local Context only', desc: 'AI retrieves grounding details strictly from files you upload.' }
          ].map((item, i) => (
            <div key={i} className="premium-card p-6 text-left space-y-3">
              <ShieldCheck className="h-8 w-8 text-[#4F46E5]" />
              <h4 className="text-base font-extrabold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EEF2F7] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            {[
              { q: 'How does the AI work?', a: 'We use Retrieval-Augmented Generation (RAG) to locate relevant chunks inside your PDFs and pass them as secure references to our LLM models for precise answers.' },
              { q: 'Which file formats are supported?', a: 'Currently we support PDF documents. We plan to support EPUB, TXT, and DOCX formats in upcoming versions.' },
              { q: 'Is my data secure?', a: 'Yes. All uploads are private to your user account and are processed on secure cloud databases.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex justify-between items-center text-sm font-bold text-slate-950 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${faqOpen[idx] ? 'rotate-90' : ''}`} />
                </button>
                {faqOpen[idx] && (
                  <div className="p-5 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-slate-50/30 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#111827] to-[#1F2937] text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to transform the way you study?</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto font-medium">Join thousands of students extracting clear answers, quiz logs, and planner paths from their notes.</p>
          <div className="flex justify-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-8 py-4 rounded-xl shadow-lg cursor-pointer transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="responsive-container grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-slate-500 font-semibold mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-bold text-slate-900">StudyAI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Grounded learning companion helping students structure notes and quizzes.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">Product</h4>
            <p className="hover:text-indigo-650 cursor-pointer">AI Chat</p>
            <p className="hover:text-indigo-650 cursor-pointer">Summaries</p>
            <p className="hover:text-indigo-650 cursor-pointer">Flashcards</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">Company</h4>
            <p className="hover:text-indigo-650 cursor-pointer">Privacy Policy</p>
            <p className="hover:text-indigo-650 cursor-pointer">Terms of Service</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">Socials</h4>
            <p className="hover:text-indigo-650 cursor-pointer">GitHub</p>
            <p className="hover:text-indigo-650 cursor-pointer">LinkedIn</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-slate-100 pt-6 text-center text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} StudyAI. Built for next-generation learners.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
