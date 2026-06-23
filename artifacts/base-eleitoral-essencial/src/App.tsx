import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  FileText,
  Landmark,
  MapIcon,
  Network,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import {
  BaseScope,
  cityRegion,
  getAutomaticArea,
  getMunicipalNeighborhoods,
  municipalTerritories,
  rjCities,
  rjRegions,
} from "./territories";

type Role =
  | "Candidato"
  | "Coordenação Geral"
  | "Coordenação RJ"
  | "Coordenação Maricá"
  | "Coordenação São Gonçalo"
  | "Coordenação Niterói"
  | "Liderança RJ"
  | "Liderança Maricá"
  | "Liderança São Gonçalo"
  | "Liderança Niterói";

type Status = "Ativo" | "Atenção" | "Pendente" | "Inativo";
type Page = "painel" | "cadastros" | "forca" | "mapas" | "relatorios";

type Person = {
  id: string;
  code: string;
  name: string;
  nickname: string;
  createdAt: string;
  phone: string;
  email: string;
  scope: BaseScope;
  city: string;
  neighborhood: string;
  area: string;
  cep: string;
  role: Role;
  parentId: string;
  votesMin: number;
  votesMax: number;
  costMin: number;
  costMax: number;
  extraCost: number;
  status: Status;
  notes: string;
};

const roles: Role[] = [
  "Candidato",
  "Coordenação Geral",
  "Coordenação RJ",
  "Coordenação Maricá",
  "Coordenação São Gonçalo",
  "Coordenação Niterói",
  "Liderança RJ",
  "Liderança Maricá",
  "Liderança São Gonçalo",
  "Liderança Niterói",
];

const statusList: Status[] = ["Ativo", "Atenção", "Pendente", "Inativo"];
const scopes: BaseScope[] = ["RJ", "Maricá", "São Gonçalo", "Niterói"];
const storagePeopleKey = "base-eleitoral-essencial.people";
const storageVersionKey = "base-eleitoral-essencial.version";
const currentDataVersion = "2";

