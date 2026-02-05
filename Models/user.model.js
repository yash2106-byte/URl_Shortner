import { timestamp } from "drizzle-orm/gel-core";
import { pgTable, uuid,varchar,text,timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),

  firstname:varchar('first_name',{length:55}).notNull(),
  lastname:varchar('last_name',{length:55}),

  email: varchar({lenght:255}).notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updateAt: timestamp('updatedAt').$onUpdate(()=>new Date()),
});
