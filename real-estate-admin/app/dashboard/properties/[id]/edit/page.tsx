'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/api';
import { useConfigOptions } from '@/hooks/useConfigOptions';
import ImageUploader, { ImageMeta } from '@/components/property/ImageUploader';
import MediaPicker from '@/components/property/MediaPicker';
import FeatureSelector from '@/components/property/FeatureSelector';
import { API_BASE } from '@/lib/utils';

export default function EditPropertyPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { propertyTypes, locations, purposes, statuses, features, loading: optLoading } = useConfigOptions();

  const [form, setForm]                   = useState<any>(null);
  const [featuredImage, setFeaturedImage] = useState<ImageMeta[]>([]);
  const [gallery, setGallery]             = useState<ImageMeta[]>([]);
  const [primaryFeatures, setPrimary]     = useState<string[]>([]);
  const [amenities, setAmenities]         = useState<string[]>([]);
  const [otherFeatures, setOther]         = useState<string[]>([]);
  const [submitting, setSubmitting]       = useState(false);
  const [pageLoading, setPageLoading]     = useState(true);

  useEffect(() => {
    api.get(`/admin/properties/${id}`).then(res => {
      const p = res.data.data.property;
      setForm({
        title:        p.title || '',
        description:  p.description || '',
        propertyName: p.propertyName || '',
        address:      p.address || '',
        type:         p.type?._id || '',
        location:     p.location?._id || '',
        purpose:      p.purpose?._id || '',
        label:        p.label?._id || '',
        areaSize:     p.areaSize || '',
        bedrooms:     p.bedrooms || '',
        bathrooms:    p.bathrooms || '',
        balcony:      p.balcony || '',
        floor:        p.floor || '',
        contactNumber: p.contactNumber || '',
        videoUrl:     p.videoUrl || '',
        slug:         p.slug || '',
        pricing: {
          totalPrice:    p.pricing?.totalPrice || '',
          pricePerSft:   p.pricing?.pricePerSft || '',
          rentPerMonth:  p.pricing?.rentPerMonth || '',
          serviceCharge: p.pricing?.serviceCharge || '',
          parkingPrice:  p.pricing?.parkingPrice || '',
        },
        seo: {
          metaTitle:       p.seo?.metaTitle || '',
          metaDescription: p.seo?.metaDescription || '',
          ogTitle:         p.seo?.ogTitle || '',
          schemaMarkup:    p.seo?.schemaMarkup ? JSON.stringify(p.seo.schemaMarkup, null, 2) : '',
        },
      });

      // Set existing images
      if (p.featuredImage?.url) {
        setFeaturedImage([{ file: null as any, url: `${API_BASE}${p.featuredImage.url}`, alt: p.featuredImage.alt || '', title: p.featuredImage.title || '' }]);
      }
      if (p.gallery?.length) {
        setGallery(p.gallery.map((g: any) => ({ file: null as any, url: `${API_BASE}${g.url}`, alt: g.alt || '', title: g.title || '' })));
      }

      setPrimary(p.primaryFeatures?.map((f: any) => f._id || f) || []);
      setAmenities(p.amenities?.map((f: any) => f._id || f) || []);
      setOther(p.otherFeatures?.map((f: any) => f._id || f) || []);
    }).catch(() => toast.error('Failed to load property'))
      .finally(() => setPageLoading(false));
  }, [id]);

  const selectedPurpose = purposes.find(p => p._id === form?.purpose);
  const isRent = selectedPurpose?.name === 'rent';
  const isSell = selectedPurpose?.name === 'sell';

  const set    = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));
  const setP   = (key: string, val: string) => setForm((f: any) => ({ ...f, pricing: { ...f.pricing, [key]: val } }));
  const setSeo = (key: string, val: string) => setForm((f: any) => ({ ...f, seo: { ...f.seo, [key]: val } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === 'object') return;
        if (v) fd.append(k, v as string);
      });

      fd.append('pricing', JSON.stringify(form.pricing));
      fd.append('seo',     JSON.stringify(form.seo));
      fd.append('primaryFeatures', JSON.stringify(primaryFeatures));
      fd.append('amenities',       JSON.stringify(amenities));
      fd.append('otherFeatures',   JSON.stringify(otherFeatures));

      // Featured image
      if (featuredImage[0]?.file) {
        fd.append('featuredImage', featuredImage[0].file);
        fd.append('featuredImageMeta', JSON.stringify({ alt: featuredImage[0].alt, title: featuredImage[0].title }));
      } else if (featuredImage[0]?.url) {
        const cleanUrl = featuredImage[0].url.replace(API_BASE, '');
        fd.append('featuredImageUrl', JSON.stringify({ url: cleanUrl, alt: featuredImage[0].alt, title: featuredImage[0].title }));
      }

      // Gallery
      gallery.forEach(g => { if (g.file) fd.append('gallery', g.file); });
      fd.append('galleryMetas', JSON.stringify(gallery.filter(g => g.file).map(g => ({ alt: g.alt, title: g.title }))));
      const galleryUrls = gallery.filter(g => !g.file).map(g => ({ url: g.url.replace(API_BASE, ''), alt: g.alt, title: g.title }));
      if (galleryUrls.length) fd.append('galleryUrls', JSON.stringify(galleryUrls));

      await api.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Property updated');
      router.push('/dashboard/properties');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading || optLoading || !form) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Property</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <Section title="Basic Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *"><input required value={form.title} onChange={e => set('title', e.target.value)} className={input} /></Field>
            <Field label="Property Name"><input value={form.propertyName} onChange={e => set('propertyName', e.target.value)} className={input} /></Field>
          </div>
          <Field label="Description *"><textarea required rows={4} value={form.description} onChange={e => set('description', e.target.value)} className={input} /></Field>
          <Field label="Address *"><input required value={form.address} onChange={e => set('address', e.target.value)} className={input} /></Field>
        </Section>

        <Section title="Classification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Property Type *">
              <select required value={form.type} onChange={e => set('type', e.target.value)} className={input}>
                <option value="">Select type</option>
                {propertyTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Location *">
              <select required value={form.location} onChange={e => set('location', e.target.value)} className={input}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="Purpose *">
              <select required value={form.purpose} onChange={e => set('purpose', e.target.value)} className={input}>
                <option value="">Select purpose</option>
                {purposes.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.label} onChange={e => set('label', e.target.value)} className={input}>
                <option value="">Select status</option>
                {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isSell && <Field label="Total Price *"><input type="number" value={form.pricing.totalPrice} onChange={e => setP('totalPrice', e.target.value)} className={input} /></Field>}
            {isRent && <>
              <Field label="Rent/Month *"><input type="number" value={form.pricing.rentPerMonth} onChange={e => setP('rentPerMonth', e.target.value)} className={input} /></Field>
              <Field label="Service Charge"><input type="number" value={form.pricing.serviceCharge} onChange={e => setP('serviceCharge', e.target.value)} className={input} /></Field>
              <Field label="Parking Price"><input type="number" value={form.pricing.parkingPrice} onChange={e => setP('parkingPrice', e.target.value)} className={input} /></Field>
            </>}
            <Field label="Price/Sqft"><input type="number" value={form.pricing.pricePerSft} onChange={e => setP('pricePerSft', e.target.value)} className={input} /></Field>
            {!form.purpose && <p className="col-span-3 text-sm text-gray-400 italic">Select a purpose to see pricing fields.</p>}
          </div>
        </Section>

        <Section title="Property Details">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Area Size"><input type="number" value={form.areaSize} onChange={e => set('areaSize', e.target.value)} className={input} /></Field>
            <Field label="Bedrooms"><input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={input} /></Field>
            <Field label="Bathrooms"><input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={input} /></Field>
            <Field label="Balcony"><input type="number" value={form.balcony} onChange={e => set('balcony', e.target.value)} className={input} /></Field>
            <Field label="Floor"><input value={form.floor} onChange={e => set('floor', e.target.value)} className={input} /></Field>
            <Field label="Contact Number"><input value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} className={input} /></Field>
          </div>
          <Field label="Video URL"><input type="url" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} className={input} /></Field>
        </Section>

        <Section title="Features">
          <div className="space-y-4">
            <FeatureSelector label="Primary Features" category="primary" features={features} selected={primaryFeatures} onChange={setPrimary} />
            <FeatureSelector label="Amenities"        category="amenity" features={features} selected={amenities}       onChange={setAmenities} />
            <FeatureSelector label="Other Features"   category="other"   features={features} selected={otherFeatures}  onChange={setOther} />
          </div>
        </Section>

        <Section title="Images">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader label="Upload New Featured Image" onChange={setFeaturedImage} />
              <div className="mt-2"><MediaPicker label="Or pick from library" selected={featuredImage} onChange={setFeaturedImage} /></div>
            </div>
            <div>
              <ImageUploader label="Upload New Gallery Images" multiple maxFiles={10} onChange={imgs => setGallery(prev => [...prev, ...imgs])} />
              <div className="mt-2"><MediaPicker label="Or pick from library" multiple maxFiles={10} selected={gallery} onChange={setGallery} /></div>
            </div>
          </div>
        </Section>

        <Section title="SEO (Optional)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug"><input value={form.slug} onChange={e => set('slug', e.target.value)} className={input} /></Field>
            <Field label="Meta Title (max 60)"><input maxLength={60} value={form.seo.metaTitle} onChange={e => setSeo('metaTitle', e.target.value)} className={input} /></Field>
            <Field label="Meta Description (max 160)"><input maxLength={160} value={form.seo.metaDescription} onChange={e => setSeo('metaDescription', e.target.value)} className={input} /></Field>
            <Field label="OG Title"><input value={form.seo.ogTitle} onChange={e => setSeo('ogTitle', e.target.value)} className={input} /></Field>
          </div>
          <Field label="Schema Markup (JSON-LD)">
            <textarea rows={5} value={form.seo.schemaMarkup} onChange={e => setSeo('schemaMarkup', e.target.value)} className={`${input} font-mono text-xs`} />
          </Field>
        </Section>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 border rounded-xl hover:bg-gray-50 text-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
