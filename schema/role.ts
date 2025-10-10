import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const role = pgTable('role', {
  roleId: serial('role_id').primaryKey(),
  roleName: text('role_name').notNull()
});