import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const notification = pgTable('notification', {
  notificationId: serial('notification_id').primaryKey(),
  userId: integer('user_id').references(() => user.userId).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  dateCreated: timestamp('date_created', { withTimezone: true }).notNull(),
  dateUpdated: timestamp('date_updated', { withTimezone: true }),
  dateDeleted: timestamp('date_deleted', { withTimezone: true })
});
