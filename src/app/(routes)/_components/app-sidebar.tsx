"use client";

import React from "react";
import {
  BookUser,
  BriefcaseBusinessIcon,
  ChartBarBig,
  Headset,
  LaptopMinimalCheck,
  ListCheck,
  ListOrdered,
  LogOutIcon,
  Users,
} from "lucide-react";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth.client";
import type { AppRole, UserProfile } from "@/lib/authorization";

type SidebarItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SidebarSections = {
  enterprise: SidebarItem[];
  results: SidebarItem[];
  professionals: SidebarItem[];
  clients: SidebarItem[];
};

function getSidebarSectionsForUser(args: {
  role?: string;
  profile?: string;
  userId?: string;
}): SidebarSections {
  const role = (args.role ?? "user") as AppRole;
  const profile = (args.profile ?? "tecnico-atendimento") as UserProfile;
  const userId = args.userId;

  const base: SidebarSections = {
    enterprise: [],
    results: [],
    professionals: [],
    clients: [],
  };

  // Developer / administrator enxergam tudo
  if (role === "administrator" || role === "supervisor-geral") {
    return {
      enterprise: [
        { title: "Setores", url: "/setores", icon: BriefcaseBusinessIcon },
        { title: "Operações", url: "/operacoes", icon: LaptopMinimalCheck },
      ],
      results: [
        { title: "Resultados de Gerais", url: "/dashboard", icon: ChartBarBig },
        { title: "Resultados de Profissionais", url: "/profissionais", icon: Users },
      ],
      professionals: [
        { title: "Operação", url: "/atendimento", icon: Headset },
        { title: "Meus atendimentos", url: "/meus-atendimentos", icon: ListCheck },
      ],
      clients: [
        { title: "Gerenciar consumidores", url: "/consumidores", icon: BookUser },
        { title: "Fila de atendimentos", url: "/fila-atendimentos", icon: ListOrdered },
      ],
    };
  }

  if (
    profile === "tecnico-geral" ||
    profile === "tecnico-atendimento" ||
    profile === "tecnico-juridico"
  ) {
    const myProfileUrl = userId ? `/profissionais/${userId}` : "/profissionais";
    return {
      ...base,
      professionals: [
        { title: "Operação", url: "/atendimento", icon: Headset },
        { title: "Meus atendimentos", url: "/meus-atendimentos", icon: ListCheck },
        { title: "Meu perfil", url: myProfileUrl, icon: Users },
      ],
    };
  }

  if (profile === "recepcionista") {
    const myProfileUrl = userId ? `/profissionais/${userId}` : "/profissionais";
    return {
      ...base,
      clients: [
        { title: "Gerenciar consumidores", url: "/consumidores", icon: BookUser },
        { title: "Fila de atendimentos", url: "/fila-atendimentos", icon: ListOrdered },
        { title: "Meu perfil", url: myProfileUrl, icon: Users },
      ],
    };
  }

  if (profile === "supervisor-atendimento" || profile === "supervisor-juridico") {
    return {
      enterprise: [
        { title: "Setores", url: "/setores", icon: BriefcaseBusinessIcon },
      ],
      results: [
        { title: "Resultados de Gerais", url: "/dashboard", icon: ChartBarBig },
        { title: "Resultados de Profissionais", url: "/profissionais", icon: Users },
      ],
      professionals: [
        { title: "Operação", url: "/atendimento", icon: Headset },
        { title: "Meus atendimentos", url: "/meus-atendimentos", icon: ListCheck },
      ],
      clients: [
        { title: "Gerenciar consumidores", url: "/consumidores", icon: BookUser },
        { title: "Fila de atendimentos", url: "/fila-atendimentos", icon: ListOrdered },
      ],
    };
  }

  // Fallback para roles básicos: mostra apenas atendimento
  return {
    ...base,
    professionals: [
      { title: "Operação", url: "/atendimento", icon: Headset },
    ],
  };
}

export function AppSidebar() {
  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const { setTheme, resolvedTheme } = useTheme();

  const role = session.data?.user?.role;
  const profile = (session.data?.user as any)?.profile as string | undefined;
  const userId = session.data?.user?.id;

  const sections = getSidebarSectionsForUser({ role, profile, userId });

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const userInitials = session.data?.user?.name
    ?.split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-background flex items-center justify-center border-b p-4" />

      <SidebarContent className="bg-background">
        {!!sections.enterprise.length && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.enterprise.map((item) => {
                  const href = item.url;
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!!sections.results.length && (
          <SidebarGroup>
            <SidebarGroupLabel>Resultados</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.results.map((item) => {
                  const href = item.url;
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!!sections.professionals.length && (
          <SidebarGroup>
            <SidebarGroupLabel>Atendimento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.professionals.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!!sections.clients.length && (
          <SidebarGroup>
            <SidebarGroupLabel>Recepção</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.clients.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-background border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-green-500 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                    <AvatarImage src={session.data?.user?.image || ""} />
                    {!session.data?.user?.image && (
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="group-data-[state=collapsed]:hidden">
                    <p className="text-sm">{session.data?.user?.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
