"use client";

import { useState, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiMagnifyingGlassDuotone as Search, PiCaretRightDuotone as ChevronRight, PiCaretLeftDuotone as ChevronLeft,
  PiGlobeDuotone as Globe, PiCurrencyDollarDuotone as DollarSign, PiFilmStripDuotone as Clapperboard,
  PiTrophyDuotone as Trophy, PiCalendarDuotone as Calendar, PiTelevisionDuotone as Tv, PiSmileyDuotone as Laugh,
  PiHeartDuotone as Heart, PiNotePencilDuotone as PenLine,
  PiWarningCircleDuotone as AlertCircle, PiArrowRightDuotone as ArrowRight
} from "react-icons/pi";
import type { IconType } from "react-icons";

/* people.id is a text column (rows are seeded as `stub-…`), not a serial —
   the previous `id: number` only compiled because page.tsx cast the prop to any.
   rumors.status is likewise a free-text column, so it is typed as such and the
   badge falls back gracefully instead of trusting a union that isn't enforced. */
type Hero = { id: string; slug: string; name: string; category?: string | null; subcategory?: string | null; title?: string; birthDate?: string; portraitUrl?: string; bannerUrl?: string; featuredUrl?: string; featured?: boolean; movies?: unknown[] };
type Rumor = { id: string; title: string; summary: string; status: string; source?: string | null };
type Upcoming = { slug: string; title: string; status: "pre" | "filming" | "post"; date?: string | Date | null; poster?: string | null };
type Recent = { slug: string; title: string; overview?: string | null; date?: string | Date | null; poster?: string | null; backdrop?: string | null };
type Ott = { slug: string; title: string; year?: number | null; platform?: string | null; poster?: string | null };

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' fill='%23111'%3E%3Crect width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='system-ui' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

/* Section rhythm. Sections are grouped by intent — find / catch up / take
   part — with a tight gap inside a group and a wide one between groups.
   Uniform padding on every section is what made the page read flat. */
const SEC = "px-6 md:px-10 lg:px-16";
const GAP_TIGHT = "pb-14";
const GAP_GROUP = "pb-28";

interface HomeClientProps {
  heroesData: Hero[];
  rumorsData: Rumor[];
  upcomingData: Upcoming[];
  recentData: Recent[];
  ottData: Ott[];
  isAuthenticated: boolean;
  userId?: string;
}

