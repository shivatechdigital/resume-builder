import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTemplateStore } from '../store/templateStore';
import toast from 'react-hot-toast';
import {
  Plus, Upload, Trash2, LogOut, FileText,
  Loader2, Image as ImageIcon
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const { templates, fetchTemplates, uploadTemplate, deleteTemplate, loading } = useTemplateStore();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchTemplates(token);
  }, [token]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) {
      return toast.error('❌ Naam aur image dono zaroori hain');
    }

    const formData = new FormData();
    formData.append('template', selectedFile);
    formData.append('name', templateName);

    try {
      await uploadTemplate(token, formData);
      toast.success('✅ Template uploaded!');
      setShowUpload(false);
      setTemplateName('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error(error.response?.data?.message || '❌ Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Kya sach mein delete karna hai?')) return;
    try {
      await deleteTemplate(token, id);
      toast.success('✅ Deleted!');
    } catch (error) {
      toast.error('❌ Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          📄 Resume Builder 2026
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hi, {user?.name} 👋</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">My Templates</h2>
            <p className="text-gray-500 text-sm mt-1">
              {templates.length} template{templates.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
          >
            <Plus className="w-5 h-5" /> Upload Template
          </button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-4">📤 Upload New Template</h3>

              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template ka naam (e.g., Modern Resume)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <label className="block w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-all mb-4">
                <Upload className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400">Click to upload image</p>
                <p className="text-gray-600 text-xs mt-1">JPEG, PNG, WEBP (Max 10MB)</p>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              {previewUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <img src={previewUrl} alt="preview" className="max-h-48 mx-auto rounded-lg border border-gray-700" />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  Upload
                </button>
                <button
                  onClick={() => { setShowUpload(false); setPreviewUrl(null); }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {loading && templates.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-xl text-gray-500">Koi template nahi hai abhi</h3>
            <p className="text-gray-600 mt-2">Upar "Upload Template" pe click karo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template._id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="relative h-48 bg-gray-800 overflow-hidden">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => navigate(`/editor/${template._id}`)}
                      className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="bg-red-600 p-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-gray-500 text-xs mt-1">
                    {template.fields.length} fields mapped • {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;