import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { role } from './role';

export const user = pgTable('user', {
  userId: serial('user_id').primaryKey(),
  roleId: integer('role_id').references(() => role.roleId).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  userPhone: text('user_phone').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  dateCreated: timestamp('date_created', { withTimezone: true }).notNull(),
  dateUpdated: timestamp('date_updated', { withTimezone: true }),
  dateDeleted: timestamp('date_deleted', { withTimezone: true })
});
