# Procon App

Sistema de atendimento do PROCON com fila, operação por guichê, chamadas em painel e gestão de profissionais.

## Stack e arquitetura

- `Next.js` (App Router) para rotas e rendering.
- `Server Actions` (`next-safe-action`) para mutações seguras.
- `API Routes` para integrações, consultas específicas e cron jobs.
- `Drizzle ORM` + PostgreSQL para persistência.
- `better-auth` para autenticação e sessão.
- `Pusher` para atualização em tempo real entre telas.

### Organização principal

- `src/app/(routes)` páginas autenticadas.
- `src/actions` regras de negócio e mutações.
- `src/app/api` endpoints HTTP e cron.
- `src/db` schema e acesso ao banco.
- `src/lib/authorization.ts` matriz de permissões e filtros por setor.
- `src/lib/realtime.ts` canais e eventos de tempo real.

## Como rodar

```bash
npm install
npm run dev
```

Aplicação local em `http://localhost:3000`.

## Variáveis de ambiente

Obrigatórias:

- `DATABASE_URL`: conexão PostgreSQL.
- `BETTER_AUTH_SECRET`: segredo da autenticação (mínimo 32 chars).
- `NEXT_PUBLIC_APP_URL`: URL base da aplicação.
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`: servidor Pusher.
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`: cliente Pusher.
- `CRON_SECRET`: token de autorização das rotas de cron.

Opcionais:

- `TRUSTED_ORIGINS`: origens adicionais permitidas na autenticação, separadas por vírgula.

## Permissões e acesso

O controle de acesso combina `role` e `profile`.

- `role` define nível global (ex.: `administrator`, `supervisor-geral`).
- `profile` define escopo funcional/setorial (ex.: `tecnico-atendimento`, `recepcionista`).
- Permissões e rotas por perfil ficam em `src/lib/authorization.ts`.
- Filtro por setor usa `sector.key_name` e `canAccessSectorKey(...)`.

Exemplos de permissões:

- `tickets.view`, `tickets.manage`
- `treatments.view`, `treatments.manage`
- `clients.view`, `clients.manage`
- `operations.view`, `operations.manage`
- `results.view.general`, `results.view.professionals`

## Fluxos principais

### 1) Fila de atendimento

1. Recepção cria ticket (`createTicket`).
2. Ticket entra como `pending`.
3. Profissional chama próximo (`callNextTicket`).
4. Ticket muda para `in-attendance`; operação também muda.
5. Ao finalizar (`endService`), ticket vira `finished` e operação volta para `operating`.

### 2) Operações e pausas

1. Profissional inicia operação (`startOperation`) vinculada a um guichê.
2. Pode pausar (`startPause`) e retomar (`endPause`).
3. Encerramento manual via `finishOperation` ou automático por cron.

### 3) Tempo real (Pusher)

Eventos principais:

- Canal `tickets`: `ticket-created`, `ticket-updated`, `tickets-changed`
- Canal `operations`: `operation-started`, `operation-paused`, `operation-resumed`, `operation-finished`, `auto-call-check`
- Canal `clients`: `clients-changed`
- Canal `professionals`: `professionals-changed`
- Canal `painel`: `nova-chamada`, `ultimas-chamadas`

As telas assinam eventos via hooks cliente para atualizar UI sem polling.

## Cron jobs

Rotas protegidas por header:

```text
Authorization: Bearer <CRON_SECRET>
```

Endpoints:

- `GET /api/cron/close-active-operations`
  - fecha operações ativas e libera guichês.
- `GET /api/cron/close-stale-treatments`
  - encerra atendimentos travados e finaliza tickets relacionados.
- `GET /api/cron/end-of-shift-alert`
  - emite alerta de encerramento no canal `sistema`.

## Qualidade e validação

- Lint: `npm run lint`
- Build: `npm run build`

Recomendado validar manualmente:

- criação/cancelamento/chamada de ticket;
- pausa e retomada de operação;
- atualização em tempo real entre telas;
- execução dos endpoints de cron com token.
