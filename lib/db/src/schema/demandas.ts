import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demandasTable = pgTable("demandas", {
  id: serial("id").primaryKey(),
  pessoaVinculada: text("pessoa_vinculada"),
  bairro: text("bairro").notNull(),
  tipoDemanda: text("tipo_demanda").notNull(),
  prioridade: text("prioridade").notNull().default("Média"),
  status: text("status").notNull().default("Aberta"),
  responsavel: text("responsavel"),
  observacoes: text("observacoes"),
  dataRetorno: text("data_retorno"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDemandaSchema = createInsertSchema(demandasTable).omit({ id: true, createdAt: true });
export type InsertDemanda = z.infer<typeof insertDemandaSchema>;
export type Demanda = typeof demandasTable.$inferSelect;
