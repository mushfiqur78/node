'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface SeoSetting {
  _id: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
}

const EMPTY_FORM = {
  page: '', metaTitle: '', metaDescription: '', metaKeywords: '',
  ogTitle: '', ogDescription: '', ogImage: '',
  canonicalUrl: '', robots: 'index, follow',
};

const PRESET_PAGES = ['home', 'properties', 'blog', 'about', 'contact', 'agents'];

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function SeoPage() {
  const [settings, setSettings] = useState<SeoSetting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<SeoSetting | null>(null);
  const [form, setForm]         = useState<any>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/seo');
      setSettings(res.data.data.settings);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const openCreate = (page = '') => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, page });
    setShowModal(true);
  };

  const openEdit = (s: SeoSetting) => {
    setEditing(s);
    setForm({ page: s.page, metaTitle: s.metaTitle || '', metaDescription: s.metaDescription || '',
      metaKeywords: s.metaKeywords || '', ogTitle: s.ogTitle || '', ogDescription: s.ogDescription || '',
      ogImage: s.ogImage || '', canonicalUrl: s.canonicalUrl || '', robots: s.robots || 'index, follow' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/seo', form);
      toast.success('SEO settings saved');
      setShowModal(false);
      fetchSettings();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this SEO setting?')) return;
    try { await api.delete(`/admin/seo/${id}`); toast.success('Deleted'); fetchSettings(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const existingPages = settings.map(s => s.page);
  const missingPages  = PRESET_PAGES.filter(p => !existingPages.includes(p));

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">SEO Settings</h1>
        <button onClick={() => openCreate()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> Add Page SEO
        </button>
      </div>

      {/* Quick add missing pages */}
      {missingPages.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-700 font-medium mb-2">Pages without SEO settings:</p>
          <div className="flex flex-wrap gap-2">
            {missingPages.map(p => (
              <button key={p} onClick={() => openCreate(p)}
                className="text-xs bg-white border border-yellow-300 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-100 transition">
                + {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-400">Loading...</div>
        ) : settings.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-gray-400">No SEO settings yet.</div>
        ) : settings.map(s => (
          <div key={s._id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {s.page}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-yellow-500"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <p className="text-xs text-gray-400">Meta Title</p>
                <p className="text-sm text-gray-700 font-medium truncate">{s.metaTitle || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Meta Description</p>
                <p className="text-sm text-gray-600 line-clamp-2">{s.metaDescription || '—'}</p>
              </div>
              <div className="flex gap-4 pt-1">
                <div>
                  <p className="text-xs text-gray-400">Robots</p>
                  <p className="text-xs text-gray-600 font-mono">{s.robots || '—'}</p>
                </div>
                {s.canonicalUrl && (
                  <div>
                    <p className="text-xs text-gray-400">Canonical</p>
                    <p className="text-xs text-gray-600 font-mono truncate max-w-[150px]">{s.canonicalUrl}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? `Edit SEO — ${editing.page}` : 'Add SEO Settings'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page *</label>
              <input required value={form.page} onChange={e => setForm({ ...form, page: e.target.value.toLowerCase() })}
                className={input} placeholder="e.g. home, properties, blog" disabled={!!editing} />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Basic SEO</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Title <span className="text-gray-400">({form.metaTitle.length}/60)</span></label>
                  <input maxLength={60} value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} className={input} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Description <span className="text-gray-400">({form.metaDescription.length}/160)</span></label>
                  <textarea rows={2} maxLength={160} value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} className={input} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Keywords</label>
                  <input value={form.metaKeywords} onChange={e => setForm({ ...form, metaKeywords: e.target.value })} className={input} placeholder="real estate, property, dhaka" />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Open Graph</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">OG Title</label>
                  <input value={form.ogTitle} onChange={e => setForm({ ...form, ogTitle: e.target.value })} className={input} placeholder="Fallback: meta title" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">OG Description</label>
                  <textarea rows={2} value={form.ogDescription} onChange={e => setForm({ ...form, ogDescription: e.target.value })} className={input} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">OG Image URL</label>
                  <input value={form.ogImage} onChange={e => setForm({ ...form, ogImage: e.target.value })} className={input} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Technical</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Canonical URL</label>
                  <input value={form.canonicalUrl} onChange={e => setForm({ ...form, canonicalUrl: e.target.value })} className={input} placeholder="https://yourdomain.com/page" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Robots</label>
                  <select value={form.robots} onChange={e => setForm({ ...form, robots: e.target.value })} className={input}>
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
