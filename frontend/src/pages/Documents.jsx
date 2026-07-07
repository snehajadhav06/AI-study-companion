import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Upload, 
  Trash2, 
  BookOpen, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/documents/');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setErrorMessage('Only PDF documents are supported currently.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      await axios.post('http://localhost:8000/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        fetchDocuments();
      }, 800);
    } catch (error) {
      setUploading(false);
      setErrorMessage(error.response?.data?.detail || 'Failed to upload document.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Study Materials</h1>
        <p className="text-slate-500 mt-1">Upload textbooks, syllabi, or lecture notes to customize your companion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Document</h3>
          
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group bg-slate-50/50">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <Upload className="h-10 w-10 text-slate-400 group-hover:text-indigo-600 transition-all mb-4" />
            <span className="text-sm font-bold text-slate-700">Click or drag PDF to upload</span>
            <span className="text-xs text-slate-400 mt-1">Max file size 20MB</span>
          </div>

          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-indigo-600 rounded-full animate-ping"></span>
                  Processing & Indexing...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Library ({documents.length})</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 border border-slate-100 rounded-xl bg-slate-50/20">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-700">No documents found</p>
              <p className="text-xs text-slate-400 mt-1">Upload a PDF file to begin study analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50/40 border border-slate-100 rounded-xl gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]">{doc.filename}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={() => navigate('/chat', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                      title="Open RAG Chat"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate('/summaries', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                      title="Generate Summary"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate('/quizzes', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                      title="Create Practice Quiz"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2.5 bg-white border border-slate-200 hover:border-red-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
