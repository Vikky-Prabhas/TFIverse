import fs from 'fs';
import path from 'path';

const file = '/home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse-data-engine/data/bms_venues_master.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const fixed = data.map((v: any) => ({
    code: v.VenueCode,
    name: v.VenueName,
    city: v.RegionCode
}));

fs.writeFileSync(file, JSON.stringify(fixed, null, 2));
console.log('Fixed bms venues');
