'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiUserDuotone,
  PiSignOutDuotone,
  PiTrophyDuotone,
  PiSmileyDuotone,
  PiListDuotone,
  PiXDuotone,
} from 'react-icons/pi';
import { signOut } from 'next-auth/react';

const NAV_LINKS = [
  { href: '/icons', label: 'Icons' },
  { href: '/movies', label: 'Movies' },
  { href: '/box-office', label: 'Box Office' },
  { href: '/upcoming', label: 'Upcoming' },
  { href: '/new-on-ott', label: 'On OTT' },
  { href: '/memes', label: 'Memes' },
  { href: '/tier-list', label: 'Tier Lists' },
];

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close account dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // The bar is transparent over the hero and earns its surface once you scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse the mobile sheet and account menu whenever the route changes.
  // Done during render rather than in an effect so it lands in the same commit
  // as the navigation (and so it covers browser back/forward too).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setShowDropdown(false);
  }

  const displayName = user?.name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const lit = scrolled || mobileOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 ${
        lit
          ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.09]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LEFT: Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-black text-white tracking-tighter shrink-0">
            TFIverse
          </Link>

          {/* CENTER: Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Auth & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border border-white/[0.12] hover:border-white/30 hover:bg-white/[0.05] transition-colors group"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs sm:text-sm">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-white/70 group-hover:text-white text-[13px] font-medium transition-colors">
                    Account
                  </span>
                </button>

                <AnimatePresence>
                  {showDropdown && <AccountMenu user={user} displayName={displayName} onNavigate={() => setShowDropdown(false)} />}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="text-white/70 hover:text-white text-[13px] font-medium transition-colors px-2 sm:px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-black hover:bg-white/90 active:scale-[0.97] text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden w-9 h-9 rounded-full border border-white/[0.12] text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
            >
              {mobileOpen ? <PiXDuotone className="w-4 h-4" /> : <PiListDuotone className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet — without this the nav links simply vanish below lg */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-white/[0.09]"
          >
            <div className="px-4 sm:px-6 py-3 grid grid-cols-2 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function AccountMenu({
  user,
  displayName,
  onNavigate,
}: {
  user: NonNullable<NavbarProps['user']>;
  displayName: string;
  onNavigate: () => void;
}) {
  return (
    <motion.div
      role="menu"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden glass-premium"
    >
      <div className="px-5 py-4 border-b border-white/[0.09]">
        <p className="text-sm font-bold text-white mb-0.5">{displayName}</p>
        <p className="text-xs text-white/60 truncate">{user.email}</p>
      </div>

      <div className="py-1">
        <DropdownLink href="/profile" label="My Profile" icon={<PiUserDuotone size={16} />} onClick={onNavigate} />
        <DropdownLink href="/tier-list/my-lists" label="My Tier Lists" icon={<PiTrophyDuotone size={16} />} onClick={onNavigate} />
        <DropdownLink href="/memes" label="My Memes" icon={<PiSmileyDuotone size={16} />} onClick={onNavigate} />
      </div>

      <div className="p-2 border-t border-white/[0.09]">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors flex items-center gap-3 font-medium"
        >
          <PiSignOutDuotone size={16} /> Sign out
        </button>
      </div>
    </motion.div>
  );
}

function DropdownLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="mx-2 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-3 font-medium group"
    >
      <span className="text-white/60 group-hover:text-white transition-colors">{icon}</span>
      {label}
    </Link>
  );
}
