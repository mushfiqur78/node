'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import { toFullUrl } from '@/lib/utils';

const inp  = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const area = `${inp} resize-none`;

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

// ── Image upload button ───────────────────────────────────────────
function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/about/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.data.url);
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value && <img src={toFullUrl(value)} alt="" className="h-16 w-24 object-cover rounded-lg border" />}
        <label className="cursor-pointer flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
          <ImageIcon size={14} /> {uploading ? 'Uploading...' : value ? 'Change' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {value && <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 hover:underline">Remove</button>}
      </div>
    </div>
  );
}

// ── Default state ─────────────────────────────────────────────────
const DEFAULT = {
  hero:     { heading: 'About Us', subheading: '', image: '' },
  overview: { title: 'Who We Are', description: '', image: '' },
  stats:    [{ label: 'Properties', value: '200+', icon: 'building' }],
  mission:  { title: 'Our Mission', description: '' },
  vision:   { title: 'Our Vision',  description: '' },
  whyUs:    { title: 'Why Choose Us', subtitle: '', items: [{ title: '', description: '', icon: 'check' }] },
  team:     { title: 'Meet Our Team', subtitle: '', members: [] as any[] },
  contact:  { address: '', phone: '', email: '', mapEmbed: '' },
};

export default function AboutPageAdmin() {
  const [form, setForm]     = useState<any>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/about').then(res => {
      const d = res.data.data.about;
      setForm({
        hero:     d.hero     || DEFAULT.hero,
        overview: d.overview || DEFAULT.overview,
        stats:    d.stats?.length ? d.stats : DEFAULT.stats,
        mission:  d.mission  || DEFAULT.mission,
        vision:   d.vision   || DEFAULT.vision,
        whyUs:    d.whyUs    || DEFAULT.whyUs,
        team:     d.team     || DEFAULT.team,
        contact:  d.contact  || DEFAULT.contact,
      });
    }).catch(() => toast.error('Failed to load'));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/about', form);
      toast.success('About page saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const setSection = (section: string, key: string, val: any) =>
    setForm((f: any) => ({ ...f, [section]: { ...f[section], [key]: val } }));

  const setStat = (i: number, key: string, val: string) =>
    setForm((f: any) => { const s = [...f.stats]; s[i] = { ...s[i], [key]: val }; return { ...f, stats: s }; });

  const addStat = () =>
    setForm((f: any) => ({ ...f, stats: [...f.stats, { label: '', value: '', icon: 'building' }] }));

  const removeStat = (i: number) =>
    setForm((f: any) => ({ ...f, stats: f.stats.filter((_: any, idx: number) => idx !== i) }));

  const setWhyItem = (i: number, key: string, val: string) =>
    setForm((f: any) => { const items = [...f.whyUs.items]; items[i] = { ...items[i], [key]: val }; return { ...f, whyUs: { ...f.whyUs, items } }; });

  const addWhyItem = () =>
    setForm((f: any) => ({ ...f, whyUs: { ...f.whyUs, items: [...f.whyUs.items, { title: '', description: '', icon: 'check' }] } }));

  const removeWhyItem = (i: number) =>
    setForm((f: any) => ({ ...f, whyUs: { ...f.whyUs, items: f.whyUs.items.filter((_: any, idx: number) => idx !== i) } }));

  const setMember = (i: number, key: string, val: string) =>
    setForm((f: any) => { const members = [...f.team.members]; members[i] = { ...members[i], [key]: val }; return { ...f, team: { ...f.team, members } }; });

  const addMember = () =>
    setForm((f: any) => ({ ...f, team: { ...f.team, members: [...f.team.members, { name: '', role: '', image: '', bio: '', facebook: '', linkedin: '', phone: '' }] } }));

  const removeMember = (i: number) =>
    setForm((f: any) => ({ ...f, team: { ...f.team, members: f.team.members.filter((_: any, idx: number) => idx !== i) } }));

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">About Page</h1>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Hero */}
      <Section title="Hero Section">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-600 mb-1">Heading</label>
            <input value={form.hero.heading} onChange={e => setSection('hero', 'heading', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Subheading</label>
            <input value={form.hero.subheading} onChange={e => setSection('hero', 'subheading', e.target.value)} className={inp} /></div>
        </div>
        <ImageUpload label="Background Image" value={form.hero.image} onChange={v => setSection('hero', 'image', v)} />
      </Section>

      {/* Overview */}
      <Section title="Company Overview">
        <div><label className="block text-xs text-gray-600 mb-1">Title</label>
          <input value={form.overview.title} onChange={e => setSection('overview', 'title', e.target.value)} className={inp} /></div>
        <div><label className="block text-xs text-gray-600 mb-1">Description</label>
          <textarea rows={4} value={form.overview.description} onChange={e => setSection('overview', 'description', e.target.value)} className={area} /></div>
        <ImageUpload label="Section Image" value={form.overview.image} onChange={v => setSection('overview', 'image', v)} />
      </Section>

      {/* Stats */}
      <Section title="Stats / Numbers">
        <div className="space-y-3">
          {form.stats.map((stat: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Value e.g. 200+" value={stat.value} onChange={e => setStat(i, 'value', e.target.value)} className={`${inp} flex-1`} />
              <input placeholder="Label e.g. Properties" value={stat.label} onChange={e => setStat(i, 'label', e.target.value)} className={`${inp} flex-1`} />
              <button onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
            </div>
          ))}
          <button onClick={addStat} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Plus size={14} /> Add Stat
          </button>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section title="Mission & Vision">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input placeholder="Mission Title" value={form.mission.title} onChange={e => setSection('mission', 'title', e.target.value)} className={inp} />
            <textarea rows={3} placeholder="Mission description..." value={form.mission.description} onChange={e => setSection('mission', 'description', e.target.value)} className={area} />
          </div>
          <div className="space-y-2">
            <input placeholder="Vision Title" value={form.vision.title} onChange={e => setSection('vision', 'title', e.target.value)} className={inp} />
            <textarea rows={3} placeholder="Vision description..." value={form.vision.description} onChange={e => setSection('vision', 'description', e.target.value)} className={area} />
          </div>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section title="Why Choose Us">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-gray-600 mb-1">Section Title</label>
            <input value={form.whyUs.title} onChange={e => setForm((f: any) => ({ ...f, whyUs: { ...f.whyUs, title: e.target.value } }))} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Subtitle</label>
            <input value={form.whyUs.subtitle} onChange={e => setForm((f: any) => ({ ...f, whyUs: { ...f.whyUs, subtitle: e.target.value } }))} className={inp} /></div>
        </div>
        <div className="space-y-3">
          {form.whyUs.items.map((item: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input placeholder="Title" value={item.title} onChange={e => setWhyItem(i, 'title', e.target.value)} className={`${inp} flex-1`} />
                <button onClick={() => removeWhyItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
              <textarea rows={2} placeholder="Description" value={item.description} onChange={e => setWhyItem(i, 'description', e.target.value)} className={area} />
            </div>
          ))}
          <button onClick={addWhyItem} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </Section>

      {/* Team */}
      <Section title="Team Members">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-gray-600 mb-1">Section Title</label>
            <input value={form.team.title} onChange={e => setForm((f: any) => ({ ...f, team: { ...f.team, title: e.target.value } }))} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Subtitle</label>
            <input value={form.team.subtitle} onChange={e => setForm((f: any) => ({ ...f, team: { ...f.team, subtitle: e.target.value } }))} className={inp} /></div>
        </div>
        <div className="space-y-4">
          {form.team.members.map((m: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Member {i + 1}</span>
                <button onClick={() => removeMember(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Name" value={m.name} onChange={e => setMember(i, 'name', e.target.value)} className={inp} />
                <input placeholder="Role / Designation" value={m.role} onChange={e => setMember(i, 'role', e.target.value)} className={inp} />
                <input placeholder="Phone" value={m.phone} onChange={e => setMember(i, 'phone', e.target.value)} className={inp} />
                <input placeholder="Facebook URL" value={m.facebook} onChange={e => setMember(i, 'facebook', e.target.value)} className={inp} />
                <input placeholder="LinkedIn URL" value={m.linkedin} onChange={e => setMember(i, 'linkedin', e.target.value)} className={`${inp} col-span-2`} />
              </div>
              <textarea rows={2} placeholder="Short bio" value={m.bio} onChange={e => setMember(i, 'bio', e.target.value)} className={area} />
              <ImageUpload label="Photo" value={m.image}
                onChange={v => setMember(i, 'image', v)} />
            </div>
          ))}
          <button onClick={addMember} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Plus size={14} /> Add Team Member
          </button>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-600 mb-1">Address</label>
            <input value={form.contact.address} onChange={e => setSection('contact', 'address', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Phone</label>
            <input value={form.contact.phone} onChange={e => setSection('contact', 'phone', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Email</label>
            <input value={form.contact.email} onChange={e => setSection('contact', 'email', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs text-gray-600 mb-1">Google Maps Embed URL</label>
            <input value={form.contact.mapEmbed} onChange={e => setSection('contact', 'mapEmbed', e.target.value)} className={inp} placeholder="https://maps.google.com/maps?..." /></div>
        </div>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition">
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
