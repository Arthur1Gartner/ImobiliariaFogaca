# Prompt Revisado Full Stack

Crie uma plataforma full stack para a Imobiliaria Alceu Fogaca, com dois produtos separados:

1. Site publico de alto padrao para clientes finais.
2. Dashboard/CRM privado para corretores cadastrarem, editarem, publicarem, arquivarem e retirarem imoveis do site publico.

## Identidade

- Marca: Imobiliaria Alceu Fogaca.
- CRECI: 71432-F.
- Local: Ilha Comprida, Litoral Sul de Sao Paulo.
- Estilo publico: luxo refinado, editorial, preto profundo `#0D0D0D`, dourado `#C9A84C`, off-white `#FAFAF8`, cinzas escuros, tipografia serifada elegante para titulos e sans limpa para UI.
- Estilo dashboard: ferramenta operacional premium, compacta, clara, com tabelas, filtros, status e formularios eficientes.

## Site publico

- Navbar fixa com Comprar, Alugar, Institucional, Contato e CTA WhatsApp.
- Hero com imagem realista de imovel costeiro, overlay escuro, headline forte e CTAs.
- Faixa de provas reais, sem inventar metricas comerciais nao confirmadas.
- Listagem de imoveis vinda do banco, com filtros por contrato e tipo.
- Cards com imagem, tipo, bairro, cidade, titulo, preco, area, quartos e vagas.
- Modal de interesse por imovel com nome, telefone, e-mail opcional, LGPD e validacao manual.
- Sobre, valores, depoimentos placeholder ate cadastrar avaliacoes reais, contato e footer.
- Cookie banner persistido em localStorage.

## Dashboard/CRM

- App separado para corretores, idealmente em subdominio `dashboard`.
- Login via Supabase Auth.
- Modulos: Dashboard, Imoveis, Leads, Corretores, Importacao, Configuracoes.
- CRUD de imoveis com status `draft`, `pending_review`, `published`, `archived`.
- Publicacao no site apenas para imoveis `published` e `approved`.
- Leads capturados do site com funil `new`, `contacted`, `visit`, `proposal`, `closed`, `lost`.
- Cadastro manual como fonte principal. Importacao do site antigo deve ser opcional e sempre entrar em revisao.

## Banco e seguranca

- Supabase Postgres com RLS em todas as tabelas publicas.
- Visitante anonimo so pode ler imoveis publicados/aprovados e inserir leads com aceite LGPD.
- Corretores autenticados gerenciam imoveis e leads conforme role em `app_metadata`.
- Nunca expor `service_role` no frontend.
- Storage para fotos de imoveis com escrita autenticada.
- Headers de seguranca: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy e Permissions-Policy.
- Cloudflare recomendado para DNS, WAF, rate limiting, DDoS e Turnstile nos formularios publicos.

## Deploy

- Netlify ou Cloudflare Pages para os dois frontends.
- Site publico e dashboard devem ter builds e variaveis separadas.
- Ambiente sem Supabase deve rodar em modo demo com dados locais.
