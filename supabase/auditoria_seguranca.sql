-- Somente leitura. Executar no SQL Editor para inspecionar a configuração real.
-- Não é uma migração; não modifica dados, permissões ou contas.

select c.relname as tabela, c.relrowsecurity as rls_ativo,
       c.relforcerowsecurity as rls_forcado
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';

select tablename, policyname, roles, cmd, qual as using_expression,
       with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated', 'PUBLIC')
order by table_name, grantee, privilege_type;

select p.proname, p.prosecdef as security_definer, p.proconfig,
       pg_get_functiondef(p.oid) as definicao
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_cardapio_admin';

-- Retorna apenas se o administrador esperado foi cadastrado, sem listar contas.
select count(*) = 1 and bool_and(user_id = '9000ff02-7a51-4314-9ebf-743a4191f69c'::uuid)
       as administrador_correto from public.cardapio_admin;

select conrelid::regclass as tabela, conname, pg_get_constraintdef(oid) as restricao
from pg_constraint
where conrelid in ('public.secao'::regclass, 'public.produto'::regclass,
                  'public.cardapio_admin'::regclass)
order by conrelid, conname;
