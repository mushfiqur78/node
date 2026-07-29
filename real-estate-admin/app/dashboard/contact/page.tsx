'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';

const inp  = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const area = `${inp} resize-none`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

const EMPTY_OFFICE = { label: '', address: '', phone: '', email: '', hours: '' };

const DEFAULT = {
  hero:        { heading: 'Contact Us', subheading: '' },
  offices:     [{ ...EMPTY_OFFICE, label: 'Head Office' }],
  mapEmbed:    '',
  social:      { facebook: '', instagram: '', linkedin: '', whatsapp: '' },
  showForm:    true,
  formHeading: 'Send Us a Message',
};

export default function ContactPageAdmin() {
  const [form, setForm]     = useState<any>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/contact-page').then(res => {
      const d = res.data.data.page;
      setForm({
        hero:        d.hero        || DEFAULT.hero,
        offices:     d.offices?.length ? d.offices : DEFAULT.offices,
        mapEmbed:    d.mapEmbed    || '',
        social:      d.social      || DEFAULT.social,
        showForm:    d.showForm    ?? true,
        formHeading: d.formHeading || DEFAULT.formHeading,
      });
    }).catch(() => toast.error('Failed to load'));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/contact-page', form);
      toast.success('Contact page saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const setOffice = (i: number, k: string, v: string) =>
    setForm((f: any) => { const o = [...f.offices]; o[i] = { ...o[i], [k]: v }; return { ...f, offices: o }; });

  const addOffice    = () => setForm((f: any) => ({ ...f, offices: [...f.offices, { ...EMPTY_OFFICE }] }));
  const removeOffice = (i: number) => setForm((f: any) => ({ ...f, offices: f.offices.filter((_: any, idx: number) => idx !== i) }));

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Contact Page</h1>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Hero */}
      <Section title="Hero Section">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Heading</label>
            <input value={form.hero.heading} onChange={e => setForm((f: any) => ({ ...f, hero: { ...f.hero, heading: e.target.value } }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Subheading</label>
            <input value={form.hero.subheading} onChange={e => setForm((f: any) => ({ ...f, hero: { ...f.hero, subheading: e.target.value } }))} className={inp} />
          </div>
        </div>
      </Section>

      {/* Offices */}
      <Section title="Office Locations">
        <div className="space-y-4">
          {form.offices.map((office: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Office {i + 1}</span>
                {form.offices.length > 1 && (
                  <button onClick={() => removeOffice(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-gray-500 mb-1">Label (e.g. Head Office)</label>
                  <input value={office.label} onChange={e => setOffice(i, 'label', e.target.value)} className={inp} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input value={office.phone} onChange={e => setOffice(i, 'phone', e.target.value)} className={inp} /></div>
                <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Address</label>
                  <input value={office.address} onChange={e => setOffice(i, 'address', e.target.value)} className={inp} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input value={office.email} onChange={e => setOffice(i, 'email', e.target.value)} className={inp} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Office Hours</label>
                  <input value={office.hours} onChange={e => setOffice(i, 'hours', e.target.value)} placeholder="Sat–Thu: 9am–6pm" className={inp} /></div>
              </div>
            </div>
          ))}
          <button onClick={addOffice} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Plus size={14} /> Add Office
          </button>
        </div>
      </Section>

      {/* Map */}
      <Section title="Google Maps Embed">
        <label className="block text-xs text-gray-600 mb-1">Embed URL (from Google Maps → Share → Embed)</label>
        <input value={form.mapEmbed} onChange={e => setForm((f: any) => ({ ...f, mapEmbed: e.target.value }))}
          placeholder="https://maps.google.com/maps?..." className={inp} />
        {form.mapEmbed && (
          <div className="mt-3 rounded-lg overflow-hidden border h-48">
            <iframe src={form.mapEmbed} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
          </div>
        )}
      </Section>

      {/* Social */}
      <Section title="Social Media Links">
        <div className="grid grid-cols-2 gap-3">
          {(['facebook', 'instagram', 'linkedin', 'whatsapp'] as const).map(s => (
            <div key={s}>
              <label className="block text-xs text-gray-600 mb-1 capitalize">{s}</label>
              <input value={form.social[s]} onChange={e => setForm((f: any) => ({ ...f, social: { ...f.social, [s]: e.target.value } }))}
                placeholder={s === 'whatsapp' ? '8801XXXXXXXXX' : `https://${s}.com/...`} className={inp} />
            </div>
          ))}
        </div>
      </Section>

      {/* Contact Form */}
      <Section title="Contact Form">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={form.showForm} onChange={e => setForm((f: any) => ({ ...f, showForm: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">Show contact form on page</span>
        </label>
        {form.showForm && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Form Heading</label>
            <input value={form.formHeading} onChange={e => setForm((f: any) => ({ ...f, formHeading: e.target.value }))} className={inp} />
          </div>
        )}
      </Section>

      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition">
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
