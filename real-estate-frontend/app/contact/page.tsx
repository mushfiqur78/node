'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Home, ChevronRight, MapPin, Phone, Mail,
  Clock, Send, MessageCircle, Facebook, Linkedin
} from 'lucide-react';

const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005e9e]/20 focus:border-[#005e9e] transition bg-white';

export default function ContactPage() {
  const [form, setForm]         = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contact-page'],
    queryFn: async () => {
      const { data } = await api.get('/contact-page');
      return data.data.page;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Use enquiry endpoint — no propertyId needed, use a general message
      await api.post('/enquiries/general', {
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        message: `Subject: ${form.subject}\n\n${form.message}`,
      });
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally { setSubmitting(false); }
  };

  const page = data;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#002d52] via-[#003d6b] to-[#004d84] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-[#99cce8] mb-5">
            <Link href="/" className="flex items-center gap-1 hover:text-white transition">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-white">Contact</span>
          </nav>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 w-64 skeleton rounded-lg mx-auto" />
              <div className="h-5 w-96 skeleton rounded mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
                {page?.hero?.heading || 'Contact Us'}
              </h1>
              {page?.hero?.subheading && (
                <p className="text-[#99cce8] text-lg max-w-xl mx-auto">
                  {page.hero.subheading}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: Info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Office cards */}
            {(page?.offices || [{ label: 'Head Office', address: 'Dhaka, Bangladesh', phone: '+880 1234-567890', email: 'info@realestate.com', hours: 'Sat–Thu: 9am–6pm' }]).map((office: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-base">{office.label || `Office ${i + 1}`}</h3>
                <div className="space-y-3">
                  {office.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#e6f2fa] rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-[#005e9e]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Address</p>
                        <p className="text-sm text-gray-700">{office.address}</p>
                      </div>
                    </div>
                  )}
                  {office.phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Phone</p>
                        <a href={`tel:${office.phone}`} className="text-sm text-gray-700 hover:text-[#005e9e] transition">
                          {office.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Email</p>
                        <a href={`mailto:${office.email}`} className="text-sm text-gray-700 hover:text-[#005e9e] transition">
                          {office.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {office.hours && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Office Hours</p>
                        <p className="text-sm text-gray-700">{office.hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Social links */}
            {page?.social && Object.values(page.social).some(Boolean) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-base">Follow Us</h3>
                <div className="flex gap-3">
                  {page.social.whatsapp && (
                    <a href={`https://wa.me/${page.social.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition" title="WhatsApp">
                      <MessageCircle size={18} className="text-white" />
                    </a>
                  )}
                  {page.social.facebook && (
                    <a href={page.social.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#005e9e] hover:bg-[#004d84] rounded-xl flex items-center justify-center transition" title="Facebook">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {page.social.instagram && (
                    <a href={page.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-xl flex items-center justify-center transition" title="Instagram">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                    </a>
                  )}
                  {page.social.linkedin && (
                    <a href={page.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#004d84] hover:bg-[#003d6b] rounded-xl flex items-center justify-center transition" title="LinkedIn">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Form + Map ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Contact Form */}
            {(page?.showForm !== false) && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {page?.formHeading || 'Send Us a Message'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name" className={inp} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com" className={inp} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <input type="tel" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="01XXXXXXXXX" className={inp} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                      <input type="text" value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="How can we help?" className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea required rows={5} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your message here..."
                      className={`${inp} resize-none`} />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#005e9e] hover:bg-[#004d84] text-white font-semibold rounded-xl transition disabled:opacity-60">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={16} /> Send Message</>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Map */}
            {page?.mapEmbed && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <iframe src={page.mapEmbed} width="100%" height="320"
                  style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
