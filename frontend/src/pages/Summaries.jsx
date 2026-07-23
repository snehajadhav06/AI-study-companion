import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  ChevronRight,
  Printer
} from 'lucide-react';

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-extrabold text-slate-900 mt-6 mb-3 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-extrabold text-indigo-700 mt-7 mb-3 pb-2 border-b border-indigo-100 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-extrabold text-indigo-700 mt-7 mb-3 pb-2 border-b border-indigo-100 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-700 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-4 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-4 pl-1">{children}</ol>
  ),
  li: ({ children, ordered, index }) => (
    <li className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
      <span className="text-indigo-400 font-bold mt-0.5 flex-shrink-0 min-w-[14px]">
        {ordered ? `${(index ?? 0) + 1}.` : '•'}
      </span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-xs font-mono border border-indigo-100">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto mb-4">{children}</pre>
  ),
};

const Summaries = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [detailLevel, setDetailLevel] = useState('medium');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchSummaries(selectedDocId);
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

  const fetchSummaries = async (docId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/summaries/?document_id=${docId}`);
      setSummaries(response.data);
      if (response.data.length > 0) {
        setSelectedSummary(response.data[0]);
      } else {
        setSelectedSummary(null);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:8000/api/summaries/generate', {
        document_id: parseInt(selectedDocId),
        detail_level: detailLevel
      });
      setSummaries((prev) => [response.data, ...prev]);
      setSelectedSummary(response.data);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Chapter Summaries</h1>
          <p className="text-slate-500 mt-1">Generate key takeaways, revision notes, and formula sheets from documents.</p>
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
            value={detailLevel}
            onChange={(e) => setDetailLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-805 focus:outline-none focus:border-indigo-500 text-sm w-full sm:w-36"
          >
            <option value="brief">Brief Bullet-points</option>
            <option value="medium">Standard Summary</option>
            <option value="detailed">In-depth Analysis</option>
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
          <h3 className="text-md font-bold text-slate-800 mb-4">Saved Summaries</h3>
          {summaries.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">No summaries generated yet.</p>
          ) : (
            <div className="space-y-2">
              {summaries.map((sum) => (
                <button
                  key={sum.id}
                  onClick={() => setSelectedSummary(sum)}
                  className={`w-full text-left p-3 rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                    selectedSummary?.id === sum.id
                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold'
                      : 'bg-slate-50/50 border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="truncate text-xs">{sum.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 premium-card p-8">
          {selectedSummary ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">{selectedSummary.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">{new Date(selectedSummary.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="max-w-none">
                <ReactMarkdown components={markdownComponents}>{selectedSummary.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-md font-bold text-slate-400">No Summary Selected</h3>
              <p className="text-xs text-slate-400 mt-1">Select a summary from the list or click Generate above to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summaries;