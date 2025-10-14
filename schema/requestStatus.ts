import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const requestStatus = pgTable('request_status', {
  requestStatusId: serial('request_status_id').primaryKey(),
  requestStatusName: text('request_status_name').notNull()
});