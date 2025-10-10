import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from './user';

export const code = pgTable('code', {
  codeId: serial('code_id').primaryKey(),
  userId: integer('user_id').references(() => user.userId).notNull(),
  code: text('code').notNull(),
  dateCreated: timestamp('date_created').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used'),
});
