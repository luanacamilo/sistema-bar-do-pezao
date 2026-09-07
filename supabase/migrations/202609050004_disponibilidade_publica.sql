-- ic_disponivel = false significa esgotado, mas o produto permanece público.
-- Aplicar após 001 e 002. A migração 003 não é necessária para este recurso.
-- Não modifica permissões de escrita nem exclui colunas ou produtos.
begin;
drop policy if exists produto_publico on public.produto;
create policy produto_publico on public.produto
  for select to anon, authenticated using (true);
commit;
