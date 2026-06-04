import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agendaTable = pgTable("agenda", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  tipo: text("tipo").notNull(),
  data: text("data").notNull(),
  horario: text("horario"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade"),
  responsavel: text("responsavel"),
  status: text("status").notNull().default("Agendado"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventoSchema = createInsertSchema(agendaTable).omit({ id: true, createdAt: true });
export type InsertEvento = z.infer<typeof insertEventoSchema>;
export type Evento = typeof agendaTable.$inferSelect;
