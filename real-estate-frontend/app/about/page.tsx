'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toFullUrl } from '@/lib/utils';
import {
  Home, ChevronRight, MapPin, Phone, Mail,
  CheckCircle, Target, Eye, Users
} from 'lucide-react';

export default function AboutPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['about-page'],
    queryFn: async () => {
      const { data } = await api.get('/about');
      return data.data.about;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-72 skeleton" />
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
          <div className="h-8 w-48 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>
      </div>
    );
  }

  const about = data;
  if (!about) return null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden">
        {about.hero?.image ? (
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${toFullUrl(about.hero.image)}')` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#002d52] to-[#004d84]" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <nav className="flex items-center justify-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-white">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-white">About</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            {about.hero?.heading || 'About Us'}
          </h1>
          {about.hero?.subheading && (
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              {about.hero.subheading}
            </p>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      {about.stats?.length > 0 && (
        <section className="bg-[#005e9e] py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {about.stats.map((stat: any, i: number) => (
                <div key={i}>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-[#99cce8] text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Overview ── */}
      {(about.overview?.description || about.overview?.image) && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-5">
                  {about.overview?.title || 'Who We Are'}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {about.overview?.description}
                </p>
              </div>
              {about.overview?.image && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={toFullUrl(about.overview.image)} alt="About"
                    className="w-full h-72 object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Mission & Vision ── */}
      {(about.mission?.description || about.vision?.description) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {about.mission?.description && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-[#cce5f5] rounded-xl flex items-center justify-center mb-4">
                    <Target size={24} className="text-[#005e9e]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {about.mission.title || 'Our Mission'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{about.mission.description}</p>
                </div>
              )}
              {about.vision?.description && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <Eye size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {about.vision.title || 'Our Vision'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{about.vision.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      {about.whyUs?.items?.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {about.whyUs.title || 'Why Choose Us'}
              </h2>
              {about.whyUs.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto">{about.whyUs.subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.whyUs.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#99cce8] hover:shadow-sm transition">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Team ── */}
      {about.team?.members?.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {about.team.title || 'Meet Our Team'}
              </h2>
              {about.team.subtitle && (
                <p className="text-gray-500 max-w-xl mx-auto">{about.team.subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.team.members.map((member: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-center">
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    {member.image ? (
                      <img src={toFullUrl(member.image)} alt={member.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#e6f2fa]">
                        <Users size={48} className="text-[#99cce8]" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
                    <p className="text-[#005e9e] text-sm font-medium mb-2">{member.role}</p>
                    {member.bio && <p className="text-gray-500 text-sm mb-3">{member.bio}</p>}
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:text-[#005e9e]">
                          <Phone size={13} /> {member.phone}
                        </a>
                      )}
                    </div>
                    {(member.facebook || member.linkedin) && (
                      <div className="flex justify-center gap-3 mt-3">
                        {member.facebook && (
                          <a href={member.facebook} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#005e9e] rounded-full flex items-center justify-center hover:bg-[#004d84] transition">
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#004d84] rounded-full flex items-center justify-center hover:bg-[#003d6b] transition">
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      {(about.contact?.address || about.contact?.phone || about.contact?.email) && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Get In Touch</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-5">
                {about.contact.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#cce5f5] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[#005e9e]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">Address</p>
                      <p className="text-gray-600 text-sm">{about.contact.address}</p>
                    </div>
                  </div>
                )}
                {about.contact.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">Phone</p>
                      <a href={`tel:${about.contact.phone}`} className="text-gray-600 text-sm hover:text-[#005e9e]">
                        {about.contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {about.contact.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">Email</p>
                      <a href={`mailto:${about.contact.email}`} className="text-gray-600 text-sm hover:text-[#005e9e]">
                        {about.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Map */}
              {about.contact.mapEmbed && (
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64">
                  <iframe src={about.contact.mapEmbed} width="100%" height="100%"
                    style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
