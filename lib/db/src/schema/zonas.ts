import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zonasTable = pgTable("zonas_eleitorais", {
  id: serial("id").primaryKey(),
  zona: text("zona").notNull(),
  secao: text("secao"),
  localVotacao: text("local_votacao"),
  endereco: text("endereco"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull().default("RJ"),
  totalEleitores: integer("total_eleitores").notNull().default(0),
  historicoVotacao: text("historico_votacao"),
  metaVotos: integer("meta_votos"),
  votosEstimados: integer("votos_estimados"),
  votosValidados: integer("votos_validados"),
  responsavel: text("responsavel"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertZonaSchema = createInsertSchema(zonasTable).omit({ id: true, createdAt: true });
export type InsertZona = z.infer<typeof insertZonaSchema>;
export type Zona = typeof zonasTable.$inferSelect;
