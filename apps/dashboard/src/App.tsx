import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Home,
  Import,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  Users,
  X
} from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  archiveProperty,
  brand,
  fetchAllProperties,
  fetchLeads,
  formatCurrency,
  getSupabaseClient,
  properties as fallbackProperties,
  saveProperty,
  type Lead,
  type LeadStage,
  type Property,
  type PropertyContract,
  type PropertyStatus,
  type PropertyType
} from "@alceu/shared";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type View = "dashboard" | "properties" | "leads" | "brokers" | "imports" | "settings";
type DrawerMode = "create" | "edit";

const navItems: Array<{ id: View; label: string; icon: ReactNode }> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "properties", label: "Imoveis", icon: <Home size={18} /> },
  { id: "leads", label: "Leads", icon: <ClipboardList size={18} /> },
  { id: "brokers", label: "Corretores", icon: <Users size={18} /> },
  { id: "imports", label: "Importacao", icon: <Import size={18} /> },
  { id: "settings", label: "Configuracoes", icon: <Settings size={18} /> }
];

const statusLabels: Record<PropertyStatus, string> = {
  draft: "Rascunho",
  pending_review: "Revisao",
  published: "Publicada",
  archived: "Arquivada"
};

const typeLabels: Record<PropertyType, string> = {
  house: "Casa",
  apartment: "Apartamento",
  penthouse: "Cobertura",
  land: "Terreno",
  commercial: "Comercial"
};

