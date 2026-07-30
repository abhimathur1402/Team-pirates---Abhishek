import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, hospitalsTable, inventoryTable } from "@workspace/db";
import { GetDashboardStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [hospitalStats] = await db
    .select({
      total_hospitals: sql<number>`count(*)::int`,
      active_hospitals: sql<number>`sum(case when ${hospitalsTable.is_active} then 1 else 0 end)::int`,
    })
    .from(hospitalsTable);

  const icuRow = await db
    .select({ total: sql<number>`coalesce(sum(${inventoryTable.quantity}), 0)::int` })
    .from(inventoryTable)
    .where(eq(inventoryTable.resource_type, "ICU"));

  const bedRow = await db
    .select({ total: sql<number>`coalesce(sum(${inventoryTable.quantity}), 0)::int` })
    .from(inventoryTable)
    .where(eq(inventoryTable.resource_type, "GENERAL_BED"));

  const bloodRows = await db
    .select({ total: sql<number>`coalesce(sum(${inventoryTable.quantity}), 0)::int` })
    .from(inventoryTable)
    .where(
      sql`${inventoryTable.resource_type}::text LIKE 'BLOOD%'`
    );

  const inventoryByType = await db
    .select({
      resource_type: inventoryTable.resource_type,
      total_quantity: sql<number>`coalesce(sum(${inventoryTable.quantity}), 0)::int`,
      hospital_count: sql<number>`count(distinct ${inventoryTable.hospital_id})::int`,
    })
    .from(inventoryTable)
    .groupBy(inventoryTable.resource_type)
    .orderBy(inventoryTable.resource_type);

  // Low stock: items with quantity < 3
  const [lowStockRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(inventoryTable)
    .where(sql`${inventoryTable.quantity} < 3`);

  const stats = {
    total_hospitals: hospitalStats?.total_hospitals ?? 0,
    active_hospitals: hospitalStats?.active_hospitals ?? 0,
    total_icu_beds: icuRow[0]?.total ?? 0,
    total_general_beds: bedRow[0]?.total ?? 0,
    total_blood_units: bloodRows[0]?.total ?? 0,
    inventory_by_type: inventoryByType,
    low_stock_alerts: lowStockRow?.count ?? 0,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
