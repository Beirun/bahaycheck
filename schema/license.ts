import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { user } from './user';

export const license = pgTable('license', {
  licenseId: serial('license_id').primaryKey(),
  userId: integer('user_id').references(() => user.userId).notNull(),
  licenseImage: text('license_image').notNull(),
});
