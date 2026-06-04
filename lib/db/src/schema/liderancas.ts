import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const liderancasTable = pgTable("liderancas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  apelido: text("apelido"),
  telefone: text("telefone"),
  email: text("email"),
  tipoLideranca: text("tipo_lideranca").notNull(),
  status: text("status").notNull().default("Ativo"),
  cep: text("cep"),
  rua: text("rua"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull().default("RJ"),
  regiaoAtuacao: text("regiao_atuacao"),
  liderancaSuperior: text("lideranca_superior"),
  responsavelInterno: text("responsavel_interno"),
  apoiadoresCadastrados: integer("apoiadores_cadastrados").notNull().default(0),
  apoiadoresEstimadosDiretos: integer("apoiadores_estimados_diretos").notNull().default(0),
  apoiadoresEstimadosIndiretos: integer("apoiadores_estimados_indiretos").notNull().default(0),
  votosDeclarados: integer("votos_declarados").notNull().default(0),
  votosValidados: integer("votos_validados").notNull().default(0),
  grauConfianca: text("grau_confianca").notNull().default("médio"),
  fonteEstimativa: text("fonte_estimativa"),
  comprovacao: text("comprovacao"),
  ultimaAtualizacao: text("ultima_atualizacao"),
  proximaAcao: text("proxima_acao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLiderancaSchema = createInsertSchema(liderancasTable).omit({ id: true, createdAt: true });
export type InsertLideranca = z.infer<typeof insertLiderancaSchema>;
export type Lideranca = typeof liderancasTable.$inferSelect;
