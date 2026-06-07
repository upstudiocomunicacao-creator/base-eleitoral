import {
  BarChart3,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Layers,
  Map,
  MapPin,
  Network,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Leader, LeaderMonthlyMetric } from "@/types/database";
import type { ForceNode } from "./types";

export const forceMapLevels: ForceNode[][] = [
  [
    {
      id: "candidato",
      title: "Candidato",
      subtitle: "Decisão política e leitura final da campanha.",
      icon: Target,
      tone: "slate",
      count: "1",
      countLabel: "núcleo",
      status: "Ativo",
      summary: "Visão consolidada da força territorial, separando o Estado do RJ por cidades e Maricá por bairros.",
      metrics: [
        { label: "Coordenações RJ", value: "4" },
        { label: "Coordenações Maricá", value: "4" },
        { label: "Lideranças", value: "5" },
        { label: "Apoio estimado", value: "6.603", helper: "Número auxiliar para conversão em voto, sem cadastro de pessoas." },
        { label: "Votos mínimos", value: "2.950" },
        { label: "Votos máximos", value: "5.280" },
      ],
      insights: ["Maricá permanece como domicílio eleitoral e base de leitura por bairro.", "O RJ deve ser acompanhado por cidade e região de governo."],
      progress: { label: "Organização da força", value: 78 },
    },
  ],
  [
    {
      id: "coordenacao-geral",
      title: "Coordenação Geral",
      subtitle: "Comando único das coordenações RJ e Maricá.",
      icon: Network,
      tone: "blue",
      count: "1",
      countLabel: "comando",
      status: "Ativo",
      summary: "Camada responsável por acompanhar coordenadores, metas mensais, custo de operação e prioridades de ação.",
      metrics: [
        { label: "Base territorial", value: "RJ + Maricá" },
        { label: "Atualização", value: "Mensal" },
        { label: "Centro de custos", value: "Ativo" },
        { label: "Modelo de dados", value: "Enxuto" },
      ],
      insights: ["A coordenação geral não precisa cadastrar eleitores, apenas força territorial.", "As decisões passam por cidade, bairro, voto estimado e custo."],
      progress: { label: "Governança operacional", value: 82 },
    },
  ],
  [
    {
      id: "coordenacao-rj",
      title: "Coordenação RJ",
      subtitle: "Coordenadores por município do Estado do RJ.",
      icon: Building2,
      tone: "blue",
      count: "92",
      countLabel: "cidades pré-listadas",
      status: "Ativo",
      summary: "Cada coordenador RJ é vinculado a uma cidade. A região de governo é preenchida automaticamente.",
      metrics: [
        { label: "Regiões oficiais", value: "8" },
        { label: "Municípios", value: "92" },
        { label: "Bairro fora de Maricá", value: "Todos" },
        { label: "Mais de um por cidade", value: "Sim" },
      ],
      insights: ["O cadastro por cidade reduz erro e deixa o mapa estadual limpo.", "Mais de um coordenador por cidade permite dividir operação sem mudar a métrica territorial."],
      progress: { label: "Cobertura estadual possível", value: 100 },
    },
    {
      id: "coordenacao-marica",
      title: "Coordenação Maricá",
      subtitle: "Coordenadores por bairro do domicílio eleitoral.",
      icon: MapPin,
      tone: "emerald",
      count: "50",
      countLabel: "bairros pré-listados",
      status: "Ativo",
      summary: "Cada coordenador de Maricá é vinculado a um bairro. O distrito é preenchido automaticamente.",
      metrics: [
        { label: "Distritos", value: "4" },
        { label: "Bairros", value: "50" },
        { label: "Recorte principal", value: "Bairro" },
        { label: "Mais de um por bairro", value: "Sim" },
      ],
      insights: ["Maricá pede leitura mais granular porque é a base eleitoral principal.", "Bairro e distrito viram chave de mapa, gráfico e custo."],
      progress: { label: "Cobertura municipal possível", value: 100 },
    },
  ],
  [
    {
      id: "liderancas-rj",
      title: "Lideranças RJ",
      subtitle: "Lideranças menores por cidade do RJ.",
      icon: Users,
      tone: "cyan",
      count: "cidades",
      countLabel: "recorte",
      status: "Ativo",
      summary: "Lideranças podem ficar subordinadas ou não a uma coordenação RJ. O território principal é a cidade.",
      metrics: [
        { label: "Vínculo à coordenação", value: "Opcional" },
        { label: "Bairro", value: "Todos" },
        { label: "Região", value: "Automática" },
        { label: "Estimativa de votos", value: "Mensal" },
      ],
      insights: ["O modelo evita microcadastro fora de Maricá.", "A análise estadual compara cidades e regiões, não bairros."],
      progress: { label: "Simplicidade do cadastro", value: 86 },
    },
    {
      id: "liderancas-marica",
      title: "Lideranças Maricá",
      subtitle: "Lideranças menores por bairro de Maricá.",
      icon: Users,
      tone: "emerald",
      count: "bairros",
      countLabel: "recorte",
      status: "Ativo",
      summary: "Lideranças de Maricá podem ser vinculadas a uma coordenação de bairro. O território principal é o bairro.",
      metrics: [
        { label: "Vínculo à coordenação", value: "Opcional" },
        { label: "Distrito", value: "Automático" },
        { label: "Apoio estimado", value: "Número" },
        { label: "Estimativa de votos", value: "Mensal" },
      ],
      insights: ["Bairros sem liderança ficam visíveis nos mapas.", "A estimativa de apoio serve apenas para calcular conversão em votos."],
      progress: { label: "Simplicidade do cadastro", value: 88 },
    },
  ],
  [
    {
      id: "estimativas",
      title: "Estimativas de Votos",
      subtitle: "Piso e teto mensais por coordenador ou liderança.",
      icon: TrendingUp,
      tone: "violet",
      count: "min/máx",
      countLabel: "mensal",
      status: "Ativo",
      summary: "Cada registro informa mínimo e máximo de votos esperados no mês. As métricas somam esses valores por cidade, bairro, região e distrito.",
      metrics: [
        { label: "Votos mínimos", value: "Manual" },
        { label: "Votos máximos", value: "Manual" },
        { label: "Apoio estimado", value: "Conversão" },
        { label: "Atualização", value: "Mês a mês" },
      ],
      insights: ["A régua mínimo/máximo deixa a leitura realista.", "A conversão de apoio em votos mostra expectativa contra capacidade."],
      progress: { label: "Métrica central", value: 90 },
    },
    {
      id: "custos",
      title: "Centro de Custos",
      subtitle: "Custo mínimo, teto e adicional eventual.",
      icon: CircleDollarSign,
      tone: "amber",
      count: "R$",
      countLabel: "mensal",
      status: "Ativo",
      summary: "Cada coordenador ou liderança pode ter custo base, custo teto e custo extra. Isso gera custo por voto e custo por território.",
      metrics: [
        { label: "Custo base", value: "Manual" },
        { label: "Custo teto", value: "Manual" },
        { label: "Custo extra", value: "Eventual" },
        { label: "Custo por voto", value: "Calculado" },
      ],
      insights: ["O custo por voto ajuda a comparar eficiência entre territórios.", "Custos extras devem aparecer separados para não distorcer o valor base."],
      progress: { label: "Controle financeiro", value: 84 },
    },
  ],
  [
    {
      id: "mapas",
      title: "Mapas RJ e Maricá",
      subtitle: "RJ por cidade, Maricá por bairro.",
      icon: Map,
      tone: "blue",
      count: "2",
      countLabel: "leituras",
      status: "Preparado",
      summary: "Os mapas usam as listas territoriais oficiais para exibir força, lacunas e prioridades.",
      metrics: [
        { label: "Mapa RJ", value: "Cidades" },
        { label: "Mapa Maricá", value: "Bairros" },
        { label: "Geocodificação", value: "Latitude/longitude" },
        { label: "Mapbox", value: "Preparado" },
      ],
      insights: ["A qualidade do mapa depende de cidade/bairro corretos e coordenadas.", "Região e distrito automáticos reduzem erro de análise."],
      progress: { label: "Pronto para mapa real", value: 74 },
    },
    {
      id: "base-territorial",
      title: "Base Territorial Oficial",
      subtitle: "Listas pré-carregadas e automáticas.",
      icon: Layers,
      tone: "cyan",
      count: "142",
      countLabel: "territórios",
      status: "Ativo",
      summary: "A base territorial traz 92 cidades do RJ e 50 bairros de Maricá, com região ou distrito calculado automaticamente.",
      metrics: [
        { label: "Cidades RJ", value: "92" },
        { label: "Regiões RJ", value: "8" },
        { label: "Bairros Maricá", value: "50" },
        { label: "Distritos Maricá", value: "4" },
      ],
      insights: ["A lista oficial padroniza cadastros e relatórios.", "O campo bairro fica como Todos quando a cidade não é Maricá."],
      progress: { label: "Padronização territorial", value: 100 },
    },
  ],
  [
    {
      id: "analises",
      title: "Análises e Indicadores",
      subtitle: "Correlação entre força, votos e custos.",
      icon: BarChart3,
      tone: "violet",
      count: "KPI",
      countLabel: "operacional",
      status: "Ativo",
      summary: "A análise cruza território, votos mínimos/máximos, apoio estimado e centro de custos.",
      metrics: [
        { label: "Força territorial", value: "Calculada" },
        { label: "Conversão em voto", value: "Calculada" },
        { label: "Custo por voto", value: "Calculado" },
        { label: "Prioridade territorial", value: "Calculada" },
      ],
      insights: ["Os dados mínimos já são suficientes para gerar mapa, ranking e custo por voto.", "A versão menor pode evoluir para um módulo financeiro sem refazer a arquitetura."],
      progress: { label: "Leitura executiva", value: 86 },
    },
    {
      id: "cadastro-minimo",
      title: "Cadastro Mínimo",
      subtitle: "Somente o necessário para operar.",
      icon: ClipboardList,
      tone: "slate",
      count: "12",
      countLabel: "campos-chave",
      status: "Ativo",
      summary: "O cadastro centraliza identidade, tipo, cidade/bairro, vínculo, apoio estimado, votos e custos.",
      metrics: [
        { label: "Nome e telefone", value: "Obrigatórios" },
        { label: "Cidade ou bairro", value: "Lista" },
        { label: "Votos min/máx", value: "Manual" },
        { label: "Custo min/máx", value: "Manual" },
      ],
      insights: ["Quanto menor o cadastro, maior a chance de uso diário.", "Campos livres devem ser exceção, não regra."],
      progress: { label: "Usabilidade operacional", value: 92 },
    },
  ],
];

