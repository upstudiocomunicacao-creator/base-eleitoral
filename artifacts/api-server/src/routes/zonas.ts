import { Router } from "express";
import { db, zonasTable, insertZonaSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/zonas", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(zonasTable).orderBy(zonasTable.zona);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list zonas");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/zonas", async (req, res): Promise<void> => {
  const parsed = insertZonaSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [created] = await db.insert(zonasTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create zona");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/zonas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertZonaSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [updated] = await db.update(zonasTable).set(parsed.data).where(eq(zonasTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update zona");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/zonas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(zonasTable).where(eq(zonasTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete zona");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
