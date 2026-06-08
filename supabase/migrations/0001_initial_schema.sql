create extension if not exists pgcrypto;

create schema if not exists app_private;

create type public.user_role as enum ('admin', 'broker', 'assistant');
create type public.property_type as enum ('house', 'apartment', 'penthouse', 'land', 'commercial');
create type public.property_contract as enum ('sale', 'rent');
create type public.property_status as enum ('draft', 'pending_review', 'published', 'archived');
create type public.review_status as enum ('pending_review', 'approved', 'rejected');
create type public.lead_stage as enum ('new', 'contacted', 'visit', 'proposal', 'closed', 'lost');
create type public.lead_source as enum ('site', 'whatsapp', 'manual', 'import');

create or replace function app_private.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function app_private.has_role(allowed_roles text[])
returns boolean
language sql
stable
as $$
  select app_private.jwt_role() = any(allowed_roles)
$$;

grant usage on schema app_private to anon, authenticated;
grant execute on function app_private.jwt_role() to anon, authenticated;
grant execute on function app_private.has_role(text[]) to anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'broker',
  phone text,
  creci text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  slug text not null unique,
  title text not null,
  description text not null default '',
  type public.property_type not null,
  contract public.property_contract not null,
  status public.property_status not null default 'pending_review',
  review_status public.review_status not null default 'pending_review',
  price numeric(14, 2) not null check (price >= 0),
  condominium_fee numeric(14, 2) check (condominium_fee is null or condominium_fee >= 0),
  iptu numeric(14, 2) check (iptu is null or iptu >= 0),
  neighborhood text not null,
  city text not null default 'Ilha Comprida',
  state text not null default 'SP',
  area_private numeric(10, 2) check (area_private is null or area_private >= 0),
  area_total numeric(10, 2) check (area_total is null or area_total >= 0),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  suites integer check (suites is null or suites >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  parking_spaces integer check (parking_spaces is null or parking_spaces >= 0),
  features text[] not null default '{}',
  tags text[] not null default '{}',
  cover_image_url text not null,
  is_featured boolean not null default false,
  source_url text,
  assigned_broker_id uuid references public.profiles(id) on delete set null,
  assigned_broker_name text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(neighborhood, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(city, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'D')
  ) stored
);

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (phone ~ '^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$'),
  stage public.lead_stage not null default 'new',
  interest text,
  message text,
  property_id uuid references public.properties(id) on delete set null,
  property_title text,
  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  assigned_broker_id uuid references public.profiles(id) on delete set null,
  assigned_broker_name text,
  source public.lead_source not null default 'site',
  lgpd_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('note', 'call', 'whatsapp', 'visit', 'proposal', 'status_change')),
  body text not null default '',
  created_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null check (status in ('queued', 'running', 'completed', 'failed')) default 'queued',
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index properties_status_review_idx on public.properties (status, review_status, is_featured, updated_at desc);
create index properties_contract_type_idx on public.properties (contract, type, neighborhood);
create index properties_search_idx on public.properties using gin (search_vector);
create index leads_stage_idx on public.leads (stage, last_activity_at desc);
create index leads_property_idx on public.leads (property_id);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.import_batches enable row level security;

create policy "profiles_select_dashboard"
on public.profiles for select
to authenticated
using (id = auth.uid() or app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "profiles_update_self_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or app_private.has_role(array['admin']))
with check (id = auth.uid() or app_private.has_role(array['admin']));

create policy "properties_public_read_published"
on public.properties for select
to anon, authenticated
using (status = 'published' and review_status = 'approved');

create policy "properties_dashboard_read"
on public.properties for select
to authenticated
using (app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "properties_dashboard_insert"
on public.properties for insert
to authenticated
with check (app_private.has_role(array['admin', 'broker']));

create policy "properties_dashboard_update"
on public.properties for update
to authenticated
using (app_private.has_role(array['admin', 'broker']))
with check (app_private.has_role(array['admin', 'broker']));

create policy "media_public_read_for_published_properties"
on public.property_media for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.status = 'published'
      and p.review_status = 'approved'
  )
);

create policy "media_dashboard_read"
on public.property_media for select
to authenticated
using (app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "media_dashboard_write"
on public.property_media for all
to authenticated
using (app_private.has_role(array['admin', 'broker']))
with check (app_private.has_role(array['admin', 'broker']));

create policy "leads_public_insert"
on public.leads for insert
to anon, authenticated
with check (lgpd_accepted is true and source in ('site', 'whatsapp'));

create policy "leads_dashboard_read"
on public.leads for select
to authenticated
using (app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "leads_dashboard_update"
on public.leads for update
to authenticated
using (app_private.has_role(array['admin', 'broker', 'assistant']))
with check (app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "lead_activities_dashboard"
on public.lead_activities for all
to authenticated
using (app_private.has_role(array['admin', 'broker', 'assistant']))
with check (app_private.has_role(array['admin', 'broker', 'assistant']));

create policy "imports_dashboard"
on public.import_batches for all
to authenticated
using (app_private.has_role(array['admin', 'broker']))
with check (app_private.has_role(array['admin', 'broker']));

insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do nothing;

create policy "property_media_storage_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'property-media');

create policy "property_media_storage_dashboard_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-media' and app_private.has_role(array['admin', 'broker']));

create policy "property_media_storage_dashboard_update"
on storage.objects for update
to authenticated
using (bucket_id = 'property-media' and app_private.has_role(array['admin', 'broker']))
with check (bucket_id = 'property-media' and app_private.has_role(array['admin', 'broker']));

create policy "property_media_storage_dashboard_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'property-media' and app_private.has_role(array['admin', 'broker']));

insert into public.properties (
  slug,
  title,
  description,
  type,
  contract,
  status,
  review_status,
  price,
  neighborhood,
  city,
  state,
  area_private,
  area_total,
  bedrooms,
  suites,
  bathrooms,
  parking_spaces,
  features,
  tags,
  cover_image_url,
  is_featured,
  assigned_broker_name
)
values
  (
    'casa-pe-na-areia-balneario-meu-recanto',
    'Casa pe na areia com vista permanente para o mar',
    'Residencia costeira com ambientes integrados, ampla area externa e acesso privilegiado a praia.',
    'house',
    'sale',
    'published',
    'approved',
    3250000,
    'Balneario Meu Recanto',
    'Ilha Comprida',
    'SP',
    280,
    620,
    4,
    2,
    5,
    4,
    array['Frente para o mar', 'Piscina', 'Espaco gourmet', 'Suite master'],
    array['alto-padrao', 'destaque'],
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    true,
    'Equipe Alceu Fogaca'
  ),
  (
    'apartamento-vista-mar-centro',
    'Apartamento vista mar no Centro',
    'Apartamento mobiliado com varanda, planta eficiente e localizacao proxima aos servicos essenciais.',
    'apartment',
    'sale',
    'published',
    'approved',
    1650000,
    'Centro',
    'Ilha Comprida',
    'SP',
    160,
    null,
    3,
    1,
    3,
    2,
    array['Vista mar', 'Varanda', 'Mobiliado'],
    array['vista-mar'],
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    false,
    'Equipe Alceu Fogaca'
  );
