"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTicketAlt, FaChartLine, FaTheaterMasks, FaCoins, FaSpinner, FaChevronDown, FaChevronRight, FaFireAlt } from "react-icons/fa";

export default function BoxOfficeDashboard({ movieSlug }: { movieSlug: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Advanced State
  const [mode, setMode] = useState<'live' | 'advance'>('live');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = `/api/movies/${movieSlug}/box-office/advanced?`;
        if (selectedDate) url += `date=${selectedDate}&`;
        if (selectedFormat) url += `format=${encodeURIComponent(selectedFormat)}`;
        
        const res = await fetch(url);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch advanced box office", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [movieSlug, selectedDate, selectedFormat]);

  const availableDates = data?.availableDates || [];
  
  // Derive timeline dates based on mode
  const timelineDates = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      if (mode === 'live') {
          return availableDates.filter((d: string) => d <= today);
      } else {
          return availableDates.filter((d: string) => d >= today);
      }
  }, [availableDates, mode]);

  // Effect: Auto-select date when mode changes
  useEffect(() => {
      if (timelineDates.length > 0 && !timelineDates.includes(selectedDate)) {
          setSelectedDate(timelineDates[timelineDates.length - 1]); // Default to latest applicable date
      } else if (timelineDates.length === 0) {
          setSelectedDate(null);
      }
  }, [mode, timelineDates]);


  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
        <FaSpinner className="animate-spin text-5xl mb-6 text-[#C1FF00]" />
        <p className="tracking-widest text-sm uppercase">Loading the God-Tier Dashboard...</p>
      </div>
    );
  }

  if (!data || !data.heroStats) {
    return <div className="text-center py-10 text-neutral-500">No Box Office Data Available</div>;
  }

  const { heroStats, formatSplits, atpDistribution, drillDown, heatmap } = data;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const isAdvance = mode === 'advance';
  const velocity = isAdvance && heroStats.totalSold > 0 ? Math.round(heroStats.totalSold / 24) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* 1. The Sticky "God Mode" Control Panel */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-6 bg-black/80 backdrop-blur-xl border-b border-white/10 space-y-6">
        
        {/* Mode Switcher */}
        <div className="flex justify-center">
            <div className="flex items-center bg-[#111] p-1.5 rounded-full border border-white/10 relative">
                <div 
                    className="absolute bg-[#C1FF00] inset-y-1.5 rounded-full transition-all duration-500 ease-out z-0" 
                    style={{ 
                        width: 'calc(50% - 6px)', 
                        left: mode === 'live' ? '6px' : 'calc(50% + 0px)' 
                    }}
                />
                <button 
                    onClick={() => { setMode('live'); setSelectedDate(null); }}
                    className={`relative z-10 px-8 py-2 text-sm font-black tracking-widest uppercase rounded-full transition-colors ${mode === 'live' ? 'text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                    Live Box Office
                </button>
                <button 
                    onClick={() => { setMode('advance'); setSelectedDate(null); }}
                    className={`relative z-10 px-8 py-2 text-sm font-black tracking-widest uppercase rounded-full transition-colors ${mode === 'advance' ? 'text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                    Advance Bookings
                </button>
            </div>
        </div>

        {/* Date Timeline */}
        {timelineDates.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setSelectedDate(null)}
                    className={`flex-shrink-0 px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${!selectedDate ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
                >
                All {isAdvance ? 'Upcoming' : 'Past'}
                </button>
                {timelineDates.map((d: string) => (
                    <button 
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`flex-shrink-0 px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${selectedDate === d ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-transparent hover:border-white/10'}`}
                    >
                    {new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </button>
                ))}
            </div>
        )}

        {/* Format Chips */}
        {formatSplits && formatSplits.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setSelectedFormat(null)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${!selectedFormat ? 'bg-blue-500 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
                >
                All Formats
                </button>
                {formatSplits.map((stat: any, idx: number) => (
                    <button 
                        key={idx}
                        onClick={() => setSelectedFormat(stat.name)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border ${selectedFormat === stat.name ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/20'}`}
                    >
                    {stat.name}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* 2. The Pulse Dashboard (Hero Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 lg:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden">
          <FaCoins className="text-[#C1FF00]/10 text-6xl absolute -right-4 -bottom-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C1FF00] mb-2">{isAdvance ? 'Advance Gross' : 'Live Gross'}</p>
          <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{formatCurrency(heroStats.totalGross)}</p>
        </div>
        
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden">
          <FaTicketAlt className="text-blue-500/10 text-6xl absolute -right-4 -bottom-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Sold Tickets</p>
          <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">{heroStats.totalSold.toLocaleString()}</p>
          {isAdvance && velocity > 0 && (
              <div className="mt-4 flex items-center gap-2 text-orange-500 text-xs font-black tracking-widest uppercase">
                  <FaFireAlt className="animate-pulse" /> Selling {velocity}/hr
              </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden">
          <FaTheaterMasks className="text-purple-500/10 text-6xl absolute -right-4 -bottom-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Total Shows</p>
          <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">{heroStats.totalShows.toLocaleString()}</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden">
          <FaChartLine className="text-rose-500/10 text-6xl absolute -right-4 -bottom-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-400 mb-2">Occupancy</p>
          <div className="flex flex-col gap-3">
            <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">{heroStats.occupancy}%</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${heroStats.occupancy}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Format / Language Breakdown */}
          {formatSplits && formatSplits.length > 0 && (
            <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300 mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Language & Version Splits
                </h3>
                <div className="space-y-4">
                    {formatSplits.map((stat: any, idx: number) => {
                        const percentage = heroStats.totalGross > 0 ? (stat.gross / heroStats.totalGross) * 100 : 0;
                        return (
                            <div key={idx} className="relative group">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-white">{stat.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{stat.shows.toLocaleString()} Shows</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white block">{formatCurrency(stat.gross)}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{stat.sold.toLocaleString()} Tickets</span>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          )}

          {/* Occupancy Heatmap */}
          {heatmap && heatmap.length > 0 && (
            <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300 mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Occupancy Heatmap (Time of Day)
                </h3>
                <div className="space-y-4">
                    {heatmap.map((h: any, idx: number) => {
                        const occ = parseFloat(h.occ);
                        const isHot = occ >= 75;
                        const isWarm = occ >= 40 && occ < 75;
                        return (
                            <div key={idx} className="relative group">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-sm font-bold text-white block">{h.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{h.shows.toLocaleString()} Shows</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white block">{occ}%</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{formatCurrency(h.gross)}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-1000 ${isHot ? 'bg-rose-500' : isWarm ? 'bg-orange-500' : 'bg-blue-500'}`}
                                        style={{ width: `${occ}%` }} 
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {/* ATP Distribution */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300 mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Ticket Price Distribution (ATP)
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 max-h-[300px]">
            <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 border-b border-white/10 sticky top-0 bg-[#111]">
                <tr>
                    <th className="pb-3 font-black">Range</th>
                    <th className="pb-3 font-black text-right hidden sm:table-cell">Shows</th>
                    <th className="pb-3 font-black text-right hidden sm:table-cell">Sold</th>
                    <th className="pb-3 font-black text-right">Occ %</th>
                    <th className="pb-3 font-black text-right">Gross</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {atpDistribution.map((row: any) => (
                    <tr key={row.range} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-white">{row.range}</td>
                    <td className="py-3 text-right text-neutral-400 hidden sm:table-cell">{row.shows.toLocaleString()}</td>
                    <td className="py-3 text-right text-neutral-300 hidden sm:table-cell">{row.sold.toLocaleString()}</td>
                    <td className="py-3 text-right text-neutral-400">{row.occ}%</td>
                    <td className="py-3 text-right text-white font-black">{formatCurrency(row.gross)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

      {/* 4. The Beast (Deep Drill Down) */}
      <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                The Beast: 5-Level Granular Tracking
            </h3>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex gap-4">
                <span>State</span>
                <FaChevronRight className="text-neutral-700"/>
                <span>District</span>
                <FaChevronRight className="text-neutral-700"/>
                <span>City</span>
                <FaChevronRight className="text-neutral-700"/>
                <span>Venue</span>
            </div>
        </div>
        
        <div className="space-y-2">
          {Object.values(drillDown).sort((a:any, b:any) => b.gross - a.gross).map((state: any) => (
            <StateRow key={state.name} state={state} formatCurrency={formatCurrency} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Recursive Drill-Down Components (5 Levels)
// ----------------------------------------------------

function StateRow({ state, formatCurrency }: { state: any, formatCurrency: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#111]">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`transition-transform duration-300 ${open ? 'rotate-90 text-[#C1FF00]' : 'text-neutral-500'}`}>
            <FaChevronRight className="text-sm" />
          </div>
          <span className="font-black text-white tracking-wide text-lg">{state.name}</span>
        </div>
        <div className="flex items-center gap-8 text-sm">
          <div className="text-right hidden sm:block">
            <span className="text-neutral-500 text-[10px] block uppercase tracking-widest mb-1">Shows</span>
            <span className="text-neutral-300 font-bold">{state.shows.toLocaleString()}</span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-neutral-500 text-[10px] block uppercase tracking-widest mb-1">Sold</span>
            <span className="text-neutral-300 font-bold">{state.sold.toLocaleString()}</span>
          </div>
          <div className="text-right w-24">
            <span className="text-neutral-500 text-[10px] block uppercase tracking-widest mb-1">Gross</span>
            <span className="text-[#C1FF00] font-black text-lg">{formatCurrency(state.gross)}</span>
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 pl-8 border-t border-white/5 bg-black/60 space-y-1">
              {Object.values(state.districts).sort((a:any, b:any) => b.gross - a.gross).map((district: any) => (
                <DistrictRow key={district.name} district={district} formatCurrency={formatCurrency} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DistrictRow({ district, formatCurrency }: { district: any, formatCurrency: any }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="border border-white/5 rounded-xl overflow-hidden bg-[#151515]">
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`transition-transform duration-300 ${open ? 'rotate-90 text-blue-400' : 'text-neutral-600'}`}>
              <FaChevronRight className="text-xs" />
            </div>
            <span className="font-bold text-neutral-200 tracking-wide">{district.name} <span className="text-neutral-600 font-normal text-xs ml-2">District</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right hidden sm:block">
              <span className="text-neutral-400 font-medium">{district.shows.toLocaleString()} shows</span>
            </div>
            <div className="text-right w-24">
              <span className="text-blue-400 font-black">{formatCurrency(district.gross)}</span>
            </div>
          </div>
        </button>
  
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 pl-6 border-t border-white/5 bg-black/40 space-y-1">
                {Object.values(district.cities).sort((a:any, b:any) => b.gross - a.gross).map((city: any) => (
                  <CityRow key={city.name} city={city} formatCurrency={formatCurrency} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
}

function CityRow({ city, formatCurrency }: { city: any, formatCurrency: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden bg-[#1a1a1a]">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`transition-transform duration-300 ${open ? 'rotate-90 text-purple-400' : 'text-neutral-600'}`}>
            <FaChevronRight className="text-xs" />
          </div>
          <span className="font-medium text-neutral-300 text-sm tracking-wide">{city.name} <span className="text-neutral-600 font-normal text-[10px] ml-2 uppercase">City / Mandal</span></span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="text-right hidden sm:block">
            <span className="text-neutral-500 font-medium">{city.shows.toLocaleString()} shows</span>
          </div>
          <div className="text-right w-20">
            <span className="text-purple-400 font-bold">{formatCurrency(city.gross)}</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 pl-6 border-t border-white/5 bg-black/60 space-y-1">
              {Object.values(city.venues).sort((a:any, b:any) => b.gross - a.gross).map((venue: any) => (
                <VenueRow key={venue.name} venue={venue} formatCurrency={formatCurrency} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VenueRow({ venue, formatCurrency }: { venue: any, formatCurrency: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-md overflow-hidden bg-white/[0.02]">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`transition-transform duration-300 ${open ? 'rotate-90 text-rose-400' : 'text-neutral-600'}`}>
            <FaChevronRight className="text-[10px]" />
          </div>
          <span className="text-neutral-300 text-xs truncate max-w-[200px] sm:max-w-xs text-left font-medium">{venue.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block text-neutral-500">
            {venue.shows} shows
          </div>
          <div className="text-right w-16">
            <span className="text-neutral-200 font-bold">{formatCurrency(venue.gross)}</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 pl-6 border-t border-white/5 bg-black">
              <table className="w-full text-left text-[10px] text-neutral-400">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-600 uppercase tracking-wider">
                    <th className="pb-1 font-medium">Date</th>
                    <th className="pb-1 font-medium">Time</th>
                    <th className="pb-1 font-medium hidden sm:table-cell">Audi</th>
                    <th className="pb-1 font-medium text-right hidden sm:table-cell">Total</th>
                    <th className="pb-1 font-medium text-right">Avail</th>
                    <th className="pb-1 font-medium text-right">Sold</th>
                    <th className="pb-1 font-medium text-right">Occ %</th>
                    <th className="pb-1 font-medium text-right">Gross</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {venue.showList.sort((a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)).map((show: any, i: number) => {
                    const isHF = show.occ === 100;
                    const isFF = show.occ >= 60 && show.occ < 100;
                    return (
                      <tr key={i} className="hover:bg-white/[0.03]">
                        <td className="py-1.5 text-neutral-500">{new Date(show.date).toLocaleDateString('en-IN', { day:'numeric', month:'short'})}</td>
                        <td className="py-1.5 text-neutral-300 font-medium">{show.time}</td>
                        <td className="py-1.5 hidden sm:table-cell truncate max-w-[80px]">{show.audi}</td>
                        <td className="py-1.5 text-right hidden sm:table-cell">{show.total}</td>
                        <td className={`py-1.5 text-right font-medium ${isHF ? 'text-green-500' : isFF ? 'text-orange-500' : ''}`}>{show.avail}</td>
                        <td className="py-1.5 text-right text-white">{show.sold}</td>
                        <td className={`py-1.5 text-right font-bold ${isHF ? 'text-green-500' : isFF ? 'text-orange-500' : 'text-neutral-500'}`}>{show.occ.toFixed(1)}%</td>
                        <td className="py-1.5 text-right text-rose-400 font-medium">{formatCurrency(show.gross)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
