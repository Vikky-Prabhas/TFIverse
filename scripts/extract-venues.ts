import { db } from '../src/lib/db';
import { venues } from '../src/lib/schema';
import fs from 'fs';
import path from 'path';

const RESEARCH_DIR = '/home/pepper-salt/.gemini/antigravity-ide/scratch/bfilmy_research';

async function extractBMSVenues() {
  const allVenues: any[] = [];
  
  for (let i = 1; i <= 8; i++) {
    const filePath = path.join(RESEARCH_DIR, 'assetz', `venues${i}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const [code, info] of Object.entries<any>(data)) {
        let vName = info.VenueName || 'Unknown Venue';
        if (vName.length > 255) vName = vName.substring(0, 255);
        
        let vCity = info.City || 'Unknown';
        if (vCity.length > 100) vCity = vCity.substring(0, 100);
        
        let vState = info.State || 'Unknown';
        if (vState.length > 100) vState = vState.substring(0, 100);

        allVenues.push({
          sourceId: code,
          source: 'BMS',
          name: vName,
          city: vCity,
          state: vState,
          chain: null,
        });
      }
    }
  }
  
  console.log(`Parsed ${allVenues.length} BMS venues.`);
  return allVenues;
}

async function extractPaytmVenues() {
  const allVenues: any[] = [];
  const filePath = path.join(RESEARCH_DIR, 'district_tracking', 'districtvenues.json');
  
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const info of data) {
      let chain = info.chainKey;
      if (chain === 'Justickets' || chain === 'TicketNew' || !chain) {
        chain = null;
      }
      if (chain && chain.length > 100) chain = chain.substring(0, 100);
      
      let vName = info.name || 'Unknown Venue';
      if (vName.length > 255) vName = vName.substring(0, 255);
      
      let vCity = info.city || 'Unknown';
      if (vCity.length > 100) vCity = vCity.substring(0, 100);
      
      let vState = info.state || 'Unknown';
      if (vState.length > 100) vState = vState.substring(0, 100);

      allVenues.push({
        sourceId: String(info.id),
        source: 'PAYTM',
        name: vName,
        city: vCity,
        state: vState,
        chain: chain,
      });
    }
  }
  
  console.log(`Parsed ${allVenues.length} Paytm venues.`);
  return allVenues;
}

async function main() {
  console.log('Starting venue extraction...');
  
  const bmsVenues = await extractBMSVenues();
  const paytmVenues = await extractPaytmVenues();
  
  const totalVenues = [...bmsVenues, ...paytmVenues];
  console.log(`Total venues to insert: ${totalVenues.length}`);
  
  // Chunk inserts to avoid query limits
  const CHUNK_SIZE = 500;
  let inserted = 0;
  
  for (let i = 0; i < totalVenues.length; i += CHUNK_SIZE) {
    const chunk = totalVenues.slice(i, i + CHUNK_SIZE);
    await db.insert(venues).values(chunk).onConflictDoNothing();
    inserted += chunk.length;
    console.log(`Inserted ${inserted} / ${totalVenues.length}`);
  }
  
  console.log('Successfully completed venue extraction!');
  process.exit(0);
}

main().catch(console.error);
