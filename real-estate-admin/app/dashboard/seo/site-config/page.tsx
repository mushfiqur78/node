'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Save, Info } from 'lucide-react';

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-1">{title}</h2>
      {desc && <p className="text-xs text-gray-400 mb-4">{desc}</p>}
      <div className="space-y-4 mt-3">{children}</div>
    </div>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function SiteConfigPage() {
  const [form, setForm]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.get('/admin/site-config').then(res => {
      const c = res.data.data.config;
      setForm({
        frontendUrl:         c.frontendUrl         || '',
        backendUrl:          c.backendUrl           || '',
        googleAnalyticsId:   c.googleAnalyticsId   || '',
        googleTagManagerId:  c.googleTagManagerId  || '',
        googleSearchConsole: c.googleSearchConsole || '',
        facebookPixelId:     c.facebookPixelId     || '',
        defaultOgImage:      c.defaultOgImage      || '',
        twitterHandle:       c.twitterHandle       || '',
      });
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/admin/site-config', form);
      toast.success('Site config saved');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading || !form) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Site Config</h1>
      <p className="text-sm text-gray-500 mb-6">Configure URLs and analytics — no need to edit .env file</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        <Section title="URLs" desc="Used for sitemap, email links, and SEO canonical URLs">
          <Field label="Frontend URL" hint="e.g. https://yourdomain.com — used in sitemap.xml and email links">
            <input value={form.frontendUrl} onChange={e => set('frontendUrl', e.target.value)}
              className={input} placeholder="https://yourdomain.com" />
          </Field>
          <Field label="Backend / API URL" hint="e.g. https://api.yourdomain.com">
            <input value={form.backendUrl} onChange={e => set('backendUrl', e.target.value)}
              className={input} placeholder="https://api.yourdomain.com" />
          </Field>
        </Section>

        <Section title="Google Analytics & Tag Manager" desc="Paste your tracking IDs — injected automatically in frontend">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Google Analytics 4 ID" hint="Format: G-XXXXXXXXXX">
              <input value={form.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)}
                className={input} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Google Tag Manager ID" hint="Format: GTM-XXXXXXX">
              <input value={form.googleTagManagerId} onChange={e => set('googleTagManagerId', e.target.value)}
                className={input} placeholder="GTM-XXXXXXX" />
            </Field>
          </div>
          <Field label="Google Search Console Verification" hint="Paste the content value from the meta tag">
            <input value={form.googleSearchConsole} onChange={e => set('googleSearchConsole', e.target.value)}
              className={input} placeholder="abc123xyz..." />
          </Field>
        </Section>

        <Section title="Social & Pixel" desc="Social media tracking and sharing defaults">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Facebook Pixel ID">
              <input value={form.facebookPixelId} onChange={e => set('facebookPixelId', e.target.value)}
                className={input} placeholder="1234567890" />
            </Field>
            <Field label="Twitter / X Handle" hint="Without @">
              <input value={form.twitterHandle} onChange={e => set('twitterHandle', e.target.value)}
                className={input} placeholder="yourhandle" />
            </Field>
          </div>
          <Field label="Default OG Image URL" hint="Fallback image for social sharing when no specific image is set">
            <input value={form.defaultOgImage} onChange={e => set('defaultOgImage', e.target.value)}
              className={input} placeholder="https://yourdomain.com/og-default.jpg" />
          </Field>
        </Section>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">How it works</p>
            <p className="text-xs mt-1">Frontend URL is used in <strong>sitemap.xml</strong> and email notification links. Analytics IDs are fetched by the Next.js frontend via <code className="bg-blue-100 px-1 rounded">/api/site-config</code> and injected into page headers automatically.</p>
          </div>
        </div>

        <div className="pb-8">
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </form>
    </div>
  );
}
