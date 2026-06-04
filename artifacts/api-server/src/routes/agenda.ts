import { Router } from "express";
import { db, agendaTable, insertEventoSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/agenda", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(agendaTable).orderBy(agendaTable.data);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list agenda");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/agenda", async (req, res): Promise<void> => {
  const parsed = insertEventoSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [created] = await db.insert(agendaTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create evento");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/agenda/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertEventoSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [updated] = await db.update(agendaTable).set(parsed.data).where(eq(agendaTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update evento");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/agenda/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(agendaTable).where(eq(agendaTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete evento");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
