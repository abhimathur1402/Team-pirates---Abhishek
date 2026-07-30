import { pgTable, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hospitalsTable } from "./hospitals";

export const resourceTypeEnum = pgEnum("resource_type", [
  "ICU",
  "GENERAL_BED",
  "BLOOD_A_POS",
  "BLOOD_A_NEG",
  "BLOOD_B_POS",
  "BLOOD_B_NEG",
  "BLOOD_AB_POS",
  "BLOOD_AB_NEG",
  "BLOOD_O_POS",
  "BLOOD_O_NEG",
]);

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  hospital_id: integer("hospital_id")
    .notNull()
    .references(() => hospitalsTable.id, { onDelete: "cascade" }),
  resource_type: resourceTypeEnum("resource_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  last_updated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({
  id: true,
  last_updated: true,
});
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventoryTable.$inferSelect;
