'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import toast, { Toaster } from 'react-hot-toast';

interface AdminFlags {
  hasDiningSpace: boolean;
  hasLivingRoom: boolean;
  isVerified: boolean;
  isRedHot: boolean;
}

interface Property {
  _id: string;
  propertyId: string;
  title: string;
  status: string;
  source: string;
  expiryDate?: string;
  type: { name: string };
  location: { name: string };
  purpose: { name: string };
  owner: { name: string };
  adminFlags: AdminFlags;
}

const DEFAULT_FLAGS: AdminFlags = { hasDiningSpace: false, hasLivingRoom: false, isVerified: false, isRedHot: false };

const FLAG_LABELS: { key: keyof AdminFlags; label: string }[] = [
  { key: 'hasDiningSpace', label: 'Dining Space' },
  { key: 'hasLivingRoom',  label: 'Living Room' },
  { key: 'isVerified',     label: 'Verified' },
  { key: 'isRedHot',       label: 'Red Hot' },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [flagsModal, setFlagsModal]     = useState<Property | null>(null);
  const [flags, setFlags]               = useState<AdminFlags>(DEFAULT_FLAGS);

  const fetchProperties = async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      const res = await api.get('/admin/properties', { params });
      setProperties(res.data.data.properties);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(1); }, [statusFilter, sourceFilter]);

  const handleApprove = async (id: string) => {
    try { await api.put(`/admin/properties/${id}/approve`); toast.success('Approved'); fetchProperties(page); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id: string) => {
    try { await api.put(`/admin/properties/${id}/reject`); toast.success('Rejected'); fetchProperties(page); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    try { await api.delete(`/admin/properties/${id}`); toast.success('Deleted'); fetchProperties(page); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const openFlagsModal = (p: Property) => {
    setFlagsModal(p);
    setFlags(p.adminFlags || DEFAULT_FLAGS);
  };

  const handleSaveFlags = async () => {
    if (!flagsModal) return;
    try {
      await api.put(`/admin/properties/${flagsModal._id}/flags`, flags);
      toast.success('Flags updated');
      setFlagsModal(null);
      fetchProperties(page);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { header: 'ID',       accessor: (p: Property) => <span className="font-mono text-xs text-blue-600">{p.propertyId || '—'}</span> },
    { header: 'Title',    accessor: (p: Property) => (
      <div>
        <span>{p.title}</span>
        {p.expiryDate && (() => {
          const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / 86400000);
          if (days < 0)  return <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Expired</span>;
          if (days <= 3) return <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Expires {days}d</span>;
          if (days <= 7) return <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">Expires {days}d</span>;
          return null;
        })()}
      </div>
    ) },
    { header: 'Type',     accessor: (p: Property) => p.type?.name || '—' },
    { header: 'Location', accessor: (p: Property) => p.location?.name || '—' },
    { header: 'Purpose',  accessor: (p: Property) => p.purpose?.name || '—' },
    { header: 'Owner',    accessor: (p: Property) => p.owner?.name || '—' },
    { header: 'Source',   accessor: (p: Property) => <Badge label={p.source} /> },
    { header: 'Status',   accessor: (p: Property) => <Badge label={p.status} /> },
    {
      header: 'Actions',
      accessor: (p: Property) => (
        <div className="flex gap-2 flex-wrap">
          {p.status === 'pending' && (
            <>
              <button onClick={() => handleApprove(p._id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Approve</button>
              <button onClick={() => handleReject(p._id)} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Reject</button>
            </>
          )}
          <Link href={`/dashboard/properties/${p._id}/edit`} className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">Edit</Link>
          <button onClick={() => openFlagsModal(p)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Flags</button>
          <button onClick={() => handleDelete(p._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Properties <span className="text-gray-400 text-lg font-normal">({total})</span>
        </h1>
        <Link href="/dashboard/properties/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + Add Property
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Sources</option>
            <option value="marketplace">Marketplace</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <Table columns={columns} data={properties} loading={loading} />
        <div className="px-4 pb-4">
          <Pagination page={page} pages={pages} onPageChange={fetchProperties} />
        </div>
      </div>

      {flagsModal && (
        <Modal title={`Flags — ${flagsModal.title}`} onClose={() => setFlagsModal(null)}>
          <div className="space-y-3 mb-4">
            {FLAG_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={flags[key]}
                  onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveFlags} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setFlagsModal(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
