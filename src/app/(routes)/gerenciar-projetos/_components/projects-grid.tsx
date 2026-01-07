"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProjectWithDocuments } from "@/types/content-management";

import UpsertProjectForm from "./upsert-project-form";

interface ProjectsGridProps {
  projects: ProjectWithDocuments[];
}

const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          new Date(b.createdAT).getTime() - new Date(a.createdAT).getTime(),
      ),
    [projects],
  );

  if (!projects.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum projeto cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sortedProjects.map((project) => (
        <Card key={project.id} className="h-full border">
          <CardHeader className="space-y-4 border-b pb-4">
            {project.coverImageUrl && (
              <div className="relative h-48 w-full overflow-hidden rounded-md border">
                <Image
                  src={project.coverImageUrl}
                  alt={`Capa do projeto ${project.title}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex w-full items-center gap-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.emphasis && (
                    <Badge variant="secondary">Em destaque</Badge>
                  )}
                </div>
                <Dialog
                  open={editingId === project.id}
                  onOpenChange={(open) =>
                    setEditingId(open ? project.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <UpsertProjectForm
                    project={project}
                    onSuccess={() => setEditingId(null)}
                  />
                </Dialog>
              </div>
              <CardDescription>{project.slug}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {project.summary || "Sem resumo disponível."}
              </p>
              <p className="text-sm">
                {project.description || "Sem descrição cadastrada."}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsGrid;
