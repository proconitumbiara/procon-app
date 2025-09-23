"use client";

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

// Menu items.
const itemsEnterprise = [

  {
    title: "Setores",
    url: "/users/sectors",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Operações",
    url: "/users/operations",
    icon: LaptopMinimalCheck,
  },
  {
    title: "Profissionais",
    url: "/users/users-professionals",
    icon: Users,
  },
  {
    title: "Atendimentos",
    url: "/users/dashboard",
    icon: ChartBarBig,
  },
];

const itemsProfessionals = [
  {
    title: "Operação",
    url: "/users/professionals-services",
    icon: Headset,
  },
  {
    title: "Meus atendimentos",
    url: "/users/my-services",
    icon: ListCheck,
  },
];

const itemsClients = [
  {
    title: "Gerenciar consumidores",
    url: "/users/clients",
    icon: BookUser,
  },
  {
    title: "Fila de atendimentos",
    url: "/users/pending-appointments",
    icon: ListOrdered,
  },
];

export function AppSidebar() {
  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const { setTheme, resolvedTheme } = useTheme();

  const role = session.data?.user?.role;

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
        {(role === "administrator") && (
          <SidebarGroup>
            <SidebarGroupLabel>Administradores</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {itemsEnterprise.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
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

        <SidebarGroup>
          <SidebarGroupLabel>Atendimento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsProfessionals.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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

        <SidebarGroup>
          <SidebarGroupLabel>Recepção</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsClients.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
