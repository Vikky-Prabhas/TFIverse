'use client';

import React from 'react';
import { Activity, Ticket, MonitorPlay, MapPin, Building2 } from 'lucide-react';

interface BoxOfficeDashboardProps {
    movieTitle: string;
    daily: any;
    regional: any[];
    chain: any[];
    liveStats: any[];
    topTheaters: any[];
}

export function BoxOfficeDashboard({ movieTitle, daily, regional, chain, liveStats, topTheaters }: BoxOfficeDashboardProps) {
    const formatCurrency = (val: number | null | undefined) => {
        if (!val) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    const formatNumber = (val: number | null | undefined) => {
        if (!val) return '0';
        return val.toLocaleString('en-IN');
    };

    // Aggregate overall live stats
    const totalSold = liveStats.reduce((sum, stat) => sum + Number(stat.total_sold || 0), 0);
    const totalGross = liveStats.reduce((sum, stat) => sum + Number(stat.total_gross || 0), 0);
    const totalShows = liveStats.reduce((sum, stat) => sum + Number(stat.shows || 0), 0);

    return (
        <section className="mt-16 space-y-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-500" />
                    Live Box Office
                </h2>
                <span className="text-[10px] font-bold tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                    REAL-TIME
                </span>
            </div>

            {/* Top Level Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><Ticket className="w-16 h-16 text-blue-500" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Tickets Sold</p>
                    <p className="text-3xl font-black text-white">{formatNumber(totalSold)}</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><Activity className="w-16 h-16 text-green-500" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Gross</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(totalGross)}</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><MonitorPlay className="w-16 h-16 text-purple-500" /></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Shows</p>
                    <p className="text-3xl font-black text-white">{formatNumber(totalShows)}</p>
                </div>
            </div>

            {/* Language / Version Splits */}
            {liveStats.length > 1 && (
                <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Language & Version Splits</p>
                    <div className="space-y-4">
                        {liveStats.sort((a, b) => Number(b.total_gross) - Number(a.total_gross)).map((stat, idx) => {
                            const percentage = totalGross > 0 ? (Number(stat.total_gross) / totalGross) * 100 : 0;
                            
                            // Extract just the "[2D | Hindi]" part if it exists
                            const match = stat.movie_version.match(/\[(.*?)\]/);
                            const versionTag = match ? match[1] : stat.movie_version;
                            
                            return (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-white">{versionTag}</span>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{formatNumber(stat.shows)} Shows</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-white block">{formatCurrency(Number(stat.total_gross))}</span>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{formatNumber(stat.total_sold)} Tickets</span>
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

            {/* Top Theaters Data Table */}
            {topTheaters.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Top Performing Theaters</p>
                        <Building2 className="w-4 h-4 text-zinc-600" />
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    <th className="pb-3 pl-2">Theater</th>
                                    <th className="pb-3">City</th>
                                    <th className="pb-3 text-right">Shows</th>
                                    <th className="pb-3 text-right">Tickets Sold</th>
                                    <th className="pb-3 text-right">Gross</th>
                                    <th className="pb-3 pr-2 text-right">Est. ATP</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {topTheaters.map((theater, idx) => {
                                    const sold = Number(theater.sold || 0);
                                    const gross = Number(theater.gross || 0);
                                    const atp = sold > 0 ? gross / sold : 0;

                                    return (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pl-2 font-bold text-white max-w-[200px] truncate" title={theater.venue_name}>
                                                {theater.venue_name}
                                            </td>
                                            <td className="py-4 text-zinc-400 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {theater.city}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right text-zinc-300">{formatNumber(theater.shows)}</td>
                                            <td className="py-4 text-right font-bold text-blue-400">{formatNumber(sold)}</td>
                                            <td className="py-4 text-right font-black text-white">{formatCurrency(gross)}</td>
                                            <td className="py-4 pr-2 text-right text-zinc-500 font-medium">
                                                ₹{atp.toFixed(0)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
        </section>
    );
}
