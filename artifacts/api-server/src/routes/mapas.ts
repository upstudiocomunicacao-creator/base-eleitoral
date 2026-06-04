import { Router } from "express";

const router = Router();

router.get("/mapas/rj", async (req, res): Promise<void> => {
  const municipios = [
    { nome: "Maricá", comAtuacao: true, liderancas: 24, apoiadores: 1240, votosDeclarados: 3200, votosValidados: 2100, ranking: 1 },
    { nome: "Niterói", comAtuacao: true, liderancas: 8, apoiadores: 320, votosDeclarados: 850, votosValidados: 540, ranking: 2 },
    { nome: "São Gonçalo", comAtuacao: true, liderancas: 6, apoiadores: 280, votosDeclarados: 720, votosValidados: 420, ranking: 3 },
    { nome: "Rio Bonito", comAtuacao: true, liderancas: 4, apoiadores: 180, votosDeclarados: 420, votosValidados: 260, ranking: 4 },
    { nome: "Saquarema", comAtuacao: true, liderancas: 3, apoiadores: 130, votosDeclarados: 310, votosValidados: 190, ranking: 5 },
    { nome: "Araruama", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
    { nome: "Cabo Frio", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
    { nome: "Itaboraí", comAtuacao: true, liderancas: 2, apoiadores: 90, votosDeclarados: 210, votosValidados: 120, ranking: 6 },
    { nome: "Tanguá", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
    { nome: "Guapimirim", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
    { nome: "Nova Iguaçu", comAtuacao: true, liderancas: 2, apoiadores: 75, votosDeclarados: 180, votosValidados: 90, ranking: 7 },
    { nome: "Magé", comAtuacao: false, liderancas: 0, apoiadores: 0, votosDeclarados: 0, votosValidados: 0, ranking: null },
  ];
  res.json(municipios);
});

router.get("/mapas/marica", async (req, res): Promise<void> => {
  const bairros = [
    { nome: "Centro", liderancas: 6, apoiadores: 600, votosDeclarados: 820, votosValidados: 420, cobertura: 5.0, prioridade: "Manter" },
    { nome: "Itaipuaçu", liderancas: 3, apoiadores: 350, votosDeclarados: 310, votosValidados: 180, cobertura: 1.25, prioridade: "Alta" },
    { nome: "Inoã", liderancas: 2, apoiadores: 220, votosDeclarados: 210, votosValidados: 130, cobertura: 1.22, prioridade: "Alta" },
    { nome: "São José do Imbassaí", liderancas: 4, apoiadores: 500, votosDeclarados: 580, votosValidados: 350, cobertura: 5.0, prioridade: "Expandir" },
    { nome: "Araçatiba", liderancas: 2, apoiadores: 150, votosDeclarados: 180, votosValidados: 95, cobertura: 2.8, prioridade: "Alta" },
    { nome: "Flamengo", liderancas: 1, apoiadores: 80, votosDeclarados: 90, votosValidados: 45, cobertura: 1.5, prioridade: "Alta" },
    { nome: "Mumbuca", liderancas: 2, apoiadores: 120, votosDeclarados: 140, votosValidados: 75, cobertura: 2.1, prioridade: "Média" },
    { nome: "Itapeba", liderancas: 1, apoiadores: 95, votosDeclarados: 110, votosValidados: 55, cobertura: 1.8, prioridade: "Média" },
    { nome: "Parque Nanci", liderancas: 1, apoiadores: 70, votosDeclarados: 80, votosValidados: 38, cobertura: 1.4, prioridade: "Alta" },
    { nome: "Barra de Maricá", liderancas: 2, apoiadores: 130, votosDeclarados: 155, votosValidados: 82, cobertura: 2.3, prioridade: "Média" },
    { nome: "Jacaroá", liderancas: 1, apoiadores: 60, votosDeclarados: 70, votosValidados: 32, cobertura: 1.2, prioridade: "Alta" },
    { nome: "Cordeirinho", liderancas: 1, apoiadores: 85, votosDeclarados: 95, votosValidados: 48, cobertura: 1.7, prioridade: "Média" },
    { nome: "Jaconé", liderancas: 1, apoiadores: 65, votosDeclarados: 75, votosValidados: 35, cobertura: 1.3, prioridade: "Alta" },
    { nome: "Caju", liderancas: 1, apoiadores: 50, votosDeclarados: 58, votosValidados: 28, cobertura: 1.1, prioridade: "Alta" },
    { nome: "Espraiado", liderancas: 1, apoiadores: 55, votosDeclarados: 63, votosValidados: 30, cobertura: 1.15, prioridade: "Alta" },
    { nome: "Guaratiba", liderancas: 0, apoiadores: 30, votosDeclarados: 35, votosValidados: 15, cobertura: 0.8, prioridade: "Alta" },
    { nome: "Bosque Fundo", liderancas: 1, apoiadores: 45, votosDeclarados: 52, votosValidados: 24, cobertura: 1.0, prioridade: "Alta" },
    { nome: "Santa Paula", liderancas: 1, apoiadores: 75, votosDeclarados: 85, votosValidados: 42, cobertura: 1.6, prioridade: "Média" },
    { nome: "Jardim Atlântico", liderancas: 2, apoiadores: 110, votosDeclarados: 128, votosValidados: 68, cobertura: 2.0, prioridade: "Média" },
    { nome: "Recanto", liderancas: 0, apoiadores: 25, votosDeclarados: 30, votosValidados: 12, cobertura: 0.7, prioridade: "Alta" },
    { nome: "Barroco", liderancas: 1, apoiadores: 55, votosDeclarados: 63, votosValidados: 30, cobertura: 1.15, prioridade: "Média" },
  ];
  res.json(bairros);
});

router.get("/mapas/comparativo", async (req, res): Promise<void> => {
  const comparativo = [
    { bairro: "Centro", eleitores: 12000, apoiadoresCadastrados: 600, votosValidados: 420, cobertura: 5.0, meta: 600, distanciaMeta: 180, prioridade: "Manter" },
    { bairro: "Itaipuaçu", eleitores: 28000, apoiadoresCadastrados: 350, votosValidados: 180, cobertura: 1.25, meta: 1400, distanciaMeta: 1220, prioridade: "Alta" },
    { bairro: "Inoã", eleitores: 18000, apoiadoresCadastrados: 220, votosValidados: 130, cobertura: 1.22, meta: 900, distanciaMeta: 770, prioridade: "Alta" },
    { bairro: "São José do Imbassaí", eleitores: 10000, apoiadoresCadastrados: 500, votosValidados: 350, cobertura: 5.0, meta: 500, distanciaMeta: 150, prioridade: "Expandir" },
    { bairro: "Araçatiba", eleitores: 8000, apoiadoresCadastrados: 150, votosValidados: 95, cobertura: 2.8, meta: 400, distanciaMeta: 305, prioridade: "Alta" },
    { bairro: "Mumbuca", eleitores: 7000, apoiadoresCadastrados: 120, votosValidados: 75, cobertura: 2.1, meta: 350, distanciaMeta: 275, prioridade: "Média" },
    { bairro: "Jardim Atlântico", eleitores: 8500, apoiadoresCadastrados: 110, votosValidados: 68, cobertura: 2.0, meta: 425, distanciaMeta: 357, prioridade: "Média" },
    { bairro: "Barra de Maricá", eleitores: 6500, apoiadoresCadastrados: 130, votosValidados: 82, cobertura: 2.3, meta: 325, distanciaMeta: 243, prioridade: "Média" },
    { bairro: "Itapeba", eleitores: 6000, apoiadoresCadastrados: 95, votosValidados: 55, cobertura: 1.8, meta: 300, distanciaMeta: 245, prioridade: "Média" },
    { bairro: "Parque Nanci", eleitores: 5500, apoiadoresCadastrados: 70, votosValidados: 38, cobertura: 1.4, meta: 275, distanciaMeta: 237, prioridade: "Alta" },
    { bairro: "Flamengo", eleitores: 5200, apoiadoresCadastrados: 80, votosValidados: 45, cobertura: 1.5, meta: 260, distanciaMeta: 215, prioridade: "Alta" },
    { bairro: "Jacaroá", eleitores: 4800, apoiadoresCadastrados: 60, votosValidados: 32, cobertura: 1.2, meta: 240, distanciaMeta: 208, prioridade: "Alta" },
    { bairro: "Cordeirinho", eleitores: 5000, apoiadoresCadastrados: 85, votosValidados: 48, cobertura: 1.7, meta: 250, distanciaMeta: 202, prioridade: "Média" },
    { bairro: "Santa Paula", eleitores: 4600, apoiadoresCadastrados: 75, votosValidados: 42, cobertura: 1.6, meta: 230, distanciaMeta: 188, prioridade: "Média" },
    { bairro: "Jaconé", eleitores: 4300, apoiadoresCadastrados: 65, votosValidados: 35, cobertura: 1.3, meta: 215, distanciaMeta: 180, prioridade: "Alta" },
    { bairro: "Espraiado", eleitores: 4100, apoiadoresCadastrados: 55, votosValidados: 30, cobertura: 1.15, meta: 205, distanciaMeta: 175, prioridade: "Alta" },
    { bairro: "Caju", eleitores: 3800, apoiadoresCadastrados: 50, votosValidados: 28, cobertura: 1.1, meta: 190, distanciaMeta: 162, prioridade: "Alta" },
    { bairro: "Bosque Fundo", eleitores: 3500, apoiadoresCadastrados: 45, votosValidados: 24, cobertura: 1.0, meta: 175, distanciaMeta: 151, prioridade: "Alta" },
    { bairro: "Barroco", eleitores: 3200, apoiadoresCadastrados: 55, votosValidados: 30, cobertura: 1.15, meta: 160, distanciaMeta: 130, prioridade: "Média" },
    { bairro: "Guaratiba", eleitores: 2800, apoiadoresCadastrados: 30, votosValidados: 15, cobertura: 0.8, meta: 140, distanciaMeta: 125, prioridade: "Alta" },
    { bairro: "Recanto", eleitores: 2500, apoiadoresCadastrados: 25, votosValidados: 12, cobertura: 0.7, meta: 125, distanciaMeta: 113, prioridade: "Alta" },
  ];
  res.json(comparativo);
});

export default router;
