'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  new_enquiry:          'bg-blue-100 text-blue-600',
  property_submitted:   'bg-orange-100 text-orange-600',
  property_approved:    'bg-green-100 text-green-600',
  property_rejected:    'bg-red-100 text-red-600',
  new_user:             'bg-purple-100 text-purple-600',
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen]           = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread]       = useState(0);
  const [loading, setLoading]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/admin/notifications/unread-count');
      setUnread(res.data.data.count);
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notifications?limit=15');
      setNotifications(res.data.data.notifications);
      setUnread(res.data.data.unread);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await api.put(`/admin/notifications/${n._id}/read`);
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (n.link) { router.push(n.link); setOpen(false); }
  };

  const markAllRead = async () => {
    await api.put('/admin/notifications/mark-all-read');
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const clearRead = async () => {
    await api.delete('/admin/notifications/clear-all');
    fetchNotifications();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-gray-800">Notifications {unread > 0 && <span className="text-red-500">({unread})</span>}</span>
            <div className="flex gap-2">
              {unread > 0 && <button onClick={markAllRead} title="Mark all read" className="text-xs text-blue-500 hover:underline">All read</button>}
              <button onClick={clearRead} title="Clear read" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
            ) : notifications.map(n => (
              <div key={n._id} onClick={() => handleClick(n)}
                className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-0 transition ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
