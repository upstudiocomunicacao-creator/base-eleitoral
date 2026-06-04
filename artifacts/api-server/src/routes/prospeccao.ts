import { Router } from "express";
import { db, prospectosTable, insertProspectoSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const ETAPAS = ["novoContato", "primeiroAtendimento", "simpatizante", "apoiadorConfirmado", "multiplicador", "votoValidado"] as const;

router.get("/prospeccao", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(prospectosTable).orderBy(prospectosTable.nome);
    const pipeline: Record<string, typeof rows> = {
      novoContato: [],
      primeiroAtendimento: [],
      simpatizante: [],
      apoiadorConfirmado: [],
      multiplicador: [],
      votoValidado: [],
    };
    for (const row of rows) {
      if (pipeline[row.etapa]) {
        pipeline[row.etapa].push(row);
      }
    }
    res.json(pipeline);
  } catch (err) {
    req.log.error({ err }, "Failed to list prospeccao");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/prospeccao/:id/status", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { etapa } = req.body;
  if (!ETAPAS.includes(etapa)) {
    res.status(400).json({ error: `Invalid etapa. Must be one of: ${ETAPAS.join(", ")}` });
    return;
  }
  try {
    const [updated] = await db.update(prospectosTable).set({ etapa }).where(eq(prospectosTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update prospecto status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
