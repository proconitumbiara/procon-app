import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";
import EndOfShiftAlert from "./_components/end-of-shift-alert";
import MobileBottomNav from "./_components/mobile-bottom-nav";
import PendingTicketAlert from "./_components/pending-ticket-alert";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full pb-20 sm:pb-0">{children}</main>
      <EndOfShiftAlert />
      <MobileBottomNav />
      <PendingTicketAlert />
    </SidebarProvider>
  );
}
