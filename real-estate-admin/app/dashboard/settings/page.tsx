'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';

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

export default function GeneralSettingPage() {
  const [form, setForm]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [logoPreview, setLogoPreview]       = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const logoRef    = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/admin/settings').then(res => {
      const s = res.data.data.settings;
      setForm({
        siteName:    s.siteName    || '',
        siteTagline: s.siteTagline || '',
        email:       s.email       || '',
        phone:       s.phone       || '',
        whatsapp:    s.whatsapp    || '',
        address:     s.address     || '',
        footerText:    s.footerText    || '',
        copyrightText: s.copyrightText || '',
        headerScripts: s.headerScripts || '',
        footerScripts: s.footerScripts || '',
        maintenanceMode:            s.maintenanceMode            || false,
        emailNotifications:         s.emailNotifications         || false,
        notifyEnquiry:              s.notifyEnquiry              || false,
        notifyPropertySubmit:       s.notifyPropertySubmit       || false,
        notifyPropertyApproved:     s.notifyPropertyApproved     || false,
        notifyPropertyRejected:     s.notifyPropertyRejected     || false,
        emailVerificationRequired:  s.emailVerificationRequired  || false,
        emailTemplates: {
          verificationSubject: s.emailTemplates?.verificationSubject || 'Verify Your Email Address',
          verificationBody:    s.emailTemplates?.verificationBody    || 'Thank you for registering! Please verify your email address by clicking the button below.',
        },
        social: {
          facebook:  s.social?.facebook  || '',
          instagram: s.social?.instagram || '',
          twitter:   s.social?.twitter   || '',
          linkedin:  s.social?.linkedin  || '',
          youtube:   s.social?.youtube   || '',
        },
      });
      if (s.siteLogo) setLogoPreview(toFullUrl(s.siteLogo));
      if (s.favicon)  setFaviconPreview(toFullUrl(s.favicon));
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const set    = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setSoc = (k: string, v: string) => setForm((f: any) => ({ ...f, social: { ...f.social, [k]: v } }));
  const setTpl = (k: string, v: string) => setForm((f: any) => ({ ...f, emailTemplates: { ...f.emailTemplates, [k]: v } }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file));
  };
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setFaviconFile(file); setFaviconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'social') fd.append(k, JSON.stringify(v));
        else if (k === 'emailTemplates') fd.append(k, JSON.stringify(v));
        else if (typeof v === 'boolean') fd.append(k, String(v));
        else if (v) fd.append(k, v as string);
      });
      if (logoFile)    fd.append('siteLogo', logoFile);
      if (faviconFile) fd.append('favicon',  faviconFile);
      await api.put('/admin/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Settings saved');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading || !form) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">General Setting</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        <Section title="Site Identity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Site Name"><input value={form.siteName} onChange={e => set('siteName', e.target.value)} className={input} /></Field>
            <Field label="Tagline"><input value={form.siteTagline} onChange={e => set('siteTagline', e.target.value)} className={input} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Site Logo">
              <div className="flex items-center gap-3">
                {logoPreview && <img src={logoPreview} alt="logo" className="h-12 object-contain rounded border bg-gray-50 p-1" />}
                <button type="button" onClick={() => logoRef.current?.click()} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"><Upload size={14} /> Upload</button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </Field>
            <Field label="Favicon">
              <div className="flex items-center gap-3">
                {faviconPreview && <img src={faviconPreview} alt="favicon" className="h-10 w-10 object-contain rounded border bg-gray-50 p-1" />}
                <button type="button" onClick={() => faviconRef.current?.click()} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"><Upload size={14} /> Upload</button>
                <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconChange} />
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Contact Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={input} /></Field>
            <Field label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={input} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={input} /></Field>
            <Field label="Address"><input value={form.address} onChange={e => set('address', e.target.value)} className={input} /></Field>
          </div>
        </Section>

        <Section title="Social Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['facebook','instagram','twitter','linkedin','youtube'] as const).map(s => (
              <Field key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}>
                <input value={form.social[s]} onChange={e => setSoc(s, e.target.value)} className={input} placeholder={`https://${s}.com/...`} />
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Footer">
          <Field label="Footer Text"><textarea rows={2} value={form.footerText} onChange={e => set('footerText', e.target.value)} className={input} /></Field>
          <Field label="Copyright Text"><input value={form.copyrightText} onChange={e => set('copyrightText', e.target.value)} className={input} placeholder="© 2025 Real Estate. All rights reserved." /></Field>
        </Section>

        <Section title="Scripts">
          <Field label="Header Scripts">
            <textarea rows={3} value={form.headerScripts} onChange={e => set('headerScripts', e.target.value)} className={`${input} font-mono text-xs`} placeholder="<!-- Google Analytics -->" />
          </Field>
          <Field label="Footer Scripts">
            <textarea rows={3} value={form.footerScripts} onChange={e => set('footerScripts', e.target.value)} className={`${input} font-mono text-xs`} placeholder="<!-- Chat widget -->" />
          </Field>
        </Section>

        <Section title="Maintenance">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.maintenanceMode} onChange={e => set('maintenanceMode', e.target.checked)} className="w-4 h-4 accent-red-500" />
            <div>
              <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
              <p className="text-xs text-gray-400">Frontend shows maintenance page when enabled</p>
            </div>
          </label>
        </Section>

        {/* ── Email Notifications ── */}
        <Section title="Email Notifications">
          {/* Master switch */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.emailNotifications ?? true} onChange={e => set('emailNotifications', e.target.checked)} className="w-4 h-4 accent-blue-500" />
            <div>
              <span className="text-sm font-medium text-gray-700">Enable Email Notifications (Master Switch)</span>
              <p className="text-xs text-gray-400">Turn off to disable ALL email notifications globally</p>
            </div>
          </label>

          {form.emailNotifications && (
            <div className="space-y-4 ml-6 border-l-2 border-blue-100 pl-4">

              {/* Enquiry */}
              <NotifyBlock
                label="New Enquiry → Admin"
                desc="Admin receives email when a user submits an enquiry on a property"
                checked={form.notifyEnquiry ?? true}
                onToggle={v => set('notifyEnquiry', v)}
                subjectKey="enquirySubject"
                bodyKey="enquiryBody"
                form={form}
                setTpl={setTpl}
                color="blue"
              />

              {/* Property Submit */}
              <NotifyBlock
                label="Property Submitted → Admin"
                desc="Admin receives email when a user submits a new property for review"
                checked={form.notifyPropertySubmit ?? true}
                onToggle={v => set('notifyPropertySubmit', v)}
                subjectKey="propertySubmitSubject"
                bodyKey="propertySubmitBody"
                form={form}
                setTpl={setTpl}
                color="orange"
              />

              {/* Property Approved */}
              <NotifyBlock
                label="Property Approved → Owner"
                desc="Owner receives email when their property is approved by admin"
                checked={form.notifyPropertyApproved ?? true}
                onToggle={v => set('notifyPropertyApproved', v)}
                subjectKey="propertyApprovedSubject"
                bodyKey="propertyApprovedBody"
                form={form}
                setTpl={setTpl}
                color="green"
              />

              {/* Property Rejected */}
              <NotifyBlock
                label="Property Rejected → Owner"
                desc="Owner receives email when their property is rejected by admin"
                checked={form.notifyPropertyRejected ?? true}
                onToggle={v => set('notifyPropertyRejected', v)}
                subjectKey="propertyRejectedSubject"
                bodyKey="propertyRejectedBody"
                form={form}
                setTpl={setTpl}
                color="red"
              />

            </div>
          )}
        </Section>

        {/* ── Email Verification ── */}
        <Section title="Email Verification">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.emailVerificationRequired ?? false} onChange={e => set('emailVerificationRequired', e.target.checked)} className="w-4 h-4 accent-green-500" />
            <div>
              <span className="text-sm font-medium text-gray-700">Email Verification Required</span>
              <p className="text-xs text-gray-400">When ON — new users must verify email after registration</p>
            </div>
          </label>
          {form.emailVerificationRequired && (
            <div className="ml-6 border-l-2 border-green-200 pl-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification Email Template</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input value={form.emailTemplates?.verificationSubject || ''} onChange={e => setTpl('verificationSubject', e.target.value)}
                  className={input} placeholder="Verify Your Email Address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
                <textarea rows={3} value={form.emailTemplates?.verificationBody || ''} onChange={e => setTpl('verificationBody', e.target.value)}
                  className={input} placeholder="Thank you for registering!..." />
                <p className="text-xs text-gray-400 mt-1">Verify button and expiry notice added automatically.</p>
              </div>
            </div>
          )}
        </Section>

        <div className="pb-8">
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Reusable notification block ───────────────────────────────────
function NotifyBlock({ label, desc, checked, onToggle, subjectKey, bodyKey, form, setTpl, color }: any) {
  const borderColor = { blue: 'border-blue-200', orange: 'border-orange-200', green: 'border-green-200', red: 'border-red-200' }[color] || 'border-gray-200';
  const accentColor = { blue: 'accent-blue-500', orange: 'accent-orange-500', green: 'accent-green-500', red: 'accent-red-500' }[color] || 'accent-blue-500';
  const ringColor   = { blue: 'focus:ring-blue-500', orange: 'focus:ring-orange-500', green: 'focus:ring-green-500', red: 'focus:ring-red-500' }[color] || 'focus:ring-blue-500';
  const inputCls = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor}`;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onToggle(e.target.checked)} className={`w-4 h-4 ${accentColor}`} />
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </label>
      {checked && (
        <div className={`ml-6 border-l-2 ${borderColor} pl-4 space-y-2`}>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email Subject</label>
            <input value={form.emailTemplates?.[subjectKey] || ''} onChange={e => setTpl(subjectKey, e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email Body Text</label>
            <textarea rows={3} value={form.emailTemplates?.[bodyKey] || ''} onChange={e => setTpl(bodyKey, e.target.value)} className={inputCls} />
          </div>
        </div>
      )}
    </div>
  );
}
