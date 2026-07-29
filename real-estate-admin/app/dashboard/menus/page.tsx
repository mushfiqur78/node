'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  url: string;
  target: string;
  parentId: { _id: string; name: string } | null;
  order: number;
  icon: string;
  isActive: boolean;
}

const EMPTY_FORM = { name: '', url: '', target: '_self', parentId: '', order: 0, icon: '', isActive: true };

export default function MenusPage() {
  const [menus, setMenus]       = useState<MenuItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<MenuItem | null>(null);
  const [form, setForm]         = useState<any>(EMPTY_FORM);
  const [dragIdx, setDragIdx]   = useState<number | null>(null);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/menus');
      setMenus(res.data.data.menus);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (m: MenuItem) => {
    setEditing(m);
    setForm({ name: m.name, url: m.url || '', target: m.target, parentId: m.parentId?._id || '', order: m.order, icon: m.icon || '', isActive: m.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, parentId: form.parentId || null, order: Number(form.order) };
    try {
      if (editing) {
        await api.put(`/admin/menus/${editing._id}`, payload);
        toast.success('Updated');
      } else {
        await api.post('/admin/menus', payload);
        toast.success('Created');
      }
      setShowModal(false);
      fetchMenus();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item? Children will be moved to parent level.')) return;
    try { await api.delete(`/admin/menus/${id}`); toast.success('Deleted'); fetchMenus(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (m: MenuItem) => {
    try { await api.put(`/admin/menus/${m._id}`, { ...m, parentId: m.parentId?._id || null, isActive: !m.isActive }); fetchMenus(); }
    catch { toast.error('Failed'); }
  };

  // Drag reorder
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...menus];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setDragIdx(i);
    setMenus(updated);
  };
  const onDragEnd = async () => {
    setDragIdx(null);
    try {
      await api.put('/admin/menus/reorder', {
        items: menus.map((m, i) => ({ id: m._id, order: i + 1 })),
      });
      toast.success('Order saved');
    } catch { toast.error('Failed to save order'); }
  };

  // Top-level menus for parent dropdown
  const topLevel = menus.filter(m => !m.parentId);

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flat list with drag reorder */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600">All Items (drag to reorder)</h2>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : menus.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No menu items yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {menus.map((m, i) => (
                <div key={m._id} draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={e => onDragOver(e, i)}
                  onDragEnd={onDragEnd}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${dragIdx === i ? 'opacity-50 bg-blue-50' : ''}`}>
                  <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {m.parentId && <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                      <span className={`font-medium text-sm ${m.parentId ? 'text-gray-600' : 'text-gray-800'}`}>{m.name}</span>
                      {m.parentId && <span className="text-xs text-gray-400">({m.parentId.name})</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.url || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.isActive ? 'Active' : 'Off'}
                    </span>
                    <button onClick={() => handleToggle(m)} className="text-gray-400 hover:text-blue-500 p-1">
                      {m.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-yellow-500 p-1"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(m._id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tree preview */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600">Menu Preview (Frontend)</h2>
          </div>
          <div className="p-4">
            {topLevel.filter(m => m.isActive).length === 0 ? (
              <p className="text-gray-400 text-sm">No active top-level items.</p>
            ) : (
              <nav className="space-y-1">
                {topLevel.filter(m => m.isActive).map(m => {
                  const children = menus.filter(c => c.parentId?._id === m._id && c.isActive);
                  return (
                    <div key={m._id}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm font-medium text-gray-700">
                        {m.icon && <span>{m.icon}</span>}
                        <span>{m.name}</span>
                        {m.url && <span className="text-xs text-gray-400 ml-auto font-mono">{m.url}</span>}
                        {children.length > 0 && <ChevronRight size={14} className="text-gray-400 ml-auto" />}
                      </div>
                      {children.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {children.map(c => (
                            <div key={c._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-gray-50/50">
                              <ChevronRight size={12} className="text-gray-300" />
                              <span>{c.name}</span>
                              {c.url && <span className="text-xs text-gray-400 ml-auto font-mono">{c.url}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Menu Item' : 'Add Menu Item'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={input} placeholder="e.g. Properties" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={input} placeholder="/properties" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className={input}>
                  <option value="_self">Same tab</option>
                  <option value="_blank">New tab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className={input} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
              <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className={input}>
                <option value="">— Top level —</option>
                {topLevel.filter(m => m._id !== editing?._id).map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
              <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className={input} placeholder="e.g. 🏠 or icon-name" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
