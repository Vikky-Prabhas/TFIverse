import { DataState } from './contracts';

/**
 * Calculates occupancy percentage based on trustworthy ticket and capacity data.
 * Returns null if capacity is 0, or if data is missing.
 */
export function calculateOccupancy(ticketsSold: number | null | undefined, capacity: number | null | undefined): number | null {
  if (ticketsSold == null || capacity == null || capacity <= 0) {
    return null;
  }
  // Cap at 100% just in case of slight data ingestion anomalies
  const occupancy = (ticketsSold / capacity) * 100;
  return Math.min(Math.max(occupancy, 0), 100);
}

/**
 * Calculates trend percentage.
 * Returns null if previous value is 0 or null, to avoid Infinity/misleading data.
 */
export function calculateTrend(currentValue: number | null | undefined, previousValue: number | null | undefined): number | null {
  if (currentValue == null || previousValue == null || previousValue === 0) {
    return null;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Calculates booking velocity (growth percentage) between two snapshots.
 * Returns null if insufficient snapshots exist or if previous is 0.
 */
export function calculateBookingVelocity(currentTickets: number | null, previousTickets: number | null): number | null {
  return calculateTrend(currentTickets, previousTickets);
}

/**
 * Safely parses the raw database data state into our contract DataState.
 * Prevents unknown states from polluting the UI.
 */
export function normalizeDataState(rawState: string | null | undefined): DataState {
  if (!rawState) return 'UNKNOWN';
  const validStates: DataState[] = ['LIVE', 'RECENT', 'ESTIMATED', 'REPORTED', 'FINAL', 'UNKNOWN'];
  const state = rawState.toUpperCase() as DataState;
  return validStates.includes(state) ? state : 'UNKNOWN';
}

/**
 * Safely calculates percentage contribution of a territory.
 */
export function calculateContribution(regional: number, total: number): number | null {
  if (total <= 0) return null;
  return Number(((regional / total) * 100).toFixed(1));
}

export type Territory = 'NIZAM' | 'CEDED' | 'UA' | 'EAST' | 'WEST' | 'GUNTUR' | 'KRISHNA' | 'NELLORE' | 'KARNATAKA' | 'TAMIL_NADU' | 'KERALA' | 'NORTH_INDIA' | 'OVERSEAS' | 'UNKNOWN';

export function mapCityToTerritory(city: string | null, state: string | null): Territory {
  if (!city && !state) return 'UNKNOWN';

  const normalizedCity = city?.trim().toLowerCase() || '';
  const normalizedState = state?.trim().toLowerCase() || '';

  // 1. Nizam (Telangana)
  if (normalizedState === 'telangana') {
    return 'NIZAM';
  }

  // 2. Andhra Pradesh Territories
  if (normalizedState === 'andhra pradesh' || normalizedState === 'ap') {
    // CEDED (Rayalaseema)
    const cededCities = ['kurnool', 'kadapa', 'anantapur', 'chittoor', 'tirupati', 'proddatur', 'nandyal', 'adoni', 'dharmavaram', 'madanapalle', 'hindupur', 'gunthakal', 'rayachoti', 'puttaparthi'];
    if (cededCities.includes(normalizedCity)) return 'CEDED';

    // UA (Uttarandhra)
    const uaCities = ['visakhapatnam', 'vizag', 'srikakulam', 'vizianagaram', 'anakapalle', 'gajuwaka'];
    if (uaCities.includes(normalizedCity)) return 'UA';

    // EAST (East Godavari)
    const eastCities = ['rajahmundry', 'kakinada', 'amalapuram', 'mandapeta', 'tuni', 'pitapuram', 'samalkot'];
    if (eastCities.includes(normalizedCity)) return 'EAST';

    // WEST (West Godavari)
    const westCities = ['eluru', 'bhimavaram', 'tadepalligudem', 'palakollu', 'narasapuram', 'tanuku'];
    if (westCities.includes(normalizedCity)) return 'WEST';

    // KRISHNA
    const krishnaCities = ['vijayawada', 'machilipatnam', 'gudivada', 'nuzvid', 'vuyyuru'];
    if (krishnaCities.includes(normalizedCity)) return 'KRISHNA';

    // GUNTUR
    const gunturCities = ['guntur', 'tenali', 'narasaraopet', 'chilakaluripet', 'mangalagiri', 'bapatla', 'repalle', 'sattenapalle', 'chebrolu', 'yerragondapalem'];
    if (gunturCities.includes(normalizedCity)) return 'GUNTUR';

    // NELLORE (Nellore district only, strictly mapping Prakasam/Ongole to UNKNOWN to avoid guessing)
    const nelloreCities = ['nellore', 'kavali', 'gudur', 'venkatagiri']; 
    if (nelloreCities.includes(normalizedCity)) return 'NELLORE';

    // If in AP but city unknown or unmapped
    return 'UNKNOWN'; 
  }

  // 3. Other specific states
  if (normalizedState.includes('karnataka')) return 'KARNATAKA';
  if (normalizedState.includes('tamil nadu')) return 'TAMIL_NADU';
  if (normalizedState.includes('kerala')) return 'KERALA';

  const northIndianStates = [
    'maharashtra', 'gujarat', 'bihar', 'uttar pradesh', 'delhi', 'west bengal', 'odisha', 'rajasthan', 'madhya pradesh',
    'punjab', 'haryana', 'chhattisgarh', 'jharkhand', 'assam', 'goa', 'chandigarh', 'uttarakhand', 'himachal'
  ];
  if (northIndianStates.some(s => normalizedState.includes(s))) {
    return 'NORTH_INDIA';
  }

  // 4. Overseas
  const overseasKeywords = ['usa', 'uk', 'uae', 'australia', 'canada', 'germany'];
  if (overseasKeywords.some(s => normalizedState.includes(s) || normalizedCity.includes(s))) {
    return 'OVERSEAS';
  }

  return 'UNKNOWN';
}
