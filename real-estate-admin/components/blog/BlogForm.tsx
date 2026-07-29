'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ImageUploader, { ImageMeta } from '@/components/property/ImageUploader';
import MediaPicker from '@/components/property/MediaPicker';
import RichTextEditor from './RichTextEditor';

import { API_BASE, toFullUrl } from '@/lib/utils';
const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>;
}

interface BlogFormProps {
  initialData?: any;
  blogId?: string;
}

export default function BlogForm({ initialData, blogId }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!blogId;

  const [form, setForm] = useState({
    title:    initialData?.title    || '',
    slug:     initialData?.slug     || '',
    excerpt:  initialData?.excerpt  || '',
    content:  initialData?.content  || '',
    category: initialData?.category || '',
    tags:     initialData?.tags?.join(', ') || '',
    status:   initialData?.status   || 'draft',
    seo: {
      metaTitle:       initialData?.seo?.metaTitle       || '',
      metaDescription: initialData?.seo?.metaDescription || '',
      ogTitle:         initialData?.seo?.ogTitle         || '',
      ogDescription:   initialData?.seo?.ogDescription   || '',
      schemaMarkup:    initialData?.seo?.schemaMarkup ? JSON.stringify(initialData.seo.schemaMarkup, null, 2) : '',
    },
  });

  const [featuredImage, setFeaturedImage] = useState<ImageMeta[]>(
    initialData?.featuredImage?.url
      ? [{ file: null as any, url: `${API_BASE}${initialData.featuredImage.url}`, alt: initialData.featuredImage.alt || '', title: initialData.featuredImage.title || '' }]
      : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    api.get('/admin/config/blog-categories')
      .then(res => setCategories(res.data.data.items))
      .catch(() => {});
  }, []);

  const set    = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setSeo = (k: string, v: string) => setForm(f => ({ ...f, seo: { ...f.seo, [k]: v } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();

      // Scalar fields
      fd.append('title',    form.title);
      fd.append('excerpt',  form.excerpt);
      fd.append('content',  form.content);
      fd.append('category', form.category);
      fd.append('status',   form.status);
      if (form.slug) fd.append('slug', form.slug);

      // Tags as JSON array
      const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      fd.append('tags', JSON.stringify(tagsArr));

      // SEO
      const seoData = { ...form.seo };
      if (seoData.schemaMarkup) {
        try { seoData.schemaMarkup = JSON.parse(seoData.schemaMarkup); } catch {}
      }
      fd.append('seo', JSON.stringify(seoData));

      // Featured image
      if (featuredImage[0]?.file) {
        fd.append('featuredImage', featuredImage[0].file);
        fd.append('featuredImageMeta', JSON.stringify({ alt: featuredImage[0].alt, title: featuredImage[0].title }));
      } else if (featuredImage[0]?.url) {
        const cleanUrl = featuredImage[0].url.replace(API_BASE, '');
        fd.append('featuredImageUrl', JSON.stringify({ url: cleanUrl, alt: featuredImage[0].alt, title: featuredImage[0].title }));
      }

      if (isEdit) {
        await api.put(`/admin/blogs/${blogId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Blog updated');
      } else {
        await api.post('/admin/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Blog created');
      }
      router.push('/dashboard/blogs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <Section title="Content">
        <Field label="Title *">
          <input required value={form.title} onChange={e => set('title', e.target.value)} className={input} />
        </Field>
        <Field label="Slug (auto-generated)">
          <input value={form.slug} onChange={e => set('slug', e.target.value)} className={input} placeholder="auto-generated from title" />
        </Field>
        <Field label="Excerpt (max 300 chars)">
          <textarea rows={3} maxLength={300} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={input} />
        </Field>
        <Field label="Content *">
          <RichTextEditor value={form.content} onChange={v => set('content', v)} />
        </Field>
      </Section>

      <Section title="Settings">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Category">
            <select value={form.category} onChange={e => set('category', e.target.value)} className={input}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input value={form.tags} onChange={e => set('tags', e.target.value)} className={input} placeholder="real estate, tips, market" />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={input}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Featured Image">
        <ImageUploader label="Upload Image" onChange={setFeaturedImage} />
        <div className="mt-2">
          <MediaPicker label="Or pick from library" selected={featuredImage} onChange={setFeaturedImage} />
        </div>
      </Section>

      <Section title="SEO (Optional)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Meta Title (max 60)">
            <input maxLength={60} value={form.seo.metaTitle} onChange={e => setSeo('metaTitle', e.target.value)} className={input} />
          </Field>
          <Field label="Meta Description (max 160)">
            <input maxLength={160} value={form.seo.metaDescription} onChange={e => setSeo('metaDescription', e.target.value)} className={input} />
          </Field>
          <Field label="OG Title">
            <input value={form.seo.ogTitle} onChange={e => setSeo('ogTitle', e.target.value)} className={input} />
          </Field>
          <Field label="OG Description">
            <input value={form.seo.ogDescription} onChange={e => setSeo('ogDescription', e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="Schema Markup (JSON-LD)">
          <textarea rows={4} value={form.seo.schemaMarkup} onChange={e => setSeo('schemaMarkup', e.target.value)}
            className={`${input} font-mono text-xs`} placeholder='{"@context":"https://schema.org",...}' />
        </Field>
      </Section>

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 border rounded-xl hover:bg-gray-50 text-gray-600">Cancel</button>
      </div>
    </form>
  );
}
