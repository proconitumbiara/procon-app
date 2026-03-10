# Cursor Rules — Next.js Stack: Boas Práticas & Segurança

> Stack: **Next.js · Better Auth · Drizzle ORM · Lucide React · Tailwind CSS · Zod · Pusher**

---

## 1. Princípios Gerais

- Escreva código **legível, previsível e auditável** — clareza supera cleverness.
- Prefira **composição sobre herança**; funções puras sobre side-effects implícitos.
- Todo código novo deve ser tipado com **TypeScript strict mode** (`strict: true` no tsconfig).
- Nunca faça commit de segredos, tokens ou chaves de API — use `.env.local` e valide com Zod no boot.
- Mantenha o princípio do **menor privilégio**: cada módulo acessa apenas o que precisa.

---

## 2. Estrutura de Pastas (App Router)

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── (auth)/             # Grupo de rotas protegidas por autenticação
│   ├── (public)/           # Rotas públicas
│   ├── api/                # Route Handlers
│   └── layout.tsx
├── components/
│   ├── ui/                 # Primitivos de UI (Tailwind + Lucide)
│   └── features/           # Componentes de domínio
├── lib/
│   ├── auth.ts             # Configuração Better Auth
│   ├── db/                 # Drizzle: schema, migrations, client
│   ├── pusher/             # Cliente e servidor Pusher
│   ├── validations/        # Schemas Zod reutilizáveis
│   └── utils.ts
├── hooks/                  # Custom React hooks
├── server/                 # Server Actions e lógica server-only
└── types/                  # Tipos globais e inferidos
```

- **Nunca importe** módulos `server/` ou `lib/db/` em Client Components.
- Use o marcador `"use server"` e `"use client"` **explicitamente** em todo arquivo que precisar.

---

## 3. Next.js — App Router

### Server vs. Client Components

```tsx
// ✅ Server Component (padrão — sem marcador)
export default async function Page() {
  const data = await fetchData(); // fetch direto, sem useEffect
  return <List items={data} />;
}

// ✅ Client Component — apenas quando necessário (estado, eventos, browser APIs)
("use client");
import { useState } from "react";
```

- **Prefira Server Components**. Mova interatividade para folhas da árvore.
- Nunca passe dados sensíveis (tokens, segredos) como props de Server → Client Component.
- Use `next/headers` apenas em Server Components e Route Handlers.

### Route Handlers (API)

```ts
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1).max(100) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // lógica de negócio...
  return NextResponse.json({ ok: true });
}
```

- **Sempre valide** o corpo da requisição com Zod antes de qualquer processamento.
- Retorne erros genéricos ao cliente — log interno com detalhes.
- Aplique rate limiting em rotas públicas sensíveis.

### Server Actions

```ts
"use server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({ title: z.string().min(1) });

export async function createItem(formData: FormData) {
  const session = await auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.flatten() };

  // inserção no banco...
  revalidatePath("/dashboard");
}
```

- Sempre verifique a sessão **dentro** da Server Action — nunca confie apenas no middleware.
- Nunca exponha stack traces ao usuário final.

---

## 4. Better Auth

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // renova a cada 24h
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Regras de Autenticação

- **Nunca** armazene senhas em texto plano; confie no hashing do Better Auth.
- Valide a sessão no servidor em **toda** rota e Server Action protegida.
- Use `auth.api.getSession({ headers })` em Route Handlers.
- Revogue sessões ao detectar comportamento suspeito.
- Configure `NEXTAUTH_SECRET` / segredos de sessão com entropia ≥ 32 bytes.
- Habilite CSRF protection (padrão no Better Auth — não desative).

```ts
// Middleware de proteção de rotas
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

---

## 5. Drizzle ORM

```ts
// lib/db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// lib/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
```

### Regras de Banco de Dados

- **Nunca** concatene strings para montar queries — use sempre o query builder do Drizzle.
- Defina `relations()` explicitamente para evitar N+1 queries acidentais.
- Use **migrations** versionadas (`drizzle-kit generate` → `drizzle-kit migrate`); nunca altere schema em produção sem migration.
- Princípio do menor privilégio: o usuário de banco da aplicação não deve ter permissão de `DROP` ou `ALTER`.
- Indexe colunas usadas em filtros frequentes (`WHERE`, `JOIN`, `ORDER BY`).
- Dados sensíveis (CPF, cartão) devem ser **criptografados** antes de persistir.
- Habilite Row-Level Security (RLS) no PostgreSQL para dados multi-tenant.

```ts
// ✅ Query tipada e segura
const userPosts = await db.query.posts.findMany({
  where: (posts, { eq }) => eq(posts.userId, session.user.id),
  with: { author: true },
  limit: 20,
});
```

---

## 6. Validação com Zod

```ts
// lib/validations/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Requer letra maiúscula")
    .regex(/[0-9]/, "Requer número"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Regras de Validação

- **Todo dado externo** (formulários, API, query params, env vars) deve ser validado com Zod.
- Valide variáveis de ambiente no startup:

```ts
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  PUSHER_APP_ID: z.string(),
  PUSHER_KEY: z.string(),
  PUSHER_SECRET: z.string(),
  PUSHER_CLUSTER: z.string(),
  NEXT_PUBLIC_PUSHER_KEY: z.string(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
});

export const env = envSchema.parse(process.env);
```

- Use `safeParse` em contextos onde o erro deve ser tratado (formulários).
- Use `parse` + try/catch em contextos onde o erro é inesperado (env, configs).
- Reutilize schemas — evite duplicação entre frontend e backend.
- Infira tipos com `z.infer<typeof schema>` — nunca duplique interfaces manualmente.

---

## 7. Pusher (Tempo Real)

```ts
// lib/pusher/server.ts — apenas server-side
import PusherServer from "pusher";
import { env } from "@/lib/env";

