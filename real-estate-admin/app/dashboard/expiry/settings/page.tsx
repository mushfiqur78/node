'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Save, Info, RefreshCw } from 'lucide-react';

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function ExpirySettingsPage() {
  const [form, setForm] = useState({
    autoExpiryEnabled:  false,
    autoExpiryDuration: 90,
    autoExpiryUnit:     'days',
    expiryWarningDays:  7,
    applyToExisting:    false,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [stats, setStats]       = useState<any>(null);
  const [preview, setPreview]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/auto-expiry/settings'),
      api.get('/admin/auto-expiry/stats'),
    ]).then(([s, st]) => {
      const d = s.data.data;
      setForm(f => ({
        ...f,
        autoExpiryEnabled:  d.autoExpiryEnabled,
        autoExpiryDuration: d.autoExpiryDuration,
        autoExpiryUnit:     d.autoExpiryUnit,
        expiryWarningDays:  d.expiryWarningDays,
      }));
      setStats(st.data.data);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  // Live preview
  useEffect(() => {
    if (!form.autoExpiryEnabled) { setPreview(''); return; }
    api.get(`/admin/auto-expiry/preview?duration=${form.autoExpiryDuration}&unit=${form.autoExpiryUnit}`)
      .then(res => setPreview(res.data.data.expiryDate))
      .catch(() => {});
  }, [form.autoExpiryDuration, form.autoExpiryUnit, form.autoExpiryEnabled]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/auto-expiry/settings', form);
      toast.success(res.data.message);
      // Refresh stats
      const st = await api.get('/admin/auto-expiry/stats');
      setStats(st.data.data);
      set('applyToExisting', false);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expiry Settings</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.autoTotal}</p>
            <p className="text-xs text-gray-500 mt-1">Auto Expiry Properties</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.autoExpired}</p>
            <p className="text-xs text-gray-500 mt-1">Auto Expired</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.autoActive}</p>
            <p className="text-xs text-gray-500 mt-1">Auto Active</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Auto Expiry Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Auto Expiry Configuration</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.autoExpiryEnabled} onChange={e => set('autoExpiryEnabled', e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">Enable Auto Expiry</span>
              <p className="text-xs text-gray-400">New properties will automatically get an expiry date</p>
            </div>
          </label>

          {form.autoExpiryEnabled && (
            <div className="space-y-4 ml-6 border-l-2 border-blue-100 pl-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input type="number" min={1} max={3650} value={form.autoExpiryDuration}
                    onChange={e => set('autoExpiryDuration', Number(e.target.value))} className={input} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.autoExpiryUnit} onChange={e => set('autoExpiryUnit', e.target.value)} className={input}>
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              {/* Live Preview */}
              {preview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-700">
                  <Info size={16} className="shrink-0" />
                  <span>
                    A property created <strong>today</strong> will expire on <strong>{preview}</strong>
                    {' '}({form.autoExpiryDuration} {form.autoExpiryUnit})
                  </span>
                </div>
              )}

              {/* Apply to existing */}
              <label className="flex items-start gap-3 cursor-pointer bg-orange-50 border border-orange-200 rounded-lg p-3">
                <input type="checkbox" checked={form.applyToExisting} onChange={e => set('applyToExisting', e.target.checked)} className="w-4 h-4 accent-orange-500 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-orange-700">Apply new duration to existing auto properties</span>
                  <p className="text-xs text-orange-500 mt-0.5">
                    This will recalculate expiry dates for all {stats?.autoTotal || 0} auto-expiry properties based on their original creation date. Manual expiry properties will NOT be affected.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Warning Days */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Warning Configuration</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Near Expiry Warning (days before expiry)
            </label>
            <input type="number" min={1} max={365} value={form.expiryWarningDays}
              onChange={e => set('expiryWarningDays', Number(e.target.value))} className={input} />
            <p className="text-xs text-gray-400 mt-1">Properties expiring within this many days will show a warning color in the dashboard.</p>
          </div>

          {/* Color legend */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-2">Color Indicators:</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 align-middle"></span>Red — Already expired</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2 align-middle"></span>Orange — Expires within 3 days</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle"></span>Yellow — Expires within {form.expiryWarningDays} days</p>
            <p><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle"></span>Green — More than {form.expiryWarningDays} days left</p>
          </div>
        </div>

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
