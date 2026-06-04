import { Router } from "express";
import { db, apoiadoresTable, insertApoiadorSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/apoiadores", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(apoiadoresTable).orderBy(apoiadoresTable.nome);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list apoiadores");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/apoiadores", async (req, res): Promise<void> => {
  const parsed = insertApoiadorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [created] = await db.insert(apoiadoresTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create apoiador");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/apoiadores/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(apoiadoresTable).where(eq(apoiadoresTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get apoiador");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/apoiadores/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertApoiadorSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [updated] = await db.update(apoiadoresTable).set(parsed.data).where(eq(apoiadoresTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update apoiador");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/apoiadores/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(apoiadoresTable).where(eq(apoiadoresTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete apoiador");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
