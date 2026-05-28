-- Avalyst Dashboard - Next Step
-- Execute this script in Supabase SQL Editor.
-- It creates the missing tables used by:
-- - /dashboard/crm
-- - /dashboard/ads
-- - /dashboard/projetos
--
-- Safe to re-run due to IF NOT EXISTS and policy drops.

-- ============================================================================
-- 1) CRM METRICS
-- ============================================================================
create table if not exists public.crm_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference_date date not null,
  novos_leads integer not null default 0,
  status_won integer not null default 0,
  status_lost integer not null default 0,
  fase_novos_leads integer not null default 0,
  fase_discovery integer not null default 0,
  fase_qualificacao integer not null default 0,
  fase_cadencia integer not null default 0,
  fase_conexao integer not null default 0,
  fase_reuniao_agendada integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_metrics_user_id_idx on public.crm_metrics (user_id);
create index if not exists crm_metrics_reference_date_idx on public.crm_metrics (reference_date);
create unique index if not exists crm_metrics_unique_user_date on public.crm_metrics (user_id, reference_date);

alter table public.crm_metrics enable row level security;

drop policy if exists "crm_metrics_select_own" on public.crm_metrics;
create policy "crm_metrics_select_own"
on public.crm_metrics
for select
using (auth.uid() = user_id);

drop policy if exists "crm_metrics_insert_own" on public.crm_metrics;
create policy "crm_metrics_insert_own"
on public.crm_metrics
for insert
with check (auth.uid() = user_id);

drop policy if exists "crm_metrics_update_own" on public.crm_metrics;
create policy "crm_metrics_update_own"
on public.crm_metrics
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "crm_metrics_delete_own" on public.crm_metrics;
create policy "crm_metrics_delete_own"
on public.crm_metrics
for delete
using (auth.uid() = user_id);

-- ============================================================================
-- 2) ADS METRICS
-- ============================================================================
create table if not exists public.ads_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference_date date not null,
  platform text not null,
  taxa_conversao numeric(10,2) not null default 0,
  taxa_clique numeric(10,2) not null default 0,
  impressoes integer not null default 0,
  cliques integer not null default 0,
  custo_clique numeric(12,2) not null default 0,
  custo_aquisicao numeric(12,2) not null default 0,
  investimento numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ads_metrics_platform_check
    check (platform in ('google', 'meta', 'linkedin', 'tiktok'))
);

create index if not exists ads_metrics_user_id_idx on public.ads_metrics (user_id);
create index if not exists ads_metrics_reference_date_idx on public.ads_metrics (reference_date);
create index if not exists ads_metrics_platform_idx on public.ads_metrics (platform);
create unique index if not exists ads_metrics_unique_user_date_platform
  on public.ads_metrics (user_id, reference_date, platform);

alter table public.ads_metrics enable row level security;

drop policy if exists "ads_metrics_select_own" on public.ads_metrics;
create policy "ads_metrics_select_own"
on public.ads_metrics
for select
using (auth.uid() = user_id);

drop policy if exists "ads_metrics_insert_own" on public.ads_metrics;
create policy "ads_metrics_insert_own"
on public.ads_metrics
for insert
with check (auth.uid() = user_id);

drop policy if exists "ads_metrics_update_own" on public.ads_metrics;
create policy "ads_metrics_update_own"
on public.ads_metrics
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ads_metrics_delete_own" on public.ads_metrics;
create policy "ads_metrics_delete_own"
on public.ads_metrics
for delete
using (auth.uid() = user_id);

-- ============================================================================
-- 3) PROJECTS
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_created_at_idx on public.projects (created_at desc);

alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
using (auth.uid() = user_id);

-- ============================================================================
-- 4) PROJECT METRICS
-- ============================================================================
create table if not exists public.project_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reference_date date not null,
  metric_name text not null,
  metric_value numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_metrics_project_id_idx on public.project_metrics (project_id);
create index if not exists project_metrics_user_id_idx on public.project_metrics (user_id);
create index if not exists project_metrics_reference_date_idx on public.project_metrics (reference_date);
create unique index if not exists project_metrics_unique_record
  on public.project_metrics (project_id, reference_date, metric_name);

alter table public.project_metrics enable row level security;

drop policy if exists "project_metrics_select_own" on public.project_metrics;
create policy "project_metrics_select_own"
on public.project_metrics
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_metrics_insert_own" on public.project_metrics;
create policy "project_metrics_insert_own"
on public.project_metrics
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_metrics_update_own" on public.project_metrics;
create policy "project_metrics_update_own"
on public.project_metrics
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_metrics_delete_own" on public.project_metrics;
create policy "project_metrics_delete_own"
on public.project_metrics
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

-- ============================================================================
-- 5) updated_at helpers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_metrics_set_updated_at on public.crm_metrics;
create trigger crm_metrics_set_updated_at
before update on public.crm_metrics
for each row execute function public.set_updated_at();

drop trigger if exists ads_metrics_set_updated_at on public.ads_metrics;
create trigger ads_metrics_set_updated_at
before update on public.ads_metrics
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists project_metrics_set_updated_at on public.project_metrics;
create trigger project_metrics_set_updated_at
before update on public.project_metrics
for each row execute function public.set_updated_at();
