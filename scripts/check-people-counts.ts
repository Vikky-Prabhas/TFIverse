import { db } from "../src/lib/db";
import { people } from "../src/lib/schema";
import { sql, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function check() {
  console.log("--- Checking Database 'people' table ---");
  
  const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(people);
  const totalCount = totalCountResult[0].count;
  console.log(`Total rows in 'people' table: ${totalCount}`);

  const categoryBreakdown = await db.select({
    category: people.category,
    count: sql<number>`count(*)`
  }).from(people).groupBy(people.category);

  console.log("\nCategory breakdown in DB:");
  console.table(categoryBreakdown);

  console.log("\n--- Checking JSON files in src/data/ ---");
  const dataDir = path.join(process.cwd(), "src/data");
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
    let grandTotalJson = 0;
    const jsonStats: { file: string; count: number }[] = [];

    for (const file of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
        const count = Array.isArray(content) ? content.length : (content.heroes?.length || content.heroines?.length || content.directors?.length || 0);
        jsonStats.push({ file, count });
        grandTotalJson += count;
      } catch (err) {
        console.error(`Error reading ${file}:`, err);
      }
    }
    console.log(`Found ${files.length} JSON files. Total people entries across JSON files: ${grandTotalJson}`);
    console.table(jsonStats);
  } else {
    console.log("src/data directory not found.");
  }

  process.exit(0);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
