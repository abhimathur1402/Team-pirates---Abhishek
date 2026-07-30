import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, hospitalsTable } from "@workspace/db";
import {
  CreateHospitalBody,
  CreateHospitalResponse,
  GetHospitalParams,
  GetHospitalResponse,
  UpdateHospitalParams,
  UpdateHospitalBody,
  UpdateHospitalResponse,
  ListHospitalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/hospitals", async (_req, res): Promise<void> => {
  const hospitals = await db
    .select()
    .from(hospitalsTable)
    .orderBy(hospitalsTable.created_at);
  res.json(ListHospitalsResponse.parse(hospitals));
});

router.post("/hospitals", async (req, res): Promise<void> => {
  const parsed = CreateHospitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [hospital] = await db
    .insert(hospitalsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateHospitalResponse.parse(hospital));
});

router.get("/hospitals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetHospitalParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [hospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, params.data.id));

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  res.json(GetHospitalResponse.parse(hospital));
});

router.patch("/hospitals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateHospitalParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateHospitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [hospital] = await db
    .update(hospitalsTable)
    .set(parsed.data)
    .where(eq(hospitalsTable.id, params.data.id))
    .returning();

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  res.json(UpdateHospitalResponse.parse(hospital));
});

export default router;
