'use client';

import { useState } from 'react';
import { Send, Bell, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const benefits = [
  { icon: Bell,       label: 'Price Alerts',    desc: 'Instant drop notifications' },
  { icon: TrendingUp, label: 'Market Insights', desc: 'Weekly market trends' },
  { icon: BookOpen,   label: 'Expert Guides',   desc: 'Real estate tips & advice' },
];

export default function NewsletterSection() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post('/subscribers', { name: '', email });
      setSubmitted(true);
      toast.success("You're subscribed!");
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong';
      if (msg.includes('already')) { setSubmitted(true); toast.success(msg); }
      else toast.error(msg);
    }
  };

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">

          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#004d84] via-[#005e9e] to-[#1a72b0]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          {/* Content */}
          <div className="relative z-10 px-8 py-14 sm:px-14 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-xs font-semibold tracking-wide uppercase mb-5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Newsletter
                </span>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                  Stay ahead of the
                  <span className="block text-blue-200">property market</span>
                </h2>
                <p className="text-blue-100 text-base leading-relaxed mb-8 max-w-md">
                  Join thousands of subscribers getting exclusive listings, price alerts, and expert real estate insights every week.
                </p>

                <div className="space-y-3">
                  {benefits.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-white" />
                      </div>
                      <div>
                        <span className="text-white text-sm font-semibold">{label}</span>
                        <span className="text-blue-200 text-sm"> - {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Form */}
              <div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                  {submitted ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-300" />
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">{"You're in!"}</h3>
                      <p className="text-blue-200 text-sm">Check your inbox for a confirmation email.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-white text-xl font-bold mb-1">Get free updates</h3>
                      <p className="text-blue-200 text-sm mb-6">No spam. Unsubscribe anytime.</p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your full name"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition"
                        />
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-blue-50 text-[#004d84] font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm"
                        >
                          <Send size={15} strokeWidth={2.5} />
                          Subscribe Now
                        </button>
                      </form>

                      <div className="flex items-center gap-2 mt-5">
                        <div className="flex -space-x-2">
                          {['bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400'].map((c, i) => (
                            <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <p className="text-blue-200 text-xs">
                          <span className="text-white font-semibold">2,400+</span> subscribers already joined
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
