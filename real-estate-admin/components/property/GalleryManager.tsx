'use client';
import { useRef, useState } from 'react';
import { Upload, X, GripVertical, Search, Check } from 'lucide-react';
import api from '@/lib/api';
import { API_BASE, toFullUrl } from '@/lib/utils';

export interface GalleryItem { file: File | null; url: string; alt: string; title: string }

interface GalleryManagerProps {
  label:    string;
  items:    GalleryItem[];
  max?:     number;
  onChange: (items: GalleryItem[]) => void;
}

export default function GalleryManager({ label, items, max = 10, onChange }: GalleryManagerProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [error, setError]       = useState('');
  const [dragIdx, setDragIdx]   = useState<number | null>(null);
  const [libOpen, setLibOpen]   = useState(false);
  const [libItems, setLibItems] = useState<any[]>([]);
  const [libSearch, setLibSearch] = useState('');
  const [libPage, setLibPage]   = useState(1);
  const [libPages, setLibPages] = useState(1);
  const [libLoading, setLibLoading] = useState(false);
  const [picked, setPicked]     = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const libFileRef = useRef<HTMLInputElement>(null);

  // ── Local file upload ──────────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const arr = Array.from(files);
    if (items.length + arr.length > max) { setError(`Maximum ${max} images allowed`); return; }
    const newItems: GalleryItem[] = arr.map(f => ({ file: f, url: URL.createObjectURL(f), alt: '', title: '' }));
    onChange([...items, ...newItems]);
  };

  // ── Update meta ────────────────────────────────────────────────
  const updateMeta = (i: number, field: 'alt' | 'title', val: string) => {
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  // ── Remove ─────────────────────────────────────────────────────
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  // ── Drag reorder ───────────────────────────────────────────────
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...items];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setDragIdx(i);
    onChange(updated);
  };

  // ── Media Library ──────────────────────────────────────────────
  const fetchLib = async (p = 1, q = libSearch) => {
    setLibLoading(true);
    try {
      const res = await api.get('/admin/media', { params: { page: p, limit: 20, search: q } });
      setLibItems(res.data.data.items);
      setLibPages(res.data.data.pages);
      setLibPage(p);
    } catch {}
    finally { setLibLoading(false); }
  };

  const openLib = () => { setLibOpen(true); setPicked([]); fetchLib(1); };

  const togglePick = (item: any) => {
    const exists = picked.find(p => p._id === item._id);
    if (exists) { setPicked(picked.filter(p => p._id !== item._id)); return; }
    if (items.length + picked.length >= max) return;
    setPicked([...picked, item]);
  };

  const confirmLib = () => {
    const newItems: GalleryItem[] = picked.map(p => ({ file: null, url: p.url, alt: p.alt, title: p.title }));
    onChange([...items, ...newItems]);
    setLibOpen(false);
    setPicked([]);
  };

  const uploadToLib = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchLib(1);
    } catch {}
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label} ({items.length}/{max})</label>
        <div className="flex gap-2">
          {items.length < max && (
            <>
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1 text-xs border rounded-lg px-3 py-1.5 hover:bg-gray-50">
                <Upload size={13} /> Upload
              </button>
              <button type="button" onClick={openLib}
                className="flex items-center gap-1 text-xs border rounded-lg px-3 py-1.5 hover:bg-gray-50">
                <Search size={13} /> Library
              </button>
            </>
          )}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpg,image/jpeg,image/png"
        multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {/* Gallery list */}
      {items.length === 0 ? (
        <div onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
          <Upload size={22} className="mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">Click or drag & drop images here</p>
          <p className="text-xs text-gray-400">JPG, JPEG, PNG (max {max})</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} draggable onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)} onDragEnd={() => setDragIdx(null)}
              className={`flex gap-3 items-start bg-gray-50 rounded-lg p-3 border ${dragIdx === i ? 'opacity-50' : ''}`}>
              <GripVertical size={16} className="text-gray-400 mt-2 cursor-grab shrink-0" />
              <img src={toFullUrl(item.url)} alt={item.alt}
                className="w-16 h-16 object-cover rounded-lg border shrink-0" />
              <div className="flex-1 space-y-1.5">
                <input placeholder="Alt text (SEO & accessibility)" value={item.alt}
                  onChange={e => updateMeta(i, 'alt', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input placeholder="Title (tooltip)" value={item.title}
                  onChange={e => updateMeta(i, 'title', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 mt-1 shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
          {/* Add more button */}
          {items.length < max && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
              + Add More Images ({max - items.length} remaining)
            </button>
          )}
        </div>
      )}

      {/* Media Library Modal */}
      {libOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Media Library</h3>
              <div className="flex items-center gap-3">
                <input ref={libFileRef} type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={uploadToLib} />
                <button type="button" onClick={() => libFileRef.current?.click()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload New'}
                </button>
                <button type="button" onClick={() => setLibOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={libSearch} onChange={e => { setLibSearch(e.target.value); fetchLib(1, e.target.value); }}
                  placeholder="Search by alt, title, filename..."
                  className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {libLoading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
                libItems.length === 0 ? <div className="text-center py-10 text-gray-400">No media found.</div> : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {libItems.map(item => {
                    const isPicked = picked.find(p => p._id === item._id);
                    const isUsed   = items.find(i => i.url === item.url);
                    return (
                      <div key={item._id} onClick={() => !isUsed && togglePick(item)}
                        className={`relative rounded-lg overflow-hidden border-2 transition ${isUsed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isPicked ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={toFullUrl(item.url)} alt={item.alt} className="w-full aspect-square object-cover" />
                        {isPicked && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="bg-blue-500 rounded-full p-1"><Check size={14} className="text-white" /></div>
                          </div>
                        )}
                        {isUsed && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="text-xs text-gray-500">Added</span></div>}
                      </div>
                    );
                  })}
                </div>
              )}
              {libPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={libPage === 1} onClick={() => fetchLib(libPage - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
                  <span className="text-sm text-gray-500 py-1">{libPage}/{libPages}</span>
                  <button disabled={libPage === libPages} onClick={() => fetchLib(libPage + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">{picked.length} selected · {max - items.length} slots remaining</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setLibOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={confirmLib} disabled={picked.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40">
                  Add Selected ({picked.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
