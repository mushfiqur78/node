'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, Trash2, Pencil, Search, X, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';

import { API_BASE, toFullUrl } from '@/lib/utils';

interface MediaItem { _id: string; url: string; alt: string; title: string; filename: string; size: number; createdAt: string }

export default function MediaPage() {
  const [items, setItems]       = useState<MediaItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing]   = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({ alt: '', title: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', { params: { page: p, limit: 24, search: q } });
      setItems(res.data.data.items);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(1); }, []);

  const handleSearch = (v: string) => { setSearch(v); fetchMedia(1, v); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      await Promise.all(files.map(file => {
        const fd = new FormData();
        fd.append('image', file);
        return api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }));
      toast.success(`${files.length} image(s) uploaded`);
      fetchMedia(1);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const openEdit = (item: MediaItem) => { setEditing(item); setEditForm({ alt: item.alt || '', title: item.title || '' }); };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await api.put(`/admin/media/${editing._id}`, editForm);
      toast.success('Updated');
      setEditing(null);
      fetchMedia(page);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try { await api.delete(`/admin/media/${id}`); toast.success('Deleted'); fetchMedia(page); }
    catch { toast.error('Failed'); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} images?`)) return;
    try {
      await Promise.all(selected.map(id => api.delete(`/admin/media/${id}`)));
      toast.success('Deleted');
      setSelected([]);
      fetchMedia(page);
    } catch { toast.error('Failed'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Media Library <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <div className="flex gap-3">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
              <Trash2 size={16} /> Delete ({selected.length})
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png" multiple className="hidden" onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search by alt, title, filename..."
          className="w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
        {search && <button onClick={() => handleSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Upload size={40} className="mx-auto mb-3 opacity-30" />
          <p>No images yet. Upload some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map(item => (
            <div key={item._id}
              className={`group relative bg-white rounded-xl overflow-hidden border-2 transition ${selected.includes(item._id) ? 'border-blue-500' : 'border-transparent hover:border-gray-200'} shadow-sm`}>
              {/* Image */}
              <div className="aspect-square cursor-pointer" onClick={() => toggleSelect(item._id)}>
                <img src={toFullUrl(item.url)} alt={item.alt} className="w-full h-full object-cover" />
              </div>

              {/* Selected overlay */}
              {selected.includes(item._id) && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-500 rounded-full p-1"><Check size={16} className="text-white" /></div>
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                <button onClick={() => openEdit(item)} className="bg-white/90 rounded-lg p-1 text-gray-600 hover:text-yellow-500 shadow"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(item._id)} className="bg-white/90 rounded-lg p-1 text-gray-600 hover:text-red-500 shadow"><Trash2 size={13} /></button>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{item.alt || item.filename || '—'}</p>
                <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Pagination page={page} pages={pages} onPageChange={p => fetchMedia(p)} />
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal title="Edit Image Info" onClose={() => setEditing(null)}>
          <div className="mb-4">
            <img src={toFullUrl(editing.url)} alt={editing.alt} className="w-full h-40 object-cover rounded-lg border" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text (SEO)</label>
              <input value={editForm.alt} onChange={e => setEditForm({ ...editForm, alt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="text-xs text-gray-400 font-mono break-all">{editing.url}</div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleUpdate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
