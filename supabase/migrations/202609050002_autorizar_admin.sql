-- Executar após 202609050001_cardapio.sql pelo SQL Editor do Supabase.
-- A FK verifica se o usuário informado existe no Supabase Auth.
begin;

insert into public.cardapio_admin (singleton, user_id)
values (true, '9000ff02-7a51-4314-9ebf-743a4191f69c'::uuid)
on conflict (singleton) do update set user_id = excluded.user_id;

commit;