const stageLabels: Record<LeadStage, string> = {
  new: "Novo",
  contacted: "Contato",
  visit: "Visita",
  proposal: "Proposta",
  closed: "Fechado",
  lost: "Perdido"
};

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    async function boot() {
      if (!supabase) {
        setIsAuthenticated(true);
        setAuthChecked(true);
        await loadData();
        return;
      }

      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data.session));
      setAuthChecked(true);
      if (data.session) {
        await loadData();
      } else {
        setSessionReady(true);
      }
    }

    boot();
  }, [supabase]);

  async function loadData() {
    setSessionReady(false);
    const [propertyRows, leadRows] = await Promise.all([fetchAllProperties(), fetchLeads()]);
    setProperties(propertyRows);
    setLeads(leadRows);
    setSessionReady(true);
  }

  async function handleLogin(email: string, password: string) {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    setIsAuthenticated(true);
    await loadData();
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setProperties([]);
      setLeads([]);
      setSessionReady(true);
    }
  }

  const stats = useMemo(() => {
    const active = properties.filter((property) => property.status === "published").length;
    const review = properties.filter((property) => property.status === "pending_review").length;
    const leadCount = leads.filter((lead) => lead.stage !== "closed" && lead.stage !== "lost").length;
    const totalValue = properties.reduce((sum, property) => sum + (property.status !== "archived" ? property.price : 0), 0);
    return { active, review, leadCount, totalValue };
  }, [leads, properties]);

  const filteredProperties = properties.filter((property) => {
    const haystack = `${property.title} ${property.neighborhood} ${property.city} ${property.assignedBrokerName ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  if (!authChecked) {
    return <div className="auth-screen">Verificando sessao...</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  function openCreateDrawer() {
    setDrawerMode("create");
    setSelectedProperty(null);
    setIsDrawerOpen(true);
  }

  function openEditDrawer(property: Property) {
    setDrawerMode("edit");
    setSelectedProperty(property);
    setIsDrawerOpen(true);
  }

  async function handleSave(property: Property) {
    const saved = await saveProperty(property);
    setProperties((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
    });
    setIsDrawerOpen(false);
  }

  async function handleArchive(property: Property) {
    await archiveProperty(property.id);
    setProperties((current) => current.map((item) => (item.id === property.id ? { ...item, status: "archived" } : item)));
  }

  return (
    <div className="dashboard-shell">
      <aside className={sidebarOpen ? "is-open" : ""}>
        <div className="dashboard-brand">
          <strong>Alceu Fogaca</strong>
          <span>CRM Imobiliario</span>
        </div>
        <nav aria-label="Navegacao do CRM">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "is-active" : ""}
              onClick={() => {
                setView(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="security-note">
          <Shield size={18} />
          <span>RLS ativo no Supabase. Publicacao exige perfil autorizado.</span>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-button sidebar-toggle" type="button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar imovel, bairro ou corretor" />
          </div>
          <button className="primary-button" type="button" onClick={openCreateDrawer}>
            <Plus size={18} />
            Novo imovel
          </button>
          <div className="user-chip">
            <span>AF</span>
            <div>
              <strong>Corretor demo</strong>
              <small>{supabase ? "Supabase conectado" : "Modo demonstracao"}</small>
            </div>
          </div>
          {supabase ? (
            <button className="icon-button" type="button" aria-label="Sair" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          ) : null}
        </header>

        {!sessionReady ? (
          <div className="loading-state">Carregando CRM...</div>
        ) : (
          <>
            {view === "dashboard" ? <DashboardOverview stats={stats} properties={properties} leads={leads} /> : null}
            {view === "properties" ? (
              <PropertyInventory properties={filteredProperties} onEdit={openEditDrawer} onArchive={handleArchive} />
            ) : null}
            {view === "leads" ? <LeadPipeline leads={leads} /> : null}
            {view === "brokers" ? <PlaceholderView title="Corretores" text="Cadastre corretores no Supabase Auth e gerencie permissoes pela tabela profiles." /> : null}
            {view === "imports" ? <ImportView /> : null}
            {view === "settings" ? <SettingsView /> : null}
          </>
        )}
      </main>

      {isDrawerOpen ? (
        <PropertyDrawer
          mode={drawerMode}
          property={selectedProperty}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSave}
        />
      ) : null}
      <SpeedInsights />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <div className="dashboard-brand light">
          <strong>Alceu Fogaca</strong>
          <span>CRM Imobiliario</span>
        </div>
        <h1>Entrar no dashboard</h1>
        <label>
          E-mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Senha
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className="login-error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

function DashboardOverview({
  stats,
  properties,
  leads
}: {
  stats: { active: number; review: number; leadCount: number; totalValue: number };
  properties: Property[];
  leads: Lead[];
}) {
  return (
    <section className="view-stack">
      <div className="view-heading">
        <div>
          <span>Operacao</span>
          <h1>Dashboard dos corretores</h1>
        </div>
        <a href={brand.currentSite} target="_blank" rel="noopener noreferrer">
          Ver site publico
        </a>
      </div>
      <div className="kpi-grid">
        <Kpi icon={<Building2 />} value={String(stats.active)} label="Imoveis publicados" />
        <Kpi icon={<ClipboardList />} value={String(stats.review)} label="Aguardando revisao" />
        <Kpi icon={<Users />} value={String(stats.leadCount)} label="Leads em aberto" />
        <Kpi icon={<BarChart3 />} value={formatCurrency(stats.totalValue)} label="Carteira ativa" />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <PanelHeader title="Ultimos imoveis" subtitle="Edicoes recentes e status de publicacao" />
          <PropertyMiniList properties={properties.slice(0, 5)} />
        </section>
        <section className="panel">
          <PanelHeader title="Pipeline" subtitle="Leads por etapa comercial" />
          <LeadPipeline leads={leads} compact />
        </section>
      </div>
    </section>
  );
}

function PropertyInventory({
  properties,
  onEdit,
  onArchive
}: {
  properties: Property[];
  onEdit: (property: Property) => void;
  onArchive: (property: Property) => void;
}) {
  return (
    <section className="view-stack">
      <div className="view-heading">
        <div>
          <span>Inventario</span>
          <h1>Imoveis</h1>
        </div>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Imovel</th>
              <th>Status</th>
              <th>Contrato</th>
              <th>Preco</th>
              <th>Bairro</th>
              <th>Corretor</th>
              <th>Atualizado</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>
                  <div className="property-cell">
                    <img src={property.coverImageUrl} alt={property.title} />
                    <div>
                      <strong>{property.title}</strong>
                      <small>{typeLabels[property.type]}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={property.status} />
                </td>
                <td>{property.contract === "sale" ? "Venda" : "Locacao"}</td>
                <td>{formatCurrency(property.price)}</td>
                <td>{property.neighborhood}</td>
                <td>{property.assignedBrokerName ?? "Sem corretor"}</td>
                <td>{new Date(property.updatedAt).toLocaleDateString("pt-BR")}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onEdit(property)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => onArchive(property)} disabled={property.status === "archived"}>
                      Arquivar
                    </button>
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

function LeadPipeline({ leads, compact = false }: { leads: Lead[]; compact?: boolean }) {
  const visibleStages: LeadStage[] = compact ? ["new", "contacted", "visit", "proposal"] : ["new", "contacted", "visit", "proposal", "closed"];
  const grouped = visibleStages.map((stage) => ({
    stage,
    rows: leads.filter((lead) => lead.stage === stage)
  }));

  return (
    <section className={compact ? "lead-board compact" : "view-stack"}>
      {!compact ? (
        <div className="view-heading">
          <div>
            <span>CRM</span>
            <h1>Leads e funil</h1>
          </div>
        </div>
      ) : null}
      <div className="kanban">
        {grouped.map((column) => (
          <div className="kanban-column" key={column.stage}>
            <header>
              <strong>{stageLabels[column.stage]}</strong>
              <span>{column.rows.length}</span>
            </header>
            {column.rows.map((lead) => (
              <article className="lead-card" key={lead.id}>
                <strong>{lead.name}</strong>
                <span>{lead.phone}</span>
                {lead.propertyTitle ? <small>{lead.propertyTitle}</small> : null}
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function PropertyDrawer({
  mode,
  property,
  onClose,
  onSave
}: {
  mode: DrawerMode;
  property: Property | null;
  onClose: () => void;
  onSave: (property: Property) => Promise<void>;
}) {
  const [alert, setAlert] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const coverImageUrl = String(form.get("coverImageUrl") ?? "").trim();
    const price = Number(form.get("price") ?? 0);

    if (!title || !coverImageUrl || !price) {
      setAlert("Titulo, imagem e preco sao obrigatorios.");
      return;
    }

    const nextProperty: Property = {
      id: property?.id ?? crypto.randomUUID(),
      externalId: property?.externalId,
      slug: slugify(title),
      title,
      description: String(form.get("description") ?? "").trim(),
      type: String(form.get("type")) as PropertyType,
      contract: String(form.get("contract")) as PropertyContract,
      status: String(form.get("status")) as PropertyStatus,
      reviewStatus: String(form.get("status")) === "published" ? "approved" : "pending_review",
      price,
      neighborhood: String(form.get("neighborhood") ?? "").trim(),
      city: String(form.get("city") ?? "Ilha Comprida").trim(),
      state: String(form.get("state") ?? "SP").trim(),
      areaPrivate: optionalNumber(form.get("areaPrivate")),
      areaTotal: optionalNumber(form.get("areaTotal")),
      bedrooms: optionalNumber(form.get("bedrooms")),
      suites: optionalNumber(form.get("suites")),
      bathrooms: optionalNumber(form.get("bathrooms")),
      parkingSpaces: optionalNumber(form.get("parkingSpaces")),
      features: String(form.get("features") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      tags: property?.tags ?? [],
      coverImageUrl,
      isFeatured: form.get("isFeatured") === "on",
      assignedBrokerName: String(form.get("assignedBrokerName") ?? "").trim() || undefined,
      updatedAt: new Date().toISOString(),
      sourceUrl: property?.sourceUrl
    };

    setSaving(true);
    try {
      await onSave(nextProperty);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  }

  const seed = property ?? fallbackProperties[0];

  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true" aria-label={mode === "create" ? "Novo imovel" : "Editar imovel"}>
      <form className="property-drawer" onSubmit={onSubmit} noValidate>
        <header>
          <div>
            <span>{mode === "create" ? "Cadastro" : "Edicao"}</span>
            <h2>{mode === "create" ? "Novo imovel" : "Editar imovel"}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="drawer-grid">
          <label className="span-2">
            Titulo
            <input name="title" defaultValue={property?.title ?? ""} required />
          </label>
          <label>
            Tipo
            <select name="type" defaultValue={property?.type ?? "house"}>
              <option value="house">Casa</option>
              <option value="apartment">Apartamento</option>
              <option value="penthouse">Cobertura</option>
              <option value="land">Terreno</option>
              <option value="commercial">Comercial</option>
            </select>
          </label>
          <label>
            Contrato
            <select name="contract" defaultValue={property?.contract ?? "sale"}>
              <option value="sale">Venda</option>
              <option value="rent">Locacao</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={property?.status ?? "pending_review"}>
              <option value="draft">Rascunho</option>
              <option value="pending_review">Revisao</option>
              <option value="published">Publicada</option>
              <option value="archived">Arquivada</option>
            </select>
          </label>
          <label>
            Preco
            <input name="price" type="number" min="0" defaultValue={property?.price ?? ""} required />
          </label>
          <label>
            Bairro
            <input name="neighborhood" defaultValue={property?.neighborhood ?? ""} />
          </label>
          <label>
            Cidade
            <input name="city" defaultValue={property?.city ?? "Ilha Comprida"} />
          </label>
          <label>
            Estado
            <input name="state" defaultValue={property?.state ?? "SP"} maxLength={2} />
          </label>
          <label>
            Area privativa
            <input name="areaPrivate" type="number" min="0" defaultValue={property?.areaPrivate ?? ""} />
          </label>
          <label>
            Area total
            <input name="areaTotal" type="number" min="0" defaultValue={property?.areaTotal ?? ""} />
          </label>
          <label>
            Quartos
            <input name="bedrooms" type="number" min="0" defaultValue={property?.bedrooms ?? ""} />
          </label>
          <label>
            Suites
            <input name="suites" type="number" min="0" defaultValue={property?.suites ?? ""} />
          </label>
          <label>
            Banheiros
            <input name="bathrooms" type="number" min="0" defaultValue={property?.bathrooms ?? ""} />
          </label>
          <label>
            Vagas
            <input name="parkingSpaces" type="number" min="0" defaultValue={property?.parkingSpaces ?? ""} />
          </label>
          <label className="span-2">
            Imagem de capa
            <input name="coverImageUrl" defaultValue={property?.coverImageUrl ?? seed.coverImageUrl} required />
          </label>
          <label className="span-2">
            Caracteristicas
            <input name="features" defaultValue={property?.features.join(", ") ?? ""} placeholder="Piscina, suite, vista mar" />
          </label>
          <label className="span-2">
            Descricao
            <textarea name="description" rows={4} defaultValue={property?.description ?? ""} />
          </label>
          <label>
            Corretor responsavel
            <input name="assignedBrokerName" defaultValue={property?.assignedBrokerName ?? ""} />
          </label>
          <label className="switch">
            <input name="isFeatured" type="checkbox" defaultChecked={property?.isFeatured ?? false} />
            Imovel em destaque
          </label>
        </div>
        {alert ? <p className="drawer-alert">{alert}</p> : null}
        <footer>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar imovel"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ImportView() {
  return (
    <section className="view-stack">
      <div className="view-heading">
        <div>
          <span>Migracao opcional</span>
          <h1>Importacao</h1>
        </div>
      </div>
      <div className="panel import-panel">
        <Import size={28} />
        <h2>Cadastro manual como fonte principal</h2>
        <p>
          A importacao do site antigo fica como apoio. Os imoveis reais devem ser cadastrados ou revisados aqui antes de aparecerem no site publico.
        </p>
        <code>npm run import:site</code>
      </div>
    </section>
  );
}

function SettingsView() {
  return (
    <section className="view-stack">
      <div className="view-heading">
        <div>
          <span>Administracao</span>
          <h1>Configuracoes</h1>
        </div>
      </div>
      <div className="panel settings-list">
        <SettingItem title="Publicacao" text="Somente admin e broker podem publicar ou arquivar imoveis." />
        <SettingItem title="Leads" text="Visitantes podem criar leads, mas nao podem listar ou editar dados." />
        <SettingItem title="Arquivos" text="Fotos ficam no Supabase Storage com escrita autenticada e leitura publica de imagens publicadas." />
        <SettingItem title="Cloudflare" text="Use WAF, rate limiting e Turnstile no formulario publico em producao." />
      </div>
    </section>
  );
}

function PlaceholderView({ title, text }: { title: string; text: string }) {
  return (
    <section className="view-stack">
      <div className="view-heading">
        <div>
          <span>Modulo</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="panel import-panel">
        <Users size={28} />
        <p>{text}</p>
      </div>
    </section>
  );
}

function Kpi({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <article className="kpi-card">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="panel-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}

function PropertyMiniList({ properties }: { properties: Property[] }) {
  return (
    <div className="mini-list">
      {properties.map((property) => (
        <article key={property.id}>
          <img src={property.coverImageUrl} alt={property.title} />
          <div>
            <strong>{property.title}</strong>
            <span>{property.neighborhood}</span>
          </div>
          <StatusBadge status={property.status} />
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  return <span className={`status-badge ${status}`}>{statusLabels[status]}</span>;
}

function SettingItem({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <CheckCircle2 size={18} />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function optionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
