'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  author: { name: string };
  publishedAt: string;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs]     = useState<Blog[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBlogs = async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/blogs', { params });
      setBlogs(res.data.data.blogs);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(1); }, [statusFilter]);

  const handleToggle = async (id: string) => {
    try { await api.put(`/admin/blogs/${id}/toggle-status`); fetchBlogs(page); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try { await api.delete(`/admin/blogs/${id}`); toast.success('Deleted'); fetchBlogs(page); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Link href="/dashboard/blogs/add" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No blog posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map(b => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 line-clamp-1">{b.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{b.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{b.author?.name || '—'}</td>
                  <td className="px-4 py-3"><Badge label={b.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggle(b._id)} title={b.status === 'published' ? 'Unpublish' : 'Publish'}
                        className="text-gray-400 hover:text-blue-500">
                        {b.status === 'published' ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                      </button>
                      <Link href={`/dashboard/blogs/${b._id}/edit`} className="text-gray-400 hover:text-yellow-500"><Pencil size={16} /></Link>
                      <button onClick={() => handleDelete(b._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 pb-4">
          <Pagination page={page} pages={pages} onPageChange={fetchBlogs} />
        </div>
      </div>
    </div>
  );
}
