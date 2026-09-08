import { 
  CollectionMomentumContract, 
  TerritoryBreakdownContract, 
  AdvanceBookingPreviewContract, 
  RankingsPreviewContract 
} from './contracts';

// ============================================================================
// UI LAYOUT DEMO DATA
// This data is strictly for reviewing the visual hierarchy of the components.
// It must NOT be used in the production data flow.
// ============================================================================

export const DEMO_MOMENTUM_DATA: CollectionMomentumContract[] = Array.from({ length: 7 }).map((_, i) => ({
  timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
  gross: 50000000 + Math.random() * 150000000,
  dataState: 'REPORTED',
  dataSource: 'DEMO',
}));

export const DEMO_TERRITORY_DATA: TerritoryBreakdownContract[] = [
  { territory: 'NIZAM', gross: 45000000, shows: 1200, occupancy: 85, contributionPercentage: 45, trend: 5.2, venueCount: 320, dataState: 'ESTIMATED', dataSource: 'DEMO', lastUpdatedAt: new Date() },
  { territory: 'CEDED', gross: 20000000, shows: 800, occupancy: 70, contributionPercentage: 20, trend: -2.1, venueCount: 180, dataState: 'ESTIMATED', dataSource: 'DEMO', lastUpdatedAt: new Date() },
  { territory: 'UA', gross: 15000000, shows: 600, occupancy: 75, contributionPercentage: 15, trend: 1.5, venueCount: 150, dataState: 'ESTIMATED', dataSource: 'DEMO', lastUpdatedAt: new Date() },
  { territory: 'EAST', gross: 10000000, shows: 400, occupancy: 65, contributionPercentage: 10, trend: null, venueCount: 100, dataState: 'ESTIMATED', dataSource: 'DEMO', lastUpdatedAt: new Date() },
  { territory: 'WEST', gross: 10000000, shows: 400, occupancy: 60, contributionPercentage: 10, trend: 0.5, venueCount: 90, dataState: 'ESTIMATED', dataSource: 'DEMO', lastUpdatedAt: new Date() },
];

export const DEMO_ADVANCE_DATA: AdvanceBookingPreviewContract[] = [
  { movieId: '1', title: 'Devara: Part 1', posterUrl: '/r8QJkGg6P0qM1rI80K55qB7K56k.jpg', showDate: '2026-09-08', ticketsSold: 25000, grossRevenue: 5000000, showsCount: 300, capacity: 50000, occupancy: 50, bookingVelocity: 24.5, citiesCount: 45, dataState: 'LIVE', lastUpdatedAt: new Date() },
  { movieId: '1', title: 'Devara: Part 1', posterUrl: '/r8QJkGg6P0qM1rI80K55qB7K56k.jpg', showDate: '2026-09-08', ticketsSold: 12000, grossRevenue: 2400000, showsCount: 150, capacity: 25000, occupancy: 48, bookingVelocity: 18.2, citiesCount: 22, dataState: 'LIVE', lastUpdatedAt: new Date() },
];

export const DEMO_RANKINGS_DATA: RankingsPreviewContract[] = [
  {
    category: 'Highest Grossing',
    movies: [
      { rank: 1, movieId: '991', title: 'Baahubali 2', posterUrl: '/2m59Y637T72bX7Oa0F72Yw9pD02.jpg', value: 1800000000, dataState: 'FINAL' },
      { rank: 2, movieId: '992', title: 'RRR', posterUrl: '/nEufeZlyAOLqO2brrs0yeO1PnEN.jpg', value: 1200000000, dataState: 'FINAL' },
      { rank: 3, movieId: '993', title: 'Kalki 2898 AD', posterUrl: '/xJWPZIYAIEHQWEtv0x803EGEQ.jpg', value: 1000000000, dataState: 'FINAL' },
    ]
  },
  {
    category: 'Highest Opening Day',
    movies: [
      { rank: 1, movieId: '992', title: 'RRR', posterUrl: '/nEufeZlyAOLqO2brrs0yeO1PnEN.jpg', value: 220000000, dataState: 'FINAL' },
      { rank: 2, movieId: '991', title: 'Baahubali 2', posterUrl: '/2m59Y637T72bX7Oa0F72Yw9pD02.jpg', value: 210000000, dataState: 'FINAL' },
      { rank: 3, movieId: '994', title: 'Salaar', posterUrl: '/y3Wc1tV1vNidT3cpxD4Xm0E800v.jpg', value: 160000000, dataState: 'FINAL' },
    ]
  }
];
