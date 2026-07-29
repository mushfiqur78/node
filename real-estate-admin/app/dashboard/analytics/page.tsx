'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function AnalyticsPage() {
  const [overview, setOverview]     = useState<any>(null);
  const [timeSeries, setTimeSeries] = useState<any>(null);
  const [locations, setLocations]   = useState<any[]>([]);
  const [types, setTypes]           = useState<any[]>([]);
  const [topProps, setTopProps]     = useState<any[]>([]);
  const [purposes, setPurposes]     = useState<any[]>([]);
  const [days, setDays]             = useState(30);
  const [loading, setLoading]       = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ov, ts, loc, typ, top, pur] = await Promise.all([
        api.get(`/admin/analytics/overview?days=${days}`),
        api.get(`/admin/analytics/views-over-time?days=${days}`),
        api.get('/admin/analytics/popular-locations'),
        api.get('/admin/analytics/popular-types'),
        api.get('/admin/analytics/top-properties?limit=5'),
        api.get('/admin/analytics/purpose-breakdown'),
      ]);
      setOverview(ov.data.data);
      setTimeSeries(ts.data.data);
      setLocations(loc.data.data.locations);
      setTypes(typ.data.data.types);
      setTopProps(top.data.data.properties);
      setPurposes(pur.data.data.breakdown);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [days]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Properties', value: overview.newProperties, color: 'text-blue-600' },
            { label: 'New Users',      value: overview.newUsers,      color: 'text-green-600' },
            { label: 'New Enquiries',  value: overview.newEnquiries,  color: 'text-orange-600' },
            { label: 'Total Views',    value: overview.totalViews,    color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{overview.period}</p>
            </div>
          ))}
        </div>
      )}

      {/* Time Series Charts */}
      {timeSeries && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Properties & Enquiries Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeSeries.propertiesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Properties" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">New Users Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeSeries.usersPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="New Users" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Locations */}
        <div className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Popular Locations</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={locations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Properties" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Purpose Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Purpose Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={purposes} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {purposes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property Types & Top Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Property Types</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={types}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Properties" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Properties by Views</h2>
          <div className="space-y-3">
            {topProps.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.location?.name || '—'} · {p.purpose?.name || '—'}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{p.viewCount} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
