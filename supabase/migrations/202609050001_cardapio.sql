begin;

-- Preserva secao e produto existentes; aplicar uma única vez.
create table public.cardapio_admin (
  singleton boolean primary key default true check (singleton = true),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.cardapio_admin enable row level security;
revoke all on public.cardapio_admin from anon, authenticated;

create function public.is_cardapio_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cardapio_admin where user_id = (select auth.uid()));
$$;
revoke all on function public.is_cardapio_admin() from public;
grant execute on function public.is_cardapio_admin() to anon, authenticated;

create table if not exists public.secao (
  id bigint generated always as identity primary key,
  nome text not null check (length(trim(nome)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descricao text not null default '',
  ordem integer not null default 0 check (ordem >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.produto (
  id bigint generated always as identity primary key,
  id_secao bigint not null references public.secao(id) on delete restrict,
  nome text not null check (length(trim(nome)) > 0),
  descricao text not null default '',
  preco numeric(10,2) not null check (preco >= 0 and preco <> 'NaN'::numeric),
  ic_disponivel boolean not null default true,
  destaque text not null default '',
  ordem integer not null default 0 check (ordem >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.secao add column if not exists slug text;
update public.secao set slug = 'secao-' || id::text where slug is null;
alter table public.secao alter column slug set not null;
create unique index if not exists secao_slug_unique on public.secao(slug);
alter table public.produto add column if not exists destaque text not null default '';

create index if not exists produto_secao_ordem_idx on public.produto(id_secao, ordem, id);
create function public.cardapio_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger secao_updated_at before update on public.secao for each row execute function public.cardapio_updated_at();
create trigger produto_updated_at before update on public.produto for each row execute function public.cardapio_updated_at();

alter table public.secao enable row level security;
alter table public.produto enable row level security;
revoke all on public.secao, public.produto from anon, authenticated;
grant select on public.secao, public.produto to anon, authenticated;
grant insert, update, delete on public.secao, public.produto to authenticated;
-- Apenas sequências pertencentes às duas tabelas, inclusive nomes personalizados.
do $$ declare sequence_name text; begin
  sequence_name := pg_get_serial_sequence('public.secao', 'id');
  if sequence_name is not null then execute format('grant usage, select on sequence %s to authenticated', sequence_name); end if;
  sequence_name := pg_get_serial_sequence('public.produto', 'id');
  if sequence_name is not null then execute format('grant usage, select on sequence %s to authenticated', sequence_name); end if;
end $$;
-- Políticas permissivas antigas não podem continuar autorizando escrita.
do $$ declare policy_row record; begin
  for policy_row in select tablename, policyname from pg_policies where schemaname = 'public' and tablename in ('secao', 'produto') loop
    execute format('drop policy %I on public.%I', policy_row.policyname, policy_row.tablename);
  end loop;
end $$;
create policy secao_publica on public.secao for select to anon, authenticated using (true);
create policy produto_publico on public.produto for select to anon, authenticated using (ic_disponivel or (select public.is_cardapio_admin()));
create policy secao_admin_insert on public.secao for insert to authenticated with check ((select public.is_cardapio_admin()));
create policy secao_admin_update on public.secao for update to authenticated using ((select public.is_cardapio_admin())) with check ((select public.is_cardapio_admin()));
create policy secao_admin_delete on public.secao for delete to authenticated using ((select public.is_cardapio_admin()));
create policy produto_admin_insert on public.produto for insert to authenticated with check ((select public.is_cardapio_admin()));
create policy produto_admin_update on public.produto for update to authenticated using ((select public.is_cardapio_admin())) with check ((select public.is_cardapio_admin()));
create policy produto_admin_delete on public.produto for delete to authenticated using ((select public.is_cardapio_admin()));
commit;
