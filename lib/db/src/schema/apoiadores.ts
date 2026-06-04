import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const apoiadoresTable = pgTable("apoiadores", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  cep: text("cep"),
  rua: text("rua"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull().default("RJ"),
  liderancaVinculada: text("lideranca_vinculada"),
  tipoPessoa: text("tipo_pessoa").notNull(),
  statusPolitico: text("status_politico").notNull(),
  nivelConfianca: text("nivel_confianca").notNull().default("médio"),
  nivelPrecisaoGeografica: text("nivel_precisao_geografica"),
  observacoes: text("observacoes"),
  dataUltimoContato: text("data_ultimo_contato"),
  proximaAcao: text("proxima_acao"),
  responsavelContato: text("responsavel_contato"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApoiadorSchema = createInsertSchema(apoiadoresTable).omit({ id: true, createdAt: true });
export type InsertApoiador = z.infer<typeof insertApoiadorSchema>;
export type Apoiador = typeof apoiadoresTable.$inferSelect;
