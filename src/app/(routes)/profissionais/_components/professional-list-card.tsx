"use client";

import { ExternalLink, User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials || <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{name}</h3>
            <Badge variant="secondary" className="mt-1">
              {accessLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full" variant="default">
          <Link href={`/profissionais/${id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver página
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalListCard;
