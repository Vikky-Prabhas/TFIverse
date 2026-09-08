import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../data');
const BMS_MASTER_PATH = path.resolve(__dirname, '../../tfiverse-data-engine/data/bms_venues_master.json');
const DISTRICT_VENUES_PATH = path.resolve(__dirname, '../../bfilmy-research/district_tracking/districtvenues.json');
const OUT_PATH = path.join(DATA_DIR, 'geo_master.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

interface OldVenue {
    name: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    address?: string;
    [key: string]: any;
}

interface BmsVenue {
    VenueCode: string;
    VenueName: string;
    RegionCode: string;
}

interface GeoEntry {
    venueCode: string;
    venueName: string;
    city: string;
    state: string;
    district: string;
    mandal: string;
    pincode: string | null;
    lat: number | null;
    lng: number | null;
    matchSource: string;
}

// India states lookup by common city associations (fallback for unmatched)
const KNOWN_STATES: Record<string, string> = {};

async function fetchPincodeDetails(pincode: string): Promise<{state: string, district: string, mandal: string} | null> {
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            return {
                state: po.State,
                district: po.District,
                mandal: po.Block || po.Division || po.Name
            };
        }
    } catch (e) {
        // Silent fail — move on
    }
    return null;
}

async function buildGeoMaster() {
    console.log('🌍 Building Geo-Master Mapping (V2 — Proper Matching)...');
    console.log('');

    if (!fs.existsSync(BMS_MASTER_PATH)) {
        console.error('❌ bms_venues_master.json not found!');
        return;
    }

    const bmsVenues: BmsVenue[] = JSON.parse(fs.readFileSync(BMS_MASTER_PATH, 'utf-8'));

    let oldVenues: OldVenue[] = [];
    if (fs.existsSync(DISTRICT_VENUES_PATH)) {
        oldVenues = JSON.parse(fs.readFileSync(DISTRICT_VENUES_PATH, 'utf-8'));
        console.log(`📂 Loaded ${oldVenues.length} old Bfilmy venues`);
    }

    // Build city-indexed lookup from old data
    const oldByCity: Record<string, OldVenue[]> = {};
    for (const v of oldVenues) {
        const city = (v.city || '').trim().toLowerCase();
        if (city) {
            if (!oldByCity[city]) oldByCity[city] = [];
            oldByCity[city].push(v);
        }
    }

    // Cache pincode lookups
    const pincodeCache: Record<string, {state: string, district: string, mandal: string} | null> = {};
    // Cache city→state from successful old matches
    const cityStateCache: Record<string, {state: string, pincode: string | null, lat: number | null, lng: number | null}> = {};

    const geoMaster: Record<string, GeoEntry> = {};
    let matchedByName = 0;
    let matchedByCity = 0;
    let matchedByPincode = 0;
    let unmatchedCount = 0;

    for (let i = 0; i < bmsVenues.length; i++) {
        const venue = bmsVenues[i];
        const venueCode = venue.VenueCode;
        const venueName = venue.VenueName;
        const regionCode = (venue.RegionCode || '').trim();
        const regionLower = regionCode.toLowerCase();

        let entry: GeoEntry = {
            venueCode,
            venueName,
            city: regionCode,
            state: 'Unknown',
            district: 'Unknown',
            mandal: 'Unknown',
            pincode: null,
            lat: null,
            lng: null,
            matchSource: 'unmatched'
        };

        // Strategy 1: Match by city + venue name overlap
        const candidates = oldByCity[regionLower] || [];
        if (candidates.length > 0) {
            const vWords = new Set(venueName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2));
            let bestMatch: OldVenue | null = null;
            let bestOverlap = 0;

            for (const c of candidates) {
                const cWords = new Set((c.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2));
                const overlap = [...vWords].filter(w => cWords.has(w)).length;
                if (overlap > bestOverlap) {
                    bestOverlap = overlap;
                    bestMatch = c;
                }
            }

            if (bestMatch && bestOverlap >= 2) {
                // Strong name match
                entry.state = (bestMatch.state || '').trim();
                entry.lat = bestMatch.latitude;
                entry.lng = bestMatch.longitude;
                entry.pincode = bestMatch.pincode;
                entry.matchSource = 'name_match';
                matchedByName++;

                // Use pincode to get district/mandal
                if (entry.pincode && !pincodeCache[entry.pincode]) {
                    pincodeCache[entry.pincode] = await fetchPincodeDetails(entry.pincode);
                    await sleep(200);
                }
                if (entry.pincode && pincodeCache[entry.pincode]) {
                    const pc = pincodeCache[entry.pincode]!;
                    entry.state = pc.state;
                    entry.district = pc.district;
                    entry.mandal = pc.mandal;
                }

                // Cache city→state mapping
                cityStateCache[regionLower] = { state: entry.state, pincode: entry.pincode, lat: entry.lat, lng: entry.lng };
            } else {
                // City matched but no strong name match — use first candidate's state
                const first = candidates[0];
                entry.state = (first.state || '').trim();
                entry.pincode = first.pincode;
                entry.lat = first.latitude;
                entry.lng = first.longitude;
                entry.matchSource = 'city_match';
                matchedByCity++;

                if (entry.pincode && !pincodeCache[entry.pincode]) {
                    pincodeCache[entry.pincode] = await fetchPincodeDetails(entry.pincode);
                    await sleep(200);
                }
                if (entry.pincode && pincodeCache[entry.pincode]) {
                    const pc = pincodeCache[entry.pincode]!;
                    entry.state = pc.state;
                    entry.district = pc.district;
                    entry.mandal = pc.mandal;
                }

                cityStateCache[regionLower] = { state: entry.state, pincode: entry.pincode, lat: entry.lat, lng: entry.lng };
            }
        } else if (cityStateCache[regionLower]) {
            // Strategy 2: Another BMS venue already matched this city
            const cached = cityStateCache[regionLower];
            entry.state = cached.state;
            entry.pincode = cached.pincode;
            entry.lat = cached.lat;
            entry.lng = cached.lng;
            entry.matchSource = 'city_cache';
            matchedByCity++;

            if (entry.pincode && pincodeCache[entry.pincode]) {
                const pc = pincodeCache[entry.pincode]!;
                entry.district = pc.district;
                entry.mandal = pc.mandal;
            }
        } else {
            // Strategy 3: Completely unmatched — city is the RegionCode
            unmatchedCount++;
            entry.matchSource = 'region_only';
        }

        // Normalize state names
        entry.state = normalizeState(entry.state);

        geoMaster[venueCode] = entry;

        // Progress logging
        if ((i + 1) % 500 === 0) {
            console.log(`   📍 Processed ${i + 1}/${bmsVenues.length} venues...`);
        }
    }

    fs.writeFileSync(OUT_PATH, JSON.stringify(geoMaster, null, 2));

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log(`║  ✅ GEO MASTER V2 COMPLETE                               ║`);
    console.log(`║  📊 Total BMS Venues: ${String(bmsVenues.length).padEnd(34)}║`);
    console.log(`║  🔗 Matched by Name:  ${String(matchedByName).padEnd(34)}║`);
    console.log(`║  🏙️  Matched by City:  ${String(matchedByCity).padEnd(34)}║`);
    console.log(`║  📮 Matched by Pincode: ${String(matchedByPincode).padEnd(32)}║`);
    console.log(`║  ❓ Unmatched (region only): ${String(unmatchedCount).padEnd(27)}║`);
    console.log(`║  📡 Pincode API calls: ${String(Object.keys(pincodeCache).length).padEnd(33)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    // Print state distribution
    const stateCounts: Record<string, number> = {};
    for (const v of Object.values(geoMaster)) {
        stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
    }
    console.log('\n📊 State Distribution:');
    const sorted = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
    for (const [state, count] of sorted) {
        console.log(`   ${state}: ${count}`);
    }
}

function normalizeState(state: string): string {
    const s = state.trim().toLowerCase();
    const map: Record<string, string> = {
        'andhra pradesh': 'Andhra Pradesh',
        'andhra-pradesh': 'Andhra Pradesh',
        'telangana': 'Telangana',
        'tamil nadu': 'Tamil Nadu',
        'tamil-nadu': 'Tamil Nadu',
        'karnataka': 'Karnataka',
        'kerala': 'Kerala',
        'kerala ': 'Kerala',
        'maharashtra': 'Maharashtra',
        'gujarat': 'Gujarat',
        'rajasthan': 'Rajasthan',
        'uttar pradesh': 'Uttar Pradesh',
        'uttar-pradesh': 'Uttar Pradesh',
        'madhya pradesh': 'Madhya Pradesh',
        'madhya-pradesh': 'Madhya Pradesh',
        'west bengal': 'West Bengal',
        'west-bengal': 'West Bengal',
        'bihar': 'Bihar',
        'odisha': 'Odisha',
        'punjab': 'Punjab',
        'haryana': 'Haryana',
        'delhi': 'Delhi',
        'new delhi': 'Delhi',
        'nct of delhi': 'Delhi',
        'chhattisgarh': 'Chhattisgarh',
        'chattisgarh': 'Chhattisgarh',
        'jharkhand': 'Jharkhand',
        'assam': 'Assam',
        'goa': 'Goa',
        'himachal pradesh': 'Himachal Pradesh',
        'jammu and kashmir': 'Jammu & Kashmir',
        'uttarakhand': 'Uttarakhand',
        'tripura': 'Tripura',
        'meghalaya': 'Meghalaya',
        'manipur': 'Manipur',
        'nagaland': 'Nagaland',
        'mizoram': 'Mizoram',
        'arunachal pradesh': 'Arunachal Pradesh',
        'sikkim': 'Sikkim',
        'puducherry': 'Puducherry',
        'chandigarh': 'Chandigarh',
        'dadra and nagar haveli': 'Dadra and Nagar Haveli',
        'daman and diu': 'Daman and Diu',
        'unknown': 'Unknown',
    };
    return map[s] || state.trim();
}

buildGeoMaster().catch(console.error);
