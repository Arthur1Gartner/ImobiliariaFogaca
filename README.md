# Imobiliaria Alceu Fogaca

Monorepo full stack para a Imobiliaria Alceu Fogaca:

- `apps/site`: site publico de alto padrao com listagem, filtros, captacao de leads e contato.
- `apps/dashboard`: CRM separado para corretores gerenciarem imoveis, leads e importacoes.
- `packages/shared`: tipos, dados de marca, fallback local e cliente Supabase.
- `supabase/migrations`: schema Postgres, RLS, storage policies e dados iniciais.

## Stack

- React + Vite + TypeScript para os dois frontends.
- Supabase Auth, Postgres, Storage e Row Level Security.
- Netlify para deploy dos frontends, com headers de seguranca em cada app.
- Cloudflare recomendado para DNS, WAF, rate limiting e Turnstile no formulario publico.

## Como rodar

```bash
npm install
npm run dev:site
npm run dev:dashboard
```

Copie `.env.example` para `.env.local` nos apps ou na raiz e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
Sem essas variaveis os apps rodam em modo demonstracao com dados locais.

## Banco

Crie um projeto Supabase e aplique `supabase/migrations/0001_initial_schema.sql`.
Depois crie usuarios pelo Supabase Auth e insira/atualize o perfil em `profiles` com role `admin`, `broker` ou `assistant`.

## Importacao do site atual

```bash
npm run import:site
```

O script gera um relatorio em `tmp/import-alceu.json` com os dados publicos extraidos do site atual. Imoveis importados devem entrar como `pending_review` antes de publicar.
