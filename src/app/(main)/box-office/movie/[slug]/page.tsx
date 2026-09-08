import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import BoxOfficeDashboard from '@/components/box-office/BoxOfficeDashboard';
import { getMovieDetails } from '@/app/actions/movies';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const movie = await getMovieDetails(slug);
    if (!movie) return { title: 'Movie Not Found | TFIverse' };
    
    return {
        title: `${movie.title} Box Office Tracker | TFIverse`,
        description: `Live box office tracking and granular analytics for ${movie.title}`,
    };
}

export default async function DedicatedBoxOfficePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // We just fetch movie details to get the title for the header
    const movie = await getMovieDetails(slug);

    if (!movie) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 max-w-7xl mx-auto pt-24 pb-32">
            
            {/* Header */}
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <Link 
                    href="/box-office" 
                    className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-neutral-500 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Global Hub
                </Link>
                
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1">
                            {movie.title}
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C1FF00]">
                            Live Data Engine Tracker
                        </p>
                    </div>
                </div>
            </div>

            {/* The Beast Dashboard */}
            <BoxOfficeDashboard movieSlug={slug} />
            
        </div>
    );
}
