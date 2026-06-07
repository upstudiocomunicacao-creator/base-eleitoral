import { FormEvent, MouseEventHandler, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Edit,
  Eye,
  FileSpreadsheet,
  Globe2,
  KeyRound,
  Landmark,
  LockKeyhole,
  Map,
  MapPin,
  Palette,
  PlusCircle,
  Save,
  ShieldCheck,
  Target,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/StatusPill";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SensitiveText } from "@/components/auth/SensitiveText";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { inviteCampaignUser } from "@/services/inviteUsers";
import { listUserProfiles } from "@/services/userProfiles";
import { getRoleLabel } from "@/lib/permissions";
import type { UserProfile } from "@/types/database";

type UserStatus = "Ativo" | "Pendente" | "Bloqueado" | "Inativo";
type ProfileStatus = "Ativo" | "Restrito" | "Rascunho";
type IntegrationStatus = "Planejado" | "Em análise" | "Futuro";
type AuditStatus = "Sucesso" | "Alerta" | "Bloqueado";

type SystemUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile: string;
  region: string;
  city: string;
  neighborhood: string;
  linkedLeader: string;
  status: UserStatus;
  lastAccess: string;
  createdAt: string;
  notes: string;
};

type AccessProfile = {
  name: string;
  description: string;
  users: number;
  level: string;
  status: ProfileStatus;
};

const modules = ["Dashboard Geral", "Modo Operacional", "Mapa de Força", "Lideranças", "Mapa RJ", "Mapa Maricá", "Comparativo Eleitoral", "Relatórios", "Importação", "Geocodificação", "Diagnóstico", "Configurações"];
const actions = ["Visualizar", "Criar", "Editar", "Excluir", "Exportar", "Importar", "Ver dados sensíveis"];
const neighborhoods = ["Centro", "Araçatiba", "Flamengo", "Mumbuca", "Itapeba", "Parque Nanci", "Barra de Maricá", "Jacaroá", "São José do Imbassaí", "Cordeirinho", "Jaconé", "Caju", "Espraiado", "Guaratiba", "Inoã", "Bosque Fundo", "Santa Paula", "Itaipuaçu", "Jardim Atlântico", "Recanto", "Barroco"];

const accessProfiles: AccessProfile[] = [
  { name: "Administrador", description: "Acesso total ao sistema, usuários, permissões e configurações críticas.", users: 2, level: "Total", status: "Ativo" },
  { name: "Coordenação Geral", description: "Dashboards, relatórios, mapas, lideranças, custos, importação e análise territorial.", users: 4, level: "Estratégico", status: "Ativo" },
  { name: "Coordenador Regional", description: "Acesso aos dados da região vinculada e indicadores territoriais.", users: 6, level: "Regional", status: "Ativo" },
  { name: "Operador de Campo", description: "Atualiza cadastros territoriais, geocodificação e dados mensais autorizados.", users: 12, level: "Operacional", status: "Ativo" },
  { name: "Liderança", description: "Visualiza seu território, metas e estimativas vinculadas.", users: 28, level: "Restrito", status: "Restrito" },
  { name: "Visualizador", description: "Leitura de dashboards e relatórios autorizados.", users: 5, level: "Leitura", status: "Ativo" },
];

const initialUsers: SystemUser[] = [
  user(1, "Eduardo Silva", "eduardo@campanha.local", "(21) 99999-1001", "Administrador", "Coordenação", "Maricá", "Centro", "Ativo", "Hoje, 09:12"),
  user(2, "Mariana Costa", "mariana@campanha.local", "(21) 99999-1002", "Coordenação Geral", "Região Central", "Maricá", "Centro", "Ativo", "Hoje, 08:44"),
  user(3, "Cláudia Menezes", "claudia@campanha.local", "(21) 99999-1003", "Coordenador Regional", "Litoral Norte", "Maricá", "Itaipuaçu", "Ativo", "Ontem, 18:20"),
  user(4, "Rafael Almeida", "rafael@campanha.local", "(21) 99999-1004", "Operador de Campo", "Eixo Rodoviário", "Maricá", "Inoã", "Ativo", "Ontem, 14:02"),
  user(5, "João Batista", "joao@campanha.local", "(21) 99999-1005", "Liderança", "Litoral Norte", "Maricá", "Jardim Atlântico", "Pendente", "Nunca"),
  user(6, "Ana Paula", "ana@campanha.local", "(21) 99999-1006", "Visualizador", "Interior", "Maricá", "Barroco", "Bloqueado", "31/05/2026"),
];

