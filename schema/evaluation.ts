import { pgTable, serial, integer, timestamp, text } from "drizzle-orm/pg-core";
import { request } from "./request";
import { houseCategory } from "./houseCategory";
import { damageCategory } from "./damageCategory";

export const evaluation = pgTable('evaluation', {
  evaluationId: serial('evaluation_id').primaryKey(),
  requestId: integer('request_id').references(() => request.requestId).notNull(),
  houseCategoryId: integer('house_category_id').references(() => houseCategory.houseCategoryId).notNull(),
  damageCategoryId: integer('damage_category_id').references(() => damageCategory.damageCategoryId).notNull(),
  note: text('note'),
  dateCreated: timestamp('date_created', { withTimezone: true }).notNull(),
  dateUpdated: timestamp('date_updated', { withTimezone: true }),
  dateDeleted: timestamp('date_deleted', { withTimezone: true })
});
 