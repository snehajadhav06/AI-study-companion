import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Copy, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Upload,
  Cpu,
  Shield,
  Lock,
  Database,
  Activity,
  Check,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';
import neuralBg from '../assets/neural-bg.png';

const Landing = () => {
  const { token } = useAuth();
  const [faqOpen, setFaqOpen] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('chat');
  const [demoAnswer, setDemoAnswer] = useState('');
  
  const fullAnswer = "Backpropagation is a supervised learning algorithm used for training artificial neural networks. It calculates the gradient of the loss function with respect to the network weights, moving backward layer by layer to minimize error.";

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated typing effect for the demo section
  useEffect(() => {
    let index = 0;
    setDemoAnswer('');
    const timer = setInterval(() => {
      if (index < fullAnswer.length) {
        setDemoAnswer((prev) => prev + fullAnswer.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const features = [
    { title: 'AI Chat Assistance', desc: 'Ask complex academic questions and get immediate responses grounded directly in your uploaded notes.', icon: MessageCircle, color: '#6366F1' },
    { title: 'Dynamic Flashcards', desc: 'Accelerate learning retention with automatically generated flashcards optimized for spaced repetition.', icon: Copy, color: '#8B5CF6' },
    { title: 'Progress Analytics', desc: 'Monitor study streaks, quiz performance, and pinpoint weak spots with actionable analytics dashboards.', icon: BarChart3, color: '#06B6D4' },
  ];

  const timelineSteps = [
    { step: '1', title: 'Upload Study Documents', desc: 'Securely upload PDFs, DOCX, TXT, or PPTX slides to your private workspace.' },
    { step: '2', title: 'AI Analysis & Indexing', desc: 'StudyAI extracts, moderates, and splits text into secure, vectorized embeddings.' },
    { step: '3', title: 'Ask Questions', desc: 'Query your documents directly and receive precise answers complete with page citations.' },
    { step: '4', title: 'Interactive Practice', desc: 'Instantly generate custom quizzes and study plans from your uploaded material.' },
    { step: '5', title: 'Track Learning Progress', desc: 'Keep track of streaks, review cards, and boost your exam readiness.' }
  ];

  const moderationFeatures = [
    { title: 'Safe Document Uploads', desc: 'Extracts and parses document text to automatically filter out inappropriate material before indexing.', icon: Upload },
    { title: 'Two-Layer AI Safety', desc: 'Uses a fast, local keyword filter combined with LLM moderation to keep all discussions clean.', icon: Shield },
    { title: 'Prompt Injection Defense', desc: 'Ignores instructions within documents that attempt to override helper prompt guidelines.', icon: Lock },
    { title: 'Student-Friendly Content', desc: 'Strictly restricts the generator output to educational, study-oriented, and academic topics.', icon: Cpu }
  ];

  const privacyFeatures = [
    { title: 'Encrypted Uploads', desc: 'All uploaded files are fully encrypted in transit and stored in isolated sandbox storage.', icon: Lock },
    { title: 'Private Vector Database', desc: 'Embeddings are kept local to your account and never shared or used to train public LLMs.', icon: Database },
    { title: 'Grounded Citations', desc: 'Every AI answer links back to exact page citations, preventing hallunications and inaccuracies.', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen text-white flex flex-col font-sans relative overflow-hidden bg-[#071020]">
      {/* Styles for premium animations */}
      <style>{`
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .bg-zoom {
          animation: slowZoom 60s ease-in-out infinite;
        }
        .animate-float {
          animation: floating 6s ease-in-out infinite;
        }
        .premium-text-gradient {
          background: linear-gradient(135deg, #ffffff 30%, #a78bfa 70%, #6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 8s linear infinite;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: none;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .glass-panel-hover:hover {
          background: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), 0 12px 40px rgba(139, 92, 246, 0.15);
          transform: translateY(-3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-zoom, .animate-float, .premium-text-gradient {
            animation: none !important;
          }
          .glass-panel-hover {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Full-screen Neural Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-zoom pointer-events-none"
        style={{ 
          backgroundImage: `url(${neuralBg})`,
        }}
      />

      {/* Deep Blue/Purple Translucent Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(7, 16, 32, 0.85), rgba(12, 20, 45, 0.75), rgba(18, 28, 60, 0.85))'
        }}
      />

      {/* NAVBAR */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 40 
            ? 'py-3 bg-[#071020]/75 border-b border-white/10 backdrop-blur-md shadow-lg shadow-black/20' 
            : 'py-5 bg-transparent border-b border-transparent backdrop-blur-none'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-2 hover:scale-102 transition-transform duration-200">
            <img src={logo} alt="StudyAI logo" className="h-6 w-auto filter drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
            <span className="text-lg font-black tracking-wider text-white">StudyAI</span>
          </Link>
          
          {!token && (
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-gray-300">
              <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
              <a href="#moderation" className="hover:text-white transition-colors duration-200">Safety System</a>
              <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
            </nav>
          )}

          <Link 
            to={token ? "/dashboard" : "/login"}
            className="text-white text-xs font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:-translate-y-0.5 transition-all duration-200"
          >
            {token ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#A78BFA] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Learning Space</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight premium-text-gradient">
              Study Smarter.<br />Not Harder.
            </h1>
            
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg">
              Upload your textbooks, notes, and study slides. Chat with PDFs, auto-generate quizzes, flashcards, summaries, and personalized study planners instantly.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to={token ? "/dashboard" : "/login"}
                className="text-white text-xs font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a 
                href="#how-it-works"
                className="text-white text-xs font-bold px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                Live Demo
              </a>
            </div>

            <div className="pt-4 text-[11px] text-gray-400 font-medium">
              ✦ Trusted by next-gen students worldwide. Safe & compliant environment.
            </div>
          </div>

          {/* Hero Right: Interactive Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-[#8b5cf6]/10 rounded-2xl blur-3xl -z-10" />
            <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/15 animate-float">
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-white/10 pb-3 mb-4">
                {['chat', 'flashcards', 'quiz', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${
                      activeTab === tab 
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md' 
                        : 'text-gray-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="h-64 rounded-xl p-4 bg-black/40 border border-white/5 flex flex-col justify-between text-left">
                {activeTab === 'chat' && (
                  <div className="space-y-3 flex-1 flex flex-col justify-end text-xs">
                    <div className="self-start bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 max-w-[85%]">
                      Explain the function of mitochondria.
                    </div>
                    <div className="self-end bg-[#6366F1]/20 border border-[#6366F1]/30 rounded-xl px-3 py-2 text-white max-w-[85%] space-y-1">
                      <p>Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.</p>
                      <span className="inline-block text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">Page 12, Biology_101.pdf</span>
                    </div>
                  </div>
                )}

                {activeTab === 'flashcards' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-56 h-36 rounded-xl border border-white/15 bg-white/5 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-[#8B5CF6] transition-colors">
                      <div className="text-[9px] text-[#A78BFA] font-bold uppercase tracking-wider mb-2">Front</div>
                      <div className="text-xs font-bold">What is backpropagation?</div>
                    </div>
                    <div className="text-[10px] text-gray-400">Click card to reveal definition</div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="flex-1 flex flex-col justify-center space-y-3 text-xs">
                    <div className="font-bold text-gray-200">Question 1: What is the main product of cellular respiration?</div>
                    <div className="space-y-2">
                      {['ATP (Adenosine Triphosphate)', 'Glucose', 'Oxygen'].map((opt, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${
                          i === 0 ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-white' : 'bg-white/5 border-white/10 text-gray-300'
                        }`}>
                          <div className={`h-3 w-3 rounded-full flex items-center justify-center text-[8px] ${
                            i === 0 ? 'bg-[#06B6D4] text-black font-bold' : 'border border-gray-400'
                          }`}>{i === 0 && <Check className="h-2 w-2 stroke-[3]" />}</div>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400">Streak</div>
                        <div className="text-lg font-black text-[#A78BFA]">12 Days</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400">Accuracy</div>
                        <div className="text-lg font-black text-[#06B6D4]">94%</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400">Quizzes</div>
                        <div className="text-lg font-black text-[#8B5CF6]">24 Done</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-2.5 text-[10px] text-gray-300">
                      <Activity className="h-4 w-4 text-[#06B6D4] animate-pulse" />
                      <span>Weak spot detected: Mitochondria ATP syntheses. Generating practice flashcards...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURE CARDS */}
      <section id="features" className="relative z-10 py-16 sm:py-24 px-6 text-center bg-[#071020]/40">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Powerful AI Study Companion</h2>
            <p className="text-sm sm:text-base text-gray-400">Everything you need to master your courses, built with speed and elegance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-panel glass-panel-hover p-8 rounded-[22px] text-left transition-all duration-300 group">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-6 border"
                    style={{ 
                      borderColor: `${item.color}30`, 
                      background: `${item.color}12`,
                      color: item.color
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO ACCORDION */}
      <section className="relative z-10 py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Interactive AI Demo</h2>
            <p className="text-xs sm:text-sm text-gray-400">Watch the AI extract, reason, and cite document context in real time.</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/15">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Question Left */}
              <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between text-left">
                <div>
                  <div className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-wider mb-2">User Query</div>
                  <p className="text-sm font-bold">"What is backpropagation?"</p>
                </div>
                <div className="pt-4 border-t border-white/5 mt-6 text-[10px] text-gray-400">
                  Target context: Biology & Computer Science notes
                </div>
              </div>

              {/* Response Right */}
              <div className="md:col-span-8 bg-black/40 border border-white/5 rounded-xl p-4 text-left flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="text-[10px] text-[#06B6D4] font-bold uppercase tracking-wider mb-2">AI Response</div>
                  <p className="text-xs text-gray-200 leading-relaxed font-mono min-h-[80px]">
                    {demoAnswer}
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-white animate-pulse" />
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <div className="inline-flex items-center gap-1 text-[9px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-semibold">
                    Page 42, notes.pdf
                  </div>
                  <div className="text-[9px] text-[#06B6D4] font-bold">
                    Confidence Indicator: 99.8%
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-24 px-6 bg-[#071020]/40">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-sm text-gray-400">Five automated steps from document uploads to full mastery.</p>
          </div>

          <div className="relative">
            {/* Timeline center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent -translate-y-1/2 hidden lg:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {timelineSteps.map((node, i) => (
                <div key={i} className="glass-panel glass-panel-hover p-6 rounded-2xl text-left relative z-10 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-xs font-bold text-white mb-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                      {node.step}
                    </span>
                    <h4 className="text-sm font-bold text-white mb-1.5">{node.title}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '10K+', title: 'Study Sessions' },
              { num: '95%', title: 'Quiz Accuracy' },
              { num: '1M+', title: 'Questions Answered' },
              { num: '100%', title: 'Private Documents' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{stat.num}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT MODERATION SECTION */}
      <section id="moderation" className="relative z-10 py-16 sm:py-24 px-6 bg-[#071020]/40">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA]">
              <Shield className="h-3.5 w-3.5" />
              <span>Full Content Safety Compliance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Content Safety & Moderation</h2>
            <p className="text-sm text-gray-400">
              StudyAI includes a multi-layered safety moderation system, ensuring the workspace remains academic, appropriate, and strictly educational.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moderationFeatures.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-panel glass-panel-hover p-6 rounded-2xl text-left flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mb-4 text-[#A78BFA]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 max-w-3xl mx-auto text-xs text-gray-300 leading-relaxed text-center">
            🔒 <strong>System Safety Notice:</strong> All uploads containing inappropriate or off-topic material are filtered out. Prompts mimicking jailbreaking or code injections are intercepted before indexing.
          </div>
        </div>
      </section>

      {/* PRIVACY SECTION */}
      <section className="relative z-10 py-16 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Designed for Privacy & Security</h2>
            <p className="text-sm text-gray-400">Your research notes and documents stay strictly yours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {privacyFeatures.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-panel glass-panel-hover p-7 rounded-2xl text-left">
                  <Icon className="h-6 w-6 mb-4 text-[#6366F1]" />
                  <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 px-6 bg-[#071020]/40">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              { q: 'How does the AI process documents?', a: 'Upon uploading a document, text is extracted and sanitized. Safe content is split into context-rich chunks and stored as embeddings inside a private vector index. When you ask questions, only relevant chunks are retrieved to ground the LLM response.' },
              { q: 'Which file formats does StudyAI support?', a: 'StudyAI fully supports PDF, DOCX, TXT, and PPTX formats.' },
              { q: 'Does StudyAI store blocked content?', a: 'No. Documents containing flagged or inappropriate keywords are rejected synchronously on upload, fully cleaned up from our workspace directories, and only metadata (timestamp and reason) is retained in safety logs.' },
              { q: 'Is my data secure?', a: 'Yes. Files and database records are private to your authenticated user account, hosted on isolated server instances, and never shared for external LLM model training.' }
            ].map((faq, idx) => (
              <div key={idx} className="glass-panel rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex justify-between items-center text-sm font-bold text-white text-left hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-[#A78BFA] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronRight className={`h-4.5 w-4.5 text-[#a78bfa] transition-transform duration-200 shrink-0 ${faqOpen[idx] ? 'rotate-90' : ''}`} />
                </button>
                {faqOpen[idx] && (
                  <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-4 bg-white/2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-20 sm:py-32 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B5CF6]/5 to-transparent pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">Ready to Learn Smarter?</h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Create your account now to start studying textbook content, querying PDFs, and tracking progress with automated study guides.
          </p>
          <div className="pt-2">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#071020]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-12 mb-12">
            <div className="space-y-4 max-w-xs text-left">
              <div className="flex items-center gap-2">
                <img src={logo} alt="StudyAI logo" className="h-5 w-auto" />
                <span className="text-sm font-extrabold text-white">StudyAI</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Next-generation learning companion for notes, flashcards, summaries, and quizzes. Safe and grounded educational workspace.
              </p>
            </div>
            
            <div className="flex gap-16 text-left">
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Product</h4>
                <div className="space-y-2 text-xs text-gray-400 font-semibold">
                  <p className="hover:text-white cursor-pointer transition-colors duration-150">AI Chat</p>
                  <p className="hover:text-white cursor-pointer transition-colors duration-150">Summaries</p>
                  <p className="hover:text-white cursor-pointer transition-colors duration-150">Flashcards</p>
                  <p className="hover:text-white cursor-pointer transition-colors duration-150">Quizzes</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Socials</h4>
                <div className="space-y-2 text-xs text-gray-400 font-semibold">
                  <a
                    href="https://github.com/snehajadhav06"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-white transition-colors duration-150"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/snehajadhav77/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-white transition-colors duration-150"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400">
            <div>
              © {new Date().getFullYear()} StudyAI. All rights reserved.
            </div>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors duration-150">Documentation</span>
              <span className="hover:text-white cursor-pointer transition-colors duration-150">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors duration-150">Terms</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;