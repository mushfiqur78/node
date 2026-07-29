'use client';
import { useEffect, useState, useRef } from 'react';
import { Search, Upload, X, Check } from 'lucide-react';
import api from '@/lib/api';
import { ImageMeta } from './ImageUploader';

import { API_BASE, toFullUrl } from '@/lib/utils';


interface MediaItem { _id: string; url: string; alt: string; title: string; filename: string }

interface MediaPickerProps {
  label:     string;
  multiple?: boolean;
  maxFiles?: number;
  selected:  ImageMeta[];
  onChange:  (items: ImageMeta[]) => void;
}

export default function MediaPicker({ label, multiple = false, maxFiles = 10, selected, onChange }: MediaPickerProps) {
  const [open, setOpen]         = useState(false);
  const [items, setItems]       = useState<MediaItem[]>([]);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(false);
  const [picked, setPicked]     = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', { params: { page: p, limit: 20, search: q } });
      setItems(res.data.data.items);
      setPages(res.data.data.pages);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) fetchMedia(1); }, [open]);

  const handleSearch = (v: string) => { setSearch(v); fetchMedia(1, v); };

  const togglePick = (item: MediaItem) => {
    if (!multiple) {
      setPicked([item]);
      return;
    }
    const exists = picked.find(p => p._id === item._id);
    if (exists) {
      setPicked(picked.filter(p => p._id !== item._id));
    } else {
      if (picked.length >= maxFiles) return;
      setPicked([...picked, item]);
    }
  };

  const handleConfirm = () => {
    const merged = picked.map(p => ({ file: null as any, url: p.url, alt: p.alt, title: p.title }));
    if (multiple) {
      onChange([...selected, ...merged].slice(0, maxFiles));
    } else {
      onChange(merged);
    }
    setOpen(false);
    setPicked([]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchMedia(1);
    } catch {}
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Selected preview */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((s, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={toFullUrl(s.url)} alt={s.alt} className="w-full h-full object-cover rounded-lg border" />
              <button type="button" onClick={() => onChange(selected.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition">
        <Search size={16} /> Browse Media Library
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Media Library</h3>
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={handleUpload} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload New'}
                </button>
                <button type="button" onClick={() => { setOpen(false); setPicked([]); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={search} onChange={e => handleSearch(e.target.value)}
                  placeholder="Search by alt, title, filename..."
                  className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No media found.</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {items.map(item => {
                    const isPicked = picked.find(p => p._id === item._id);
                    return (
                      <div key={item._id} onClick={() => togglePick(item)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${isPicked ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={toFullUrl(item.url)} alt={item.alt} className="w-full aspect-square object-cover" />
                        {isPicked && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="bg-blue-500 rounded-full p-1"><Check size={14} className="text-white" /></div>
                          </div>
                        )}
                        {item.alt && <p className="text-xs text-gray-500 truncate px-1 py-0.5 bg-white/80 absolute bottom-0 w-full">{item.alt}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={page === 1} onClick={() => fetchMedia(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
                  <span className="text-sm text-gray-500 py-1">{page}/{pages}</span>
                  <button disabled={page === pages} onClick={() => fetchMedia(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">{picked.length} selected</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setOpen(false); setPicked([]); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleConfirm} disabled={picked.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40">
                  Use Selected ({picked.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