const auditLogs = [
  ["05/06/2026 09:12", "Eduardo Silva", "Exportou relatério", "Relatórios", "Semanal Executivo", "Exportação", "Desktop ? 127.0.0.1", "Sucesso"],
  ["05/06/2026 08:44", "Mariana Costa", "Criou liderança", "Lideranças", "Centro", "Criação", "Notebook ? 10.0.0.22", "Sucesso"],
  ["04/06/2026 18:21", "Cláudia Menezes", "Editou apoio estimado", "Modo Operacional", "Itaipuaçu", "Edição", "Mobile ? 10.0.0.31", "Sucesso"],
  ["04/06/2026 15:10", "Rafael Almeida", "Atualizou custo mensal", "Modo Operacional", "Niterói", "Edição", "Mobile ? 10.0.0.41", "Sucesso"],
  ["04/06/2026 11:05", "Ana Paula", "Visualizou dados sensíveis", "Lideranças", "Telefone", "Leitura", "Desktop ? 10.0.0.18", "Alerta"],
  ["03/06/2026 17:44", "Equipe Campo", "Tentou excluir cadastro", "Lideranças", "Centro", "Exclusão", "Tablet ? 10.0.0.50", "Bloqueado"],
  ["03/06/2026 10:25", "Mariana Costa", "Atualizou geocodificação", "Geocodificação", "Maricá", "Edição", "Desktop ? 10.0.0.11", "Sucesso"],
] satisfies Array<[string, string, string, string, string, string, string, AuditStatus]>;

