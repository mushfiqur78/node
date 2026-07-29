'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, MailOpen, Trash2, Download, Calendar } from 'lucide-react';

export default function PropertyEnquiriesPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (filter !== '') params.isRead = filter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/admin/enquiries', { params });
      // Only property enquiries (have property field)
      const all = res.data.data.enquiries as any[];
      const filtered = all.filter(e => e.property);
      setItems(filtered);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(1); }, [filter, startDate, endDate]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (filter !== '') params.isRead = filter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await api.get('/admin/enquiries/export', { 
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `property_enquiries_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Exported successfully');
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilter('');
    setStartDate('');
    setEndDate('');
  };

  const markRead = async (id: string) => {
    try { await api.put(`/admin/enquiries/${id}/read`); fetch(page); } catch { toast.error('Failed'); }
  };
  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/admin/enquiries/${id}`); toast.success('Deleted'); fetch(page); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <Toaster />
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Property Enquiries <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
          <button 
            onClick={exportCSV}
            disabled={exporting || items.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {(filter || startDate || endDate) && (
              <button 
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div>
        : items.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">No property enquiries found.</div>
        : (
          <div className="space-y-3">
            {items.map(e => (
              <div key={e._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${e.isRead ? 'border-gray-200' : 'border-blue-500'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!e.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <span className="font-semibold text-gray-800">{e.name}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">{e.email}</span>
                      {e.phone && <><span className="text-gray-400">·</span><span className="text-sm text-gray-500">{e.phone}</span></>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      Property: <span className="text-gray-600 font-medium">{e.property?.title || 'N/A'}</span>
                      <span className="ml-3">{new Date(e.createdAt).toLocaleDateString()}</span>
                    </p>
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
