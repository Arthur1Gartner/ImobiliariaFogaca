# Supabase

## Aplicacao inicial

1. Crie um projeto Supabase.
2. Aplique `migrations/0001_initial_schema.sql`.
3. Crie usuarios em Supabase Auth.
4. Defina a role do usuario em `app_metadata`:

```json
{
  "role": "admin"
}
```

Roles aceitas: `admin`, `broker`, `assistant`.

## Politicas principais

- Visitantes anonimos leem apenas imoveis `published` + `approved`.
- Visitantes podem inserir leads com `lgpd_accepted = true`.
- Corretores autenticados podem criar, editar, publicar e arquivar imoveis.
- Leads e atividades sao visiveis apenas para usuarios autenticados do dashboard.
- `service_role` nunca deve ir para o frontend.

## Storage

Crie um bucket `property-media`. Em producao, use URLs publicas somente para imagens de imoveis publicados ou assine URLs em uma camada server-side.
