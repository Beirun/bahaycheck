import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const damageCategory = pgTable('damage_category', {
  damageCategoryId: serial('damage_category_id').primaryKey(),
  damageCategoryName: text('damage_category_name').notNull()
});