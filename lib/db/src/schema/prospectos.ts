import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prospectosTable = pgTable("prospectos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade"),
  etapa: text("etapa").notNull().default("novoContato"),
  responsavel: text("responsavel"),
  dataContato: text("data_contato"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProspectoSchema = createInsertSchema(prospectosTable).omit({ id: true, createdAt: true });
export type InsertProspecto = z.infer<typeof insertProspectoSchema>;
export type Prospecto = typeof prospectosTable.$inferSelect;
