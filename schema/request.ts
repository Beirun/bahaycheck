import { pgTable, serial, integer, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const request = pgTable('request', {
  requestId: serial('request_id').primaryKey(),
  userId: integer('user_id').references(() => user.userId).notNull(),
  requestImage: text('request_image').notNull(),
  requestDetails: text('request_details'),
  requestStatus: text('request_status').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  dateCreated: timestamp('date_created', { withTimezone: true }).notNull(),
  dateUpdated: timestamp('date_updated', { withTimezone: true }),
  dateDeleted: timestamp('date_deleted', { withTimezone: true })
});
