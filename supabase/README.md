# Configuração do cardápio

O frontend usa `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (chave publicável). Nunca coloque `service_role`, chave secreta ou senha de banco em variáveis VITE.

## Aplicar no projeto existente

1. Faça uma cópia de segurança do banco. No SQL Editor do Supabase execute `migrations/202609050001_cardapio.sql` uma única vez. A migração preserva `secao` e `produto`, adiciona `slug` e `destaque` e substitui as políticas dessas duas tabelas. Não mexe em pedidos antigos ou outras tabelas. Em tabelas preexistentes, espera os campos id, nome, descricao, ordem, created_at e updated_at, além de preco, id_secao e ic_disponivel no produto; IDs precisam ter geração automática. As restrições das tabelas existentes devem ser revisadas no painel, pois CREATE TABLE IF NOT EXISTS não as altera.
2. Em Authentication, crie manualmente uma conta com e-mail e senha forte. Desabilite **Allow new users to sign up** e login anônimo. Não desabilite o login por e-mail. Configure Site URL e URLs de redirecionamento com o domínio publicado. Considere MFA como próxima etapa; esta implementação ainda usa e-mail e senha.
3. Para a conta informada neste projeto (`9000ff02-7a51-4314-9ebf-743a4191f69c`), execute `migrations/202609050002_autorizar_admin.sql` após a primeira migração. Para substituir a conta futuramente, use pelo SQL Editor:

```sql
insert into public.cardapio_admin (singleton, user_id)
values (true, 'COLE-O-UUID-DO-ADMIN'::uuid)
on conflict (singleton) do update set user_id = excluded.user_id;
```

A chave primária com CHECK permite somente uma conta autorizada. A tabela de autorização não aceita leitura ou escrita pelos clientes. O frontend consulta `is_cardapio_admin()`, que só retorna se a sessão atual é a conta autorizada. A autorização efetiva de todas as escritas é feita pelo RLS, não pelo frontend nem por uma lista de e-mails.

4. Somente se as tabelas do cardápio estiverem vazias, execute `seed.sql`: contém as 9 seções e os 150 produtos do cardápio anterior. O script recusa execução quando já há dados, para evitar duplicatas. Não apague dados existentes para usá-lo. Nas seções preexistentes, os slugs novos serão `secao-ID`; é possível editá-los no painel para os identificadores conhecidos como `porcoes`, `peixes`, `porcoes-fritas`, `porcao-premium`, `frios`, `caipirinhas`, `drinks`, `cervejas` e `sem-alcool`.
5. Reinicie `npm run dev`. Abra `/admin/login`, entre com a conta autorizada e edite o cardápio. O público lê o banco ao abrir `/cardapio`; não há fallback silencioso para dados demonstrativos. Uma página já aberta precisa ser recarregada para ver alterações.

## Permissões e validação

- Visitante: lê seções e produtos disponíveis, sem modificar dados.
- Usuário autenticado sem autorização: mesmas leituras públicas, sem editar.
- Administrador autorizado: lê inclusive produtos ocultos e cria/edita/exclui seções e produtos.
- Ocultar produto: desmarcar Disponível no cardápio no editor.
- Uma seção com produtos deve ter os produtos movidos/excluídos antes da exclusão (FK RESTRICT no esquema novo; confira essa restrição no esquema preexistente).

Após aplicar, valide em uma janela anônima e em sessões de administrador e de usuário não autorizado. Verifique bloqueio de INSERT/UPDATE/DELETE diretamente pela API, não apenas pelos botões. A chave publicável não executa migrações nem cria contas administradoras. Os scripts deste repositório não são aplicados automaticamente no projeto remoto.

Referências: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Configuração de Auth](https://supabase.com/docs/guides/auth/general-configuration).
