'use client';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/ui/NotificationBell';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, Users, Settings, ChevronDown, LogOut, Menu as MenuIcon, MessageSquare, BookOpen, Navigation, Search, Image, Sliders, Star, Layout, BarChart2, Timer, FileUp, MousePointerClick, Ticket, Gift, UserCheck, Info, Phone } from 'lucide-react';

const configItems = [
  { href: '/dashboard/config/property-types', label: 'Property Types' },
  { href: '/dashboard/config/locations',      label: 'Locations' },
  { href: '/dashboard/config/purposes',       label: 'Purposes' },
  { href: '/dashboard/config/statuses',       label: 'Statuses' },
  { href: '/dashboard/config/features',       label: 'Features' },
];

const blogSubItems = [
  { href: '/dashboard/blogs',                        label: 'All Posts' },
  { href: '/dashboard/config/blog-categories',       label: 'Categories' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [configOpen, setConfigOpen]   = useState(false);
  const [blogOpen, setBlogOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seoOpen, setSeoOpen]           = useState(false);
  const [expiryOpen, setExpiryOpen]     = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  // Auto-open blog submenu if on a blog page
  useEffect(() => {
    if (pathname.startsWith('/dashboard/blogs') || pathname.includes('blog-categories')) {
      setBlogOpen(true);
    }
    if (pathname.startsWith('/dashboard/config') && !pathname.includes('blog-categories')) {
      setConfigOpen(true);
    }
    if (pathname.startsWith('/dashboard/settings')) {
      setSettingsOpen(true);
    }
    if (pathname.startsWith('/dashboard/seo')) {
      setSeoOpen(true);
    }
    if (pathname.startsWith('/dashboard/expiry')) {
      setExpiryOpen(true);
    }
    if (pathname.startsWith('/dashboard/referral') || pathname.startsWith('/dashboard/coupons') || pathname.startsWith('/dashboard/rewards')) {
      setReferralOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === href ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
      <Icon size={20} />
      {sidebarOpen && <span>{label}</span>}
    </Link>
  );

  const SubLink = ({ href, label }: { href: string; label: string }) => (
    <Link href={href}
      className={`block px-3 py-1.5 rounded-lg text-sm transition ${pathname === href ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
      {label}
    </Link>
  );

  const SubMenu = ({ label, icon: Icon, items }: { label: string; icon: any; items: { href: string; label: string }[] }) => {
    const isAnyActive = items.some(i => pathname === i.href || pathname.startsWith(i.href));
    const [open, setOpen] = useState(isAnyActive);
    return (
      <div>
        <button onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${isAnyActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
          <Icon size={20} />
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left">{label}</span>
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {sidebarOpen && open && (
          <div className="ml-8 mt-1 space-y-0.5">
            {items.map(item => (
              <Link key={item.href} href={item.href}
                className={`block px-3 py-1.5 rounded-lg text-sm transition ${pathname === item.href ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <span className="font-bold text-lg">RealEstate</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-700">
            <MenuIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          <NavLink href="/dashboard"            label="Dashboard"  icon={LayoutDashboard} />
          <NavLink href="/dashboard/properties" label="Properties" icon={Building2} />

          {/* Blogs with submenu */}
          {sidebarOpen ? (
            <div>
              <button onClick={() => setBlogOpen(!blogOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${pathname.startsWith('/dashboard/blogs') || pathname.includes('blog-categories') ? 'bg-gray-700' : ''}`}>
                <div className="flex items-center gap-3"><BookOpen size={20} /><span>Blogs</span></div>
                <ChevronDown size={16} className={`transition-transform ${blogOpen ? 'rotate-180' : ''}`} />
              </button>
              {blogOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {blogSubItems.map(({ href, label }) => <SubLink key={href} href={href} label={label} />)}
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/dashboard/blogs" label="Blogs" icon={BookOpen} />
          )}

          <NavLink href="/dashboard/analytics"   label="Analytics"    icon={BarChart2} />
          {/* Expiry submenu */}
          {sidebarOpen ? (
            <div>
              <button onClick={() => setExpiryOpen(!expiryOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${pathname.startsWith('/dashboard/expiry') ? 'bg-gray-700' : ''}`}>
                <div className="flex items-center gap-3"><Timer size={20} /><span>Expiry</span></div>
                <ChevronDown size={16} className={`transition-transform ${expiryOpen ? 'rotate-180' : ''}`} />
              </button>
              {expiryOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <SubLink href="/dashboard/expiry"          label="Expiry List" />
                  <SubLink href="/dashboard/expiry/settings" label="Settings" />
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/dashboard/expiry" label="Expiry" icon={Timer} />
          )}
          <NavLink href="/dashboard/import-export"  label="Import/Export"  icon={FileUp} />

          {/* Referral System submenu */}
          {sidebarOpen ? (
            <div>
              <button onClick={() => setReferralOpen(!referralOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${referralOpen ? 'bg-gray-700' : ''}`}>
                <div className="flex items-center gap-3"><MousePointerClick size={20} /><span>Referral</span></div>
                <ChevronDown size={16} className={`transition-transform ${referralOpen ? 'rotate-180' : ''}`} />
              </button>
              {referralOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <SubLink href="/dashboard/referral-clicks" label="Clicks" />
                  <SubLink href="/dashboard/coupons"         label="Coupons" />
                  <SubLink href="/dashboard/rewards"         label="Rewards" />
                  <SubLink href="/dashboard/referral-leads"  label="Leads" />
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/dashboard/referral-clicks" label="Referral" icon={MousePointerClick} />
          )}

          <NavLink href="/dashboard/users"        label="Users"         icon={Users} />
          <SubMenu label="Enquiries" icon={MessageSquare} items={[
            { href: '/dashboard/enquiries/property',    label: 'Property' },
            { href: '/dashboard/enquiries/contact',     label: 'Contact Us' },
            { href: '/dashboard/enquiries/subscribers', label: 'Subscribers' },
          ]} />
          <NavLink href="/dashboard/testimonials" label="Testimonials"  icon={Star} />
          <NavLink href="/dashboard/banners"      label="Banner/Slider" icon={Layout} />
          <NavLink href="/dashboard/about"        label="About Page"    icon={Info} />
          <NavLink href="/dashboard/contact"      label="Contact Page"  icon={Phone} />
          <NavLink href="/dashboard/menus"        label="Menus"         icon={Navigation} />
          <NavLink href="/dashboard/media"        label="Media"         icon={Image} />

          {/* SEO Settings submenu */}
          {sidebarOpen ? (
            <div>
              <button onClick={() => setSeoOpen(!seoOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${pathname.startsWith('/dashboard/seo') ? 'bg-gray-700' : ''}`}>
                <div className="flex items-center gap-3"><Search size={20} /><span>SEO Settings</span></div>
                <ChevronDown size={16} className={`transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
              </button>
              {seoOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <SubLink href="/dashboard/seo"              label="Page SEO" />
                  <SubLink href="/dashboard/seo/site-config"  label="Site Config" />
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/dashboard/seo" label="SEO" icon={Search} />
          )}

          {/* General Settings submenu */}
          {sidebarOpen ? (
            <div>
              <button onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${pathname.startsWith('/dashboard/settings') ? 'bg-gray-700' : ''}`}>
                <div className="flex items-center gap-3"><Sliders size={20} /><span>General Settings</span></div>
                <ChevronDown size={16} className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <SubLink href="/dashboard/settings"       label="General Setting" />
                  <SubLink href="/dashboard/settings/smtp"  label="Email / SMTP" />
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/dashboard/settings" label="Settings" icon={Sliders} />
          )}

          {/* Config dropdown */}
          {sidebarOpen && (
            <div>
              <button onClick={() => setConfigOpen(!configOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition">
                <div className="flex items-center gap-3"><Settings size={20} /><span>Config</span></div>
                <ChevronDown size={16} className={`transition-transform ${configOpen ? 'rotate-180' : ''}`} />
              </button>
              {configOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {configItems.map(({ href, label }) => <SubLink key={href} href={href} label={label} />)}
                </div>
              )}
            </div>
          )}
        </nav>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 hover:bg-gray-700 border-t border-gray-700">
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-700 font-semibold capitalize">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <NotificationBell />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
