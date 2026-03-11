"use client";

import { Headset } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden border-t bg-background p-3"
      aria-label="Navegação mobile"
    >
      <Link href="/atendimento" className="w-full">
        <Button className="w-full gap-2" size="lg">
          <Headset className="size-5" />
          Atendimento
        </Button>
      </Link>
    </nav>
  );
}
