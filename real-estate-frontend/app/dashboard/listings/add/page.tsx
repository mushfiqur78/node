'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { usePropertyTypes, useLocations, usePurposes, useFeatures, useLabels } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import StepIndicator from '@/components/property-form/StepIndicator';
import { Plus, X, ChevronLeft, ChevronRight, Eye, Send, Bed, Bath, Maximize, MapPin, CheckCircle } from 'lucide-react';

// -- shared input style ------------------------------------------
const inp = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#3d8fc4] transition bg-white';
const sel = `${inp} appearance-none`;

// -- Checkbox group ----------------------------------------------
function CheckGroup({ items, selected, onChange }: {
  items: { _id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map(item => (
        <label key={item._id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-[#005e9e]">
          <input type="checkbox" checked={selected.includes(item._id)}
            onChange={() => toggle(item._id)}
            className="w-4 h-4 accent-[#005e9e] rounded" />
          {item.name}
        </label>
      ))}
    </div>
  );
}

// -- Preview Modal -----------------------------------------------
function PreviewModal({ form, featuredPreview, galleryPreviews, features, types, locations, purposes, onClose }: any) {
  const [selectedImg, setSelectedImg] = useState(0);
  const images = [featuredPreview, ...galleryPreviews].filter(Boolean);

  const typeName     = types?.find((t: any) => t._id === form.type)?.name || '';
  const locationName = locations?.find((l: any) => l._id === form.location)?.name || '';
  const purposeName  = purposes?.find((p: any) => p._id === form.purpose)?.name || '';
  const isRent       = purposeName?.toLowerCase() === 'rent';

  const price = isRent
    ? `BDT ${Number(form.rentPerMonth).toLocaleString()}/month`
    : form.totalPrice
    ? `BDT ${(Number(form.totalPrice) / 10000000).toFixed(2)} Crore`
    : 'Price on request';

  const selectedFeatures = features?.filter((f: any) => form.primaryFeatures.includes(f._id)) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Preview Only</span>
            <p className="text-xs text-gray-400 mt-0.5">This is how your property will look after approval</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title & badges */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{form.title || 'Untitled Property'}</h1>
            <div className="flex flex-wrap gap-2">
              {typeName     && <span className="px-3 py-1 bg-[#cce5f5] text-[#003d6b] text-xs font-medium rounded-full">{typeName}</span>}
              {purposeName  && <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{purposeName}</span>}
              {locationName && <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">{locationName}</span>}
            </div>
          </div>

          {/* Price */}
          <p className="text-3xl font-bold text-[#005e9e]">{price}</p>

          {/* Image gallery */}
          {images.length > 0 && (
            <div>
              <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
                <img src={images[selectedImg]} alt="preview" className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${selectedImg === i ? 'border-[#1a72b0]' : 'border-gray-200'}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
            {form.areaSize  && <div><p className="text-xs text-gray-500">Area</p><p className="font-bold text-gray-900">{form.areaSize} sft</p></div>}
            {form.bedrooms  && <div className="flex items-center gap-2"><Bed size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500">Bedrooms</p><p className="font-bold">{form.bedrooms}</p></div></div>}
            {form.bathrooms && <div className="flex items-center gap-2"><Bath size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500">Bathrooms</p><p className="font-bold">{form.bathrooms}</p></div></div>}
            {form.balcony   && <div><p className="text-xs text-gray-500">Balcony</p><p className="font-bold">{form.balcony}</p></div>}
            {form.floor     && <div><p className="text-xs text-gray-500">Floor</p><p className="font-bold">{form.floor}</p></div>}
            {form.pricePerSft && !isRent && <div><p className="text-xs text-gray-500">Per sft</p><p className="font-bold">BDT {Number(form.pricePerSft).toLocaleString()}</p></div>}
          </div>

          {/* Description */}
          {form.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{form.description}</p>
            </div>
          )}

          {/* Features */}
          {selectedFeatures.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedFeatures.map((f: any) => (
                  <div key={f._id} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-green-500" />
                    {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {form.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-[#005e9e] mt-0.5 flex-shrink-0" />
              <span>{form.address}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Initial form state ------------------------------------------
const INIT = {
  // Step 1
  type: '', location: '', purpose: '', label: '',
  title: '', areaSize: '', address: '',
  // pricing
  totalPrice: '', pricePerSft: '', rentPerMonth: '', serviceCharge: '', parkingPrice: '',
  // Step 2
  floor: '', bedrooms: '', bathrooms: '', balcony: '',
  propertyName: '', description: '', contactNumber: '',
  primaryFeatures: [] as string[],
  amenities:       [] as string[],
  otherFeatures:   [] as string[],
};

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const DRAFT_KEY = 'property_draft';

  // Restore draft from localStorage on mount
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? (JSON.parse(saved).step ?? 1) : 1;
    } catch { return 1; }
  });

  const [form, setForm] = useState(() => {
    if (typeof window === 'undefined') return INIT;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...INIT, ...JSON.parse(saved).form } : INIT;
    } catch { return INIT; }
  });

  // Auto-fill contact number from user profile if not already set
  useEffect(() => {
    if (user && !form.contactNumber) {
      const phone = (user as any).phone || '';
      if (phone) set('contactNumber', phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [gallery, setGallery]             = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draftSaved, setDraftSaved]   = useState(false);

  const featuredRef = useRef<HTMLInputElement>(null);
  const galleryRef  = useRef<HTMLInputElement>(null);

  const { data: types }    = usePropertyTypes();
  const { data: locations } = useLocations();
  const { data: purposes }  = usePurposes();
  const { data: features }  = useFeatures();
  const { data: labels }    = useLabels();

  const set = (k: string, v: any) => setForm((f: typeof INIT) => ({ ...f, [k]: v }));

  // -- Draft helpers -------------------------------------------
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
      setDraftSaved(true);
      toast.success('Draft saved!');
      setTimeout(() => setDraftSaved(false), 2000);
    } catch { toast.error('Could not save draft'); }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  // Determine if purpose is rent
  const selectedPurpose = purposes?.find(p => p._id === form.purpose);
  const isRent = selectedPurpose?.name?.toLowerCase() === 'rent';

  // -- Step validation -----------------------------------------
  const validateStep1 = () => {
    if (!form.type)     { toast.error('Select property type'); return false; }
    if (!form.location) { toast.error('Select location'); return false; }
    if (!form.purpose)  { toast.error('Select purpose (Buy/Rent)'); return false; }
    if (!form.title.trim()) { toast.error('Enter property title'); return false; }
    if (!form.areaSize) { toast.error('Enter area size'); return false; }
    if (isRent && !form.rentPerMonth) { toast.error('Enter rent per month'); return false; }
    if (!isRent && !form.totalPrice)  { toast.error('Enter total price'); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!featuredImage) { toast.error('Featured image is required'); return false; }
    return true;
  };

  // -- Gallery handlers ----------------------------------------
  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - gallery.length;
    if (remaining <= 0) { toast.error('Maximum 10 gallery images allowed'); return; }
    const allowed = files.slice(0, remaining);
    if (files.length > remaining) toast.error(`Only ${remaining} more image(s) can be added`);
    setGallery(prev => [...prev, ...allowed]);
    setGalleryPreviews(prev => [...prev, ...allowed.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeGallery = (i: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== i));
    setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // -- Submit --------------------------------------------------
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();

      // Basic fields
      fd.append('type',     form.type);
      fd.append('location', form.location);
      fd.append('purpose',  form.purpose);
      if (form.label) fd.append('label', form.label);
      fd.append('title',    form.title);
      fd.append('areaSize', form.areaSize);
      fd.append('address',  form.address);
      if (form.floor)    fd.append('floor',    form.floor);
      if (form.bedrooms) fd.append('bedrooms', form.bedrooms);
      if (form.bathrooms) fd.append('bathrooms', form.bathrooms);
      if (form.balcony)  fd.append('balcony',  form.balcony);
      if (form.propertyName) fd.append('propertyName', form.propertyName);
      if (form.description)  fd.append('description',  form.description);
      if (form.contactNumber) fd.append('contactNumber', form.contactNumber);

      // Pricing
      const pricing: any = {};
      if (form.totalPrice)    pricing.totalPrice    = Number(form.totalPrice);
      if (form.pricePerSft)   pricing.pricePerSft   = Number(form.pricePerSft);
      if (form.rentPerMonth)  pricing.rentPerMonth  = Number(form.rentPerMonth);
      if (form.serviceCharge) pricing.serviceCharge = Number(form.serviceCharge);
      if (form.parkingPrice)  pricing.parkingPrice  = Number(form.parkingPrice);
      fd.append('pricing', JSON.stringify(pricing));

      // Features
      fd.append('primaryFeatures', JSON.stringify(form.primaryFeatures));
      fd.append('amenities',       JSON.stringify(form.amenities));
      fd.append('otherFeatures',   JSON.stringify(form.otherFeatures));

      // Images
      fd.append('featuredImage', featuredImage!);
      gallery.forEach(f => fd.append('gallery', f));

      await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearDraft();
      toast.success('Property submitted for review!');
      router.push('/dashboard/listings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // -- Render --------------------------------------------------
  return (
    <div className="max-w-2xl">

      {/* Draft controls */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {typeof window !== 'undefined' && localStorage.getItem(DRAFT_KEY)
            ? '?? Draft restored from last session'
            : 'Fill in the form below to list your property'}
        </p>
        <div className="flex items-center gap-2">
          {typeof window !== 'undefined' && localStorage.getItem(DRAFT_KEY) && (
            <button
              onClick={() => { clearDraft(); setForm(INIT); setStep(1); toast.success('Draft cleared'); }}
              className="text-xs text-red-500 hover:text-red-600 hover:underline transition"
            >
              Clear Draft
            </button>
          )}
          <button
            onClick={saveDraft}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              draftSaved
                ? 'bg-green-50 border-green-300 text-green-600'
                : 'bg-white border-gray-300 text-gray-600 hover:border-[#3d8fc4] hover:text-[#005e9e]'
            }`}
          >
            {draftSaved ? '? Saved' : '?? Save Draft'}
          </button>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* -- STEP 1: Basic Information -- */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={sel}>
                <option value="">Select Type</option>
                {types?.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
              <select value={form.location} onChange={e => set('location', e.target.value)} className={sel}>
                <option value="">Select Location</option>
                {locations?.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose *</label>
              <select value={form.purpose} onChange={e => set('purpose', e.target.value)} className={sel}>
                <option value="">Select Purpose</option>
                {purposes?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label</label>
              <select value={form.label} onChange={e => set('label', e.target.value)} className={sel}>
                <option value="">Select Label</option>
                {labels?.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., 3 Bedroom Apartment in Gulshan" className={inp} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area Size (sft) *</label>
              <input type="number" value={form.areaSize} onChange={e => set('areaSize', e.target.value)}
                placeholder="e.g., 1450" className={inp} />
            </div>
            {!isRent && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Per sft Price</label>
                <input type="number" value={form.pricePerSft} onChange={e => set('pricePerSft', e.target.value)}
                  placeholder="e.g., 6500" className={inp} />
              </div>
            )}

            {isRent ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rent Per Month (BDT) *</label>
                  <input type="number" value={form.rentPerMonth} onChange={e => set('rentPerMonth', e.target.value)}
                    placeholder="e.g., 85,000" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Charge</label>
                  <input type="number" value={form.serviceCharge} onChange={e => set('serviceCharge', e.target.value)}
                    placeholder="e.g., 8,000" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parking Price</label>
                  <input type="number" value={form.parkingPrice} onChange={e => set('parkingPrice', e.target.value)}
                    placeholder="e.g., 5,000" className={inp} />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Price (BDT) *</label>
                <input type="number" value={form.totalPrice} onChange={e => set('totalPrice', e.target.value)}
                  placeholder="e.g., 12000000" className={inp} />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="e.g., House 12, Road 5, Dhanmondi, Dhaka" className={inp} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => validateStep1() && setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition">
              Next: Step 2 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* -- STEP 2: Description -- */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'floor',     label: 'Floor' },
              { key: 'bedrooms',  label: 'Bed' },
              { key: 'bathrooms', label: 'Bath' },
              { key: 'balcony',   label: 'Balcony' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input type="number" value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                  placeholder="0" className={inp} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Name</label>
            <input value={form.propertyName} onChange={e => set('propertyName', e.target.value)}
              placeholder="e.g., Bashundhara Residentials" className={inp} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the property..." className={`${inp} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number</label>
            <input value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)}
              placeholder="01XXXXXXXXX" className={inp} />
            {(user as any)?.phone && form.contactNumber === (user as any)?.phone && (
              <p className="text-xs text-green-600 mt-1">Auto-filled from your profile</p>
            )}
          </div>

          {/* Primary Features */}
          {features && features.filter(f => f.category === 'primary').length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Features</label>
              <CheckGroup
                items={features.filter(f => f.category === 'primary')}
                selected={form.primaryFeatures}
                onChange={ids => set('primaryFeatures', ids)}
              />
            </div>
          )}

          {/* Amenities */}
          {features && features.filter(f => f.category === 'amenity').length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
              <CheckGroup
                items={features.filter(f => f.category === 'amenity')}
                selected={form.amenities}
                onChange={ids => set('amenities', ids)}
              />
            </div>
          )}

          {/* Other Features */}
          {features && features.filter(f => f.category === 'other').length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Other Features</label>
              <CheckGroup
                items={features.filter(f => f.category === 'other')}
                selected={form.otherFeatures}
                onChange={ids => set('otherFeatures', ids)}
              />
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft size={16} /> Back to Step 1
            </button>
            <button onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition">
              Next: Step 3 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* -- STEP 3: Attachment -- */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          {/* Featured Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image *</label>
            {featuredPreview ? (
              <div className="relative w-40 h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={featuredPreview} alt="featured" className="w-full h-full object-cover" />
                <button onClick={() => { setFeaturedImage(null); setFeaturedPreview(''); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => featuredRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-[#3d8fc4] hover:text-[#005e9e] transition">
                Choose File
              </button>
            )}
            <input ref={featuredRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setFeaturedImage(f); setFeaturedPreview(URL.createObjectURL(f)); }
              }} />
          </div>

          {/* Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Gallery Images</label>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                gallery.length >= 10
                  ? 'bg-red-100 text-red-600'
                  : gallery.length >= 7
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {gallery.length} / 10
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              You can upload up to <strong>10 images</strong>. Accepted formats: JPG, JPEG, PNG. Max 10MB per image.
            </p>
            <div className="flex flex-wrap gap-3">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeGallery(i)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                    <X size={11} />
                  </button>
                </div>
              ))}
              {gallery.length < 10 && (
                <button onClick={() => galleryRef.current?.click()}
                  className="w-24 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#3d8fc4] hover:text-[#1a72b0] transition text-xs gap-1">
                  <Plus size={18} />
                  Add More
                </button>
              )}
            </div>
            {gallery.length >= 10 && (
              <p className="text-xs text-red-500 mt-2">Maximum 10 images reached.</p>
            )}
            <input ref={galleryRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden"
              onChange={handleGalleryAdd} />
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft size={16} /> Back to Step 2
            </button>
            <button onClick={() => validateStep3() && setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition">
              Next: Preview & Submit <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* -- STEP 4: Preview & Submit -- */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Preview & Submit</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Featured */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Featured Image</p>
              {featuredPreview
                ? <img src={featuredPreview} alt="featured" className="w-full h-40 object-cover rounded-xl border" />
                : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No image</div>}
            </div>
            {/* Gallery */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Gallery ({gallery.length})</p>
              <div className="flex flex-wrap gap-2">
                {galleryPreviews.slice(0, 4).map((src, i) => (
                  <img key={i} src={src} alt="" className="w-16 h-14 object-cover rounded-lg border" />
                ))}
                {gallery.length > 4 && (
                  <div className="w-16 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                    +{gallery.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium text-gray-900 text-right max-w-xs truncate">{form.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Purpose</span><span className="font-medium">{selectedPurpose?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Area</span><span className="font-medium">{form.areaSize} sft</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Price</span>
              <span className="font-medium text-[#005e9e]">
                {isRent ? `BDT ${Number(form.rentPerMonth).toLocaleString()}/mo` : `BDT ${Number(form.totalPrice).toLocaleString()}`}
              </span>
            </div>
            {form.address && <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium text-right max-w-xs truncate">{form.address}</span></div>}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft size={16} /> Back to Step 3
            </button>
            <div className="flex gap-3">
              <button onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
                <Eye size={15} /> Preview Property
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                  : <><Send size={15} />Submit for Publish</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          form={form}
          featuredPreview={featuredPreview}
          galleryPreviews={galleryPreviews}
          features={features}
          types={types}
          locations={locations}
          purposes={purposes}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
