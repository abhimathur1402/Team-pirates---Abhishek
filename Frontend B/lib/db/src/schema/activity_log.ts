import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actionTypeEnum = pgEnum("action_type", [
  "created",
  "updated",
  "deleted",
]);

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  hospital_name: text("hospital_name").notNull(),
  resource_type: text("resource_type").notNull(),
  quantity: integer("quantity").notNull(),
  action: actionTypeEnum("action").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({
  id: true,
  timestamp: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;
