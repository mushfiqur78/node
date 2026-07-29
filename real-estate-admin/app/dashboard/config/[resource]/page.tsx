'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import toast, { Toaster } from 'react-hot-toast';

interface Item { _id: string; name: string; isActive: boolean; [key: string]: any }

const RESOURCE_LABELS: Record<string, string> = {
  'property-types':  'Property Types',
  'locations':       'Locations',
  'statuses':        'Statuses',
  'purposes':        'Purposes',
  'features':        'Features',
  'blog-categories': 'Blog Categories',
};

const EXTRA_FIELDS: Record<string, { key: string; label: string; type?: string; options?: string[] }[]> = {
  'locations': [{ key: 'city', label: 'City' }],
  'statuses':  [{ key: 'color', label: 'Color', type: 'color' }],
  'features':  [
    { key: 'category', label: 'Category', type: 'select', options: ['primary', 'amenity', 'other'] },
    { key: 'icon', label: 'Icon' },
  ],
};

export default function ConfigPage() {
  const { resource } = useParams<{ resource: string }>();
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Item | null>(null);
  const [form, setForm]           = useState<Record<string, string>>({});

  const label = RESOURCE_LABELS[resource] || resource;
  const extraFields = EXTRA_FIELDS[resource] || [];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/config/${resource}`);
      setItems(res.data.data.items);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [resource]);

  const openCreate = () => { setEditing(null); setForm({ name: '' }); setShowModal(true); };
  const openEdit   = (item: Item) => { setEditing(item); setForm({ name: item.name, ...Object.fromEntries(extraFields.map(f => [f.key, item[f.key] || ''])) }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/config/${resource}/${editing._id}`, form);
        toast.success('Updated');
      } else {
        await api.post(`/admin/config/${resource}`, form);
        toast.success('Created');
      }
      setShowModal(false);
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/admin/config/${resource}/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/admin/config/${resource}/${id}/toggle`);
      fetchItems();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{label}</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No items yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                {extraFields.map(f => <th key={f.key} className="px-4 py-3 text-left">{f.label}</th>)}
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  {extraFields.map(f => (
                    <td key={f.key} className="px-4 py-3 text-gray-600">
                      {f.type === 'color'
                        ? <span className="inline-block w-5 h-5 rounded-full border" style={{ backgroundColor: item[f.key] }} />
                        : item[f.key] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggle(item._id)} className="text-gray-400 hover:text-blue-500">
                        {item.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-yellow-500"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? `Edit ${label}` : `Add ${label}`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {extraFields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select {f.label}</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
