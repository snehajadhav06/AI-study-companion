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

  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.pptx'];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setErrorMessage(`Unsupported file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
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
    <div className="space-y-8 text-white text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Study Materials</h1>
        <p className="text-gray-300 mt-1">Upload textbooks, syllabi, or lecture notes to customize your companion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Upload Document</h3>
          
          <div className="border-2 border-dashed border-white/10 hover:border-[#8B5CF6]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group bg-white/3">
            <input 
              type="file" 
              accept=".pdf,.docx,.txt,.pptx" 
              onChange={handleFileUpload} 
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <Upload className="h-10 w-10 text-gray-400 group-hover:text-[#A78BFA] transition-all mb-4" />
            <span className="text-sm font-bold text-gray-200">Click or drag a file to upload</span>
            <span className="text-xs text-gray-400 mt-1">PDF, DOCX, PPTX, or TXT · Max file size 20MB</span>
          </div>

          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-[#8B5CF6] rounded-full animate-ping"></span>
                  Processing & Indexing...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 premium-card p-6">
          <h3 className="text-lg font-bold mb-6">Library ({documents.length})</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#8B5CF6]"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 border border-white/10 rounded-xl bg-white/3">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-300">No documents found</p>
              <p className="text-xs text-gray-400 mt-1">Upload a document to begin study analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 border border-white/10 rounded-xl gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl">
                      <FileText className="h-6 w-6 text-[#A78BFA]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[280px]">{doc.filename}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={() => navigate('/chat', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Open RAG Chat"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate('/summaries', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Generate Summary"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate('/quizzes', { state: { docId: doc.id } })}
                      className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Create Practice Quiz"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2.5 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-950/30 text-gray-300 hover:text-red-400 rounded-xl transition-all cursor-pointer"
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