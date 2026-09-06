import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function reseedFromJson() {
    const { db } = await import('../src/lib/db');
    const { movies, people, movieCredits } = await import('../src/lib/schema');
    const { eq } = await import('drizzle-orm');

    const JSON_DIR = path.resolve(__dirname, '../data/movies-json');
    const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  🎬 TFIverse FAST RE-SEED from JSON Backups             ║');
    console.log(`║  📁 Found ${files.length} JSON files                              ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    function slugify(text: string) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
    }

    let synced = 0, skipped = 0, errors = 0;
    const startTime = Date.now();
    const CREDITS_TOP_CAST = 15;

    for (const file of files) {
        try {
            const detail = JSON.parse(fs.readFileSync(path.join(JSON_DIR, file), 'utf8'));
            
            if (!detail.id || !detail.title) { skipped++; continue; }

            const slug = `${slugify(detail.title)}-${detail.id}`;
            const imdbId = detail.imdb_id || detail.external_ids?.imdb_id;
            
            const trailer = detail.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
                           detail.videos?.results?.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube');
            const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

            await db.insert(movies).values({
                tmdbId: detail.id,
                imdbId: imdbId,
                title: detail.title,
                originalTitle: detail.original_title,
                slug: slug,
                tagline: detail.tagline,
                overview: detail.overview,
                releaseDate: detail.release_date ? new Date(detail.release_date) : null,
                year: detail.release_date ? new Date(detail.release_date).getFullYear() : null,
                runtime: detail.runtime,
                status: detail.status || 'Released',
                budget: detail.budget,
                revenue: detail.revenue,
                voteAverage: detail.vote_average,
                voteCount: detail.vote_count,
                popularity: detail.popularity,
                posterUrl: detail.poster_path,
                backdropUrl: detail.backdrop_path,
                trailerUrl: trailerUrl,
                metadata: detail
            }).onConflictDoUpdate({
                target: movies.tmdbId,
                set: {
                    title: detail.title,
                    originalTitle: detail.original_title,
                    tagline: detail.tagline,
                    overview: detail.overview,
                    runtime: detail.runtime,
                    popularity: detail.popularity,
                    voteAverage: detail.vote_average,
                    voteCount: detail.vote_count,
                    status: detail.status || 'Released',
                    budget: detail.budget,
                    revenue: detail.revenue,
                    posterUrl: detail.poster_path,
                    backdropUrl: detail.backdrop_path,
                    trailerUrl: trailerUrl,
                    metadata: detail,
                    updatedAt: new Date()
                }
            });

            // Sync Credits
            if (detail.credits) {
                const [movieRecord] = await db.select().from(movies).where(eq(movies.tmdbId, detail.id)).limit(1);
                
                const cast = detail.credits.cast?.slice(0, CREDITS_TOP_CAST) || [];
                const crew = detail.credits.crew?.filter((c: any) => 
                    ['Director', 'Producer', 'Screenplay', 'Writer', 'Original Music Composer', 'Director of Photography', 'Editor'].includes(c.job)
                ) || [];
                
                const combined = [
                    ...cast.map((c: any) => ({ ...c, role_type: 'cast' })),
                    ...crew.map((c: any) => ({ ...c, role_type: 'crew' }))
                ];

                for (const person of combined) {
                    let [personRecord] = await db.select().from(people).where(eq(people.tmdbPersonId, person.id)).limit(1);
                    let personId = personRecord?.id;

                    if (!personRecord) {
                        personId = `stub-${person.id}`;
                        const stubSlug = `${slugify(person.name)}-${person.id}`;
                        await db.insert(people).values({
                            id: personId,
                            name: person.name,
                            slug: stubSlug,
                            tmdbPersonId: person.id,
                            category: 'crew',
                            metadata: { profile_path: person.profile_path }
                        }).onConflictDoNothing();
                    }

                    await db.insert(movieCredits).values({
                        movieId: movieRecord.id,
                        personId: personId!,
                        tmdbPersonId: person.id,
                        roleType: person.role_type,
                        character: person.character || null,
                        job: person.job || null,
                        department: person.department || null,
                        orderIndex: person.order ?? null
                    }).onConflictDoNothing();
                }
            }

            synced++;
            if (synced % 100 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
                console.log(`   ✅ ${synced}/${files.length} movies seeded (${elapsed}s elapsed)`);
            }
        } catch (err: any) {
            errors++;
            if (errors <= 5) console.error(`   ❌ ${file}: ${err.message}`);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log(`║  🏁 RE-SEED COMPLETE                                     ║`);
    console.log(`║  ✅ Synced:  ${String(synced).padEnd(6)} movies                            ║`);
    console.log(`║  ⏭️  Skipped: ${String(skipped).padEnd(6)}                                    ║`);
    console.log(`║  ❌ Errors:  ${String(errors).padEnd(6)}                                    ║`);
    console.log(`║  ⏱️  Time:    ${totalTime} seconds                                 ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    process.exit(0);
}

reseedFromJson().catch(err => { console.error('💀 Fatal:', err); process.exit(1); });
