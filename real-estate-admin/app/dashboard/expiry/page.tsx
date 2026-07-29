'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { AlertTriangle, Clock, RefreshCw, Trash2, Settings } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';

interface Property {
  _id: string;
  title: string;
  propertyId: string;
  expiryDate: string;
  status: string;
  type: { name: string };
  location: { name: string };
  owner: { name: string; email: string };
}

import { API_BASE, toFullUrl } from '@/lib/utils';

const daysUntil = (date: string) => {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const ExpiryBadge = ({ date, warningDays }: { date: string; warningDays: number }) => {
  const days = daysUntil(date);
  if (days < 0)  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expired {Math.abs(days)}d ago</span>;
  if (days === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expires today</span>;
  if (days <= 3)  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Expires in {days}d</span>;
  if (days <= warningDays) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Expires in {days}d</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Expires in {days}d</span>;
};

export default function ExpiryPage() {
  const [tab, setTab]           = useState<'expired' | 'near'>('expired');
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [summary, setSummary]   = useState<any>(null);
  const [warningDays, setWarningDays] = useState(7);
  const [showSettings, setShowSettings] = useState(false);
  const [settingDays, setSettingDays]   = useState(7);
  const [renewModal, setRenewModal]     = useState<Property | null>(null);
  const [renewDate, setRenewDate]       = useState('');

  const fetchSummary = async () => {
    try {
      const res = await api.get('/admin/expiry/summary');
      setSummary(res.data.data);
      setWarningDays(res.data.data.warningDays);
      setSettingDays(res.data.data.warningDays);
    } catch {}
  };

  const fetchProperties = async (p = 1) => {
    setLoading(true);
    try {
      const endpoint = tab === 'expired' ? '/admin/expiry/expired' : '/admin/expiry/near-expiry';
      const res = await api.get(`${endpoint}?page=${p}&limit=10`);
      setProperties(res.data.data.properties);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchProperties(1); }, [tab]);

  const handleRenew = async () => {
    if (!renewModal || !renewDate) return;
    try {
      await api.put(`/admin/expiry/${renewModal._id}/renew`, { expiryDate: renewDate });
      toast.success('Expiry date updated');
      setRenewModal(null);
      fetchProperties(page);
      fetchSummary();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleRemoveExpiry = async (id: string) => {
    if (!confirm('Remove expiry date? Property will have no expiry.')) return;
    try {
      await api.delete(`/admin/expiry/${id}`);
      toast.success('Expiry removed');
      fetchProperties(page);
      fetchSummary();
    } catch { toast.error('Failed'); }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/admin/expiry/settings', { expiryWarningDays: settingDays });
      toast.success('Settings saved');
      setWarningDays(settingDays);
      setShowSettings(false);
      fetchSummary();
      fetchProperties(page);
    } catch { toast.error('Failed'); }
  };

  // Default renew date = 30 days from now
  const openRenew = (p: Property) => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setRenewDate(d.toISOString().split('T')[0]);
    setRenewModal(p);
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Property Expiry</h1>
        <button onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50">
          <Settings size={16} /> Warning: {warningDays} days
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-600">{summary.expired}</p>
              <p className="text-sm text-red-500">Expired</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <Clock size={24} className="text-yellow-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{summary.nearExpiry}</p>
              <p className="text-sm text-yellow-500">Near Expiry (≤{warningDays}d)</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <RefreshCw size={24} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{summary.withExpiry}</p>
              <p className="text-sm text-blue-500">With Expiry Date</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('expired')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'expired' ? 'bg-red-500 text-white' : 'bg-white border hover:bg-gray-50'}`}>
          Expired ({summary?.expired || 0})
        </button>
        <button onClick={() => setTab('near')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'near' ? 'bg-yellow-500 text-white' : 'bg-white border hover:bg-gray-50'}`}>
          Near Expiry ({summary?.nearExpiry || 0})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
          properties.length === 0 ? <div className="text-center py-10 text-gray-400">No properties found.</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map(p => (
                <tr key={p._id} className={`hover:bg-gray-50 ${daysUntil(p.expiryDate) < 0 ? 'bg-red-50/30' : daysUntil(p.expiryDate) <= 3 ? 'bg-orange-50/30' : 'bg-yellow-50/20'}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.propertyId || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.location?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{p.owner?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{p.owner?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ExpiryBadge date={p.expiryDate} warningDays={warningDays} />
                    <p className="text-xs text-gray-400 mt-1">{new Date(p.expiryDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openRenew(p)}
                        className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                        <RefreshCw size={12} /> Renew
                      </button>
                      <button onClick={() => handleRemoveExpiry(p._id)}
                        className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded border hover:border-red-300">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 pb-4">
          <Pagination page={page} pages={pages} onPageChange={fetchProperties} />
        </div>
      </div>

      {/* Renew Modal */}
      {renewModal && (
        <Modal title={`Renew — ${renewModal.title}`} onClose={() => setRenewModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Expiry Date</label>
              <input type="date" value={renewDate} onChange={e => setRenewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleRenew} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
              <button onClick={() => setRenewModal(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal title="Expiry Warning Settings" onClose={() => setShowSettings(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warning Days Before Expiry
              </label>
              <input type="number" min={1} max={365} value={settingDays} onChange={e => setSettingDays(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">
                Properties expiring within this many days will show a warning color.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>Red — Already expired</p>
              <p><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>Orange — Expires within 3 days</p>
              <p><span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>Yellow — Expires within {settingDays} days</p>
              <p><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>Green — More than {settingDays} days left</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveSettings} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
