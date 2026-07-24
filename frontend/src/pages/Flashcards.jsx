import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Copy, 
  Sparkles, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown,
  Info
} from 'lucide-react';

const Flashcards = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [numCards, setNumCards] = useState(5);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchFlashcards(selectedDocId);
    }
  }, [selectedDocId]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/documents/');
      setDocuments(response.data);
      if (response.data.length > 0) {
        setSelectedDocId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchFlashcards = async (docId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/flashcards/?document_id=${docId}`);
      setFlashcards(response.data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/api/flashcards/generate', {
        document_id: parseInt(selectedDocId),
        num_cards: parseInt(numCards)
      });
      setFlashcards(response.data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleReview = async (difficulty) => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    try {
      await axios.post(`http://localhost:8000/api/flashcards/${currentCard.id}/review`, {
        difficulty
      });
      
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          fetchFlashcards(selectedDocId);
        }
      }, 200);
    } catch (error) {
      console.error('Failed to submit card review:', error);
    }
  };

  const activeCard = flashcards[currentIndex];

  return (
    <div className="space-y-8 text-white text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Flashcards</h1>
          <p className="text-gray-300 mt-1">Review, memorize, and optimize concepts using the Leitner repetition boxes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 text-sm w-full sm:w-56 animate-fade-in"
          >
            <option value="" className="bg-[#071020] text-white">Select document...</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-[#071020] text-white">{doc.filename}</option>
            ))}
          </select>

          <select
            value={numCards}
            onChange={(e) => setNumCards(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/15 text-sm w-full sm:w-24"
          >
            <option value="5" className="bg-[#071020]">5 Cards</option>
            <option value="10" className="bg-[#071020]">10 Cards</option>
            <option value="15" className="bg-[#071020]">15 Cards</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!selectedDocId || generating}
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all text-sm disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {flashcards.length > 0 && activeCard ? (
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-3 px-1">
              <span>CARD {currentIndex + 1} OF {flashcards.length}</span>
              <span className="bg-[#6366F1]/20 text-[#A78BFA] px-3 py-1 rounded-full border border-[#6366F1]/30">{activeCard.topic}</span>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-80 w-full relative cursor-pointer group"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="w-full h-full rounded-2xl relative transition-transform duration-500 ease-out"
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                }}
              >
                <div 
                  className="absolute inset-0 w-full h-full p-8 rounded-2xl bg-white/8 border border-white/15 flex flex-col justify-between items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[20px] backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-bold text-white leading-relaxed">{activeCard.front}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Click to reveal answer</span>
                  </div>
                </div>

                <div 
                  className="absolute inset-0 w-full h-full p-8 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex flex-col justify-between items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[20px] backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-lg text-white leading-relaxed font-bold">{activeCard.back}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A78BFA] font-semibold">
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Click to see question</span>
                  </div>
                </div>
              </div>
            </div>

            {isFlipped && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview('hard'); }}
                  className="flex-1 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-300 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Still Learning (Hard)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview('easy'); }}
                  className="flex-1 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Got It! (Easy)
                </button>
              </div>
            )}
            
            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Info className="h-4 w-4 text-[#A78BFA]" />
                <span>Leitner Level Box:</span>
              </div>
              <span className="font-bold text-white px-3 py-1 rounded bg-white/10">Box #{activeCard.box} / 5</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 premium-card p-6">
            <Copy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-md font-bold text-gray-400">No Flashcards Found</h3>
            <p className="text-xs text-gray-400 mt-1">Select a document above and click Generate to start your review deck.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
