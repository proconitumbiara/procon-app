"use client";

import { User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";

export interface ProfessionalListCardProps {
  id: string;
  name: string;
  role: string;
}

const ProfessionalListCard = ({ id, name, role }: ProfessionalListCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const accessLabel =
    role === "administrator" ? "Administrador" : "Usuário Padrão";

  return (
    <Link
      href={`/profissionais/${id}`}
      className="group block no-underline focus:outline-none focus-visible:outline-none"
    >
      <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary-foreground/5 hover:border-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-muted text-muted-foreground text-lg transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                {initials || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <h3 className="truncate text-muted-foreground text-base font-normal transition-all duration-200 group-hover:font-semibold group-hover:text-primary">
              {name}
            </h3>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ProfessionalListCard;
