import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Copy, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';
const Landing = () => {
  const { token } = useAuth();
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const features = [
    { title: 'AI chat', desc: 'Ask anything, cited to the page.', icon: MessageCircle, color: '#7c3aed' },
    { title: 'Flashcards', desc: 'Spaced repetition, made for you.', icon: Copy, color: '#2563eb' },
    { title: 'Progress', desc: 'Streaks, accuracy, weak spots.', icon: BarChart3, color: '#059669' },
  ];

  return (
    <div className="min-h-screen text-[#2e2350] flex flex-col font-sans relative overflow-hidden">

      <div className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,139,250,0.35), rgba(168,139,250,0))' }}></div>
      <div className="pointer-events-none absolute top-40 -right-16 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.3), rgba(110,231,183,0))' }}></div>
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.3), rgba(147,197,253,0))' }}></div>

      <header className="w-full sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <div className="responsive-container py-4 flex justify-between items-center relative">
          <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img src={logo} alt="StudyAI logo" className="h-6 w-auto" />
            <span className="text-lg font-extrabold text-[#3730a3]">StudyAI</span>
          </Link>
          {!token && (
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#6d5b9c]">
              <a href="#features" className="hover:text-[#3730a3] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#3730a3] transition-colors">How it works</a>
              <a href="#faq" className="hover:text-[#3730a3] transition-colors">FAQ</a>
            </div>
          )}
          <Link 
            to={token ? "/dashboard" : "/login"}
            className="text-white text-xs font-bold px-5 py-2.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
          >
            {token ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </header>

      <section className="relative py-16 sm:py-24 text-center">
        <div className="responsive-container max-w-2xl mx-auto relative z-10">
          <div 
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)', color: '#6d28d9' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Soft, focused studying
          </div>
          <h1 
            className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg, #4c1d95, #1e3a8a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
          >
            Study in a calmer space,<br />powered by AI.
          </h1>
          <p className="text-sm text-[#5b5b7a] leading-relaxed max-w-md mx-auto mb-8">
            Upload your notes, ask questions, and get gentle guidance through every subject.
          </p>
          <div className="flex justify-center gap-3">
            <Link 
              to={token ? "/dashboard" : "/login"}
              className="text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a 
              href="#how-it-works"
              className="text-[#3730a3] text-xs font-bold px-6 py-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-6 pb-16">
        <div className="responsive-container relative z-10">
          <div 
            className="max-w-lg mx-auto rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 32px rgba(124,58,237,0.12)' }}
          >
            <div className="text-[10px] font-bold text-[#7c5cbf] mb-2.5">AI ASSISTANT</div>
            <div className="rounded-xl px-3 py-2.5 text-xs text-[#4b3a6b] mb-2" style={{ background: 'rgba(255,255,255,0.6)' }}>
              What is backpropagation?
            </div>
            <div 
              className="rounded-xl px-3 py-2.5 text-xs text-[#3730a3] leading-relaxed"
              style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(96,165,250,0.18))' }}
            >
              It trains a network by propagating loss gradients backward through each layer.
              <span 
                className="inline-block text-[9px] px-2 py-0.5 rounded-md mt-2"
                style={{ background: 'rgba(255,255,255,0.6)', color: '#6d28d9' }}
              >
                Page 42, notes.pdf
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-16 sm:py-20 text-center">
        <div className="responsive-container relative z-10">
          <div className="space-y-3 max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3730a3]">Why choose AI Study Companion</h2>
            <p className="text-sm text-[#6d5b9c] font-medium">Everything you need, wrapped in a calmer place to study.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="premium-card p-6 text-left">
                  <Icon className="h-6 w-6 mb-3" style={{ color: item.color }} />
                  <h4 className="text-sm font-bold text-[#3730a3] mb-1">{item.title}</h4>
                  <p className="text-xs text-[#6d5b9c] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-16 sm:py-20 text-center">
        <div className="responsive-container relative z-10">
          <div className="space-y-3 max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3730a3]">How it works</h2>
            <p className="text-sm text-[#6d5b9c] font-medium">Four gentle steps from notes to mastery.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Upload notes', desc: 'Drag in a PDF, textbook, or slide deck.' },
              { step: '2', title: 'Ask naturally', desc: 'Type a question like you would to a tutor.' },
              { step: '3', title: 'Get an answer', desc: 'Cited straight back to the page it came from.' },
              { step: '4', title: 'Practice it', desc: 'Flashcards and quizzes from the same notes.' },
            ].map((node, i) => (
              <div key={i} className="premium-card p-5 text-left">
                <span 
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white mb-3"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
                >
                  {node.step}
                </span>
                <h4 className="text-xs font-bold text-[#3730a3]">{node.title}</h4>
                <p className="text-[11px] text-[#6d5b9c] mt-1 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 text-center">
        <div className="responsive-container relative z-10">
          <div className="space-y-3 max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3730a3]">Built with privacy in mind</h2>
            <p className="text-sm text-[#6d5b9c] font-medium">Your notes stay yours, fully sandboxed and private.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { title: 'Encrypted uploads', desc: 'Secure transit and safe database instances.' },
              { title: 'Private indexing', desc: 'PDFs are processed in isolated environments.' },
              { title: 'Local context only', desc: 'Answers pull strictly from files you upload.' }
            ].map((item, i) => (
              <div key={i} className="premium-card p-6 text-left">
                <ShieldCheck className="h-6 w-6 mb-3 text-[#7c3aed]" />
                <h4 className="text-sm font-bold text-[#3730a3] mb-1">{item.title}</h4>
                <p className="text-xs text-[#6d5b9c] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-16 sm:py-20">
        <div className="responsive-container relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3730a3] text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {[
              { q: 'How does the AI work?', a: 'It uses retrieval-augmented generation to locate relevant chunks inside your PDFs and passes them as references to an LLM for precise answers.' },
              { q: 'Which file formats are supported?', a: 'Currently PDF documents. EPUB, TXT, and DOCX support is planned.' },
              { q: 'Is my data secure?', a: 'Yes. Uploads are private to your account and processed on secure cloud databases.' }
            ].map((faq, idx) => (
              <div key={idx} className="premium-card overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex justify-between items-center text-xs font-bold text-[#3730a3] text-left"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-4 w-4 text-[#a78bfa] transition-transform ${faqOpen[idx] ? 'rotate-90' : ''}`} />
                </button>
                {faqOpen[idx] && (
                  <div className="px-4 pb-4 text-xs text-[#6d5b9c] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 text-center">
        <div className="responsive-container relative z-10 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#3730a3] mb-3">Ready to study smarter?</h2>
          <p className="text-xs text-[#6d5b9c] mb-6 leading-relaxed">
            Join students turning their notes into answers, flashcards, and quizzes.
          </p>
          <Link 
            to={token ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 text-white text-xs font-bold px-6 py-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.6)' }}>
        <div className="responsive-container py-12 relative z-10">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:justify-between gap-8 mb-8">
            <div className="space-y-2 max-w-xs">
              <div className="flex items-center gap-2">
                <img src={logo} alt="StudyAI logo" className="h-5 w-auto" />
                <span className="text-sm font-extrabold text-[#3730a3]">StudyAI</span>
              </div>
              <p className="text-[11px] text-[#6d5b9c] leading-relaxed">
                Grounded learning companion for notes and quizzes.
              </p>
            </div>
            <div className="flex gap-16">
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-[#3730a3] uppercase tracking-wide">Product</h4>
                <div className="space-y-1.5 text-xs text-[#6d5b9c] font-semibold">
                  <p className="hover:text-[#3730a3] cursor-pointer transition-colors">AI Chat</p>
                  <p className="hover:text-[#3730a3] cursor-pointer transition-colors">Summaries</p>
                  <p className="hover:text-[#3730a3] cursor-pointer transition-colors">Flashcards</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-[#3730a3] uppercase tracking-wide">Socials</h4>
                <div className="space-y-1.5 text-xs text-[#6d5b9c] font-semibold">
                  <a
                    href="https://github.com/snehajadhav06"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-[#3730a3] transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/snehajadhav77/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-[#3730a3] transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto border-t pt-6 text-center text-[11px] text-[#8b7bb0]" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} StudyAI. Built for next-generation learners.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;