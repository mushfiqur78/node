'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1); }, [roleFilter]);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success('User approved');
      fetchUsers(page);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success('Updated');
      fetchUsers(page);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Deleted');
      fetchUsers(page);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { header: 'Name',    accessor: 'name' as keyof User },
    { header: 'Email',   accessor: 'email' as keyof User },
    { header: 'Role',    accessor: (u: User) => <Badge label={u.role} /> },
    { header: 'Status',  accessor: (u: User) => <Badge label={u.isActive ? 'active' : 'inactive'} /> },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => handleToggle(u._id)} className={`text-xs px-2 py-1 rounded text-white ${u.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
            {u.isActive ? 'Ban' : 'Unban'}
          </button>
          {u.role !== 'super_admin' && (
            <button onClick={() => handleDelete(u._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Roles</option>
          <option value="owner">Owner</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <Table columns={columns} data={users} loading={loading} />
        <div className="px-4 pb-4">
          <Pagination page={page} pages={pages} onPageChange={fetchUsers} />
        </div>
      </div>
    </div>
  );
}
