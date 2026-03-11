import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";
import EndOfShiftAlert from "./_components/end-of-shift-alert";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">{children}</main>
      <EndOfShiftAlert />
    </SidebarProvider>
  );
}
