import { integer, varchar, pgTable, uuid,timestamp,text } from "drizzle-orm/pg-core"
import { usersTable } from "./schema"

export const urlTable = pgTable('url',{
    id: uuid().primaryKey().defaultRandom(),

    shortCode: varchar('code',{lenght: 10}).notNull().unique(),
    targetUrl: text('target_url').notNull(),

    userId: uuid('user_id').references(()=>usersTable.id).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(()=>new Date()),
})