type RuntimeForceMapData = {
  leaders: Leader[];
  monthlyMetrics: LeaderMonthlyMetric[];
};

export function buildForceMapLevels({ leaders, monthlyMetrics }: RuntimeForceMapData): ForceNode[][] {
  if (!leaders.length) return forceMapLevels;

  const latestMonth = getLatestMonth(monthlyMetrics);
  const monthMetrics = latestMonth ? monthlyMetrics.filter((metric) => metric.month_ref === latestMonth) : [];
  const hasMonthlyMetrics = monthMetrics.length > 0;
  const totalSupporters = hasMonthlyMetrics
    ? sum(monthMetrics, (metric) => metric.estimated_supporters)
    : sum(leaders, getLeaderSupporters);
  const minVotes = hasMonthlyMetrics ? sum(monthMetrics, (metric) => metric.min_votes) : sum(leaders, (leader) => leader.validated_votes ?? 0);
  const maxVotes = hasMonthlyMetrics ? sum(monthMetrics, (metric) => metric.max_votes) : sum(leaders, (leader) => leader.declared_votes ?? 0);
  const baseCost = sum(monthMetrics, (metric) => metric.base_cost);
  const ceilingCost = sum(monthMetrics, (metric) => metric.ceiling_cost);
  const extraCost = sum(monthMetrics, (metric) => metric.extra_cost);
  const totalCost = ceilingCost + extraCost;
  const coordinatorsRJ = leaders.filter((leader) => isCoordinator(leader) && !isMaricaLeader(leader)).length;
  const coordinatorsMarica = leaders.filter((leader) => isCoordinator(leader) && isMaricaLeader(leader)).length;
  const leadersRJ = leaders.filter((leader) => isLeadership(leader) && !isMaricaLeader(leader)).length;
  const leadersMarica = leaders.filter((leader) => isLeadership(leader) && isMaricaLeader(leader)).length;
  const rjCitiesWithAction = uniqueCount(leaders.filter((leader) => !isMaricaLeader(leader)).map((leader) => leader.city));
  const maricaNeighborhoodsWithAction = uniqueCount(leaders.filter(isMaricaLeader).map((leader) => leader.neighborhood));
  const regionsWithAction = uniqueCount(leaders.filter((leader) => !isMaricaLeader(leader)).map((leader) => leader.territory_region));
  const districtsWithAction = uniqueCount(leaders.filter(isMaricaLeader).map((leader) => leader.territory_region));
  const territories = rjCitiesWithAction + maricaNeighborhoodsWithAction;
  const costPerMinVote = minVotes > 0 ? totalCost / minVotes : 0;

  return forceMapLevels.map((level) =>
    level.map((node) => {
      switch (node.id) {
        case "candidato":
          return patchNode(node, {
            metrics: [
              { label: "Coordenações RJ", value: formatNumber(coordinatorsRJ) },
              { label: "Coordenações Maricá", value: formatNumber(coordinatorsMarica) },
              { label: "Lideranças", value: formatNumber(leadersRJ + leadersMarica) },
              { label: "Apoio estimado", value: formatNumber(totalSupporters), helper: "Número auxiliar para conversão em voto, sem cadastro de pessoas." },
              { label: "Votos mínimos", value: formatNumber(minVotes) },
              { label: "Votos máximos", value: formatNumber(maxVotes) },
            ],
            insights: [
              `Base real com ${formatNumber(leaders.length)} cadastros territoriais ativos no Supabase.`,
              latestMonth ? `Leitura mensal baseada no recorte ${formatMonth(latestMonth)}.` : "Sem mês operacional preenchido; usando votos declarados e validados dos cadastros.",
            ],
            progress: { label: "Organização da força", value: clampProgress(territories, 25) },
          });
        case "coordenacao-geral":
          return patchNode(node, {
            count: formatNumber(coordinatorsRJ + coordinatorsMarica),
            countLabel: "coordenações",
            metrics: [
              { label: "Coordenações RJ", value: formatNumber(coordinatorsRJ) },
              { label: "Coordenações Maricá", value: formatNumber(coordinatorsMarica) },
              { label: "Territórios cobertos", value: formatNumber(territories) },
              { label: "Atualização", value: latestMonth ? formatMonth(latestMonth) : "Cadastro base" },
            ],
            progress: { label: "Governança operacional", value: clampProgress(coordinatorsRJ + coordinatorsMarica, 12) },
          });
        case "coordenacao-rj":
          return patchNode(node, {
            count: formatNumber(coordinatorsRJ),
            countLabel: "coordenações RJ",
            metrics: [
              { label: "Municípios com atuação", value: formatNumber(rjCitiesWithAction) },
              { label: "Regiões com atuação", value: formatNumber(regionsWithAction) },
              { label: "Bairro fora de Maricá", value: "Todos" },
              { label: "Mais de um por cidade", value: "Sim" },
            ],
            progress: { label: "Cobertura estadual atual", value: clampProgress(rjCitiesWithAction, 92) },
          });
        case "coordenacao-marica":
          return patchNode(node, {
            count: formatNumber(coordinatorsMarica),
            countLabel: "coordenações Maricá",
            metrics: [
              { label: "Bairros com atuação", value: formatNumber(maricaNeighborhoodsWithAction) },
              { label: "Distritos com atuação", value: formatNumber(districtsWithAction) },
              { label: "Recorte principal", value: "Bairro" },
              { label: "Mais de um por bairro", value: "Sim" },
            ],
            progress: { label: "Cobertura municipal atual", value: clampProgress(maricaNeighborhoodsWithAction, 50) },
          });
        case "liderancas-rj":
          return patchNode(node, {
            count: formatNumber(leadersRJ),
            countLabel: "lideranças RJ",
            metrics: [
              { label: "Cidades atendidas", value: formatNumber(rjCitiesWithAction) },
              { label: "Vínculo à coordenação", value: "Opcional" },
              { label: "Bairro", value: "Todos" },
              { label: "Estimativa de votos", value: latestMonth ? "Mensal" : "Cadastro" },
            ],
            progress: { label: "Base estadual cadastrada", value: clampProgress(leadersRJ, 30) },
          });
        case "liderancas-marica":
          return patchNode(node, {
            count: formatNumber(leadersMarica),
            countLabel: "lideranças Maricá",
            metrics: [
              { label: "Bairros atendidos", value: formatNumber(maricaNeighborhoodsWithAction) },
              { label: "Vínculo à coordenação", value: "Opcional" },
              { label: "Distrito", value: "Automático" },
              { label: "Apoio estimado", value: formatNumber(totalSupporters) },
            ],
            progress: { label: "Base municipal cadastrada", value: clampProgress(leadersMarica, 35) },
          });
        case "estimativas":
          return patchNode(node, {
            count: `${formatNumber(minVotes)} / ${formatNumber(maxVotes)}`,
            countLabel: "votos min/máx",
            metrics: [
              { label: "Votos mínimos", value: formatNumber(minVotes) },
              { label: "Votos máximos", value: formatNumber(maxVotes) },
              { label: "Apoio estimado", value: formatNumber(totalSupporters) },
              { label: "Atualização", value: latestMonth ? formatMonth(latestMonth) : "Sem mês definido" },
            ],
            progress: { label: "Preenchimento mensal", value: clampProgress(monthMetrics.length, leaders.length || 1) },
          });
        case "custos":
          return patchNode(node, {
            count: formatCurrency(totalCost),
            countLabel: "teto + extras",
            metrics: [
              { label: "Custo base", value: formatCurrency(baseCost) },
              { label: "Custo teto", value: formatCurrency(ceilingCost) },
              { label: "Custo extra", value: formatCurrency(extraCost) },
              { label: "Custo por voto mínimo", value: costPerMinVote ? formatCurrency(costPerMinVote) : "Sem votos" },
            ],
            progress: { label: "Centro de custos preenchido", value: clampProgress(monthMetrics.filter((metric) => metric.ceiling_cost > 0 || metric.base_cost > 0).length, leaders.length || 1) },
          });
        case "mapas":
          return patchNode(node, {
            count: formatNumber(territories),
            countLabel: "territórios com dados",
            metrics: [
              { label: "Mapa RJ", value: `${formatNumber(rjCitiesWithAction)} cidades` },
              { label: "Mapa Maricá", value: `${formatNumber(maricaNeighborhoodsWithAction)} bairros` },
              { label: "Geocodificação", value: "Latitude/longitude" },
              { label: "Mapbox", value: "Ativo" },
            ],
            progress: { label: "Dados prontos para mapa", value: clampProgress(leaders.filter((leader) => leader.latitude && leader.longitude).length, leaders.length || 1) },
          });
        case "analises":
          return patchNode(node, {
            count: costPerMinVote ? formatCurrency(costPerMinVote) : "KPI",
            countLabel: "custo/voto mínimo",
            metrics: [
              { label: "Força territorial", value: formatNumber(territories) },
              { label: "Conversão em voto", value: totalSupporters ? `${Math.round((minVotes / totalSupporters) * 100)}%` : "Sem apoio" },
              { label: "Custo por voto", value: costPerMinVote ? formatCurrency(costPerMinVote) : "Sem custo" },
              { label: "Prioridade territorial", value: "Calculada" },
            ],
          });
        case "cadastro-minimo":
          return patchNode(node, {
            count: formatNumber(leaders.length),
            countLabel: "cadastros reais",
            metrics: [
              { label: "Nome e telefone", value: "Obrigatórios" },
              { label: "Cidade ou bairro", value: "Lista" },
              { label: "Votos min/máx", value: hasMonthlyMetrics ? "Preenchidos" : "Pendente" },
              { label: "Custo min/máx", value: hasMonthlyMetrics ? "Preenchidos" : "Pendente" },
            ],
          });
        default:
          return node;
      }
    }),
  );
}

function patchNode(node: ForceNode, patch: Partial<ForceNode>): ForceNode {
  return { ...node, ...patch };
}

function isCoordinator(leader: Leader) {
  return normalize(leader.leader_type).includes("coord");
}

function isLeadership(leader: Leader) {
  return normalize(leader.leader_type).includes("lider");
}

function isMaricaLeader(leader: Leader) {
  return normalize(leader.city) === "marica";
}

function getLeaderSupporters(leader: Leader) {
  return (leader.registered_supporters ?? 0) + (leader.estimated_direct_supporters ?? 0) + (leader.estimated_indirect_supporters ?? 0);
}

function getLatestMonth(metrics: LeaderMonthlyMetric[]) {
  return metrics.map((metric) => metric.month_ref).filter(Boolean).sort((a, b) => b.localeCompare(a))[0] ?? null;
}

function uniqueCount(values: Array<string | null | undefined>) {
  return new Set(values.filter(Boolean)).size;
}

function sum<T>(items: T[], getValue: (item: T) => number | null | undefined) {
  return items.reduce((total, item) => total + Number(getValue(item) ?? 0), 0);
}

function clampProgress(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("pt-BR");
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${month}/${year}`;
}

function normalize(value: string | null | undefined) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
