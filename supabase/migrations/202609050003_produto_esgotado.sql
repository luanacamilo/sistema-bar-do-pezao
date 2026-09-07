-- Esgotado permanece visível; ic_disponivel continua controlando a visibilidade.
begin;
alter table public.produto
  add column if not exists is_esgotado boolean not null default false;
commit;
