import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";
import { user } from './user';

export const license = pgTable('license', {
  licenseId: serial('license_id').primaryKey(),
  userId: integer('user_id').references(() => user.userId).notNull(),
  licenseImage: text('license_image').notNull(),
  specialization: text('specialization').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  isRejected: boolean('is_rejected').notNull().default(false)
});
