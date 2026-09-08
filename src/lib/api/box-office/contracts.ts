export type DataState = 'LIVE' | 'RECENT' | 'ESTIMATED' | 'REPORTED' | 'FINAL' | 'UNKNOWN';

// ─── Section 2: Today's Pulse ───
export interface TodayPulseContract {
  totalGross: number | null;
  totalShows: number | null;
  totalTicketsSold: number | null;
  movieCount: number | null;
  topMovie: string | null;
  avgOccupancy: number | null;
  housefullShows: number | null;
  fastFillingShows: number | null;
  activeVenues: number | null;
  lastUpdatedAt: Date | null;
  dataState: DataState;
  dataSource: string | null;
}

// ─── Section 3: Top Movies Leaderboard ───
export interface TopMovieContract {
  rank: number;
  movieId: string;
  slug: string;
  title: string;
  language: string | null;
  format: string | null;
  posterUrl: string | null;
  todayGross: number | null;
  totalGross: number | null;
  occupancy: number | null;
  shows: number | null;
  ticketsSold: number | null;
  totalSeats: number | null;
  housefullCount: number | null;
  fastFillingCount: number | null;
  trend: number | null;
  dataState: DataState;
  dataSource: string | null;
  lastUpdatedAt: Date | null;
}

// ─── Section 4: Ticket Category X-Ray ───
export interface TicketCategory {
  name: string;
  price: number;
  total: number;
  sold: number;
  available: number;
}

export interface TicketCategoryAggregation {
  movieTitle: string;
  categories: {
    name: string;
    avgPrice: number;
    totalSeats: number;
    soldSeats: number;
    occupancy: number;
  }[];
  avgTicketPrice: number;
}

// ─── Section 5: Collection Momentum ───
export interface CollectionMomentumContract {
  timestamp: Date;
  gross: number | null;
  dataState: DataState;
  dataSource: string | null;
}

// ─── Section 6: Territory Breakdown ───
export interface TerritoryBreakdownContract {
  territory: string;
  gross: number | null;
  shows: number | null;
  occupancy: number | null;
  contributionPercentage: number | null;
  trend: number | null;
  venueCount: number | null;
  dataState: DataState;
  dataSource: string | null;
  lastUpdatedAt: Date | null;
}

// ─── Section 7: Occupancy Heatmap ───
export interface HotVenueContract {
  venueId: string;
  venueName: string;
  city: string;
  state: string;
  movieTitle: string;
  occupancy: number;
  soldSeats: number;
  totalSeats: number;
  status: 'HOUSEFULL' | 'FAST_FILLING' | 'NORMAL';
}

// ─── Section 8: Advance Booking ───
export interface AdvanceBookingPreviewContract {
  movieId: string;
  slug: string;
  title: string;
  posterUrl: string | null;
  showDate: string;
  ticketsSold: number | null;
  grossRevenue: number | null;
  showsCount: number | null;
  capacity: number | null;
  occupancy: number | null;
  bookingVelocity: number | null;
  citiesCount: number | null;
  dataState: DataState;
  lastUpdatedAt: Date | null;
}

// ─── Section 9: Rankings ───
export interface RankingsPreviewContract {
  category: string;
  movies: {
    rank: number;
    movieId: string;
    title: string;
    posterUrl: string | null;
    value: number | null;
    dataState: DataState;
  }[];
}

// ─── Section 10: Currently Running Movies Grid ───
export interface RunningMovieContract {
  movieId: string;
  slug: string;
  title: string;
  language: string | null;
  posterUrl: string | null;
  todayGross: number;
  occupancy: number | null;
  shows: number;
}
