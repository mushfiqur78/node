'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import { Calendar, User, Tag, Home, ChevronRight, ArrowLeft } from 'lucide-react';

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data.data.blog;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-4 w-48 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded" />
          <div className="h-10 w-3/4 skeleton rounded" />
          <div className="h-72 skeleton rounded-2xl" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-4 skeleton rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Article not found</h2>
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005e9e] text-white rounded-xl hover:bg-[#004d84] transition text-sm font-semibold">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const blog = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center flex-wrap gap-1.5 text-sm">
            <Link href="/" className="flex items-center text-gray-500 hover:text-[#005e9e]">
              <Home size={14} className="mr-1" /> Home
            </Link>
            <ChevronRight size={13} className="text-gray-400" />
            <Link href="/blog" className="text-gray-500 hover:text-[#005e9e]">Blog</Link>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{blog.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Category */}
        {blog.category && (
          <span className="inline-block px-3 py-1 bg-[#cce5f5] text-[#004d84] text-xs font-semibold rounded-full mb-4">
            {blog.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {blog.author?.name || 'Admin'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-BD', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </span>
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag size={14} />
              {blog.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage?.url && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img
              src={toFullUrl(blog.featuredImage.url)}
              alt={blog.featuredImage.alt || blog.title}
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6 italic border-l-4 border-blue-500 pl-4">
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
