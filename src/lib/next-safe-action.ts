import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "@/lib/auth";
import { type PermissionKey, buildUserPermissions } from "@/lib/authorization";

export const actionClient = createSafeActionClient();

export const authActionClient = createSafeActionClient().use(
  async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    return next({ ctx: { session } });
  },
);

export const adminActionClient = createSafeActionClient().use(
  async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    if (
      session.user.role !== "administrator" &&
      session.user.role !== "supervisor-geral"
    ) {
      throw new Error("Acesso negado");
    }

    return next({ ctx: { session } });
  },
);

export const permissionedActionClient = (permission: PermissionKey) =>
  createSafeActionClient().use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const perms = buildUserPermissions({
      id: session.user.id,
      role: session.user.role,
      profile: (session.user as any).profile,
    });

    if (!perms.can(permission)) {
      throw new Error("Acesso negado");
    }

    return next({ ctx: { session, perms } });
  });
