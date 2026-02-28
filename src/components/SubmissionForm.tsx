import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { X, Upload, Plus, Check } from 'lucide-react';
import { Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SubmissionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File terlalu besar. Maksimal 1MB.');
        return;
      }
      setCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setCategoryId(newCat.id.toString());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !content || !authorName) {
      alert('Mohon lengkapi semua field wajib.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', categoryId);
    formData.append('content', content);
    formData.append('author_name', authorName);
    formData.append('author_email', authorEmail);
    if (cover) formData.append('cover', cover);

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(`Gagal mengirim rubrik: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Kirim Rubrik Baru</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Judul Rubrik *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul yang menarik"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kategori *</label>
              <div className="flex gap-2">
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="p-2.5 bg-emerald-50 text-brand rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <AnimatePresence>
                {showAddCategory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-2 mt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Kategori baru..."
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-brand-dark"
                    >
                      Tambah
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Konten *</label>
            <div className="h-64 mb-12">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-full rounded-xl overflow-hidden border border-gray-200"
                placeholder="Tuliskan cerita atau opini Anda di sini..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nama Penulis *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Nama lengkap atau pena"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email (Opsional)</label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Cover Image (JPG/PNG, Max 1MB)</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-brand hover:bg-emerald-50/30 cursor-pointer transition-all">
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500">Klik untuk unggah cover</span>
                <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
              </label>
              {coverPreview && (
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-100 relative group">
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCover(null); setCoverPreview(null); }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : (
              <>
                <Check size={20} />
                Kirim Sekarang
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
