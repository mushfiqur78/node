'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, GripVertical } from 'lucide-react';
import Modal from '@/components/ui/Modal';

import { API_BASE, toFullUrl } from '@/lib/utils';
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

interface Testimonial {
  _id: string; name: string; designation: string; company: string;
  avatar: string; message: string; rating: number; order: number; isActive: boolean;
}

const EMPTY = { name: '', designation: '', company: '', message: '', rating: 5, order: 0, isActive: true, avatarAlt: '', avatarTitle: '' };

export default function TestimonialsPage() {
  const [items, setItems]     = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm]       = useState<any>(EMPTY);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/testimonials'); setItems(res.data.data.testimonials); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setAvatarFile(null); setAvatarPreview(''); setShowModal(true); };
  const openEdit   = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, designation: t.designation || '', company: t.company || '', message: t.message, rating: t.rating, order: t.order, isActive: t.isActive,
      avatarAlt: (t.avatar as any)?.alt || '', avatarTitle: (t.avatar as any)?.title || '' });
    setAvatarPreview(t.avatar && typeof t.avatar === 'object' ? toFullUrl((t.avatar as any).url) : t.avatar ? toFullUrl(t.avatar as any) : '');
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (avatarFile) fd.append('avatar', avatarFile);
      if (editing) { await api.put(`/admin/testimonials/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Updated'); }
      else { await api.post('/admin/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Created'); }
      setShowModal(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id: string) => {
    try { await api.patch(`/admin/testimonials/${id}/toggle`); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/admin/testimonials/${id}`); toast.success('Deleted'); fetch(); }
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
    await api.put('/admin/testimonials/reorder', { items: items.map((t, i) => ({ id: t._id, order: i + 1 })) });
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
        items.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">No testimonials yet.</div> : (
        <div className="space-y-3">
          {items.map((t, i) => (
            <div key={t._id} draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)} onDragEnd={onDragEnd}
              className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 ${dragIdx === i ? 'opacity-50' : ''}`}>
              <GripVertical size={16} className="text-gray-300 cursor-grab mt-1 shrink-0" />
              {t.avatar && typeof t.avatar === 'object' ? <img src={toFullUrl((t.avatar as any).url)} alt={(t.avatar as any).alt} className="w-12 h-12 rounded-full object-cover border shrink-0" /> :
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">{t.name[0]}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{t.name}</span>
                  {t.designation && <span className="text-xs text-gray-400">{t.designation}{t.company ? `, ${t.company}` : ''}</span>}
                  <div className="flex gap-0.5 ml-1">{[...Array(5)].map((_, j) => <Star key={j} size={12} className={j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}</div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleToggle(t._id)} className="text-gray-400 hover:text-blue-500">
                  {t.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-yellow-500"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Testimonial' : 'Add Testimonial'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 mb-2">
              {avatarPreview ? <img src={avatarPreview} alt="" className="w-14 h-14 rounded-full object-cover border" /> :
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Photo</div>}
              <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} />
              </label>
            </div>
            {/* Alt & Title for avatar */}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Image Alt Text (SEO)</label><input value={form.avatarAlt} onChange={e => setForm({...form, avatarAlt: e.target.value})} className={input} placeholder="Photo of John Doe" /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Image Title</label><input value={form.avatarTitle} onChange={e => setForm({...form, avatarTitle: e.target.value})} className={input} placeholder="John Doe - Client" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={input} /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Designation</label><input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className={input} /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Company</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className={input} /></div>
              <div><label className="block text-xs text-gray-600 mb-1">Rating</label>
                <select value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})} className={input}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-xs text-gray-600 mb-1">Message *</label><textarea required rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className={input} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-600 mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className={input} /></div>
              <label className="flex items-center gap-2 cursor-pointer pt-5">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
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
