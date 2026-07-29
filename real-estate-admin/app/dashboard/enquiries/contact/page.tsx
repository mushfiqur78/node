'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, MailOpen, Trash2 } from 'lucide-react';

export default function ContactEnquiriesPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/enquiries', { params: { limit: 100 } });
      // Contact enquiries = no property
      const all = res.data.data.enquiries as any[];
      const filtered = all.filter(e => !e.property);
      setItems(filtered);
      setTotal(filtered.length);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id: string) => {
    try { await api.put(`/admin/enquiries/${id}/read`); fetch(); } catch { toast.error('Failed'); }
  };
  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/admin/enquiries/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Us Enquiries <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div>
        : items.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">No contact enquiries found.</div>
        : (
          <div className="space-y-3">
            {items.map(e => (
              <div key={e._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${e.isRead ? 'border-gray-200' : 'border-green-500'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!e.isRead && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                      <span className="font-semibold text-gray-800">{e.name}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">{e.email}</span>
                      {e.phone && <><span className="text-gray-400">·</span><span className="text-sm text-gray-500">{e.phone}</span></>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{new Date(e.createdAt).toLocaleDateString()}</p>
                    <p className={`text-sm text-gray-600 ${expanded === e._id ? '' : 'line-clamp-2'}`}>{e.message}</p>
                    {e.message?.length > 100 && (
                      <button onClick={() => setExpanded(expanded === e._id ? null : e._id)} className="text-xs text-blue-500 mt-1">
                        {expanded === e._id ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!e.isRead && <button onClick={() => markRead(e._id)} className="text-gray-400 hover:text-blue-500"><Mail size={18} /></button>}
                    {e.isRead && <MailOpen size={18} className="text-gray-300" />}
                    <button onClick={() => del(e._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
