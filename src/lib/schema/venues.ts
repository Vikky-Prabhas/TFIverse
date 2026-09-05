import { sql } from 'drizzle-orm';
import { pgTable, varchar, timestamp, serial, boolean, index, unique } from 'drizzle-orm/pg-core';

export const venues = pgTable('venues', {
    id: serial('id').primaryKey(),
    sourceId: varchar('source_id', { length: 100 }).notNull(), // e.g., 'HYDF' for BMS, '12345' for Paytm
    source: varchar('source', { length: 10 }).notNull(), // 'BMS' or 'PAYTM'
    name: varchar('name', { length: 255 }).notNull(),
    chain: varchar('chain', { length: 100 }), // e.g., PVR, INOX
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    sourceUnique: unique('unique_venue_source').on(table.sourceId, table.source),
    cityIdx: index('idx_venues_city').on(table.city),
    stateIdx: index('idx_venues_state').on(table.state),
    sourceIdx: index('idx_venues_source').on(table.source),
}));
