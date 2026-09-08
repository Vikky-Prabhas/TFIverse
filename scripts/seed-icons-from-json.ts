import 'dotenv/config';
import { db } from '../src/lib/db';
import { people } from '../src/lib/schema';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Mapping from directory folder names in public/data to singular DB categories
const FOLDER_TO_DB_CATEGORY: Record<string, string> = {
  "heroes": "hero",
  "heroines": "heroine",
  "directors": "director",
  "music-directors": "music-director",
  "villains": "villain",
  "comedians": "comedian",
  "character-artists": "character-artist",
  "singers": "singer",
  "producers": "producer",
  "cinematographers": "cinematographer",
  "editors": "editor",
  "lyricists": "lyricist",
  "choreographers": "choreographer",
  "stunt-directors": "stunt-director",
  "art-directors": "art-director",
  "costume-designers": "costume-designer",
  "line-producers": "line-producer",
  "vfx-supervisors": "vfx-supervisor",
  "pros": "pro",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
}

async function seedIcons() {
  console.log("🚀 Starting Seeding of Icons from JSON files into PostgreSQL DB...");

  let totalSeeded = 0;
  let totalUpdated = 0;

  // 1. Seed from src/data/heroes.json
  const heroesJsonPath = path.join(process.cwd(), "src/data/heroes.json");
  if (fs.existsSync(heroesJsonPath)) {
    console.log("\n--- Processing src/data/heroes.json ---");
    const heroesData = JSON.parse(fs.readFileSync(heroesJsonPath, "utf-8"));
    if (Array.isArray(heroesData)) {
      for (const hero of heroesData) {
        const slug = hero.slug || slugify(hero.name);
        const subcategory = hero.category || hero.subcategory || "Superstar";
        const personId = `hero-${slug}`;

        // Check if person exists in DB by slug or tmdbPersonId
        const existing = await db.query.people.findFirst({
          where: eq(people.slug, slug),
        });

        if (existing) {
          await db.update(people).set({
            category: "hero",
            subcategory: subcategory,
            metadata: {
              ...(existing.metadata as object || {}),
              ...hero,
            },
            updatedAt: new Date(),
          }).where(eq(people.id, existing.id));
          totalUpdated++;
          console.log(`  ✅ Updated hero in DB: ${hero.name} (${slug})`);
        } else {
          await db.insert(people).values({
            id: personId,
            name: hero.name,
            slug: slug,
            category: "hero",
            subcategory: subcategory,
            metadata: hero,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).onConflictDoUpdate({
            target: people.id,
            set: {
              category: "hero",
              subcategory: subcategory,
              metadata: hero,
              updatedAt: new Date(),
            }
          });
          totalSeeded++;
          console.log(`  ✨ Inserted new hero: ${hero.name} (${slug})`);
        }
      }
    }
  }

  // 2. Recursively scan public/data/
  const publicDataDir = path.join(process.cwd(), "public/data");
  if (fs.existsSync(publicDataDir)) {
    console.log("\n--- Processing public/data/ directory tree ---");

    function getAllJsonFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllJsonFiles(fullPath));
        } else if (file.endsWith('.json')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const jsonFiles = getAllJsonFiles(publicDataDir);
    console.log(`Found ${jsonFiles.length} profile JSON files in public/data/`);

    for (const filePath of jsonFiles) {
      const relativePath = path.relative(publicDataDir, filePath);
      const parts = relativePath.split(path.sep); // e.g. ["heroes", "superstars", "prabhas.json"] or ["editors", "a-sreekar-prasad.json"]

      const folderCategory = parts[0];
      const dbCategory = FOLDER_TO_DB_CATEGORY[folderCategory] || folderCategory;

      let subcategory = "General";
      if (parts.length > 2) {
        // e.g. superstars, legends, rising-stars, comedy-kings
        subcategory = parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      try {
        const rawContent = fs.readFileSync(filePath, "utf-8");
        const profile = JSON.parse(rawContent);

        const name = profile.name || profile.personalInfo?.name || profile.title || path.basename(filePath, '.json');
        const slug = profile.slug || slugify(name);
        const personId = `${dbCategory}-${slug}`;

        // Find existing person in DB
        const existing = await db.query.people.findFirst({
          where: eq(people.slug, slug),
        });

        if (existing) {
          await db.update(people).set({
            category: dbCategory,
            subcategory: subcategory,
            metadata: {
              ...(existing.metadata as object || {}),
              ...profile,
            },
            updatedAt: new Date(),
          }).where(eq(people.id, existing.id));
          totalUpdated++;
          console.log(`  ✅ Updated ${dbCategory}: ${name} (${slug}) [Sub: ${subcategory}]`);
        } else {
          await db.insert(people).values({
            id: personId,
            name: name,
            slug: slug,
            category: dbCategory,
            subcategory: subcategory,
            metadata: profile,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).onConflictDoUpdate({
            target: people.id,
            set: {
              category: dbCategory,
              subcategory: subcategory,
              metadata: profile,
              updatedAt: new Date(),
            }
          });
          totalSeeded++;
          console.log(`  ✨ Inserted ${dbCategory}: ${name} (${slug}) [Sub: ${subcategory}]`);
        }
      } catch (err: any) {
        console.error(`  ❌ Error processing file ${filePath}:`, err.message);
      }
    }
  }

  console.log("\n==========================================");
  console.log(`🎉 SEEDING COMPLETE!`);
  console.log(`Total New Profiles Inserted: ${totalSeeded}`);
  console.log(`Total Existing DB Rows Updated: ${totalUpdated}`);
  console.log("==========================================");

  process.exit(0);
}

seedIcons().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
