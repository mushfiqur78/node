'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import api from '@/lib/api';
import BlogForm from '@/components/blog/BlogForm';

export default function EditBlogPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [blog, setBlog]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/blogs/${id}`)
      .then(res => setBlog(res.data.data.blog))
      .catch(() => router.push('/dashboard/blogs'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Blog Post</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>
      <BlogForm initialData={blog} blogId={id} />
    </div>
  );
}
