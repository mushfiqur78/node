'use client';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import BlogForm from '@/components/blog/BlogForm';

export default function AddBlogPage() {
  const router = useRouter();
  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">New Blog Post</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>
      <BlogForm />
    </div>
  );
}
