import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  FileText, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

const Chat = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState([]);
  const [showCitationModal, setShowCitationModal] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchHistory(selectedDocId);
    } else {
      setMessages([]);
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

  const fetchHistory = async (docId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/chat/history?document_id=${docId}`);
      
      const formatted = response.data.map(msg => ({
        role: msg.role,
        content: msg.content,
        citations: msg.citations ? JSON.parse(msg.citations) : null
      }));
      setMessages(formatted);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load chat history', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedDocId) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        question: userMessage.content,
        document_id: parseInt(selectedDocId)
      });

      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: response.data.answer,
          citations: response.data.citations
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleViewCitations = (cits) => {
    setCitations(cits || []);
    setShowCitationModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13.5rem)] md:h-[calc(100vh-8rem)] text-white text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#A78BFA] filter drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]" />
            AI Study Chat
          </h1>
          <p className="text-gray-300 text-sm mt-1">Ask questions and search context inside your documents.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FileText className="h-5 w-5 text-gray-400" />
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 text-sm w-full sm:w-64"
          >
            <option value="" className="bg-[#071020] text-white">Select a document...</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-[#071020] text-white">{doc.filename}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
            <div className="p-4 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-2xl text-[#A78BFA] filter drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Ask your Study Material</h3>
            <p className="text-sm text-gray-400">Select a textbook or lecture notes file above to ask targeted questions. Answers are fully cited from the text.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-4 p-5 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-[#6366F1]/10 border border-[#6366F1]/20 ml-4 md:ml-12 text-white' 
                  : 'bg-white/5 border border-white/10 mr-4 md:mr-12 shadow-sm text-white'
              }`}
            >
              <div className="flex-1 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {msg.role === 'user' ? 'You' : 'AI Companion'}
                </p>
                <div className="text-sm text-gray-200 leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <button 
                    onClick={() => handleViewCitations(msg.citations)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#A78BFA] hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>View Grounded Citations ({msg.citations.length})</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 mr-4 md:mr-12 animate-pulse shadow-sm">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-12 bg-white/10 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="pt-4 border-t border-white/10 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!selectedDocId || loading}
          placeholder={selectedDocId ? "Ask a question about this document..." : "Please select a document first"}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 text-sm placeholder-gray-500 disabled:opacity-50 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!selectedDocId || loading || !input.trim()}
          className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] text-white rounded-xl px-6 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {showCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071020]/60 backdrop-blur-md">
          <div className="bg-[#071020]/90 border border-white/15 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#8B5CF6]" />
                Source Citations
              </h3>
              <button 
                onClick={() => setShowCitationModal(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {citations.map((cit, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                    <span>Source #{idx + 1}</span>
                    <span className="bg-white/10 text-[#A78BFA] px-2 py-0.5 rounded">Page {cit.page || cit.page_number}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed italic">"...{cit.content}..."</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
