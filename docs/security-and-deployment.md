# Seguranca e Deploy

## Supabase

- Use `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nos frontends.
- Nunca use `service_role` em `apps/site` ou `apps/dashboard`.
- Configure a role do usuario em `auth.users.raw_app_meta_data`, por exemplo `{ "role": "admin" }`.
- Aplique a migration inicial e rode o SQL Advisors do Supabase antes de producao.
- Ative MFA para administradores e convide corretores com e-mails individuais.

## Netlify

- Deploy separado recomendado:
  - Site publico: `apps/site/netlify.toml`.
  - Dashboard: `apps/dashboard/netlify.toml`.
- Configure variaveis no painel da Netlify, nao no repositorio.
- Os headers ja incluem CSP, X-Frame-Options, Referrer-Policy e Permissions-Policy.

## Cloudflare

- Use Cloudflare como DNS e protecao de borda.
- Ative WAF Managed Rules e rate limiting nos endpoints de formulario.
- Adicione Turnstile no formulario publico antes de producao para reduzir spam de leads.
- Use regras separadas para `dashboard` com protecao adicional, como Access ou allowlist se fizer sentido.

## GitHub

- Proteja a branch principal com checks de build/typecheck.
- Use GitHub Secrets para tokens de deploy, nunca arquivos `.env`.
- Abra PRs para mudancas de migration e revise RLS antes de aplicar no banco de producao.
