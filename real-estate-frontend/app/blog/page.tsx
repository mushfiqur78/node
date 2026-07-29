'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import { Calendar, User, Tag, Search, ChevronRight, Home } from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: { url: string; alt?: string };
  category?: string;
  tags?: string[];
  author?: { name: string };
  publishedAt?: string;
  createdAt: string;
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [search, setSearch]   = useState('');
  const [query,  setQuery]    = useState('');
  const [page,   setPage]     = useState(1);
  const limit = 9;

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', query, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page',  String(page));
      params.set('limit', String(limit));
      if (query) params.set('search', query);
      const { data } = await api.get(`/blogs?${params.toString()}`);
      return data.data as { blogs: Blog[]; total: number; pages: number };
    },
  });

  const blogs = data?.blogs || [];
  const totalPages = data?.pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="flex items-center text-gray-500 hover:text-[#005e9e]">
              <Home size={15} className="mr-1" /> Home
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Blog</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {data?.total ? `${data.total} articles` : 'Latest articles & insights'}
              </p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4] transition"
                />
              </div>
              <button type="submit"
                className="px-4 py-2.5 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-xl transition">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No articles found.</p>
            {query && (
              <button onClick={() => { setQuery(''); setSearch(''); setPage(1); }}
                className="text-[#005e9e] hover:underline text-sm">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <Link key={blog._id} href={`/blog/${blog.slug}`}>
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
                      {blog.featuredImage?.url ? (
                        <img
                          src={toFullUrl(blog.featuredImage.url)}
                          alt={blog.featuredImage.alt || blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#cce5f5] to-[#e6f2fa] flex items-center justify-center">
                          <span className="text-[#7ab8d9] text-4xl font-bold">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      {blog.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#005e9e] text-white text-xs font-semibold rounded-full">
                          {blog.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#005e9e] transition-colors">
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {blog.author?.name || 'Admin'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-BD', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      p === page
                        ? 'bg-[#005e9e] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