export const pusherServer = new PusherServer({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true, // ✅ sempre true
});
```

```ts
// lib/pusher/client.ts — apenas client-side
import PusherClient from "pusher-js";
import { env } from "@/lib/env";

export const pusherClient = new PusherClient(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  forceTLS: true, // ✅ sempre true
});
```

### Regras de Tempo Real

- **Nunca** exponha `PUSHER_SECRET` ou `PUSHER_APP_ID` ao cliente.
- Use **Private Channels** (`private-`) para dados do usuário; **Presence Channels** (`presence-`) para salas colaborativas.
- Autentique canais privados via endpoint `/api/pusher/auth` protegido por sessão:

```ts
// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id")!;
  const channel = params.get("channel_name")!;

  const authResponse = pusherServer.authorizeChannel(socketId, channel, {
    user_id: session.user.id,
    user_info: { name: session.user.name },
  });

  return NextResponse.json(authResponse);
}
```

- Valide os dados **no servidor** antes de emitir eventos — nunca confie em payload do cliente.
- Implemente lógica de reconexão no cliente para lidar com drops de rede.

---

## 8. Tailwind CSS

```tsx
// ✅ Use cn() para classes condicionais — evite string interpolation manual
import { cn } from "@/lib/utils";

<div
  className={cn(
    "rounded-lg border p-4 transition-colors",
    isActive && "border-primary bg-primary/10",
    isDisabled && "cursor-not-allowed opacity-50",
  )}
/>;
```

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Regras de Estilo

- Defina **design tokens** no `tailwind.config.ts` (cores, espaçamentos, tipografia da marca).
- Extraia componentes repetitivos — evite duplicar longas strings de classes.
- Prefira variantes semânticas (`text-destructive`, `bg-muted`) a valores brutos.
- Garanta **contraste de acessibilidade** mínimo WCAG AA (4.5:1 para texto).
- Use `dark:` variants consistentemente para suporte a modo escuro.

---

## 9. Lucide React

```tsx
// ✅ Importe apenas os ícones necessários (tree-shaking automático)
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// ✅ Padronize tamanhos via props ou className
<AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />

// ✅ Ícones decorativos devem ter aria-hidden
// ✅ Ícones funcionais devem ter aria-label
<button aria-label="Fechar modal">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

- Nunca hardcode dimensões fora do sistema de design — use classes Tailwind.
- Agrupe ícones em um arquivo `icons.ts` se o projeto usar muitos deles.

---

## 10. Segurança — Checklist Geral

### Headers HTTP

Configure em `next.config.ts`:

```ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // ajuste conforme necessário
      `connect-src 'self' wss://*.pusher.com https://sockjs-*.pusher.com`,
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
    ].join("; "),
  },
];
```

### Proteções Essenciais

| Ameaça                  | Mitigação                                                |
| ----------------------- | -------------------------------------------------------- |
| XSS                     | React escapa por padrão; evite `dangerouslySetInnerHTML` |
| SQL Injection           | Drizzle query builder — nunca concatene SQL              |
| CSRF                    | Better Auth habilita por padrão                          |
| Broken Auth             | Valide sessão em **toda** rota protegida                 |
| Sensitive Data Exposure | Nunca logue senhas, tokens ou PII                        |
| Mass Assignment         | Sempre use Zod para filtrar campos permitidos            |
| Rate Limiting           | Aplique em `/api/auth/*` e endpoints sensíveis           |

### Variáveis de Ambiente

```bash
# .env.local — NUNCA commitar este arquivo
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ chars gerado com: openssl rand -base64 32>
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=mt1

# Públicas (expostas ao browser) — apenas chaves não-secretas
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

- Adicione `.env*.local` ao `.gitignore`.
- Use `.env.example` (sem valores) para documentar as variáveis necessárias.
- Valide todas as env vars com Zod no startup (ver seção 6).

---

## 11. Qualidade de Código

### Convenções de Nomenclatura

| Tipo            | Convenção            | Exemplo             |
| --------------- | -------------------- | ------------------- |
| Componentes     | PascalCase           | `UserCard.tsx`      |
| Hooks           | camelCase + `use`    | `useSessionUser.ts` |
| Server Actions  | camelCase + verbo    | `createPost.ts`     |
| Schemas Zod     | camelCase + `Schema` | `createPostSchema`  |
| Tipos inferidos | PascalCase           | `CreatePostInput`   |
| Constantes      | SCREAMING_SNAKE      | `MAX_FILE_SIZE`     |

### Padrões de Erro

```ts
// ✅ Erro tipado e tratável
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createPost(input: unknown): Promise<ActionResult<Post>> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }
  try {
    const post = await db.insert(posts).values(parsed.data).returning();
    return { success: true, data: post[0] };
  } catch {
    return { success: false, error: "Erro interno" };
  }
}
```

### Performance

- Use `React.Suspense` + `loading.tsx` para streaming de Server Components.
- Prefira `next/image` para todas as imagens — otimização automática.
- Prefira `next/link` para navegação interna — prefetch automático.
- Memoize computações caras com `useMemo` / `useCallback` apenas quando necessário (meça antes).
- Use `unstable_cache` / `React.cache` para cachear queries de banco no servidor.

---

## 12. Git & CI

- **Commits** seguem Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Nunca commite diretamente em `main` — use Pull Requests com revisão.
- Configure **branch protection** com status checks obrigatórios.
- Pipeline mínimo de CI:
  1. `tsc --noEmit` — checagem de tipos
  2. `eslint` — linting
  3. `vitest` — testes unitários
  4. Build de produção

---

_Mantenha este arquivo atualizado conforme a stack evolui. Em caso de dúvida, priorize segurança e legibilidade._
