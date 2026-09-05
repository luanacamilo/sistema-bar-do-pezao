# Bar do Pezão

Site comercial em `/`, cardápio público em `/cardapio` e edição autenticada em `/admin/painel` (login em `/admin/login`).

## Desenvolvimento

Configure `.env` conforme `.env.example`. Execute `npm install` e `npm run dev`. Use `npm run build` para gerar a versão de produção.

## Supabase

Consulte [as instruções de banco, migração, carga inicial e autorização do administrador](supabase/README.md).

O cardápio consulta `secao` e `produto`. O painel permite criar, editar, excluir, ordenar e ocultar produtos. A autenticação usa Supabase Auth e a autorização depende das políticas RLS e do UUID cadastrado em `cardapio_admin`. Não há pedidos, chamadas de garçom ou cadastro público na interface.

Para deploy, configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` antes do build e o fallback de rotas SPA para `index.html`.

## Testes

Execute `npx playwright test` para verificar o frontend com API simulada. Se necessário, instale o navegador com `npx playwright install chromium`. Esses testes não validam as políticas do banco remoto; elas precisam ser verificadas após a migração.
