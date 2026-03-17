import "server-only";

/**
 * Tipos base de autorização
 */

export type AppRole = "user" | "professional" | "administrator" | "supervisor-geral";

export type UserProfile =
  | "tecnico-geral"
  | "tecnico-atendimento"
  | "tecnico-juridico"
  | "recepcionista"
  | "supervisor-atendimento"
  | "supervisor-juridico"
  | "supervisor-geral";

export type SectorKeyName = string;
export type SectorKeyFilter = ["*"] | SectorKeyName[];

export type PermissionKey =
  // atendimento
  | "tickets.view"
  | "tickets.manage"
  | "treatments.view"
  | "treatments.manage"
  // recepção
  | "clients.view"
  | "clients.manage"
  | "queue.view"
  | "queue.manage"
  // gestão / resultados
  | "results.view.general"
  | "results.view.professionals"
  | "sectors.view"
  | "sectors.manage"
  | "operations.view"
  | "operations.manage";

export type ProfilePermissions = {
  allowedRoutes: string[];
  allowedPermissions: PermissionKey[] | ["*"];
  sectorKeyFilter: SectorKeyFilter;
};

export type UserPermissions = {
  profile: UserProfile;
  role: AppRole;
  routes: string[];
  permissions: PermissionKey[] | ["*"];
  sectorKeyFilter: SectorKeyFilter;
  canAccessRoute: (pathname: string) => boolean;
  can: (permission: PermissionKey) => boolean;
  canAccessSectorKey: (sectorKeyName: SectorKeyName | null | undefined) => boolean;
};

/**
 * Matriz de permissões por profile
 *
 * Observação:
 * - Rotas aqui são padrões simples, sem libs externas de matching.
 * - O matcher em `buildUserPermissions` sabe lidar com caminhos exatos,
 *   prefixos e padrões com `[id]`.
 */

export const PROFILE_PERMISSIONS: Record<UserProfile, ProfilePermissions> = {
  "tecnico-geral": {
    allowedRoutes: [
      "/atendimento",
      "/meus-atendimentos",
      "/profissionais/[id]",
    ],
    allowedPermissions: [
      "tickets.view",
      "tickets.manage",
      "treatments.view",
      "treatments.manage",
    ],
    sectorKeyFilter: ["*"],
  },
  "tecnico-atendimento": {
    allowedRoutes: [
      "/atendimento",
      "/meus-atendimentos",
      "/profissionais/[id]",
    ],
    allowedPermissions: [
      "tickets.view",
      "tickets.manage",
      "treatments.view",
      "treatments.manage",
    ],
    sectorKeyFilter: ["atendimento"],
  },
  "tecnico-juridico": {
    allowedRoutes: [
      "/atendimento",
      "/meus-atendimentos",
      "/profissionais/[id]",
    ],
    allowedPermissions: [
      "tickets.view",
      "tickets.manage",
      "treatments.view",
      "treatments.manage",
    ],
    sectorKeyFilter: ["juridico"],
  },
  "recepcionista": {
    allowedRoutes: [
      "/consumidores",
      "/fila-atendimentos",
      "/profissionais/[id]",
    ],
    allowedPermissions: [
      "clients.view",
      "clients.manage",
      "queue.view",
      "queue.manage",
      "tickets.manage",
    ],
    sectorKeyFilter: ["*"],
  },
  "supervisor-atendimento": {
    allowedRoutes: ["*"],
    allowedPermissions: [
      "tickets.view",
      "tickets.manage",
      "treatments.view",
      "treatments.manage",
      "clients.view",
      "clients.manage",
      "queue.view",
      "queue.manage",
      "results.view.general",
      "results.view.professionals",
      "sectors.view",
      "operations.view",
    ],
    sectorKeyFilter: ["atendimento"],
  },
  "supervisor-juridico": {
    allowedRoutes: ["*"],
    allowedPermissions: [
      "tickets.view",
      "tickets.manage",
      "treatments.view",
      "treatments.manage",
      "clients.view",
      "clients.manage",
      "queue.view",
      "queue.manage",
      "results.view.general",
      "results.view.professionals",
      "sectors.view",
      "operations.view",
    ],
    sectorKeyFilter: ["juridico"],
  },
  "supervisor-geral": {
    allowedRoutes: ["*"],
    allowedPermissions: ["*"],
    sectorKeyFilter: ["*"],
  },
};

