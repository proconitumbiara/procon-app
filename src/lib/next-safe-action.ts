import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "@/lib/auth";

export const actionClient = createSafeActionClient();

export const authActionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  return next({ ctx: { session } });
});

export const adminActionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  if (session.user.role !== "administrator") {
    throw new Error("Acesso negado");
  }

  return next({ ctx: { session } });
});
