import { Router } from "express";
import { db, liderancasTable, insertLiderancaSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/liderancas", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(liderancasTable).orderBy(liderancasTable.nome);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list liderancas");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/liderancas", async (req, res): Promise<void> => {
  const parsed = insertLiderancaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [created] = await db.insert(liderancasTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create lideranca");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/liderancas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(liderancasTable).where(eq(liderancasTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get lideranca");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/liderancas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertLiderancaSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [updated] = await db.update(liderancasTable).set(parsed.data).where(eq(liderancasTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update lideranca");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/liderancas/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(liderancasTable).where(eq(liderancasTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete lideranca");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
