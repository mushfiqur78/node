'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import { 
  Home, ChevronRight, Bed, Bath, Maximize, MapPin, 
  Mail, CheckCircle, Tag, X, Loader2
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface PropertyDetailProps {
  params: Promise<{ slug: string }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailProps) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in this property`
  });
  const [submitting, setSubmitting]     = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Coupon state
  const [couponCode, setCouponCode]     = useState('');
  const [couponData, setCouponData]     = useState<any>(null);
  const [couponError, setCouponError]   = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const checkCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    setCouponData(null);
    try {
      const { data } = await api.get(
        `/coupons/check?code=${couponCode.trim().toUpperCase()}&propertyId=${property?._id || ''}`
      );
      setCouponData(data.data);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
  };

  // Calculate discounted price
  const getDiscountedPrice = () => {
    if (!couponData || !property) return null;
    const base = property.pricing?.totalPrice || property.pricing?.rentPerMonth || 0;
    if (!base) return null;
    if (couponData.type === 'percent' || couponData.type === 'percentage') {
      return base - (base * couponData.value) / 100;
    }
    return Math.max(0, base - couponData.value);
  };

  // Fetch property details
  const { data, isLoading, error } = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => {
      console.log('[property] Fetching with slug/id:', slug);
      
      // Check if slug looks like MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
      
      if (isObjectId) {
        // If it's an ID, use ID endpoint directly
        console.log('[property] Using ID endpoint:', `/properties/${slug}`);
        const { data } = await api.get(`/properties/${slug}`);
        console.log('[property] Loaded via ID:', data.data.property.title);
        return data.data.property;
      } else {
        // If it's a slug, try slug endpoint first, then fallback to ID
        try {
          console.log('[property] Trying slug endpoint:', `/properties/slug/${slug}`);
          const { data } = await api.get(`/properties/slug/${slug}`);
          console.log('[property] Loaded via slug:', data.data.property.title);
          return data.data.property;
        } catch (err: any) {
          console.log('[property] Slug endpoint failed:', err.response?.status);
          // Fallback to ID endpoint
          console.log('[property] Trying ID endpoint:', `/properties/${slug}`);
          const { data } = await api.get(`/properties/${slug}`);
          console.log('[property] Loaded via ID:', data.data.property.title);
          return data.data.property;
        }
      }
      
      if (isObjectId) {
        // If it's an ID, use ID endpoint directly
        console.log('📡 Using ID endpoint:', `/properties/${slug}`);
        const { data } = await api.get(`/properties/${slug}`);
        console.log('✅ Property loaded via ID:', data.data.property.title);
        return data.data.property;
      } else {
        // If it's a slug, try slug endpoint first, then fallback to ID
        try {
          console.log('📡 Trying slug endpoint:', `/properties/slug/${slug}`);
          const { data } = await api.get(`/properties/slug/${slug}`);
          console.log('✅ Property loaded via slug:', data.data.property.title);
          return data.data.property;
        } catch (err: any) {
          console.log('⚠️ Slug endpoint failed:', err.response?.status);
          // Fallback to ID endpoint
          console.log('📡 Trying ID endpoint:', `/properties/${slug}`);
          const { data } = await api.get(`/properties/${slug}`);
          console.log('✅ Property loaded via ID:', data.data.property.title);
          return data.data.property;
        }
      }
    },
  });

  const property = data;

  // Handle form submission — sends enquiry to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      await api.post('/enquiries', {
        propertyId: property._id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message + (couponData ? `\n\nCoupon applied: ${couponData.code} (${couponData.type === 'percent' || couponData.type === 'percentage' ? couponData.value + '% OFF' : 'Tk ' + couponData.value + ' OFF'})` : ''),
      });

      setSubmitStatus('success');
      setSubmitMessage('Your enquiry has been submitted successfully. We will contact you shortly.');
      setFormData({ name: '', email: '', phone: '', message: `I'm interested in this property` });
      removeCoupon();
    } catch (err: any) {
      setSubmitStatus('error');
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.message
        || 'Something went wrong. Please try again.';
      setSubmitMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005e9e]"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Failed to load property details' : 'This property does not exist'}
          </p>
          <Link 
            href="/properties" 
            className="inline-flex items-center px-6 py-3 bg-[#005e9e] text-white rounded-lg hover:bg-[#004d84]"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = [
    property.featuredImage,
    ...(property.gallery || [])
  ].filter(img => img?.url);

  const price = property.pricing.totalPrice 
    ? `BDT ${(property.pricing.totalPrice / 10000000).toFixed(2)} Crore`
    : property.pricing.rentPerMonth
    ? `BDT ${property.pricing.rentPerMonth.toLocaleString()}/month`
    : 'Price on request';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="flex items-center text-gray-600 hover:text-[#005e9e]">
              <Home size={16} className="mr-1" />
              <span>Home</span>
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/properties" className="text-gray-600 hover:text-[#005e9e]">
              Properties
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {property.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{property.propertyId}</p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {property.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#cce5f5] text-[#003d6b] text-sm font-medium rounded-full">
                      {property.type?.name}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {property.purpose?.name}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      {property.location?.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#005e9e]">{price}</p>
                  {property.pricing.pricePerSft && (
                    <p className="text-sm text-gray-600 mt-1">
                      BDT {property.pricing.pricePerSft}/sqft
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200">
                {images[selectedImage] && (
                  <img
                    src={toFullUrl(images[selectedImage].url)}
                    alt={images[selectedImage].alt || property.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-[#005e9e]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={toFullUrl(img.url)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Area (sft)</p>
                  <p className="text-2xl font-bold text-gray-900">{property.areaSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price (sft)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {property.pricing.pricePerSft || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bedrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bathrooms</p>
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Balcony</p>
                  <p className="text-2xl font-bold text-gray-900">{property.balcony || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Floor</p>
                  <p className="text-2xl font-bold text-gray-900">{property.floor || '-'}</p>
                </div>
              </div>

              {/* Features */}
              {property.primaryFeatures && property.primaryFeatures.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.primaryFeatures.map((feature: any) => (
                      <div key={feature._id} className="flex items-center space-x-2 text-gray-700">
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="text-sm">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="text-[#005e9e] mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-900">{property.location?.name}</p>
                  <p className="text-gray-600">{property.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact</h2>
              
              {/* Success / Error Message */}
              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{submitMessage}</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{submitMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment or Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005e9e] focus:border-transparent resize-none"
                  />
                </div>

                {/* ── Coupon Section ── */}
                <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <Tag size={14} className="text-[#1a72b0]" />
                    Have a Coupon?
                  </div>

                  {couponData ? (
                    /* Applied coupon display */
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="font-mono font-bold text-green-800 tracking-widest text-sm">
                            {couponData.code}
                          </span>
                        </div>
                        <button type="button" onClick={removeCoupon}
                          className="text-gray-400 hover:text-red-500 transition">
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-green-700 mt-1">
                        {couponData.type === 'percent' || couponData.type === 'percentage'
                          ? `${couponData.value}% OFF applied`
                          : `Tk ${couponData.value.toLocaleString()} OFF applied`}
                      </p>
                      {/* Show discounted price if calculable */}
                      {getDiscountedPrice() !== null && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-500">Discounted price</p>
                          <p className="text-base font-bold text-green-700">
                            {property.pricing.totalPrice
                              ? `BDT ${(getDiscountedPrice()! / 10000000).toFixed(2)} Crore`
                              : `BDT ${getDiscountedPrice()!.toLocaleString()}/month`}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Coupon input */
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), checkCoupon())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-[#005e9e] focus:border-transparent uppercase"
                        />
                        <button
                          type="button"
                          onClick={checkCoupon}
                          disabled={checkingCoupon || !couponCode.trim()}
                          className="px-4 py-2 bg-[#005e9e] hover:bg-[#004d84] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {checkingCoupon
                            ? <Loader2 size={14} className="animate-spin" />
                            : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <X size={11} /> {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#005e9e] text-white font-semibold rounded-lg hover:bg-[#004d84] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </form>

              {/* Share */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Share</h3>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Twitter</span>
                  </button>
                  <button className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
