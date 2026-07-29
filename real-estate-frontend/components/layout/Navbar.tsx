'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, Heart, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMenus, MenuItem } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Navbar Component
 * Dynamic navigation from backend API
 * Supports nested dropdown menus (1 level deep)
 */

// Dropdown for desktop submenu
function DropdownMenu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
      {items.map((child) => (
        <Link
          key={child._id}
          href={child.url || '#'}
          target={child.target}
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e6f2fa] hover:text-[#005e9e] transition"
        >
          {child.name}
        </Link>
      ))}
    </div>
  );
}

// Single nav item (with optional dropdown)
function NavItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = item.children && item.children.length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (hasChildren) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-1 text-gray-700 hover:text-[#005e9e] transition font-medium"
        >
          <span>{item.name}</span>
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <DropdownMenu items={item.children} onClose={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <Link
      href={item.url || '#'}
      target={item.target}
      className="text-gray-700 hover:text-[#005e9e] transition font-medium"
    >
      {item.name}
    </Link>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileItem, setOpenMobileItem] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading } = useMenus();
  const { user, logout } = useAuth();
  const menus = data?.menus || [];

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#005e9e]">
              RealEstate
            </Link>
          </div>

          {/* Desktop Navigation — dynamic */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoading ? (
              // Skeleton loader
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </>
            ) : (
              menus.map((item) => <NavItem key={item._id} item={item} />)
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-[#005e9e] transition">
              <Heart size={20} />
            </button>

            {user ? (
              /* Logged-in user dropdown */
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#005e9e] flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserCircle size={16} />
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#005e9e] transition font-medium"
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#005e9e] text-white rounded-lg hover:bg-[#004d84] transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#005e9e]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {isLoading ? (
              <div className="py-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : (
              menus.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <div key={item._id}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => setOpenMobileItem(openMobileItem === item._id ? null : item._id)}
                          className="w-full flex items-center justify-between py-2.5 text-gray-700 hover:text-[#005e9e] font-medium"
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${openMobileItem === item._id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openMobileItem === item._id && (
                          <div className="pl-4 border-l-2 border-[#cce5f5] mb-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child._id}
                                href={child.url || '#'}
                                target={child.target}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-sm text-gray-600 hover:text-[#005e9e]"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.url || '#'}
                        target={item.target}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2.5 text-gray-700 hover:text-[#005e9e] font-medium"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })
            )}

            {/* Auth buttons */}
            <div className="pt-3 border-t space-y-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#005e9e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2.5 text-gray-700 hover:text-[#005e9e] font-medium">
                    <UserCircle size={18} />
                    <span>My Dashboard</span>
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 py-2.5 text-red-600 font-medium">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2.5 text-gray-700 hover:text-[#005e9e] font-medium">
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-4 bg-[#005e9e] text-white rounded-lg text-center font-medium hover:bg-[#004d84]">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
