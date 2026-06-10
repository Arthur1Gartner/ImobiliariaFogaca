# Deploy na Vercel

Este repositorio tem dois frontends Vite:

- Site publico em `apps/site`.
- Dashboard/CRM em `apps/dashboard`.

## Um projeto Vercel com duas rotas

Use esta opcao se quiser publicar tudo no mesmo dominio:

- `/`: site publico.
- `/dashboard/`: dashboard/CRM.

Configuracao do projeto na Vercel:

- Root Directory: raiz do repositorio, sem selecionar `apps/site` ou `apps/dashboard`.
- Build Command: `npm run build:vercel`.
- Output Directory: `dist-vercel`.
- Install Command: `npm install`.

O arquivo `vercel.json` ja define esses valores. Se a Vercel ainda mostrar apenas o dashboard na raiz, confira se o projeto nao esta com Root Directory apontando para `apps/dashboard`, porque nesse caso a Vercel ignora o `vercel.json` da raiz.

Variaveis de ambiente:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Dois projetos Vercel separados

Use esta opcao se quiser dominios separados, por exemplo `site.com.br` e `dashboard.site.com.br`.

Projeto do site:

- Root Directory: raiz do repositorio.
- Build Command: `npm run build:site`.
- Output Directory: `apps/site/dist`.

Projeto do dashboard:

- Root Directory: raiz do repositorio.
- Build Command: `npm run build:dashboard`.
- Output Directory: `apps/dashboard/dist`.

Nos dois projetos, cadastre as mesmas variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
