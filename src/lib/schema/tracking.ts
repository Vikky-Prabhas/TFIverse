import { sql } from 'drizzle-orm';
import { pgTable, varchar, integer, timestamp, jsonb, serial, index, real, unique, pgEnum } from 'drizzle-orm/pg-core';
import { movies } from './content';
import { territoryEnum } from './venues';

export const dataStateEnum = pgEnum('data_state_enum', ['LIVE', 'RECENT', 'ESTIMATED', 'REPORTED', 'FINAL', 'UNKNOWN']);

// ══════════════════════════════════════════════════════════
// 1. DAILY AGGREGATES (Mega Header Stats)
// ══════════════════════════════════════════════════════════
export const dailyBoxOffice = pgTable('daily_box_office', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date' }).notNull(), // The tracking day (e.g., Day 1, Day 6)
    
    // Core Metrics
    gross: real('gross').notNull().default(0),
    nett: real('nett').notNull().default(0),
    ticketsSold: integer('tickets_sold').notNull().default(0),
    shows: integer('shows').notNull().default(0),
    occupancy: real('occupancy').notNull().default(0),
    
    // Data Trust
    dataState: dataStateEnum('data_state').default('UNKNOWN').notNull(),
    dataSource: varchar('data_source', { length: 100 }), // e.g. 'TMDB', 'RENTRAK', 'BMS_SCRAPE'
    
    // Status metrics
    ffCount: integer('ff_count').notNull().default(0), // Fast Filling
    hfCount: integer('hf_count').notNull().default(0), // House Full
    
    // Breadth metrics
    venues: integer('venues').notNull().default(0),
    screens: integer('screens').notNull().default(0),
    cities: integer('cities').notNull().default(0),
    states: integer('states').notNull().default(0),
    
    // Derived
    atp: real('atp').notNull().default(0), // Average Ticket Price
    
    // PIC (National Chain) specific
    picGross: real('pic_gross').notNull().default(0),
    picTickets: integer('pic_tickets').notNull().default(0),

    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    movieDateUnique: unique('unique_dbo_movie_date').on(table.movieId, table.date),
    movieIdx: index('idx_dbo_movie').on(table.movieId),
    dateIdx: index('idx_dbo_date').on(table.date),
}));

// ══════════════════════════════════════════════════════════
// 2. REGIONAL BREAKDOWN (State & City Tables)
// ══════════════════════════════════════════════════════════
export const regionalBoxOffice = pgTable('regional_box_office', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date' }).notNull(),
    
    state: varchar('state', { length: 100 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(), // Can be 'ALL' for State-wise summary rows
    
    shows: integer('shows').notNull().default(0),
    ffCount: integer('ff_count').notNull().default(0),
    hfCount: integer('hf_count').notNull().default(0),
    sold: integer('sold').notNull().default(0),
    gross: real('gross').notNull().default(0),
    occupancy: real('occupancy').notNull().default(0),
    atp: real('atp').notNull().default(0),
    
    territory: territoryEnum('territory').default('UNKNOWN').notNull(),
    dataState: dataStateEnum('data_state').default('UNKNOWN').notNull(),
    dataSource: varchar('data_source', { length: 100 }),

    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    movieRegionUnique: unique('unique_rbo_movie_date_region').on(table.movieId, table.date, table.state, table.city),
    movieIdx: index('idx_rbo_movie').on(table.movieId),
}));

// ══════════════════════════════════════════════════════════
// 3. CHAIN BREAKDOWN (PIC & Multiplex Tables)
// ══════════════════════════════════════════════════════════
export const chainBoxOffice = pgTable('chain_box_office', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date' }).notNull(),
    
    chain: varchar('chain', { length: 100 }).notNull(), // 'PVR', 'INOX', 'CINEPOLIS', 'JUSTICKETS', 'PIC TOTAL'
    
    shows: integer('shows').notNull().default(0),
    ffCount: integer('ff_count').notNull().default(0),
    hfCount: integer('hf_count').notNull().default(0),
    sold: integer('sold').notNull().default(0),
    gross: real('gross').notNull().default(0),
    occupancy: real('occupancy').notNull().default(0),
    atp: real('atp').notNull().default(0),
    
    dataState: dataStateEnum('data_state').default('UNKNOWN').notNull(),
    dataSource: varchar('data_source', { length: 100 }),

    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    movieChainUnique: unique('unique_cbo_movie_date_chain').on(table.movieId, table.date, table.chain),
    movieIdx: index('idx_cbo_movie').on(table.movieId),
}));

