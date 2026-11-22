import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, FileText, UploadCloud, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import DocCard from '../components/DocCard';
import { BACKEND_URL } from '../utils/apiConfig';

export default function Documents() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);
  const fileInputRef = useRef(null); 
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login"); 
      return;
    }        
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.email) return;

    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        const response = await fetch(`${BACKEND_URL}/docs/${user?.email}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,  
          },
        });
        const data = await response.json();

        if (data.success) {
          setDocs(data.documents || []);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [user?.email, success, token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!description.trim()) {
      setError('Please provide a document description (e.g. RC Book, Insurance Policy)');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileDescription', description);

    try {
      const response = await fetch(`${BACKEND_URL}/docs/${user.email}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Document securely saved to your digital glovebox.");
        setFile(null);
        setDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Upload failed. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const promptDelete = (id, name) => {
    setDocToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/docs/${docToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDocs((prev) => prev.filter((d) => d._id !== docToDelete.id));
        setSuccess(`"${docToDelete.name}" was permanently removed.`);
        setDocToDelete(null);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please check your connection.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocuments = docs.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      <Navbar />

      <input 
        ref={fileInputRef}
        type='file'
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800/80">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Digital Glovebox
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Centralized, cloud-encrypted vehicle documentation & certificates
            </p>
          </div>

          <button 
            onClick={handleFileUpload}
            disabled={uploading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && !file && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search documents by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
            />
          </div>
        </div>

        {/* Upload Modal Dialog */}
        {file && !uploading && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <h3 className="text-base font-semibold text-white">Upload to Glovebox</h3>
                <button
                  onClick={() => {
                    setFile(null);
                    setDescription('');
                    setError('');
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-4 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Selected File</span>
                <p className="text-sm font-medium text-zinc-200 truncate mt-0.5">{file.name}</p>
                <p className="text-xs text-zinc-500 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Document Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Registration Certificate (RC), Comprehensive Insurance, Pollution Certificate"
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                  rows="3"
                />
              </div>

              {error && (
                <p className="text-rose-400 text-xs mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer"
                >
                  Upload Document
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setDescription('');
                    setError('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal Dialog */}
        {docToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-900/60 flex items-center justify-center text-rose-400 mb-4">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Delete Document</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Are you sure you want to permanently delete <span className="text-zinc-200 font-medium break-all">"{docToDelete.name}"</span> from your cloud glovebox?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Document'}
                </button>
                <button
                  onClick={() => setDocToDelete(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 font-mono text-xs text-zinc-400">
            <span>Archived Documents ({filteredDocuments.length})</span>
          </div>

          {loadingDocs ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400 text-sm">
              Loading vault documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-400 max-w-md mx-auto p-8">
              <FileText className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
              <h3 className="text-base font-semibold text-zinc-200">No documents stored</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto mb-6">
                Keep your RC, vehicle insurance, and PUC certificates safely organized in your encrypted digital glovebox.
              </p>
              <button
                onClick={handleFileUpload}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <DocCard 
                  key={doc._id}
                  id={doc._id}
                  date={doc.date} 
                  name={doc.fileName} 
                  description={doc.fileDescription} 
                  size={doc.fileSize}
                  fileURL={doc.fileURL}
                  onDelete={promptDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}