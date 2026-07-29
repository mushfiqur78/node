'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Lock, Eye, EyeOff, Camera } from 'lucide-react';

const inp = 'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4] transition';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm]         = useState({ name: '', phone: '' });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phone: '' });
      setAvatarPreview(user.avatar ? toFullUrl(user.avatar) : '');
    }
  }, [user]);

  // ── Avatar upload ──────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.post('/auth/upload-avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Update context so navbar avatar also updates
      updateUser({ avatar: data.data.avatarUrl });
      setAvatarPreview(toFullUrl(data.data.avatarUrl));
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
      // Revert preview on error
      setAvatarPreview(user?.avatar ? toFullUrl(user.avatar) : '');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Profile save ───────────────────────────────────────────
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/update-profile', form);
      updateUser({ name: form.name });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  // ── Password save ──────────────────────────────────────────
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-6">

      {/* ── Avatar section ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Profile Photo</h2>

        <div className="flex items-center gap-6">
          {/* Avatar preview */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#005e9e] text-white text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            {/* Camera overlay button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#005e9e] hover:bg-[#004d84] text-white rounded-full flex items-center justify-center shadow-md transition disabled:opacity-60"
              title="Change photo"
            >
              {uploading
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />}
            </button>
          </div>

          {/* Info + button */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{user?.name}</p>
            <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
            >
              <Camera size={15} />
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG. Max 10MB.</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* ── Profile info ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Profile Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="email" value={user?.email || ''} disabled
                className={`${inp} bg-gray-50 cursor-not-allowed opacity-60`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX" className={inp} />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* ── Change password ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
          {([
            { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
            { key: 'newPassword',     label: 'New Password',     show: showPw.new,     toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
            { key: 'confirmPassword', label: 'Confirm Password', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
          ] as any[]).map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type={show ? 'text' : 'password'} required
                  value={(pwForm as any)[key]}
                  onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4] transition" />
                <button type="button" onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={savingPw}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center gap-2">
            {savingPw && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