function applyRoleOverrides(
  base: ProfilePermissions,
  role: AppRole,
): ProfilePermissions {
  // developer (role) tem acesso total, independente do profile salvo
  if (role === "supervisor-geral") {
    return PROFILE_PERMISSIONS["supervisor-geral"];
  }

  // administrator tem acesso a todas as rotas e permissões de gestão.
  // A filtragem por setor (key_name) continua vindo do profile (ex.: supervisor-atendimento/juridico)
  if (role === "administrator") {
    const mergedPermissions: PermissionKey[] | ["*"] =
      base.allowedPermissions.length === 1 && base.allowedPermissions[0] === "*"
        ? ["*"]
        : (Array.from(
            new Set([
              ...base.allowedPermissions,
              "results.view.general",
              "results.view.professionals",
              "sectors.view",
              "sectors.manage",
              "operations.view",
              "operations.manage",
            ]),
          ) as PermissionKey[]);

    return {
      ...base,
      allowedRoutes: ["*"],
      allowedPermissions: mergedPermissions,
    };
  }

  // user / professional seguem o profile normalmente
  return base;
}

function matchRoute(patterns: string[], pathname: string): boolean {
  if (patterns.includes("*")) return true;

  for (const pattern of patterns) {
    if (pattern === pathname) return true;

    // Padrões com [id], ex: "/profissionais/[id]"
    if (pattern.includes("[id]")) {
      const base = pattern.replace("/[id]", "");
      if (pathname === base) continue;
      if (pathname.startsWith(base + "/")) {
        return true;
      }
    }
  }

  return false;
}

export function buildUserPermissions(user: {
  id: string;
  role?: string | null;
  profile?: string | null;
}): UserPermissions {
  const profile: UserProfile =
    (user.profile as UserProfile | null) ?? "tecnico-atendimento";

  const role: AppRole =
    (user.role as AppRole | null) ??
    // Se não existir role explícito, tratamos como "user"
    "user";

  const baseProfilePerms =
    PROFILE_PERMISSIONS[profile] ??
    PROFILE_PERMISSIONS["tecnico-atendimento"];
  const effective = applyRoleOverrides(baseProfilePerms, role);

  const routes = effective.allowedRoutes;
  const permissions = effective.allowedPermissions;
  const sectorKeyFilter = effective.sectorKeyFilter;

  const can = (permission: PermissionKey) => {
    if (permissions.length === 1 && permissions[0] === "*") {
      return true;
    }

    return (permissions as PermissionKey[]).includes(permission);
  };

  const canAccessRoute = (pathname: string) => {
    return matchRoute(routes, pathname);
  };

  const canAccessSectorKey = (sectorKeyName: SectorKeyName | null | undefined) => {
    if (sectorKeyFilter.length === 1 && sectorKeyFilter[0] === "*") {
      return true;
    }
    if (!sectorKeyName) return false;
    return (sectorKeyFilter as SectorKeyName[]).includes(sectorKeyName);
  };

  return {
    profile,
    role,
    routes,
    permissions,
    sectorKeyFilter,
    canAccessRoute,
    can,
    canAccessSectorKey,
  };
}

/**
 * Helper simples para validar se um determinado setor (por key_name)
 * é acessível de acordo com o filtro do usuário.
 */
export function assertSectorKeyAccess(
  perms: UserPermissions,
  targetSectorKeyName: SectorKeyName | null | undefined,
) {
  if (!perms.canAccessSectorKey(targetSectorKeyName)) {
    throw new Error("Acesso a setor não permitido para este usuário");
  }
}
