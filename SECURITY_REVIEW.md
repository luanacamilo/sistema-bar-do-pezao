# Revisão de segurança — 05/09/2026

Escopo: código local, dependências instaladas, quatro commits presentes no histórico local e consultas de leitura com a chave publicável do Supabase. Não houve alteração de dados ou permissões no banco durante a revisão. Não foi informado um endereço de produção do site para inspecionar TLS e cabeçalhos HTTP.

## Arquivos recuperados e publicação

As duas migrações foram reconstruídas conforme o conteúdo preparado nesta conversa. O seed foi reconstruído a partir dos dados originais de `src/menuData.js`, com a apresentação anterior, 9 seções e 150 produtos. São arquivos locais recuperados, não scripts reaplicados ao banco.

Os SQLs recuperados contêm estrutura, políticas, produtos e o UUID do administrador. Não contêm senhas, tokens de sessão ou chaves secretas. Conhecer o UUID não permite assinar uma sessão do Supabase nem se tornar administrador. Ele identifica uma conta; caso não queira divulgar esse identificador, use um exemplo em documentação pública e mantenha a configuração específica do ambiente em local privado. Publicar as regras RLS não concede permissão para alterá-las.

A URL do Supabase e a chave publicável são deliberadamente usadas no navegador. A segurança depende do Auth, das permissões e do RLS. Não publicar `.env`, senhas, `sb_secret_*`, JWTs `service_role`, strings de conexão com senha ou backups contendo dados privados.

## Evidências verificadas

- `.env` está ignorado e não está versionado. Nenhum commit local encontrado para esse arquivo.
- A busca por padrões de chaves secretas, chaves privadas e URLs de banco com senha não encontrou candidatos nos arquivos analisados nem nos quatro commits locais disponíveis. Também foram buscados JWTs de service_role nos arquivos atuais. Isso é uma busca por padrões, não uma garantia de ausência de qualquer segredo ou de conteúdo removido do servidor Git.
- `npm audit --json`: zero vulnerabilidades conhecidas reportadas nas dependências instaladas.
- Leitura pública de seções e produtos funciona: 9 seções e 150 produtos visíveis.
- Consulta pública a `cardapio_admin` negada com código PostgreSQL 42501.
- `is_cardapio_admin()` retorna false sem autenticação.
- Cadastros públicos desabilitados (`disable_signup: true`).
- Consultas por produtos indisponíveis não retornaram registros. Como não se sabe se existem produtos ocultos, esse resultado isolado não comprova o filtro RLS.
- `orders`, `service_calls` e `usuario` não foram encontradas no schema cache público consultado; isso não prova ausência dessas tabelas em outros schemas.
- Login usa Supabase Auth; senha não é armazenada pelo código da aplicação. O painel consulta autorização no banco, e as funções de escrita também a verificam.
- Não foram encontrados `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `document.write` no código inspecionado. Os dados do cardápio são renderizados como texto por React.
- O build e o teste de fluxo de autenticação/CRUD com API simulada passaram. O teste simulado não valida as políticas do banco remoto.

## Pontos pendentes e melhorias

1. **Validar escrita real por perfil:** não foram usadas credenciais de administrador nem de uma segunda conta. Portanto, ainda é preciso confirmar INSERT/UPDATE/DELETE com visitante, usuário comum e administrador. As migrações restauradas definem bloqueio de escrita para visitantes e autorização por UUID, mas o estado remoto completo não pode ser deduzido somente das leituras públicas.
2. **Conferir o esquema preexistente:** `CREATE TABLE IF NOT EXISTS` não aplica novas constraints a uma tabela já criada. Conferir preço não negativo, geração dos IDs, chave estrangeira produto → seção, comportamento da exclusão e as restrições da tabela de admin. O arquivo `supabase/auditoria_seguranca.sql` permite inspecionar RLS, políticas, permissões e constraints pelo SQL Editor sem alterar dados.
3. **MFA:** não existe etapa de segundo fator na interface atual. Para maior proteção da conta única, implementar e exigir MFA também no banco; apenas habilitar MFA na conta da plataforma Supabase não adiciona MFA ao login deste aplicativo.
4. **Sessão no navegador:** o SDK persiste a sessão por padrão. Isso é usual para uma SPA, mas torna essencial evitar XSS e sair em computadores compartilhados. Não há tempo de inatividade próprio implementado.
5. **Publicação:** revisar CSP, proteção contra enquadramento (`frame-ancestors`), `X-Content-Type-Options`, política de referência e HTTPS na hospedagem efetiva. Não há configuração de cabeçalhos de produção neste repositório; ela pode existir externamente. Não publicar o servidor de desenvolvimento Vite como servidor de produção.
6. **Configurações do Auth:** conferir senha forte, recuperação de acesso, limites de tentativas e URLs de redirecionamento no painel. Os valores administrativos completos não foram acessados nesta revisão.

Não foi confirmada uma falha crítica explorável no escopo inspecionado. Isso não equivale a uma auditoria completa ou certificação de segurança do banco e da hospedagem.

Fontes: [chaves do Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [limites de autenticação](https://supabase.com/docs/guides/auth/rate-limits), [segurança de senhas](https://supabase.com/docs/guides/auth/password-security).
