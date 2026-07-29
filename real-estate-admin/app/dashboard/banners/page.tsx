'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, Image as ImageIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

import { API_BASE, toFullUrl } from '@/lib/utils';
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

interface Banner {
  _id: string; title: string; subtitle: string; description: string;
  image: { url: string; alt: string }; buttonText: string; buttonUrl: string;
  type: string; order: number; isActive: boolean;
}

const EMPTY = { title: '', subtitle: '', description: '', imageAlt: '', imageTitle: '', buttonText: '', buttonUrl: '', buttonTarget: '_self', type: 'slider', order: 0, isActive: true, titleFontSize: '3xl', overlayOpacity: 55 };

export default function BannersPage() {
  const [items, setItems]     = useState<Banner[]>([]);
  const [mode, setMode]       = useState<'banner' | 'slider'>('slider');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm]       = useState<any>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [switchingMode, setSwitchingMode] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/banners');
      setItems(res.data.data.banners);
      setMode(res.data.data.mode);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleModeSwitch = async (newMode: 'banner' | 'slider') => {
    setSwitchingMode(true);
    try {
      await api.put('/admin/banners/mode', { mode: newMode });
      setMode(newMode);
      toast.success(`Switched to ${newMode} mode`);
      fetchBanners();
    } catch { toast.error('Failed'); } finally { setSwitchingMode(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, type: mode }); setImageFile(null); setImagePreview(''); setShowModal(true); };
  const openEdit   = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title || '', subtitle: b.subtitle || '', description: b.description || '', imageAlt: b.image?.alt || '', imageTitle: b.image?.title || '', buttonText: b.buttonText || '', buttonUrl: b.buttonUrl || '', buttonTarget: '_self', type: b.type, order: b.order, isActive: b.isActive, titleFontSize: (b as any).titleFontSize || '3xl', overlayOpacity: (b as any).overlayOpacity ?? 55 });
    setImagePreview(b.image?.url ? toFullUrl(b.image.url) : '');
    setImageFile(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !imageFile) return toast.error('Image is required');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('image', imageFile);
      if (editing) { await api.put(`/admin/banners/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Updated'); }
      else { await api.post('/admin/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Created'); }
      setShowModal(false); fetchBanners();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id: string) => {
    try { await api.patch(`/admin/banners/${id}/toggle`); fetchBanners(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/admin/banners/${id}`); toast.success('Deleted'); fetchBanners(); }
    catch { toast.error('Failed'); }
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...items]; const [moved] = updated.splice(dragIdx, 1); updated.splice(i, 0, moved);
    setDragIdx(i); setItems(updated);
  };
  const onDragEnd = async () => {
    setDragIdx(null);
    await api.put('/admin/banners/reorder', { items: items.map((b, i) => ({ id: b._id, order: i + 1 })) });
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Banner / Slider</h1>
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => handleModeSwitch('banner')} disabled={switchingMode}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'banner' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Banner
            </button>
            <button onClick={() => handleModeSwitch('slider')} disabled={switchingMode}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === 'slider' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Slider
            </button>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={16} /> Add {mode === 'banner' ? 'Banner' : 'Slide'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
        Current homepage hero mode: <strong className="capitalize">{mode}</strong> — only <strong>{mode}</strong> type items are shown on frontend.
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
        items.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">No {mode} items yet.</div> : (
        <div className="space-y-3">
          {items.map((b, i) => (
            <div key={b._id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)} onDragEnd={onDragEnd}
              className={`bg-white rounded-xl shadow-sm flex items-center gap-4 overflow-hidden ${dragIdx === i ? 'opacity-50' : ''}`}>
              <GripVertical size={16} className="text-gray-300 cursor-grab ml-3 shrink-0" />
              <div className="w-24 h-16 shrink-0 bg-gray-100">
                {b.image?.url ? <img src={toFullUrl(b.image.url)} alt={b.image.alt} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-300" /></div>}
              </div>
              <div className="flex-1 min-w-0 py-3">
                <p className="font-medium text-gray-800 truncate">{b.title || '(No title)'}</p>
                {b.subtitle && <p className="text-xs text-gray-400 truncate">{b.subtitle}</p>}
                {b.buttonText && <p className="text-xs text-blue-500 mt-0.5">{b.buttonText} → {b.buttonUrl}</p>}
              </div>
              <div className="flex items-center gap-2 pr-4 shrink-0">
                <Badge label={b.type} />
                <button onClick={() => handleToggle(b._id)} className="text-gray-400 hover:text-blue-500">
                  {b.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-yellow-500"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(b._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit' : `Add ${mode === 'banner' ? 'Banner' : 'Slide'}`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Image {!editing && '*'}</label>
              <div className="flex items-center gap-3">
                {imagePreview && <img src={imagePreview} alt="" className="h-16 rounded-lg object-cover border" />}
                <label className="cursor-pointer flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                  <ImageIcon size={14} /> {imagePreview ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Image Alt Text (SEO)</label><input value={form.imageAlt} onChange={e => setForm({...form, imageAlt: e.target.value})} className={input} placeholder="Hero banner image" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Image Title</label><input value={form.imageTitle} onChange={e => setForm({...form, imageTitle: e.target.value})} className={input} placeholder="Real Estate Banner" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={input} /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Subtitle</label><input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className={input} /></div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Title Font Size</label>
              <select value={form.titleFontSize} onChange={e => setForm({...form, titleFontSize: e.target.value})} className={input}>
                <option value="sm">Small (sm)</option>
                <option value="lg">Large (lg)</option>
                <option value="xl">Extra Large (xl)</option>
                <option value="2xl">2X Large (2xl)</option>
                <option value="3xl">3X Large — Default (3xl)</option>
                <option value="4xl">4X Large (4xl)</option>
                <option value="5xl">5X Large (5xl)</option>
                <option value="6xl">6X Large (6xl)</option>
                <option value="7xl">7X Large (7xl)</option>
                <option value="8xl">8X Large (8xl)</option>
                <option value="9xl">9X Large (9xl)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Controls the title text size on the homepage hero section</p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Background Overlay Opacity: <strong>{form.overlayOpacity}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.overlayOpacity}
                onChange={e => setForm({...form, overlayOpacity: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Light (0%)</span>
                <span>Dark (100%)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Controls how dark the background overlay is (higher = darker)</p>
            </div>
            <div><label className="block text-xs text-gray-600 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={input} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Button Text</label><input value={form.buttonText} onChange={e => setForm({...form, buttonText: e.target.value})} className={input} placeholder="Learn More" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Button URL</label><input value={form.buttonUrl} onChange={e => setForm({...form, buttonUrl: e.target.value})} className={input} placeholder="/properties" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={input}>
                  <option value="slider">Slider</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
              <div><label className="block text-xs text-gray-600 mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className={input} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