// ══════════════════════════════════════════════════════════
// 4. LIVE RAW SESSIONS (The Data Engine Source)
// ══════════════════════════════════════════════════════════
export const realtimeSessions = pgTable('realtime_sessions', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    sessionId: varchar('session_id', { length: 100 }).notNull(), // Unique session identifier
    venueName: varchar('venue_name', { length: 255 }).notNull(),
    chainName: varchar('chain_name', { length: 100 }),
    city: varchar('city', { length: 100 }).notNull(),
    mandal: varchar('mandal', { length: 100 }),
    district: varchar('district', { length: 100 }),
    state: varchar('state', { length: 100 }),
    showDate: timestamp('show_date', { mode: 'date' }).notNull(),
    showTime: varchar('show_time', { length: 50 }).notNull(),
    audi: varchar('audi', { length: 100 }),
    
    totalSeats: integer('total_seats').notNull(),
    availableSeats: integer('available_seats').notNull(),
    soldSeats: integer('sold_seats').notNull(),
    grossRevenue: real('gross_revenue').notNull(),
    
    source: varchar('source', { length: 10 }).notNull(), // 'BMS', 'PAYTM'
    lastUpdated: timestamp('last_updated').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    sessionUnique: unique('unique_session').on(table.movieId, table.sessionId),
    movieSessionIdx: index('idx_realtime_movie_session').on(table.movieId),
    cityIdx: index('idx_realtime_city').on(table.city),
    dateIdx: index('idx_realtime_date').on(table.showDate),
}));

// ══════════════════════════════════════════════════════════
// 5. HOURLY TRENDS (For Charts)
// ══════════════════════════════════════════════════════════
export const hourlyTrendingLogs = pgTable('hourly_trending_logs', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').notNull(), // Rounded hour
    soldTickets: integer('sold_tickets').notNull(),
    grossRevenue: real('gross_revenue').notNull(),
    showsCount: integer('shows_count').notNull(),
    averageOccupancy: real('average_occupancy').notNull(),
}, (table) => ({
    movieHourUnique: unique('unique_movie_hour').on(table.movieId, table.timestamp),
    movieHourIdx: index('idx_hourly_trending_movie').on(table.movieId),
}));

// ══════════════════════════════════════════════════════════
// 6. MOVIE FINANCIALS (Verdict Engine Inputs)
// ══════════════════════════════════════════════════════════
// Note: This table stores reliable financial INPUTS only.
// The actual Hit/Flop verdict formula is applied at the business-logic layer.
export const movieFinancials = pgTable('movie_financials', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    
    productionBudget: real('production_budget'),
    preReleaseBusiness: real('pre_release_business'),
    theatricalRights: real('theatrical_rights'),
    theatricalBreakEven: real('theatrical_break_even'),
    
    worldwideGross: real('worldwide_gross'),
    worldwideShare: real('worldwide_share'),
    distributorShare: real('distributor_share'),
    
    financialState: dataStateEnum('financial_state').default('UNKNOWN').notNull(),
    source: varchar('source', { length: 100 }),

    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    movieUnique: unique('unique_movie_financial').on(table.movieId),
}));

// ══════════════════════════════════════════════════════════
// 7. CITY BOOKING SNAPSHOTS (Advance Velocity Engine)
// ══════════════════════════════════════════════════════════
// Granularity: Aggregated at the City + ShowDate level at a specific minute.
export const cityBookingSnapshots = pgTable('city_booking_snapshots', {
    id: serial('id').primaryKey(),
    movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
    
    city: varchar('city', { length: 100 }).notNull(),
    territory: territoryEnum('territory').default('UNKNOWN').notNull(),
    
    showDate: timestamp('show_date', { mode: 'date' }).notNull(), // The future date being booked
    snapshotTimestamp: timestamp('snapshot_timestamp').notNull(), // Exact time the snapshot was taken
    
    ticketsSold: integer('tickets_sold').notNull(),
    grossRevenue: real('gross_revenue').notNull(),
    showsCount: integer('shows_count').notNull(),
    capacity: integer('capacity').notNull(), 
    
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    // Querying "What was the booking for Hyderabad for Day 1 as of 6 hours ago?"
    movieCityDateSnapshotIdx: index('idx_city_adv_booking_query').on(table.movieId, table.city, table.showDate, table.snapshotTimestamp),
    // Ensuring no duplicate snapshots for the exact same city and minute
    snapshotUnique: unique('unique_city_adv_snapshot').on(table.movieId, table.city, table.showDate, table.snapshotTimestamp),
}));
