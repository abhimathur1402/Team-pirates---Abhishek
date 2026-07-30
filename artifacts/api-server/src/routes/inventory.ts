import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, inventoryTable, hospitalsTable, activityLogTable } from "@workspace/db";
import {
  GetHospitalInventoryParams,
  GetHospitalInventoryResponse,
  ListInventoryResponse,
  CreateInventoryItemBody,
  CreateInventoryItemResponse,
  UpdateInventoryItemParams,
  UpdateInventoryItemBody,
  UpdateInventoryItemResponse,
  DeleteInventoryItemParams,
  GetDashboardStatsResponse,
  GetInventoryActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /inventory/activity — must be declared before /inventory/:id
router.get("/inventory/activity", async (_req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityLogTable)
    .orderBy(sql`${activityLogTable.timestamp} DESC`)
    .limit(50);
  res.json(GetInventoryActivityResponse.parse(activity));
});

// GET /hospitals/:id/inventory
router.get("/hospitals/:id/inventory", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetHospitalInventoryParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: inventoryTable.id,
      hospital_id: inventoryTable.hospital_id,
      hospital_name: hospitalsTable.name,
      resource_type: inventoryTable.resource_type,
      quantity: inventoryTable.quantity,
      last_updated: inventoryTable.last_updated,
    })
    .from(inventoryTable)
    .leftJoin(hospitalsTable, eq(inventoryTable.hospital_id, hospitalsTable.id))
    .where(eq(inventoryTable.hospital_id, params.data.id))
    .orderBy(inventoryTable.resource_type);

  res.json(GetHospitalInventoryResponse.parse(rows));
});

// GET /inventory
router.get("/inventory", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: inventoryTable.id,
      hospital_id: inventoryTable.hospital_id,
      hospital_name: hospitalsTable.name,
      resource_type: inventoryTable.resource_type,
      quantity: inventoryTable.quantity,
      last_updated: inventoryTable.last_updated,
    })
    .from(inventoryTable)
    .leftJoin(hospitalsTable, eq(inventoryTable.hospital_id, hospitalsTable.id))
    .orderBy(sql`${inventoryTable.last_updated} DESC`);

  res.json(ListInventoryResponse.parse(rows));
});

// POST /inventory
router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [hospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, parsed.data.hospital_id));

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  const [item] = await db
    .insert(inventoryTable)
    .values({
      hospital_id: parsed.data.hospital_id,
      resource_type: parsed.data.resource_type,
      quantity: parsed.data.quantity,
    })
    .returning();

  // Log activity
  await db.insert(activityLogTable).values({
    hospital_name: hospital.name,
    resource_type: parsed.data.resource_type,
    quantity: parsed.data.quantity,
    action: "created",
  });

  res.status(201).json(CreateInventoryItemResponse.parse({
    ...item,
    hospital_name: hospital.name,
  }));
});

// PATCH /inventory/:id
router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateInventoryItemParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.resource_type !== undefined) updateData.resource_type = parsed.data.resource_type;
  updateData.last_updated = new Date();

  const [item] = await db
    .update(inventoryTable)
    .set(updateData)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }

  // Get hospital name for activity log
  const [hospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, item.hospital_id));

  if (hospital) {
    await db.insert(activityLogTable).values({
      hospital_name: hospital.name,
      resource_type: item.resource_type,
      quantity: item.quantity,
      action: "updated",
    });
  }

  res.json(UpdateInventoryItemResponse.parse({
    ...item,
    hospital_name: hospital?.name ?? null,
  }));
});

// DELETE /inventory/:id
router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteInventoryItemParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(inventoryTable)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }

  // Get hospital name for activity log
  const [hospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, item.hospital_id));

  if (hospital) {
    await db.insert(activityLogTable).values({
      hospital_name: hospital.name,
      resource_type: item.resource_type,
      quantity: item.quantity,
      action: "deleted",
    });
  }

  res.sendStatus(204);
});

export default router;
