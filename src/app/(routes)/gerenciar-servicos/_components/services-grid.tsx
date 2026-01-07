"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ServiceWithDocuments } from "@/types/content-management";

import UpsertServiceForm from "./upsert-service-form";

interface ServicesGridProps {
  services: ServiceWithDocuments[];
}

const ServicesGrid = ({ services }: ServicesGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!services.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum serviço cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <Card key={service.id} className="h-full border">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {service.emphasis && (
                <Badge variant="secondary">Em destaque</Badge>
              )}
            </div>
            <CardDescription>{service.slug}</CardDescription>
            <CardAction>
              <Dialog
                open={editingId === service.id}
                onOpenChange={(open) => setEditingId(open ? service.id : null)}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <UpsertServiceForm
                  service={service}
                  onSuccess={() => setEditingId(null)}
                />
              </Dialog>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {service.description || "Sem descrição cadastrada."}
              </p>
              <div>
                <span className="font-semibold">Requisitos: </span>
                <span>{service.requirements || "Não informado."}</span>
              </div>
              <div>
                <span className="font-semibold">Como solicitar: </span>
                <span>{service.howToApply || "Não informado."}</span>
              </div>
            </div>
            <Separator />
            <div className="text-muted-foreground grid gap-1 text-sm">
              {service.contactEmail && (
                <div className="flex justify-between">
                  <span>E-mail</span>
                  <a
                    href={`mailto:${service.contactEmail}`}
                    className="text-primary"
                  >
                    {service.contactEmail}
                  </a>
                </div>
              )}
              {service.contactPhone && (
                <div className="flex justify-between">
                  <span>Telefone</span>
                  <span>{service.contactPhone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServicesGrid;