const seedPeople: Person[] = [
  {
    id: "p1",
    code: "CAD-0001",
    name: "Renato Machado",
    nickname: "Renato",
    createdAt: "2026-06-22",
    phone: "(21) 99999-0000",
    email: "campanha@exemplo.com",
    scope: "RJ",
    city: "Rio de Janeiro",
    neighborhood: "Todos",
    area: "Metropolitana",
    cep: "",
    role: "Candidato",
    parentId: "",
    votesMin: 0,
    votesMax: 0,
    costMin: 0,
    costMax: 0,
    extraCost: 0,
    status: "Ativo",
    notes: "Núcleo político da campanha.",
  },
  {
    id: "p2",
    code: "CAD-0002",
    name: "Coordenação Geral",
    nickname: "Geral",
    createdAt: "2026-06-22",
    phone: "",
    email: "",
    scope: "RJ",
    city: "Rio de Janeiro",
    neighborhood: "Todos",
    area: "Metropolitana",
    cep: "",
    role: "Coordenação Geral",
    parentId: "p1",
    votesMin: 0,
    votesMax: 0,
    costMin: 0,
    costMax: 0,
    extraCost: 0,
    status: "Ativo",
    notes: "Comando das coordenações territoriais.",
  },
  {
    id: "p3",
    code: "CAD-0003",
    name: "Marina Costa",
    nickname: "Marina",
    createdAt: "2026-06-22",
    phone: "(21) 98888-1111",
    email: "marina@exemplo.com",
    scope: "Maricá",
    city: "Maricá",
    neighborhood: "Centro",
    area: "Sede / Maricá",
    cep: "",
    role: "Coordenação Maricá",
    parentId: "p2",
    votesMin: 420,
    votesMax: 680,
    costMin: 3500,
    costMax: 5200,
    extraCost: 0,
    status: "Ativo",
    notes: "Base consolidada no centro e entorno.",
  },
  {
    id: "p4",
    code: "CAD-0004",
    name: "João Pereira",
    nickname: "João do Centro",
    createdAt: "2026-06-22",
    phone: "(21) 97777-2222",
    email: "",
    scope: "Maricá",
    city: "Maricá",
    neighborhood: "Centro",
    area: "Sede / Maricá",
    cep: "",
    role: "Liderança Maricá",
    parentId: "p3",
    votesMin: 120,
    votesMax: 210,
    costMin: 900,
    costMax: 1400,
    extraCost: 200,
    status: "Ativo",
    notes: "Boa circulação comunitária.",
  },
  {
    id: "p5",
    code: "CAD-0005",
    name: "Carlos Brito",
    nickname: "Brito",
    createdAt: "2026-06-22",
    phone: "(21) 96666-3333",
    email: "",
    scope: "São Gonçalo",
    city: "São Gonçalo",
    neighborhood: "Alcântara",
    area: "1º Distrito - São Gonçalo / Sede",
    cep: "",
    role: "Coordenação São Gonçalo",
    parentId: "p2",
    votesMin: 260,
    votesMax: 480,
    costMin: 2600,
    costMax: 4200,
    extraCost: 0,
    status: "Atenção",
    notes: "Precisa ampliar lideranças vinculadas.",
  },
  {
    id: "p6",
    code: "CAD-0006",
    name: "Ana Lúcia",
    nickname: "Ana",
    createdAt: "2026-06-22",
    phone: "(21) 95555-4444",
    email: "",
    scope: "Niterói",
    city: "Niterói",
    neighborhood: "Icaraí",
    area: "Praias da Baía",
    cep: "",
    role: "Coordenação Niterói",
    parentId: "p2",
    votesMin: 210,
    votesMax: 360,
    costMin: 2300,
    costMax: 3900,
    extraCost: 300,
    status: "Ativo",
    notes: "Boa entrada em região de classe média.",
  },
  {
    id: "p7",
    code: "CAD-0007",
    name: "Rafael Souza",
    nickname: "Rafa SG",
    createdAt: "2026-06-22",
    phone: "(21) 94444-5555",
    email: "",
    scope: "São Gonçalo",
    city: "São Gonçalo",
    neighborhood: "Jardim Catarina",
    area: "3º Distrito - Monjolos",
    cep: "",
    role: "Liderança São Gonçalo",
    parentId: "p5",
    votesMin: 90,
    votesMax: 180,
    costMin: 700,
    costMax: 1200,
    extraCost: 0,
    status: "Ativo",
    notes: "Liderança comunitária em expansão.",
  },
  {
    id: "p8",
    code: "CAD-0008",
    name: "Patrícia Lima",
    nickname: "Paty",
    createdAt: "2026-06-22",
    phone: "(21) 93333-6666",
    email: "",
    scope: "Niterói",
    city: "Niterói",
    neighborhood: "Fonseca",
    area: "Norte",
    cep: "",
    role: "Liderança Niterói",
    parentId: "p6",
    votesMin: 75,
    votesMax: 130,
    costMin: 650,
    costMax: 1000,
    extraCost: 0,
    status: "Pendente",
    notes: "Precisa validar estimativa mínima.",
  },
  {
    id: "p9",
    code: "CAD-0009",
    name: "Bruno Martins",
    nickname: "Bruno",
    createdAt: "2026-06-22",
    phone: "(21) 92222-7777",
    email: "",
    scope: "RJ",
    city: "Cabo Frio",
    neighborhood: "Todos",
    area: "Baixadas Litorâneas",
    cep: "",
    role: "Coordenação RJ",
    parentId: "p2",
    votesMin: 180,
    votesMax: 320,
    costMin: 1600,
    costMax: 2600,
    extraCost: 0,
    status: "Ativo",
    notes: "Base regional para Baixadas Litorâneas.",
  },
  {
    id: "p10",
    code: "CAD-0010",
    name: "Luciana Reis",
    nickname: "Lu",
    createdAt: "2026-06-22",
    phone: "(21) 91111-8888",
    email: "",
    scope: "RJ",
    city: "Niterói",
    neighborhood: "Todos",
    area: "Metropolitana",
    cep: "",
    role: "Liderança RJ",
    parentId: "p2",
    votesMin: 110,
    votesMax: 190,
    costMin: 800,
    costMax: 1300,
    extraCost: 100,
    status: "Ativo",
    notes: "Apoio metropolitano complementar.",
  },
  {
    id: "p11",
    code: "CAD-0011",
    name: "Sérgio Paiva",
    nickname: "Sérgio",
    createdAt: "2026-06-22",
    phone: "(21) 90000-1111",
    email: "",
    scope: "Maricá",
    city: "Maricá",
    neighborhood: "Itaipuaçu",
    area: "Itaipuaçu",
    cep: "",
    role: "Liderança Maricá",
    parentId: "p3",
    votesMin: 95,
    votesMax: 160,
    costMin: 700,
    costMax: 1150,
    extraCost: 0,
    status: "Ativo",
    notes: "Ponto forte no litoral norte.",
  },
  {
    id: "p12",
    code: "CAD-0012",
    name: "Marta Oliveira",
    nickname: "Marta",
    createdAt: "2026-06-22",
    phone: "(21) 90000-2222",
    email: "",
    scope: "Maricá",
    city: "Maricá",
    neighborhood: "Araçatiba",
    area: "Sede / Maricá",
    cep: "",
    role: "Liderança Maricá",
    parentId: "p3",
    votesMin: 70,
    votesMax: 120,
    costMin: 500,
    costMax: 900,
    extraCost: 0,
    status: "Atenção",
    notes: "Boa capilaridade, mas custo precisa revisão.",
  },
];

