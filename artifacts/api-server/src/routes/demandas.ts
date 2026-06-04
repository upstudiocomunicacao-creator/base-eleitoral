import { Router } from "express";
import { db, demandasTable, insertDemandaSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/demandas", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(demandasTable).orderBy(demandasTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list demandas");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/demandas", async (req, res): Promise<void> => {
  const parsed = insertDemandaSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [created] = await db.insert(demandasTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create demanda");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/demandas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertDemandaSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [updated] = await db.update(demandasTable).set(parsed.data).where(eq(demandasTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update demanda");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/demandas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(demandasTable).where(eq(demandasTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete demanda");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
