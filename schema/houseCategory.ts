//safe, needs retrofitting, requires rebuilding

import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const houseCategory = pgTable('house_category', {
  houseCategoryId: serial('house_category_id').primaryKey(),
  houseCategoryName: text('house_category_name').notNull()
});