const emptyPerson = (index: number): Person => ({
  id: "",
  code: `CAD-${String(index + 1).padStart(4, "0")}`,
  name: "",
  nickname: "",
  createdAt: new Date().toISOString().slice(0, 10),
  phone: "",
  email: "",
  scope: "Maricá",
  city: "Maricá",
  neighborhood: "Centro",
  area: "Sede / Maricá",
  cep: "",
  role: "Liderança Maricá",
  parentId: "",
  votesMin: 0,
  votesMax: 0,
  costMin: 0,
  costMax: 0,
  extraCost: 0,
  status: "Ativo",
  notes: "",
});

function loadPeople() {
  const raw = localStorage.getItem(storagePeopleKey);
  if (!raw) return seedPeople;
  try {
    const parsed = JSON.parse(raw) as Person[];
    if (!Array.isArray(parsed)) return seedPeople;
    if (localStorage.getItem(storageVersionKey) !== currentDataVersion && parsed.length <= 6) {
      localStorage.setItem(storagePeopleKey, JSON.stringify(seedPeople));
      localStorage.setItem(storageVersionKey, currentDataVersion);
      return seedPeople;
    }
    return parsed;
  } catch {
    return seedPeople;
  }
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function percent(value: number) {
  return `${Math.round(value)}%`;
}

function scopeForRole(role: Role): BaseScope {
  if (role.includes("Maricá")) return "Maricá";
  if (role.includes("São Gonçalo")) return "São Gonçalo";
  if (role.includes("Niterói")) return "Niterói";
  return "RJ";
}

function allowedParents(person: Person, people: Person[]) {
  if (person.role === "Candidato") return [];
  const general = people.filter((item) => item.role === "Candidato" || item.role === "Coordenação Geral");
  if (person.role.startsWith("Coordenação")) return general;

  const expectedCoordination = person.role.replace("Liderança", "Coordenação") as Role;
  const sameTerritory = people.filter(
    (item) =>
      item.role === expectedCoordination &&
      item.scope === person.scope &&
      (person.scope === "RJ" ? item.city === person.city || item.city === "Rio de Janeiro" : item.area === person.area),
  );
  return [...general, ...sameTerritory];
}

function descendants(id: string, people: Person[]): Person[] {
  const direct = people.filter((item) => item.parentId === id);
  return [...direct, ...direct.flatMap((item) => descendants(item.id, people))];
}

function buildMetrics(people: Person[]) {
  const active = people.filter((item) => item.status !== "Inativo");
  const votesMin = active.reduce((sum, item) => sum + item.votesMin, 0);
  const votesMax = active.reduce((sum, item) => sum + item.votesMax, 0);
  const costMin = active.reduce((sum, item) => sum + item.costMin, 0);
  const costMax = active.reduce((sum, item) => sum + item.costMax + item.extraCost, 0);
  const territories = new Set(active.map((item) => `${item.scope}:${item.city}:${item.neighborhood}`)).size;
  return {
    records: people.length,
    active: active.length,
    coordinations: active.filter((item) => item.role.startsWith("Coordenação")).length,
    leaders: active.filter((item) => item.role.startsWith("Liderança")).length,
    votesMin,
    votesMax,
    costMin,
    costMax,
    territories,
    attention: active.filter((item) => item.status === "Atenção" || item.status === "Pendente").length,
    costPerVote: votesMin > 0 ? costMax / votesMin : 0,
  };
}

function buildTerritoryRows(people: Person[], scope: BaseScope) {
  const rows = new Map<string, Person[]>();
  people
    .filter((item) => item.scope === scope && item.status !== "Inativo")
    .forEach((item) => {
      const key = scope === "RJ" ? item.city : item.neighborhood;
      rows.set(key, [...(rows.get(key) ?? []), item]);
    });

  return [...rows.entries()]
    .map(([name, items]) => {
      const min = items.reduce((sum, item) => sum + item.votesMin, 0);
      const max = items.reduce((sum, item) => sum + item.votesMax, 0);
      const cost = items.reduce((sum, item) => sum + item.costMax + item.extraCost, 0);
      const coord = items.filter((item) => item.role.startsWith("Coordenação")).length;
      const leaders = items.filter((item) => item.role.startsWith("Liderança")).length;
      return {
        name,
        area: scope === "RJ" ? cityRegion[name] ?? "RJ" : getAutomaticArea(scope, scope, name),
        count: items.length,
        min,
        max,
        cost,
        coord,
        leaders,
        efficiency: min > 0 ? cost / min : 0,
      };
    })
    .sort((a, b) => b.min - a.min);
}

export function App() {
  const [page, setPage] = useState<Page>("painel");
  const [people, setPeople] = useState<Person[]>(loadPeople);
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<BaseScope | "Todos">("Todos");
  const [editing, setEditing] = useState<Person | null>(null);
  const [mapScope, setMapScope] = useState<BaseScope>("Maricá");

  const savePeople = (next: Person[]) => {
    setPeople(next);
    localStorage.setItem(storagePeopleKey, JSON.stringify(next));
    localStorage.setItem(storageVersionKey, currentDataVersion);
  };

  const metrics = useMemo(() => buildMetrics(people), [people]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return people.filter((item) => {
      const byScope = scopeFilter === "Todos" || item.scope === scopeFilter;
      const byQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.nickname.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized) ||
        item.neighborhood.toLowerCase().includes(normalized);
      return byScope && byQuery;
    });
  }, [people, query, scopeFilter]);

  const upsertPerson = (person: Person) => {
    const id = person.id || crypto.randomUUID();
    const area = getAutomaticArea(person.scope, person.city, person.neighborhood);
    const nextPerson = { ...person, id, area };
    const exists = people.some((item) => item.id === id);
    savePeople(exists ? people.map((item) => (item.id === id ? nextPerson : item)) : [...people, nextPerson]);
    setEditing(null);
  };

  const deletePerson = (id: string) => {
    const next = people.filter((item) => item.id !== id).map((item) => (item.parentId === id ? { ...item, parentId: "" } : item));
    savePeople(next);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BE</div>
          <div>
            <strong>Base Eleitoral</strong>
            <span>Essencial</span>
          </div>
        </div>
        <div className="operation-card">
          <span>Operação</span>
          <strong>Enxuta e ativa</strong>
          <div className="bar"><i /></div>
        </div>
        <nav>
          <MenuButton page={page} id="painel" onClick={setPage} icon={<BarChart3 />}>Painel</MenuButton>
          <MenuButton page={page} id="cadastros" onClick={setPage} icon={<Users />}>Cadastros</MenuButton>
          <MenuButton page={page} id="forca" onClick={setPage} icon={<Network />}>Mapa de Força</MenuButton>
          <MenuButton page={page} id="mapas" onClick={setPage} icon={<MapIcon />}>Mapas</MenuButton>
          <MenuButton page={page} id="relatorios" onClick={setPage} icon={<FileText />}>Relatórios</MenuButton>
        </nav>
        <small>Dados locais para MVP. Pronto para evoluir para Supabase.</small>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p>Versão reduzida</p>
            <h1>{pageTitle(page)}</h1>
          </div>
          <button className="primary" onClick={() => setEditing(emptyPerson(people.length))}>
            <Plus size={17} /> Novo cadastro
          </button>
        </header>

        {page === "painel" && <Dashboard people={people} metrics={metrics} />}
        {page === "cadastros" && (
          <Registry
            people={filtered}
            query={query}
            scopeFilter={scopeFilter}
            onQuery={setQuery}
            onScopeFilter={setScopeFilter}
            onEdit={setEditing}
            onDelete={deletePerson}
          />
        )}
        {page === "forca" && <ForceMap people={people} />}
        {page === "mapas" && <Maps people={people} scope={mapScope} onScope={setMapScope} />}
        {page === "relatorios" && <Reports people={people} metrics={metrics} />}
      </main>

      {editing && (
        <PersonModal
          person={editing}
          people={people}
          onClose={() => setEditing(null)}
          onSave={upsertPerson}
        />
      )}
    </div>
  );
}

