'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Search, Loader2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, getErrorMessage, buildQueryString } from '@/lib/referralUtils';

// ── Types ─────────────────────────────────────────────────────────
interface FormValues {
  code:        string;
  type:        'fixed' | 'percent';
  value:       number;
  maxUses:     number;
  isPublic:    boolean;
  expiryDate:  string;
  ownerUserId: string | null;
  propertyId:  string | null;
}

interface Coupon {
  _id: string; code: string; type: 'fixed' | 'percent'; value: number;
  maxUses: number; usedCount: number; isPublic: boolean;
  expiryDate: string; isActive: boolean;
  ownerUserId?: { _id: string; name: string; email: string } | null;
  propertyId?:  { _id: string; title: string } | null;
}

interface UserOption  { _id: string; name: string; email: string }
interface PropOption  { _id: string; title: string }

// ── Reusable debounce hook ────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── User Selector ─────────────────────────────────────────────────
function UserSelector({
  value, onChange,
}: {
  value: string | null;
  onChange: (id: string | null, user: UserOption | null) => void;
}) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState<UserOption | null>(null);
  const debouncedQ = useDebounce(query, 350);
  const ref        = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isFetching } = useQuery<{ data: { users: UserOption[] } }>({
    queryKey: ['user-search', debouncedQ],
    queryFn:  () => api.get(`/admin/users?search=${encodeURIComponent(debouncedQ)}&limit=20&role=owner`).then(r => r.data),
    enabled:  open,
  });

  const users = data?.data?.users ?? [];

  const handleSelect = (u: UserOption) => {
    setSelected(u);
    onChange(u._id, u);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null, null);
  };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm">
          <div>
            <span className="font-medium text-gray-800">{selected.name}</span>
            <span className="text-gray-400 ml-2 text-xs">{selected.email}</span>
          </div>
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 ml-2">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              placeholder="Search by name or email…"
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isFetching
              ? <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
              : <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            }
          </div>

          {open && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {/* Always show "All Users (Public)" option */}
              <button
                type="button"
                onClick={() => { onChange(null, null); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100 font-medium"
              >
                — All Users (Public) —
              </button>

              {users.length === 0 && !isFetching && (
                <p className="px-3 py-2 text-xs text-gray-400">
                  {query ? 'No users found' : 'Type to search users…'}
                </p>
              )}

              {users.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleSelect(u)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="font-medium">{u.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Property Selector ─────────────────────────────────────────────
function PropertySelector({
  value, onChange,
}: {
  value: string | null;
  onChange: (id: string | null, prop: PropOption | null) => void;
}) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState<PropOption | null>(null);
  const debouncedQ = useDebounce(query, 350);
  const ref        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isFetching } = useQuery<{ data: { properties: PropOption[] } }>({
    queryKey: ['property-search-coupon', debouncedQ],
    queryFn:  () =>
      api.get(`/admin/properties?search=${encodeURIComponent(debouncedQ)}&limit=20`).then(r => r.data),
    enabled:  open && query.trim().length > 0,
  });

  const properties = data?.data?.properties ?? [];

  const handleSelect = (p: PropOption) => {
    setSelected(p);
    onChange(p._id, p);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null, null);
  };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm">
          <span className="text-gray-800 truncate">{selected.title}</span>
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 ml-2 shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              placeholder="Search by name or size…"
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isFetching && (
              <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>

          {open && query.trim() && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {properties.length === 0 && !isFetching && (
                <p className="px-3 py-2 text-xs text-gray-400">No properties found</p>
              )}
              {properties.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Coupon Modal ──────────────────────────────────────────────────
function CouponModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing: Coupon | null;
}) {
  const qc = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: editing
      ? {
          code:        editing.code,
          type:        editing.type,
          value:       editing.value,
          maxUses:     editing.maxUses,
          isPublic:    editing.isPublic,
          expiryDate:  new Date(editing.expiryDate).toISOString().split('T')[0],
          ownerUserId: typeof editing.ownerUserId === 'object' ? editing.ownerUserId?._id ?? null : editing.ownerUserId ?? null,
          propertyId:  typeof editing.propertyId  === 'object' ? editing.propertyId?._id  ?? null : editing.propertyId  ?? null,
        }
      : { code: '', type: 'fixed', value: 0, maxUses: 1, isPublic: false, expiryDate: '', ownerUserId: null, propertyId: null },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      editing
        ? api.put(`/admin/coupons/${editing._id}`, data).then((r) => r.data)
        : api.post('/admin/coupons', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(editing ? 'Coupon updated' : 'Coupon created');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const couponType    = watch('type');
  const ownerUserId   = watch('ownerUserId');

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="coupon-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input
                {...register('code', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
                placeholder="e.g. SPECIAL50"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percent">Percentage</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                {...register('value', {
                  required: 'Required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Min 0' },
                  validate: (v) => couponType !== 'percent' || v <= 100 || 'Max 100%',
                })}
                type="number" step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input
                {...register('maxUses', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Min 0' } })}
                type="number" min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">0 for unlimited</p>
              {errors.maxUses && <p className="text-xs text-red-500 mt-1">{errors.maxUses.message}</p>}
            </div>

            {/* Expires At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                {...register('expiryDate', { required: 'Required' })}
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>}
            </div>

            {/* Assign to User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to User <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <UserSelector
                value={ownerUserId ?? null}
                onChange={(id) => setValue('ownerUserId', id)}
              />
              <p className="text-xs text-gray-400 mt-1">
                If selected, only this user can see and use this coupon.
              </p>
            </div>

            {/* Assign to Property */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Property <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <PropertySelector
                value={watch('propertyId') ?? null}
                onChange={(id) => setValue('propertyId', id)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Type to search by property name. Leave blank for no restriction (all properties).
              </p>
            </div>

            {/* Publicly Visible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publicly Visible</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isPublic')}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show to all logged-in users</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                If unchecked and no user is assigned, this coupon is admin-internal only.
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" form="coupon-form" disabled={mutation.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : editing ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function CouponsPage() {
  const qc = useQueryClient();
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState<{ open: boolean; editing: Coupon | null }>({ open: false, editing: null });
  const [confirm, setConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', page],
    queryFn: async () => {
      const res = await api.get(`/admin/coupons?${buildQueryString({ page, limit: 15 })}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted');
      setConfirm(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const coupons: Coupon[] = data?.data ?? [];
  const pagination        = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{pagination?.total ?? 0} coupons</p>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {['Code', 'Type', 'Value', 'Usage', 'Assigned To', 'Expires', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : coupons.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No coupons found.
                  </td>
                </tr>
              )
              : coupons.map((c) => {
                  const assignedUser = typeof c.ownerUserId === 'object' ? c.ownerUserId : null;
                  const assignedProp = typeof c.propertyId  === 'object' ? c.propertyId  : null;
                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800">{c.code}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{c.type === 'percent' ? `${c.value}%` : formatCurrency(c.value)}</td>
                      <td className="px-4 py-3 text-xs">{c.usedCount} / {c.maxUses === 0 ? '∞' : c.maxUses}</td>
                      <td className="px-4 py-3 text-xs">
                        {assignedUser
                          ? <span className="text-blue-600">{assignedUser.name}</span>
                          : assignedProp
                          ? <span className="text-purple-600">{assignedProp.title}</span>
                          : <span className="text-gray-300">Public</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.expiryDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setModal({ open: true, editing: c })}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirm(c._id)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-xs">{page} / {pagination.totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-xs"
          >
            Next
          </button>
        </div>
      )}

      <CouponModal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        editing={modal.editing}
      />

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Coupon</h3>
            <p className="text-sm text-gray-600 mb-5">This will deactivate the coupon. Continue?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