export default function HomeClient({ heroesData, rumorsData, upcomingData, recentData, ottData, isAuthenticated, userId }: HomeClientProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const t = query.toLowerCase();
    return heroesData
      .filter(h => h.name.toLowerCase().includes(t))
      .slice(0, 6)
      .map(h => ({
        label: h.name,
        sub: h.title || "Icon",
        // Real route is /icons/[category]/[subcategory]/[slug]; /hero/[slug] 404s.
        href: h.category && h.subcategory
          ? `/icons/${h.category}/${h.subcategory}/${h.slug}`
          : `/icons`,
      }));
  }, [query, heroesData]);

  const searching = query.trim().length > 0;

  return (
    <div className="relative">

      {/* ══════ SEARCH ══════ */}
      <section className={`${SEC} pt-28 pb-20 relative`}>
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/55 z-10" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search heroes, movies…"
              className="relative w-full pl-14 pr-6 py-5 rounded-2xl bg-[#121212] border border-white/[0.09] text-white placeholder:text-white/50 outline-none focus:border-white/25 transition-colors text-[15px] font-medium"
            />
          </div>
          <AnimatePresence>
            {searching && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-3 rounded-2xl bg-[#121212] border border-white/[0.09] overflow-hidden">
                {results.length === 0 ? (
                  <p className="px-6 py-5 text-sm text-white/60">No match for “{query}”. Try a movie title.</p>
                ) : results.map((r, i) => (
                  <Link key={i} href={r.href} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.06] transition-colors border-b border-white/[0.06] last:border-0 group">
                    <div>
                      <p className="text-white font-semibold text-[15px]">{r.label}</p>
                      <p className="text-white/60 text-xs mt-0.5">{r.sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════ EXPLORE GRID ══════ */}
      <section className={`${SEC} ${GAP_GROUP}`}>
        <div className="max-w-7xl mx-auto">
          <SectionHead label="Explore" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <NavCard href="/icons" icon={Globe} title="The Icons" sub="The cinematic universe" />
            <NavCard href="/box-office" icon={DollarSign} title="Box Office" sub="Collections & records" />
            <NavCard href="/upcoming" icon={Calendar} title="Upcoming" sub="Everything in the pipeline" />
            <NavCard href="/movies" icon={Clapperboard} title="Movies" sub="Browse the database" />
          </div>
        </div>
      </section>

      {/* ══════ LATEST UPDATES ══════ */}
      <LatestUpdates items={recentData} />

      {/* ══════ NEW ON OTT ══════ */}
      <OTTReleases items={ottData} />

      {/* ══════ UPCOMING + RUMORS ══════ */}
      <section className={`${SEC} ${GAP_GROUP}`}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
          <UpcomingPanel items={upcomingData} />
          <RumorsPanel items={rumorsData} />
        </div>
      </section>

      {/* ══════ COMMUNITY ══════ */}
      <section className={`${SEC} ${GAP_TIGHT}`}>
        <div className="max-w-7xl mx-auto">
          <SectionHead label="Community" />
          <div className="grid md:grid-cols-3 gap-4">
            <NavCard href="/tier-list" icon={Trophy} title="Tier Lists" sub="Rank your favorites" tall />
            <NavCard href="/memes" icon={Laugh} title="Memes" sub="TFI's funniest" tall />
            <NavCard href="/new-on-ott" icon={Tv} title="On OTT" sub="Streaming now" tall />
          </div>
        </div>
      </section>

      {/* ══════ FAN ZONE + DIARY ══════ */}
      <section className={`${SEC} ${GAP_GROUP}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1.5fr_1fr] gap-6">
          <FanZone />
          <DiaryCard isAuth={isAuthenticated} />
        </div>
      </section>

      {/* ══════ CORRECTIONS ══════ */}
      <section className={`${SEC} pb-24`}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-6 rounded-2xl glass">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <AlertCircle className="w-5 h-5 text-white/55 hidden sm:block flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">Notice an error?</p>
              <p className="text-white/60 text-xs mt-0.5">Help us keep the database accurate.</p>
            </div>
          </div>
          <Link href="/contact" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white border border-white/15 hover:border-white/35 px-6 py-2.5 rounded-full transition-colors whitespace-nowrap">
            Submit
          </Link>
        </div>
      </section>

    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* SHARED COMPONENTS */
/* ═══════════════════════════════════════════ */

function SectionHead({ label, href }: { label: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-10">
      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{label}</h2>
      {href && (
        <Link href={href} className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* One chip, used by every card that has an icon. Was copy-pasted in four
   places with four slightly different hover states. */
function IconChip({ icon: Icon, lg }: { icon: IconType; lg?: boolean }) {
  return (
    <div className={`${lg ? "w-14 h-14 rounded-2xl" : "w-10 h-10 rounded-xl"} inset-surface flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${lg ? "w-6 h-6" : "w-5 h-5"} text-white/70 group-hover:text-white transition-colors duration-300`} />
    </div>
  );
}

function NavCard({ href, icon: Icon, title, sub, tall }: { href: string; icon: IconType; title: string; sub?: string; tall?: boolean }) {
  return (
    <Link href={href} className={`glow-card group flex flex-col justify-between rounded-2xl p-7 ${tall ? 'min-h-[200px]' : 'min-h-[160px]'} glass-premium hover:border-white/25 relative overflow-hidden`}>
      <IconChip icon={Icon} />
      <div className="mt-auto pt-6 relative z-10">
        <h3 className="text-white font-bold text-lg tracking-tight">{title}</h3>
        {sub && <p className="text-white/60 text-[13px] mt-1 font-medium">{sub}</p>}
      </div>
    </Link>
  );
}

function FanZone() {
  const fans = [
    { name: "Rajesh", quote: "Devara BGM gave me chills" },
    { name: "Sneha", quote: "Can't wait for the Pushpa 2 trailer" },
    { name: "Kiran", quote: "TFI domination incoming" },
  ];
  return (
    <div className="rounded-2xl p-8 glass-premium group">
      <div className="flex items-center gap-3 mb-8">
        <IconChip icon={Heart} />
        <h3 className="text-xl font-bold text-white tracking-tight">Fan Zone</h3>
      </div>
      <div className="space-y-3">
        {fans.map((f, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl inset-surface">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 bg-white/10 text-white">
              {f.name[0]}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{f.name}</p>
              <p className="text-white/65 text-[13px] mt-0.5 leading-relaxed">{f.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaryCard({ isAuth }: { isAuth: boolean }) {
  return (
    <div className="rounded-2xl p-8 glass-premium flex flex-col items-center justify-center text-center group">
      <IconChip icon={PenLine} lg />
      <h3 className="text-xl font-bold text-white tracking-tight mb-3 mt-6">Movie Diary</h3>
      <p className="text-white/65 text-sm mb-8 max-w-[220px] leading-relaxed">Log watches, rate films, and build your profile.</p>
      <Link href={isAuth ? "/profile" : "/login"} className={`px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${isAuth ? "bg-white text-black hover:bg-white/85" : "border border-white/25 text-white hover:bg-white hover:text-black"}`}>
        {isAuth ? "Open Diary" : "Sign in"}
      </Link>
    </div>
  );
}

function Poster({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  return (
    <>
      <img
        src={src || IMG_FALLBACK}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${className}`}
        onError={e => ((e.target as HTMLImageElement).src = IMG_FALLBACK)}
      />
      {/* Just enough scrim to seat the badge; the poster is the colour here. */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
    </>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-widest text-white bg-black/70 px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-white/60 text-sm py-8">{children}</p>;
}

function RailButtons({ onScroll }: { onScroll: (d: "l" | "r") => void }) {
  return (
    <div className="flex gap-1.5">
      <button aria-label="Scroll left" onClick={() => onScroll("l")} className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 flex items-center justify-center transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-white/70" /></button>
      <button aria-label="Scroll right" onClick={() => onScroll("r")} className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 flex items-center justify-center transition-colors"><ChevronRight className="w-3.5 h-3.5 text-white/70" /></button>
    </div>
  );
}

function UpcomingPanel({ items }: { items: Upcoming[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: "l" | "r") => ref.current?.scrollBy({ left: d === "l" ? -260 : 260, behavior: "smooth" });

  return (
    <div className="rounded-2xl p-6 md:p-8 glass-premium w-full overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white tracking-tight">Upcoming</h3>
        {items.length > 0 && <RailButtons onScroll={scroll} />}
      </div>
      {items.length === 0 ? (
        <EmptyNote>Nothing in the pipeline yet.</EmptyNote>
      ) : (
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {items.map(m => (
            <Link key={m.slug} href={`/movies/${m.slug}`} className="flex-shrink-0 w-[150px] group snap-start">
              <div className="relative rounded-xl overflow-hidden h-[225px] mb-3 bg-[#1a1a1a]">
                <Poster src={m.poster} alt={m.title} />
                <Badge>{m.status === "filming" ? "Filming" : m.status === "pre" ? "Pre-Prod" : "Post"}</Badge>
              </div>
              <h4 className="text-white font-semibold text-sm leading-tight line-clamp-2">{m.title}</h4>
              {m.date && <p className="text-white/60 text-[11px] mt-1 font-medium">{new Date(m.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RumorsPanel({ items }: { items: Rumor[] }) {
  return (
    <div className="rounded-2xl p-6 md:p-8 glass-premium flex flex-col w-full overflow-hidden">
      <h3 className="text-xl font-bold text-white tracking-tight mb-8">Rumors &amp; Trades</h3>
      {items.length === 0 ? (
        <EmptyNote>No trade talk logged yet.</EmptyNote>
      ) : (
        <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto scrollbar-hide pr-1">
          {items.map(r => (
            <div key={r.id} className="p-5 rounded-xl inset-surface">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-white font-semibold text-sm leading-snug line-clamp-2">{r.title}</h4>
                <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${r.status === "confirmed" ? "bg-white text-black" : "bg-white/10 text-white/75"}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-white/65 text-xs leading-relaxed line-clamp-2">{r.summary}</p>
              {r.source && <p className="text-white/60 text-[10px] mt-3 font-semibold uppercase tracking-widest">{r.source}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LatestUpdates({ items }: { items: Recent[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;

  return (
    <section className={`${SEC} ${GAP_TIGHT}`}>
      <div className="max-w-7xl mx-auto">
        <SectionHead label="Just Released" href="/movies" />
        {/* One film gets the wide frame; the rest sit beside it. Equal cards
            in a row of three is what made this section read as filler. */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
          <Link href={`/movies/${lead.slug}`} className="group relative rounded-2xl overflow-hidden min-h-[320px] bg-[#121212] flex items-end">
            <img
              src={lead.backdrop || lead.poster || IMG_FALLBACK}
              alt={lead.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              onError={e => ((e.target as HTMLImageElement).src = IMG_FALLBACK)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="relative p-7 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{lead.title}</h3>
              {lead.date && <p className="text-white/70 text-xs mt-2 font-semibold uppercase tracking-[0.2em]">{new Date(lead.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</p>}
              {lead.overview && <p className="text-white/70 text-sm mt-3 max-w-[46ch] leading-relaxed line-clamp-2">{lead.overview}</p>}
            </div>
          </Link>

          <div className="grid grid-cols-3 lg:grid-cols-2 gap-4 content-start">
            {rest.slice(0, 4).map(m => (
              <Link key={m.slug} href={`/movies/${m.slug}`} className="group">
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-[#1a1a1a]">
                  <Poster src={m.poster} alt={m.title} />
                </div>
                <h4 className="text-white font-semibold text-[13px] leading-tight mt-2 line-clamp-1">{m.title}</h4>
                {m.date && <p className="text-white/60 text-[11px] mt-0.5">{new Date(m.date).getFullYear()}</p>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OTTReleases({ items }: { items: Ott[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: "l" | "r") => ref.current?.scrollBy({ left: d === "l" ? -280 : 280, behavior: "smooth" });
  if (items.length === 0) return null;

  return (
    <section className={`${SEC} ${GAP_TIGHT}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-3">
            <Tv className="w-5 h-5 text-white/70" />
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">New on OTT</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/new-on-ott" className="text-[11px] font-semibold text-white/60 hover:text-white uppercase tracking-[0.2em] transition-colors hidden sm:block">View All</Link>
            <RailButtons onScroll={scroll} />
          </div>
        </div>
        <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {items.map(m => (
            <Link key={m.slug} href={`/movies/${m.slug}`} className="flex-shrink-0 w-[170px] group block snap-start">
              <div className="relative rounded-2xl overflow-hidden h-[255px] mb-3 bg-[#1a1a1a]">
                <Poster src={m.poster} alt={m.title} />
                {m.platform && <Badge>{m.platform}</Badge>}
              </div>
              <h4 className="text-white font-semibold text-sm leading-tight line-clamp-1">{m.title}</h4>
              {m.year && <p className="text-white/60 text-[11px] mt-1 font-medium">{m.year}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
