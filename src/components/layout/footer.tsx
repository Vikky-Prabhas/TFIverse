import Link from "next/link";
import { FaTwitter, FaInstagram } from "react-icons/fa";
import { HiHeart } from "react-icons/hi2";

export default function Footer() {
  const universe = [
    { href: "/icons", label: "Icons" },
    { href: "/movies", label: "Movies" },
    { href: "/upcoming", label: "Upcoming" },
    { href: "/box-office", label: "Box Office" },
    { href: "/tier-list", label: "Tier Lists" },
  ];
  const support = [
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="border-t border-white/[0.09] pt-20 pb-10 px-6 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-tight mb-5 block text-white">
            TFIverse
          </Link>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed mb-6">
            The premium sanctuary for Telugu cinema. Discover heroes, rank movies, join the culture.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: FaTwitter, href: "https://x.com/TFI_verse", label: "TFIverse on X" },
              { Icon: FaInstagram, href: "https://www.instagram.com/tfiverse.in/", label: "TFIverse on Instagram" },
            ].map(({ Icon, href, label }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-black hover:bg-white hover:border-white transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-[11px] uppercase tracking-[0.2em] mb-6">Universe</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            {universe.map(l => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-[11px] uppercase tracking-[0.2em] mb-6">Support</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            {support.map(l => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/[0.09] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1.5 text-white/60 text-xs">
          © {new Date().getFullYear()} TFIVERSE. Made with <HiHeart className="w-3.5 h-3.5 text-white mx-0.5" /> for Telugu Cinema.
        </div>
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.25em]">Built for the culture</p>
      </div>
    </footer>
  );
}