function MenuButton({
  page,
  id,
  onClick,
  icon,
  children,
}: {
  page: Page;
  id: Page;
  onClick: (page: Page) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button className={page === id ? "active" : ""} onClick={() => onClick(id)}>
      {icon}
      {children}
    </button>
  );
}

function pageTitle(page: Page) {
  const titles: Record<Page, string> = {
    painel: "Painel Executivo",
    cadastros: "Cadastro Territorial",
    forca: "Mapa de Força",
    mapas: "Mapas Estratégicos",
    relatorios: "Relatórios",
  };
  return titles[page];
}

function Dashboard({ people, metrics }: { people: Person[]; metrics: ReturnType<typeof buildMetrics> }) {
  const scopeRows = scopes.map((scope) => {
    const items = people.filter((item) => item.scope === scope);
    return {
      name: scope,
      votos: items.reduce((sum, item) => sum + item.votesMin, 0),
      custo: items.reduce((sum, item) => sum + item.costMax + item.extraCost, 0),
      cadastros: items.length,
    };
  });

  return (
    <section className="page-grid">
      <Metric icon={<Users />} label="Cadastros" value={metrics.records} />
      <Metric icon={<Network />} label="Coordenações" value={metrics.coordinations} />
      <Metric icon={<Landmark />} label="Lideranças" value={metrics.leaders} />
      <Metric icon={<BarChart3 />} label="Votos mín." value={metrics.votesMin.toLocaleString("pt-BR")} />
      <Metric icon={<BarChart3 />} label="Votos máx." value={metrics.votesMax.toLocaleString("pt-BR")} />
      <Metric icon={<CircleDollarSign />} label="Custo teto" value={money(metrics.costMax)} />
      <Metric icon={<MapIcon />} label="Territórios" value={metrics.territories} />
      <Metric icon={<ClipboardList />} label="Atenção" value={metrics.attention} />

      <div className="panel wide">
        <PanelTitle title="Votos mínimos por base" subtitle="Leitura rápida das quatro frentes territoriais" />
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={scopeRows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="votos" radius={[8, 8, 0, 0]}>
              {scopeRows.map((row) => <Cell key={row.name} fill={colorForScope(row.name as BaseScope)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <PanelTitle title="Resumo operacional" subtitle="Força, custo e eficiência" />
        <SummaryLine label="Faixa de votos" value={`${metrics.votesMin} a ${metrics.votesMax}`} />
        <SummaryLine label="Custo mensal mínimo" value={money(metrics.costMin)} />
        <SummaryLine label="Custo mensal teto" value={money(metrics.costMax)} />
        <SummaryLine label="Custo por voto mínimo" value={metrics.costPerVote ? money(metrics.costPerVote) : "-"} />
        <p className="analysis">
          A operação está mais forte onde há coordenação territorial com lideranças vinculadas. O próximo passo é reduzir
          cadastros sem superior hierárquico e manter votos/custos atualizados mês a mês.
        </p>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function Registry({
  people,
  query,
  scopeFilter,
  onQuery,
  onScopeFilter,
  onEdit,
  onDelete,
}: {
  people: Person[];
  query: string;
  scopeFilter: BaseScope | "Todos";
  onQuery: (value: string) => void;
  onScopeFilter: (value: BaseScope | "Todos") => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="stack">
      <div className="filters">
        <label>
          <Search size={16} />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar por nome, cidade ou bairro" />
        </label>
        <select value={scopeFilter} onChange={(event) => onScopeFilter(event.target.value as BaseScope | "Todos")}>
          <option>Todos</option>
          {scopes.map((scope) => <option key={scope}>{scope}</option>)}
        </select>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Papel</th>
              <th>Território</th>
              <th>Votos</th>
              <th>Custo teto</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id}>
                <td>{person.code}</td>
                <td>
                  <strong>{person.name}</strong>
                  <small>{person.nickname || "Sem apelido"}</small>
                </td>
                <td>{person.role}</td>
                <td>
                  <strong>{person.city}</strong>
                  <small>{person.neighborhood} · {person.area}</small>
                </td>
                <td>{person.votesMin} / {person.votesMax}</td>
                <td>{money(person.costMax + person.extraCost)}</td>
                <td><StatusBadge status={person.status} /></td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => onEdit(person)} title="Editar"><Edit3 size={16} /></button>
                    <button onClick={() => onDelete(person.id)} title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ForceMap({ people }: { people: Person[] }) {
  const candidate = people.find((item) => item.role === "Candidato");
  const general = people.filter((item) => item.role === "Coordenação Geral");
  const groups: { title: string; roles: Role[]; color: string }[] = [
    { title: "Coordenação RJ", roles: ["Coordenação RJ"], color: "blue" },
    { title: "Coordenação Maricá", roles: ["Coordenação Maricá"], color: "green" },
    { title: "Coordenação São Gonçalo", roles: ["Coordenação São Gonçalo"], color: "orange" },
    { title: "Coordenação Niterói", roles: ["Coordenação Niterói"], color: "violet" },
  ];

  return (
    <section className="force-panel">
      <FlowCard title={candidate?.name ?? "Candidato"} subtitle="Núcleo da campanha" count={candidate ? 1 : 0} />
      <Connector />
      <div className="flow-row centered">
        {general.map((item) => <FlowCard key={item.id} title={item.name} subtitle="Coordenação Geral" count={descendants(item.id, people).length} />)}
      </div>
      <Connector />
      <div className="flow-row">
        {groups.map((group) => {
          const coordinators = people.filter((item) => group.roles.includes(item.role));
          const leaders = people.filter((item) => item.role === group.title.replace("Coordenação", "Liderança"));
          return (
            <div className={`flow-group ${group.color}`} key={group.title}>
              <FlowCard title={group.title} subtitle="Coordenações territoriais" count={coordinators.length} />
              <div className="mini-list">
                {coordinators.slice(0, 4).map((item) => <span key={item.id}>{item.name}</span>)}
                {coordinators.length === 0 && <span>Sem coordenação cadastrada</span>}
              </div>
              <FlowCard title={group.title.replace("Coordenação", "Lideranças")} subtitle="Bases subordinadas" count={leaders.length} />
            </div>
          );
        })}
      </div>
      <Connector />
      <div className="flow-row centered">
        <FlowCard title="Estimativas mensais" subtitle="Votos mínimo/máximo e custo" count={people.reduce((sum, item) => sum + item.votesMin, 0)} />
        <FlowCard title="Mapas e relatórios" subtitle="RJ, Maricá, São Gonçalo e Niterói" count={4} />
      </div>
    </section>
  );
}

function Maps({ people, scope, onScope }: { people: Person[]; scope: BaseScope; onScope: (scope: BaseScope) => void }) {
  const rows = buildTerritoryRows(people, scope);
  const max = Math.max(...rows.map((row) => row.min), 1);
  const totals = rows.reduce(
    (acc, row) => ({
      records: acc.records + row.count,
      votes: acc.votes + row.min,
      ceiling: acc.ceiling + row.max,
      cost: acc.cost + row.cost,
      coordinations: acc.coordinations + row.coord,
      leaders: acc.leaders + row.leaders,
    }),
    { records: 0, votes: 0, ceiling: 0, cost: 0, coordinations: 0, leaders: 0 },
  );
  const leadingArea = rows[0]?.name ?? "Sem dados";

  return (
    <section className="map-layout">
      <div className="map-tabs">
        {scopes.map((item) => (
          <button className={item === scope ? "active" : ""} key={item} onClick={() => onScope(item)}>{item}</button>
        ))}
      </div>
      <div className="map-stats">
        <Metric icon={<MapIcon />} label="Territórios" value={rows.length} />
        <Metric icon={<Users />} label="Cadastros" value={totals.records} />
        <Metric icon={<Network />} label="Coordenações" value={totals.coordinations} />
        <Metric icon={<Landmark />} label="Lideranças" value={totals.leaders} />
        <Metric icon={<BarChart3 />} label="Votos mín." value={totals.votes.toLocaleString("pt-BR")} />
        <Metric icon={<CircleDollarSign />} label="Custo teto" value={money(totals.cost)} />
      </div>
      <div className="map-card">
        <PanelTitle
          title={`Mapa estratégico - ${scope}`}
          subtitle={scope === "RJ" ? "Análise por cidade e região de governo" : "Análise por bairros e região/distrito"}
        />
        <div className="map-toolbar">
          <span>Camada ativa</span>
          <strong>Força territorial</strong>
          <small>Região forte: {leadingArea}</small>
        </div>
        <div className="strategic-map">
          {rows.length === 0 && <div className="empty">Sem cadastros nesta base territorial.</div>}
          {rows.map((row, index) => (
            <button
              className="map-bubble"
              key={row.name}
              style={{
                width: `${74 + (row.min / max) * 74}px`,
                height: `${74 + (row.min / max) * 74}px`,
                left: `${16 + ((index * 29) % 68)}%`,
                top: `${18 + ((index * 23) % 58)}%`,
                background: colorForScope(scope),
              }}
            >
              <strong>{row.name}</strong>
              <span>{row.min} votos mín.</span>
              <small>{row.area}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="map-side">
        <div className="panel">
          <PanelTitle title="Ranking territorial" subtitle="Onde agir primeiro" />
          {rows.slice(0, 8).map((row, index) => (
            <SummaryLine key={row.name} label={`${index + 1}. ${row.name}`} value={`${row.min} votos · ${money(row.cost)}`} />
          ))}
        </div>
        <div className="panel">
          <PanelTitle title="Leitura rápida" subtitle="Base selecionada" />
          <SummaryLine label="Votos máximos" value={totals.ceiling.toLocaleString("pt-BR")} />
          <SummaryLine label="Custo por voto mín." value={totals.votes ? money(totals.cost / totals.votes) : "-"} />
          <SummaryLine label="Território forte" value={leadingArea} />
        </div>
      </div>
      <div className="panel wide">
        <PanelTitle title="Custo x votos" subtitle="Correlação simples por território" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number, name: string) => name === "cost" ? money(value) : value} />
            <Legend />
            <Bar dataKey="min" name="Votos mínimos" fill="#2563eb" radius={[8, 8, 0, 0]} />
            <Bar dataKey="cost" name="Custo teto" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Reports({ people, metrics }: { people: Person[]; metrics: ReturnType<typeof buildMetrics> }) {
  const reportRows = scopes.flatMap((scope) => buildTerritoryRows(people, scope).slice(0, 5));
  const hierarchy = people
    .filter((item) => item.role.startsWith("Coordenação"))
    .map((item) => {
      const linked = descendants(item.id, people);
      return {
        name: item.name,
        role: item.role,
        linked: linked.length,
        votes: linked.reduce((sum, child) => sum + child.votesMin, item.votesMin),
        cost: linked.reduce((sum, child) => sum + child.costMax + child.extraCost, item.costMax + item.extraCost),
      };
    });

  return (
    <section className="page-grid">
      <div className="panel wide">
        <PanelTitle title="Relatório executivo" subtitle="Resumo pronto para apresentação" />
        <p className="report-text">
          A operação possui {metrics.records} cadastros, {metrics.coordinations} coordenações e {metrics.leaders} lideranças.
          A faixa atual de votos estimados vai de {metrics.votesMin.toLocaleString("pt-BR")} a {metrics.votesMax.toLocaleString("pt-BR")}.
          O custo mensal teto é {money(metrics.costMax)}, com custo mínimo por voto de {metrics.costPerVote ? money(metrics.costPerVote) : "não calculado"}.
        </p>
        <div className="report-actions">
          <button onClick={() => window.print()}><FileText size={16} /> Imprimir / PDF</button>
          <button onClick={() => exportCsv(people)}><Save size={16} /> Exportar CSV</button>
        </div>
      </div>

      <div className="panel">
        <PanelTitle title="Coordenações e subordinados" subtitle="Somatórios por hierarquia" />
        {hierarchy.map((item) => (
          <SummaryLine key={`${item.name}-${item.role}`} label={`${item.name} · ${item.linked} vínculo(s)`} value={`${item.votes} votos · ${money(item.cost)}`} />
        ))}
      </div>

      <div className="panel wide">
        <PanelTitle title="Territórios sensíveis" subtitle="Poucos votos ou custo alto" />
        <table>
          <thead>
            <tr><th>Território</th><th>Área</th><th>Votos mín.</th><th>Custo</th><th>Custo/voto</th></tr>
          </thead>
          <tbody>
            {reportRows.map((row) => (
              <tr key={`${row.area}-${row.name}`}>
                <td>{row.name}</td>
                <td>{row.area}</td>
                <td>{row.min}</td>
                <td>{money(row.cost)}</td>
                <td>{row.efficiency ? money(row.efficiency) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel wide">
        <PanelTitle title="Evolução simulada" subtitle="Modelo para atualização mensal" />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={[
            { month: "Jun", min: metrics.votesMin, max: metrics.votesMax },
            { month: "Jul", min: Math.round(metrics.votesMin * 1.12), max: Math.round(metrics.votesMax * 1.1) },
            { month: "Ago", min: Math.round(metrics.votesMin * 1.24), max: Math.round(metrics.votesMax * 1.2) },
          ]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="min" name="Votos mínimos" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="max" name="Votos máximos" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PersonModal({
  person,
  people,
  onClose,
  onSave,
}: {
  person: Person;
  people: Person[];
  onClose: () => void;
  onSave: (person: Person) => void;
}) {
  const [form, setForm] = useState(person);
  const parentOptions = allowedParents(form, people).filter((item) => item.id !== form.id);
  const cityOptions = form.scope === "RJ" ? rjCities : [form.scope];
  const neighborhoodOptions =
    form.scope === "RJ" ? ["Todos"] : getMunicipalNeighborhoods(form.scope);

  const update = <K extends keyof Person>(key: K, value: Person[K]) => {
    const next = { ...form, [key]: value };
    if (key === "role") {
      next.scope = scopeForRole(value as Role);
      next.city = next.scope === "RJ" ? next.city || "Rio de Janeiro" : next.scope;
      next.neighborhood = next.scope === "RJ" ? "Todos" : getMunicipalNeighborhoods(next.scope)[0] ?? "";
    }
    if (key === "scope") {
      next.city = value === "RJ" ? "Rio de Janeiro" : value as string;
      next.neighborhood = value === "RJ" ? "Todos" : getMunicipalNeighborhoods(value as Exclude<BaseScope, "RJ">)[0] ?? "";
    }
    next.area = getAutomaticArea(next.scope, next.city, next.neighborhood);
    setForm(next);
  };

  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <div>
            <p>Cadastro mínimo</p>
            <h2>{form.id ? "Editar cadastro" : "Novo cadastro"}</h2>
          </div>
          <button onClick={onClose}><X /></button>
        </header>
        <div className="form-grid">
          <Field label="Código interno"><input value={form.code} onChange={(event) => update("code", event.target.value)} /></Field>
          <Field label="Data"><input type="date" value={form.createdAt} onChange={(event) => update("createdAt", event.target.value)} /></Field>
          <Field label="Nome"><input value={form.name} onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Apelido"><input value={form.nickname} onChange={(event) => update("nickname", event.target.value)} /></Field>
          <Field label="Telefone"><input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
          <Field label="E-mail"><input value={form.email} onChange={(event) => update("email", event.target.value)} /></Field>
          <Field label="Função">
            <select value={form.role} onChange={(event) => update("role", event.target.value as Role)}>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </Field>
          <Field label="Base territorial">
            <select value={form.scope} onChange={(event) => update("scope", event.target.value as BaseScope)}>
              {scopes.map((scope) => <option key={scope}>{scope}</option>)}
            </select>
          </Field>
          <Field label="Cidade">
            <select value={form.city} onChange={(event) => update("city", event.target.value)}>
              {cityOptions.map((city) => <option key={city}>{city}</option>)}
            </select>
          </Field>
          <Field label={form.scope === "RJ" ? "Bairro" : "Bairro"}>
            <select value={form.neighborhood} onChange={(event) => update("neighborhood", event.target.value)}>
              {neighborhoodOptions.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
            </select>
          </Field>
          <Field label={form.scope === "Niterói" ? "Região automática" : "Região/Distrito automático"}>
            <input value={form.area} disabled />
          </Field>
          <Field label="CEP"><input value={form.cep} onChange={(event) => update("cep", event.target.value)} /></Field>
          <Field label="Vinculado a">
            <select value={form.parentId} onChange={(event) => update("parentId", event.target.value)}>
              <option value="">Nenhum</option>
              {parentOptions.map((parent) => <option key={parent.id} value={parent.id}>{parent.name} · {parent.role}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => update("status", event.target.value as Status)}>
              {statusList.map((status) => <option key={status}>{status}</option>)}
            </select>
          </Field>
          <Field label="Votos mín."><input type="number" value={form.votesMin} onChange={(event) => update("votesMin", Number(event.target.value))} /></Field>
          <Field label="Votos máx."><input type="number" value={form.votesMax} onChange={(event) => update("votesMax", Number(event.target.value))} /></Field>
          <Field label="Custo/mês mín."><input type="number" value={form.costMin} onChange={(event) => update("costMin", Number(event.target.value))} /></Field>
          <Field label="Custo/mês teto"><input type="number" value={form.costMax} onChange={(event) => update("costMax", Number(event.target.value))} /></Field>
          <Field label="Despesa extra"><input type="number" value={form.extraCost} onChange={(event) => update("extraCost", Number(event.target.value))} /></Field>
          <Field label="Observações" wide><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} /></Field>
        </div>
        <footer>
          <button onClick={onClose}>Cancelar</button>
          <button className="primary" onClick={submit}><Save size={16} /> Salvar cadastro</button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "field wide-field" : "field"}><span>{label}</span>{children}</label>;
}

function FlowCard({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="flow-card">
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <b>{count.toLocaleString("pt-BR")}</b>
    </div>
  );
}

function Connector() {
  return <div className="connector" />;
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="panel-title"><h2>{title}</h2><p>{subtitle}</p></div>;
}

function SummaryLine({ label, value }: { label: string; value: string | number }) {
  return <div className="summary-line"><span>{label}</span><strong>{value}</strong></div>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status ${status.toLowerCase().replace("ç", "c")}`}>{status}</span>;
}

function colorForScope(scope: BaseScope) {
  const colors: Record<BaseScope, string> = {
    RJ: "#2563eb",
    Maricá: "#10b981",
    "São Gonçalo": "#f97316",
    Niterói: "#7c3aed",
  };
  return colors[scope];
}

function exportCsv(people: Person[]) {
  const header = [
    "codigo",
    "nome",
    "apelido",
    "funcao",
    "base",
    "cidade",
    "bairro",
    "regiao_distrito",
    "votos_min",
    "votos_max",
    "custo_min",
    "custo_teto",
    "extra",
    "status",
  ];
  const rows = people.map((item) => [
    item.code,
    item.name,
    item.nickname,
    item.role,
    item.scope,
    item.city,
    item.neighborhood,
    item.area,
    item.votesMin,
    item.votesMax,
    item.costMin,
    item.costMax,
    item.extraCost,
    item.status,
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "base-eleitoral-essencial.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
