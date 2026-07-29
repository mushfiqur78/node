'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Save, Send, Info } from 'lucide-react';

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

export default function SmtpPage() {
  const [form, setForm]       = useState({ host: '', port: 587, user: '', pass: '', from: '', secure: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting]     = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(res => {
      const s = res.data.data.settings;
      setForm({
        host:   s.smtp?.host   || '',
        port:   s.smtp?.port   || 587,
        user:   s.smtp?.user   || '',
        pass:   s.smtp?.pass   || '',
        from:   s.smtp?.from   || '',
        secure: s.smtp?.secure || false,
      });
      setTestEmail(s.email || '');
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('smtp', JSON.stringify(form));
      await api.put('/admin/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('SMTP settings saved');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testEmail) return toast.error('Enter a test email address');
    setTesting(true);
    try {
      await api.post('/admin/settings/test-email', { email: testEmail });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'SMTP test failed — check your config'); }
    finally { setTesting(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Email / SMTP Configuration</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="SMTP Server">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-sm text-blue-700">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>Configure here — no need to edit .env file. Settings saved in database.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="SMTP Host">
              <input value={form.host} onChange={e => set('host', e.target.value)} className={input} placeholder="smtp.gmail.com" />
            </Field>
            <Field label="SMTP Port">
              <input type="number" value={form.port} onChange={e => set('port', Number(e.target.value))} className={input} placeholder="587" />
            </Field>
            <Field label="Username (Email)">
              <input value={form.user} onChange={e => set('user', e.target.value)} className={input} placeholder="your@gmail.com" />
            </Field>
            <Field label="Password / App Password">
              <input type="password" value={form.pass} onChange={e => set('pass', e.target.value)} className={input} placeholder="••••••••••••" />
            </Field>
          </div>

          <Field label="From Address">
            <input value={form.from} onChange={e => set('from', e.target.value)} className={input} placeholder='Real Estate <your@gmail.com>' />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.secure} onChange={e => set('secure', e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-700">Use SSL/TLS (port 465)</span>
          </label>
        </Section>

        <Section title="Test Email">
          <p className="text-sm text-gray-500">Save settings first, then send a test email to verify your SMTP configuration.</p>
          <div className="flex gap-2">
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email"
              placeholder="Send test to..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={handleTest} disabled={testing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              <Send size={14} /> {testing ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </Section>

        <Section title="Gmail Setup Guide">
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Go to <strong>Google Account → Security</strong></li>
            <li>Enable <strong>2-Step Verification</strong></li>
            <li>Go to <strong>App Passwords</strong></li>
            <li>Generate a new app password for "Mail"</li>
            <li>Use that 16-character password above (not your Gmail password)</li>
          </ol>
          <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 mt-2">
            Host: smtp.gmail.com | Port: 587 | SSL: off
          </div>
        </Section>

        <div className="pb-8">
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={18} /> {saving ? 'Saving...' : 'Save SMTP Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
