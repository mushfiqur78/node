'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, MailOpen, Trash2 } from 'lucide-react';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  property: { title: string; featuredImage: string };
  createdAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchEnquiries = async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (filter !== '') params.isRead = filter;
      const res = await api.get('/admin/enquiries', { params });
      setEnquiries(res.data.data.enquiries);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEnquiries(1); }, [filter]);

  const handleRead = async (id: string) => {
    try { await api.put(`/admin/enquiries/${id}/read`); fetchEnquiries(page); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    try { await api.delete(`/admin/enquiries/${id}`); toast.success('Deleted'); fetchEnquiries(page); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">No enquiries found.</div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${e.isRead ? 'border-gray-200' : 'border-blue-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!e.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    <span className="font-semibold text-gray-800">{e.name}</span>
                    <span className="text-gray-400 text-sm">·</span>
                    <span className="text-sm text-gray-500">{e.email}</span>
                    {e.phone && <><span className="text-gray-400 text-sm">·</span><span className="text-sm text-gray-500">{e.phone}</span></>}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    Property: <span className="text-gray-600">{e.property?.title || '—'}</span>
                    <span className="ml-3">{new Date(e.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className={`text-sm text-gray-600 ${expanded === e._id ? '' : 'line-clamp-2'}`}>{e.message}</p>
                  {e.message.length > 100 && (
                    <button onClick={() => setExpanded(expanded === e._id ? null : e._id)} className="text-xs text-blue-500 mt-1">
                      {expanded === e._id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!e.isRead && (
                    <button onClick={() => handleRead(e._id)} title="Mark as read" className="text-gray-400 hover:text-blue-500">
                      <Mail size={18} />
                    </button>
                  )}
                  {e.isRead && <MailOpen size={18} className="text-gray-300" />}
                  <button onClick={() => handleDelete(e._id)} title="Delete" className="text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pages} onPageChange={fetchEnquiries} />
    </div>
  );
}