export default function Configuracoes() {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const userSummary = useMemo(() => ({
    total: users.length,
    active: users.filter((item) => item.status === "Ativo").length,
    pending: users.filter((item) => item.status === "Pendente").length,
    blocked: users.filter((item) => item.status === "Bloqueado").length,
  }), [users]);

  const mockSave = (label = "Configuração") => toast({ title: `${label} salva`, description: "Preferência registrada na interface. A persistência centralizada fica preparada para Supabase." });

  useEffect(() => {
    let mounted = true;

    listUserProfiles()
      .then((profiles) => {
        if (mounted && profiles.length > 0) {
          setUsers(profiles.map(mapProfileToSystemUser));
        }
      })
      .catch(() => {
        toast({
          title: "Usuários da demonstração",
          description: "Não foi possível carregar users_profiles agora. A lista local segue funcionando.",
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const saveUser = async (record: SystemUser) => {
    if (record.id) {
      setUsers((current) => current.map((item) => item.id === record.id ? record : item));
      setFormOpen(false);
      setEditing(null);
      mockSave("Usuário");
      return;
    }

    try {
      const result = await inviteCampaignUser({
        fullName: record.name,
        email: record.email,
        phone: record.phone || null,
        role: roleValueFromLabel(record.profile),
        linkedState: record.region || "RJ",
        linkedCity: record.city || "Maricá",
        linkedNeighborhood: record.neighborhood === "Todas" ? null : record.neighborhood,
        redirectTo: `${window.location.origin}/login`,
      });

      setUsers((current) => [mapProfileToSystemUser(result.profile), ...current]);
      setFormOpen(false);
      setEditing(null);
      toast({
        title: "Convite enviado",
        description: `O usuário ${record.email} foi criado no Supabase Auth e vinculado ao perfil ${record.profile}.`,
      });
    } catch (error) {
      toast({
        title: "Convite não enviado",
        description: error instanceof Error ? error.message : "Verifique se a Edge Function invite-user foi publicada.",
      });
    }
  };
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="Configurações"
        title="Administração do Sistema"
        description="Usuários, perfis, permissões, campanha, territórios, segurança, integrações e auditoria."
        actions={
          <PermissionGate module="configuracoes" action="edit">
            <Button onClick={() => mockSave("Configurações gerais")}><Save className="h-4 w-4" /> Salvar alterações</Button>
          </PermissionGate>
        }
      />

      <Tabs defaultValue="geral" className="space-y-5">
        <TabsList className="grid h-auto grid-cols-2 gap-1 bg-slate-100 p-1 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["geral", "Geral"],
            ["usuarios", "Usuários"],
            ["perfis", "Perfis"],
            ["permissoes", "Permissões"],
            ["campanha", "Campanha"],
            ["territorios", "Territórios"],
            ["seguranca", "Segurança"],
            ["integracoes", "Integrações"],
            ["aparencia", "Aparência"],
            ["auditoria", "Auditoria"],
          ].map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="geral"><GeneralTab users={users} onSave={mockSave} /></TabsContent>
        <TabsContent value="usuarios"><UsersTab users={users} summary={userSummary} onCreate={() => { setEditing(null); setFormOpen(true); }} onEdit={(userItem) => { setEditing(userItem); setFormOpen(true); }} onDelete={(id) => setUsers((current) => current.filter((item) => item.id !== id))} /></TabsContent>
        <TabsContent value="perfis"><ProfilesTab /></TabsContent>
        <TabsContent value="permissoes"><PermissionsTab /></TabsContent>
        <TabsContent value="campanha"><CampaignTab onSave={mockSave} /></TabsContent>
        <TabsContent value="territorios"><TerritoriesTab /></TabsContent>
        <TabsContent value="seguranca"><SecurityTab onSave={mockSave} /></TabsContent>
        <TabsContent value="integracoes"><IntegrationsTab onSave={mockSave} /></TabsContent>
        <TabsContent value="aparencia"><AppearanceTab onSave={mockSave} /></TabsContent>
        <TabsContent value="auditoria"><AuditTab /></TabsContent>
      </Tabs>

      <UserFormSheet open={formOpen} record={editing} onOpenChange={setFormOpen} onSave={saveUser} />
    </div>
  );
}

function user(id: number, name: string, email: string, phone: string, profile: string, region: string, city: string, neighborhood: string, status: UserStatus, lastAccess: string): SystemUser {
  return { id, name, email, phone, profile, region, city, neighborhood, linkedLeader: profile === "Liderança" ? name : "", status, lastAccess, createdAt: "01/06/2026", notes: "Usuário de referência para Supabase Auth e permissões reais." };
}

function mapProfileToSystemUser(profile: UserProfile): SystemUser {
  return {
    id: stableId(profile.id),
    name: profile.full_name,
    email: profile.email,
    phone: profile.phone ?? "Não informado",
    profile: getRoleLabel(profile.role),
    region: profile.linked_state ?? "RJ",
    city: profile.linked_city ?? "Todas",
    neighborhood: profile.linked_neighborhood ?? "Todas",
    linkedLeader: profile.role === "lideranca" ? profile.full_name : "",
    status: normalizeUserStatus(profile.status),
    lastAccess: "Sessão real via Supabase Auth",
    createdAt: new Date(profile.created_at).toLocaleDateString("pt-BR"),
    notes: profile.auth_user_id ? "Perfil vinculado ao Supabase Auth." : "Perfil ainda sem auth_user_id vinculado.",
  };
}

function stableId(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function normalizeUserStatus(status: string): UserStatus {
  const normalized = status.toLowerCase();
  if (normalized === "ativo" || normalized === "active") return "Ativo";
  if (normalized === "bloqueado" || normalized === "blocked") return "Bloqueado";
  if (normalized === "inativo" || normalized === "inactive") return "Inativo";
  return "Pendente";
}

function roleValueFromLabel(label: string) {
  const normalized = label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (normalized.includes("administrador")) return "admin";
  if (normalized.includes("coordenacao geral")) return "coordenacao_geral";
  if (normalized.includes("coordenador regional")) return "coordenador_regional";
  if (normalized.includes("operador de campo")) return "operador_campo";
  if (normalized.includes("lideranca")) return "lideranca";
  return "visualizador";
}

function GeneralTab({ users, onSave }: { users: SystemUser[]; onSave: (label: string) => void }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Sistema ativo" value="Online" icon={Activity} tone="green" />
        <MetricCard label="Última atualização" value="05/06" icon={CheckCircle2} tone="blue" />
        <MetricCard label="Usuários" value={users.length} icon={Users} tone="indigo" />
        <MetricCard label="Perfis ativos" value={accessProfiles.filter((p) => p.status === "Ativo").length} icon={UserCog} tone="violet" />
        <MetricCard label="Módulos" value={modules.length} icon={Database} tone="emerald" />
      </section>
      <SettingsPanel title="Configurações gerais" description="Dados base exibidos nos painéis, relatórios e futuras exportações.">
        <Field label="Nome do sistema" defaultValue="Base Eleitoral 360" />
        <Field label="Nome da campanha" defaultValue="Campanha Maricá 2026" />
        <Field label="Nome do candidato" defaultValue="Candidato Exemplo" />
        <Field label="Cargo disputado" defaultValue="Vereador" />
        <Field label="Estado principal" defaultValue="RJ" />
        <Field label="Município principal" defaultValue="Maricá" />
        <Field label="Ano da eleição" defaultValue="2026" type="number" />
        <Field label="Responsável geral" defaultValue="Coordenação Geral" />
        <Field label="Telefone de contato" defaultValue="(21) 99999-0000" />
        <Field label="E-mail de contato" defaultValue="contato@campanha.local" />
        <label className="block md:col-span-2"><FieldLabel>Observações gerais</FieldLabel><Textarea defaultValue="Ambiente operacional para campanha, preparado para autenticação, banco real e auditoria." rows={4} /></label>
        <div className="md:col-span-2"><Button onClick={() => onSave("Configurações gerais")}><Save className="h-4 w-4" /> Salvar geral</Button></div>
      </SettingsPanel>
    </div>
  );
}

function UsersTab({ users, summary, onCreate, onEdit, onDelete }: { users: SystemUser[]; summary: { total: number; active: number; pending: number; blocked: number }; onCreate: () => void; onEdit: (user: SystemUser) => void; onDelete: (id: number) => void }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MetricCard label="Total" value={summary.total} icon={Users} tone="blue" />
        <MetricCard label="Ativos" value={summary.active} icon={CheckCircle2} tone="green" />
        <MetricCard label="Pendentes" value={summary.pending} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Bloqueados" value={summary.blocked} icon={LockKeyhole} tone="red" />
        <MetricCard label="Últimos acessos" value="4 hoje" icon={Activity} tone="indigo" />
        <MetricCard label="Perfis" value={accessProfiles.length} icon={UserCog} tone="violet" />
      </section>
      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Gestão de usuários</CardTitle>
            <PermissionGate module="configuracoes" action="create">
              <Button onClick={onCreate}><PlusCircle className="h-4 w-4" /> Convidar usuário</Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>{["Nome", "E-mail", "Telefone", "Perfil", "Região", "Status", "Último acesso", "Criado em", "Ações"].map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                    <TableCell><SensitiveText value={item.email} kind="email" /></TableCell>
                    <TableCell><SensitiveText value={item.phone} kind="phone" /></TableCell>
                    <TableCell><StatusPill label={item.profile} tone="blue" /></TableCell>
                    <TableCell>{item.region}</TableCell>
                    <TableCell><StatusPill label={item.status} tone={userStatusTone(item.status)} /></TableCell>
                    <TableCell>{item.lastAccess}</TableCell>
                    <TableCell>{item.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <IconButton label="Visualizar" icon={Eye} onClick={() => onEdit(item)} />
                        <PermissionGate module="configuracoes" action="edit">
                          <IconButton label="Editar" icon={Edit} onClick={() => onEdit(item)} />
                        </PermissionGate>
                        <PermissionGate module="configuracoes" action="delete">
                          <IconButton label="Excluir" icon={Trash2} danger onClick={() => onDelete(item.id)} />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilesTab() {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader><CardTitle className="text-base">Perfis de acesso</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{["Nome do perfil", "Descrição", "Usuários", "Nível", "Status", "Ações"].map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{accessProfiles.map((profile) => (
              <TableRow key={profile.name}>
                <TableCell className="font-bold text-slate-900">{profile.name}</TableCell>
                <TableCell className="min-w-[320px]">{profile.description}</TableCell>
                <TableCell>{profile.users}</TableCell>
                <TableCell>{profile.level}</TableCell>
                <TableCell><StatusPill label={profile.status} tone={profile.status === "Ativo" ? "green" : "amber"} /></TableCell>
                <TableCell><Button variant="outline" size="sm">Editar perfil</Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionsTab() {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Matriz visual de permissões por perfil</CardTitle>
        <p className="text-sm font-medium text-slate-500">Mock visual para futura autorização real por Supabase Auth e políticas no banco.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {accessProfiles.map((profile) => (
          <div key={profile.name} className="rounded-lg border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="font-extrabold text-slate-950">{profile.name}</div><div className="text-sm font-medium text-slate-500">{profile.description}</div></div>
              <StatusPill label={profile.level} tone="blue" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Módulo</TableHead>{actions.map((action) => <TableHead key={action} className="text-center">{action}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                  {modules.map((moduleName) => (
                    <TableRow key={`${profile.name}-${moduleName}`}>
                      <TableCell className="min-w-[190px] font-semibold">{moduleName}</TableCell>
                      {actions.map((action) => <TableCell key={action} className="text-center"><Checkbox checked={permission(profile.name, moduleName, action)} /></TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CampaignTab({ onSave }: { onSave: (label: string) => void }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Meta geral" value={7410} icon={Target} tone="blue" />
        <MetricCard label="Validados atuais" value={2432} icon={CheckCircle2} tone="green" />
        <MetricCard label="Distância" value={4978} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Dias restantes" value={122} icon={Activity} tone="indigo" />
        <MetricCard label="Cobertura atual" value="1,6%" icon={MapPin} tone="cyan" />
      </section>
      <SettingsPanel title="Configurações da campanha" description="Metas e dados estratégicos usados nos módulos de inteligência.">
        <Field label="Nome do candidato" defaultValue="Candidato Exemplo" />
        <Field label="Número do candidato" defaultValue="00000" />
        <Field label="Partido/coligação" defaultValue="Partido Modelo" />
        <Field label="Cargo" defaultValue="Vereador" />
        <Field label="Estado" defaultValue="RJ" />
        <Field label="Município base" defaultValue="Maricá" />
        <Field label="Meta geral de votos" defaultValue="7410" type="number" />
        <Field label="Meta de lideranças" defaultValue="180" type="number" />
        <Field label="Meta de apoio estimado" defaultValue="5000" type="number" />
        <Field label="Meta de votos validados" defaultValue="7410" type="number" />
        <Field label="Data de início" defaultValue="2026-05-01" type="date" />
        <Field label="Data da eleição" defaultValue="2026-10-04" type="date" />
        <label className="block md:col-span-2"><FieldLabel>Observações estratégicas</FieldLabel><Textarea defaultValue="Prioridade inicial: ampliar lideranças em Itaipuaçu, Jardim Atlântico, Inoã e regiões sem cobertura." rows={4} /></label>
        <div className="md:col-span-2"><Button onClick={() => onSave("Campanha")}><Save className="h-4 w-4" /> Salvar campanha</Button></div>
      </SettingsPanel>
    </div>
  );
}

function TerritoriesTab() {
  const lists = [
    ["Estados", ["Rio de Janeiro"]],
    ["Cidades", ["Maricá", "Niterói", "São Gonçalo", "Itaboraí", "Rio de Janeiro", "Saquarema", "Araruama"]],
    ["Regiões", ["Região Central", "Litoral Norte", "Litoral Sul", "Interior", "Eixo Rodoviário"]],
    ["Bairros", neighborhoods],
    ["Distritos de Maricá", ["Sede / Maricá", "Ponta Negra", "Inoã", "Itaipuaçu"]],
    ["Regiões de governo RJ", ["Metropolitana", "Costa Verde", "Médio Paraíba", "Centro-Sul Fluminense", "Serrana", "Baixadas Litorâneas", "Norte Fluminense", "Noroeste Fluminense"]],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {lists.map(([title, items]) => <ListSettings key={title as string} title={title as string} items={items as string[]} />)}
    </div>
  );
}

function SecurityTab({ onSave }: { onSave: (label: string) => void }) {
  const switches = ["Exigir autorização para cadastrar usuário", "Bloquear exportação para operadores", "Ocultar telefone para visualizadores", "Registrar alterações em auditoria", "Exigir motivo para exclusão", "Permitir anonimização futura"];
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {["Consentimento de cadastro", "Dados sensíveis", "Exportações controladas", "Auditoria de alterações", "Backup futuro", "Controle de acesso"].map((title, index) => <InfoCard key={title} title={title} icon={index < 3 ? ShieldCheck : LockKeyhole} tone={index < 3 ? "blue" : "amber"} />)}
      </section>
      <SettingsPanel title="Segurança e LGPD" description="Políticas operacionais para tratamento de dados pessoais e controle de acesso.">
        <label className="block md:col-span-2"><FieldLabel>Termo de consentimento padrão</FieldLabel><Textarea defaultValue="Autorizo o uso dos meus dados para contato autorizado da campanha e acompanhamento territorial." rows={3} /></label>
        <label className="block"><FieldLabel>Aviso de uso de dados</FieldLabel><Textarea defaultValue="Dados usados apenas pela equipe autorizada." rows={3} /></label>
        <label className="block"><FieldLabel>Política de retenção</FieldLabel><Textarea defaultValue="Retenção até encerramento do ciclo eleitoral e posterior revisão." rows={3} /></label>
        <label className="block"><FieldLabel>Restrição de exportação</FieldLabel><Textarea defaultValue="Exportações sensíveis exigem perfil de coordenação." rows={3} /></label>
        <label className="block"><FieldLabel>Observações legais</FieldLabel><Textarea defaultValue="Preparado para políticas reais de LGPD e auditoria." rows={3} /></label>
        <div className="space-y-3 md:col-span-2">{switches.map((item, index) => <SwitchRow key={item} label={item} checked={index !== 5} />)}</div>
        <div className="md:col-span-2"><Button onClick={() => onSave("Segurança e LGPD")}><Save className="h-4 w-4" /> Salvar segurança</Button></div>
      </SettingsPanel>
    </div>
  );
}

function IntegrationsTab({ onSave }: { onSave: (label: string) => void }) {
  const integrations: Array<[string, string, IntegrationStatus, typeof Database]> = [
    ["Supabase", "Banco de dados, autenticação e storage.", "Planejado", Database],
    ["Mapbox", "Mapas reais, pins, rotas e mapa de calor.", "Em análise", Map],
    ["Google Maps", "Geocodificação, CEP, rua, bairro e localização.", "Futuro", Globe2],
    ["Importação CSV/XLSX", "Importar coordenações, lideranças, apoio estimado, votos e custos.", "Planejado", FileSpreadsheet],
    ["Exportação PDF/Excel", "Relatórios estratégicos exportáveis.", "Planejado", FileSpreadsheet],
    ["WhatsApp", "Envio futuro de mensagens e lembretes.", "Futuro", Activity],
    ["TSE/TRE", "Possível importação de dados públicos eleitorais.", "Em análise", Landmark],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map(([name, purpose, status, Icon]) => (
        <Card key={name} className="premium-card premium-card-hover">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0"><div className="font-extrabold text-slate-950">{name}</div><p className="mt-1 text-sm font-medium leading-6 text-slate-500">{purpose}</p></div>
            </div>
            <div className="flex items-center justify-between gap-3"><StatusPill label={status} tone={status === "Planejado" ? "blue" : status === "Em análise" ? "amber" : "slate"} /><Button variant="outline" onClick={() => onSave(name)}>Configurar</Button></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AppearanceTab({ onSave }: { onSave: (label: string) => void }) {
  return (
    <SettingsPanel title="Preferências visuais" description="Preferências preparadas para personalização por usuário e perfil.">
      <SwitchRow label="Tema claro" checked />
      <SwitchRow label="Tema escuro" />
      <Field label="Cor principal" defaultValue="#2563eb" />
      <Field label="Cor secundária" defaultValue="#10b981" />
      <SwitchRow label="Modo compacto" />
      <SwitchRow label="Modo apresentação" />
      <Field label="Densidade dos cards" defaultValue="Confortável" />
      <SwitchRow label="Exibir animações" checked />
      <SwitchRow label="Exibir mapa em modo premium" checked />
      <div className="md:col-span-2"><Button onClick={() => onSave("Aparência")}><Palette className="h-4 w-4" /> Salvar aparência</Button></div>
    </SettingsPanel>
  );
}

function AuditTab() {
  return (
    <Card className="premium-card overflow-hidden">
      <CardHeader><CardTitle className="text-base">Logs de auditoria</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{["Data/hora", "Usuário", "Ação", "Módulo", "Registro alterado", "Tipo", "IP/dispositivo", "Status"].map((head) => <TableHead key={head}>{head}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{auditLogs.map((row) => <TableRow key={`${row[0]}-${row[2]}`}>{row.map((cell, index) => <TableCell key={index}>{index === 7 ? <StatusPill label={cell} tone={cell === "Sucesso" ? "green" : cell === "Alerta" ? "amber" : "red"} /> : cell}</TableCell>)}</TableRow>)}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserFormSheet({ open, record, onOpenChange, onSave }: { open: boolean; record: SystemUser | null; onOpenChange: (open: boolean) => void; onSave: (record: SystemUser) => Promise<void> | void }) {
  const empty = user(0, "", "", "", "Operador de Campo", "Região Central", "Maricá", "Centro", "Pendente", "Nunca");
  const [draft, setDraft] = useState<SystemUser>(record ?? empty);
  const [submitting, setSubmitting] = useState(false);
  useMemo(() => setDraft(record ?? empty), [record, open]);
  const update = <K extends keyof SystemUser>(key: K, value: SystemUser[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSave(draft);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto bg-slate-50 p-0 sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-5 p-5">
          <SheetHeader className="rounded-lg border bg-white p-5 text-left shadow-sm"><SheetTitle>{record ? "Editar usuário" : "Convidar usuário"}</SheetTitle><SheetDescription>Cria o usuário no Supabase Auth e vincula o perfil em users_profiles por uma função segura.</SheetDescription></SheetHeader>
          <SettingsPanel title="Dados do usuário" description="Perfil, território vinculado e status de acesso.">
            <Field controlled label="Nome completo" value={draft.name} onChange={(event) => update("name", event.target.value)} />
            <Field controlled label="E-mail" value={draft.email} onChange={(event) => update("email", event.target.value)} />
            <Field controlled label="Telefone/WhatsApp" value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
            <SelectField label="Perfil de acesso" value={draft.profile} options={accessProfiles.map((p) => p.name)} onChange={(value) => update("profile", value)} />
            <Field controlled label="Região vinculada" value={draft.region} onChange={(event) => update("region", event.target.value)} />
            <Field controlled label="Cidade vinculada" value={draft.city} onChange={(event) => update("city", event.target.value)} />
            <SelectField label="Bairro vinculado" value={draft.neighborhood} options={neighborhoods} onChange={(value) => update("neighborhood", value)} />
            <Field controlled label="Liderança vinculada" value={draft.linkedLeader ?? ""} onChange={(event) => update("linkedLeader", event.target.value)} />
            <SelectField label="Status" value={draft.status} options={["Ativo", "Pendente", "Bloqueado", "Inativo"]} onChange={(value) => update("status", value as UserStatus)} />
            <label className="block md:col-span-2"><FieldLabel>Observações</FieldLabel><Textarea value={draft.notes} onChange={(event) => update("notes", event.target.value)} rows={3} /></label>
          </SettingsPanel>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting ? "Enviando..." : record ? "Salvar usuário" : "Enviar convite"}</Button></div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="premium-card"><CardHeader className="border-b border-slate-100"><CardTitle className="text-base">{title}</CardTitle><p className="text-sm font-medium text-slate-500">{description}</p></CardHeader><CardContent className="grid gap-4 p-5 md:grid-cols-2">{children}</CardContent></Card>;
}

function Field({ label, controlled, className = "", ...props }: { label: string; controlled?: boolean; className?: string } & React.ComponentProps<typeof Input>) {
  return <label className="block"><FieldLabel>{label}</FieldLabel><Input className={`h-11 rounded-lg border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:bg-white ${className}`} {...props} /></label>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{children}</span>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block"><FieldLabel>{label}</FieldLabel><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ListSettings({ title, items }: { title: string; items: string[] }) {
  return <Card className="premium-card"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">{title}</CardTitle><Button variant="outline" size="sm"><PlusCircle className="h-4 w-4" /> Adicionar</Button></div></CardHeader><CardContent className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">{item}</span>)}</CardContent></Card>;
}

function InfoCard({ title, icon: Icon, tone }: { title: string; icon: typeof ShieldCheck; tone: "blue" | "amber" }) {
  return <Card className="premium-card"><CardContent className="flex items-center gap-3 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone === "blue" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}><Icon className="h-5 w-5" /></div><div className="font-bold text-slate-900">{title}</div></CardContent></Card>;
}

function SwitchRow({ label, checked = false }: { label: string; checked?: boolean }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm"><span className="text-sm font-semibold text-slate-700">{label}</span><Switch defaultChecked={checked} /></div>;
}

function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: MouseEventHandler<HTMLButtonElement>; danger?: boolean }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`rounded-lg border p-2 transition ${danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}><Icon className="h-4 w-4" /></button>;
}

function permission(profile: string, moduleName: string, action: string) {
  if (profile === "Administrador") return true;
  if (profile === "Coordenação Geral") return !["Configurações"].includes(moduleName) || ["Visualizar", "Exportar"].includes(action);
  if (profile === "Coordenador Regional") return ["Visualizar", "Criar", "Editar", "Exportar"].includes(action) && moduleName !== "Configurações";
  if (profile === "Operador de Campo") return ["Visualizar", "Criar", "Editar"].includes(action) && ["Modo Operacional", "Lideranças", "Geocodificação"].includes(moduleName);
  if (profile === "Liderança") return action === "Visualizar" && ["Dashboard Geral", "Mapa de Força", "Lideranças", "Mapa Maricá", "Relatórios"].includes(moduleName);
  return action === "Visualizar" && ["Dashboard Geral", "Relatórios"].includes(moduleName);
}

function userStatusTone(status: UserStatus) {
  if (status === "Ativo") return "green";
  if (status === "Pendente") return "amber";
  if (status === "Bloqueado") return "red";
  return "slate";
}
