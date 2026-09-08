import Link from 'next/link';
import { ArrowLeftIcon, Globe, MapPin, PlaneTakeoff } from 'lucide-react';

export const metadata = {
  title: 'Overseas Box Office Tracker | TFIverse',
  description: 'Track Telugu cinema box office collections in USA, UK, Australia, and Gulf.',
};

export default function OverseasBoxOfficePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-white/20 selection:text-white relative overflow-hidden">
      
      <div className="absolute top-24 left-6 md:left-16 z-50">
        <Link href="/box-office" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Box Office
        </Link>
      </div>

      <div className="pt-32 pb-12 max-w-[1600px] mx-auto px-6 md:px-16 relative z-30">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 mb-6">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase">Global Tracking</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter mb-4 text-white">
            Overseas Markets
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl font-light">
            Real-time pre-sales and live tracking for Cinemark, AMC, Regal, and international distributors across USA, UK, Aus, and Gulf.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-16 relative z-30 mb-20">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-10 md:p-16 text-center max-w-4xl mx-auto">
          
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <PlaneTakeoff className="w-8 h-8 text-zinc-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-medium mb-6 tracking-tight text-white">
            Establishing Comscore Link...
          </h2>
          <p className="text-zinc-500 text-sm font-light mb-12 max-w-xl mx-auto leading-relaxed">
            The overseas data engine is currently being wired up. We are building the tracking API to aggregate Fandango, Cinemark, and AMC live sales directly into the TFIverse data lake.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-8">
              <MapPin className="w-5 h-5 text-zinc-600 mb-4" />
              <h3 className="font-medium text-white mb-2 tracking-tight">North America</h3>
              <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Tracking 800+ Cinemark & AMC locations across the US and Canada.</p>
            </div>
            <div className="bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-8">
              <MapPin className="w-5 h-5 text-zinc-600 mb-4" />
              <h3 className="font-medium text-white mb-2 tracking-tight">UK & Europe</h3>
              <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Cineworld, Vue, and independent distributor cinema deep links.</p>
            </div>
            <div className="bg-[#050505] hover:bg-[#0a0a0a] transition-colors p-8">
              <MapPin className="w-5 h-5 text-zinc-600 mb-4" />
              <h3 className="font-medium text-white mb-2 tracking-tight">Aus & Gulf</h3>
              <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Hoyts, Event, and Vox Cinemas direct API integration.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
