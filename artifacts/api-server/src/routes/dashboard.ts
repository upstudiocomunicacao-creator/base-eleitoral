import { Router } from "express";
import { db } from "@workspace/db";
import { liderancasTable, apoiadoresTable, prospectosTable, zonasTable } from "@workspace/db";
import { sql, count } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    const [liderancas] = await db.select({ count: count() }).from(liderancasTable);
    const [apoiadores] = await db.select({ count: count() }).from(apoiadoresTable);
    const [zonas] = await db.select({ count: count() }).from(zonasTable);

    const liderancaStats = await db
      .select({
        votosDeclarados: sql<number>`COALESCE(SUM(${liderancasTable.votosDeclarados}), 0)::int`,
        votosValidados: sql<number>`COALESCE(SUM(${liderancasTable.votosValidados}), 0)::int`,
        apoiadoresEstimados: sql<number>`COALESCE(SUM(${liderancasTable.apoiadoresEstimadosDiretos} + ${liderancasTable.apoiadoresEstimadosIndiretos}), 0)::int`,
      })
      .from(liderancasTable);

    const bairrosResult = await db
      .select({ bairro: liderancasTable.bairro })
      .from(liderancasTable)
      .groupBy(liderancasTable.bairro);

    const municipiosResult = await db
      .select({ cidade: liderancasTable.cidade })
      .from(liderancasTable)
      .groupBy(liderancasTable.cidade);

    res.json({
      totalLiderancas: liderancas.count,
      totalApoiadores: apoiadores.count,
      apoiadoresEstimados: liderancaStats[0]?.apoiadoresEstimados ?? 0,
      votosDeclarados: liderancaStats[0]?.votosDeclarados ?? 0,
      votosValidados: liderancaStats[0]?.votosValidados ?? 0,
      indiceConfianca: 7.4,
      municipiosAtuacao: municipiosResult.length,
      bairrosCobertos: bairrosResult.length,
      zonasEleitorais: zonas.count,
      regioesPrioritarias: 5,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/evolucao", async (req, res): Promise<void> => {
  const evolucao = [
    { semana: "Sem 1", cadastros: 45, liderancas: 3, apoiadores: 42 },
    { semana: "Sem 2", cadastros: 78, liderancas: 5, apoiadores: 73 },
    { semana: "Sem 3", cadastros: 62, liderancas: 4, apoiadores: 58 },
    { semana: "Sem 4", cadastros: 95, liderancas: 7, apoiadores: 88 },
    { semana: "Sem 5", cadastros: 110, liderancas: 8, apoiadores: 102 },
    { semana: "Sem 6", cadastros: 133, liderancas: 9, apoiadores: 124 },
    { semana: "Sem 7", cadastros: 147, liderancas: 11, apoiadores: 136 },
    { semana: "Sem 8", cadastros: 189, liderancas: 14, apoiadores: 175 },
  ];
  res.json(evolucao);
});

router.get("/dashboard/ranking-liderancas", async (req, res): Promise<void> => {
  try {
    const ranking = await db
      .select({
        nome: liderancasTable.nome,
        valor: liderancasTable.votosValidados,
        secundario: liderancasTable.votosDeclarados,
      })
      .from(liderancasTable)
      .orderBy(sql`${liderancasTable.votosValidados} DESC`)
      .limit(10);

    res.json(ranking);
  } catch (err) {
    req.log.error({ err }, "Failed to get ranking liderancas");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/ranking-bairros", async (req, res): Promise<void> => {
  try {
    const ranking = await db
      .select({
        nome: liderancasTable.bairro,
        valor: sql<number>`SUM(${liderancasTable.apoiadoresCadastrados})::int`,
        secundario: sql<number>`SUM(${liderancasTable.votosValidados})::int`,
      })
      .from(liderancasTable)
      .groupBy(liderancasTable.bairro)
      .orderBy(sql`SUM(${liderancasTable.apoiadoresCadastrados}) DESC`)
      .limit(10);

    res.json(ranking);
  } catch (err) {
    req.log.error({ err }, "Failed to get ranking bairros");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
