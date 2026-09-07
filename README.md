<div align="center">

# Bar do Pezão

**Site institucional + cardápio digital + painel administrativo**

Desde 1986 · Americana – SP

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

</div>

---

## O que é

Uma aplicação React (SPA) de página única com quatro áreas:

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/` | Site comercial — história, destaques, localização e contato | Público |
| `/cardapio` | Cardápio digital com busca, filtros por categoria e marcação de esgotados | Público |
| `/admin/login` | Login do administrador (Supabase Auth) | Público |
| `/admin/painel` | Criar, editar, excluir, ordenar e esgotar produtos e seções | Autenticado + autorizado |

Não há pedidos online, chamada de garçom ou cadastro de clientes — o foco é divulgação e gestão do cardápio.

---

## Começando

### Pré-requisitos

- **Node.js 18+** (`node -v`)
- Um projeto no [Supabase](https://supabase.com) com as migrações aplicadas (veja [`supabase/README.md`](supabase/README.md))

### Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
```

Preencha o `.env` com os dados do seu projeto Supabase (Project Settings → API):

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publicavel
```

> **Use apenas a chave publicável (anon).** Ela é embarcada no site e visível a qualquer visitante — isso é normal. A proteção contra escrita indevida é o RLS do banco, não o sigilo da chave. Nunca coloque `service_role` ou senha de banco em variáveis `VITE_`.

### Rodando

```bash
npm run dev      # servidor de desenvolvimento -> http://localhost:5173
npm run build    # build de produção -> dist/
npm run preview  # serve o build localmente para conferência
```

---

## Testes

Testes end-to-end com Playwright e API simulada (não tocam no banco remoto):

```bash
npx playwright install chromium   # só na primeira vez
npx playwright test
```

As políticas RLS do banco precisam ser validadas manualmente após cada migração — veja a seção de validação em [`supabase/README.md`](supabase/README.md).

---

## Estrutura

```
sistema-bar-do-pezao/
├── src/
│   ├── App.jsx            # rotas + landing page
│   ├── MenuCatalog.jsx    # cardápio público (/cardapio)
│   ├── Admin.jsx          # login e painel administrativo
│   ├── menuData.js        # dados de fallback do cardápio
│   ├── lib/
│   │   ├── supabaseClient.js  # inicialização do cliente
│   │   └── menuApi.js         # leitura/escrita do cardápio
│   └── *.css              # estilos por área
├── public/                # logo e imagens estáticas
├── supabase/
│   ├── migrations/        # migrações SQL numeradas
│   ├── seed.sql           # seções e produtos iniciais
│   └── README.md          # guia de banco, auth e autorização
└── tests/                 # specs do Playwright
```

---

## Como funciona a autorização

1. O visitante lê `secao` e `produto` diretamente do Supabase — inclusive itens esgotados.
2. O administrador entra em `/admin/login` com e-mail e senha (Supabase Auth).
3. O frontend chama `is_cardapio_admin()` só para decidir o que mostrar na interface.
4. **A autorização real de toda escrita é feita pelo RLS do Postgres** — apenas o UUID cadastrado em `cardapio_admin` (uma única conta) pode criar, editar ou excluir. Esconder botões no frontend não é segurança; o RLS é.

O estado "esgotado" usa `produto.ic_disponivel` (`true` = disponível, `false` = esgotado). O item continua visível no cardápio com um aviso.

---

## Deploy

1. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de build.
2. Rode `npm run build`.
3. Publique a pasta `dist/` com **fallback de SPA** para `index.html` (todas as rotas servem o mesmo arquivo).
4. Em Supabase → Authentication: ajuste **Site URL** e **Redirect URLs** para o domínio publicado, desative **Allow new users to sign up** e o login anônimo, e use uma senha forte na conta de administrador.

---

<div align="center">

Desenvolvido por **Luana Camilo**

</div>
