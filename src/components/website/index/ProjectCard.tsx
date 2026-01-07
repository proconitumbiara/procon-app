import Link from "next/link";

import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  name: string;
  description: string;
  href: string;
}

export default function ProjectCard({
  name,
  description,
  href,
}: ProjectCardProps) {
  return (
    <div className="bg-card border-border group hover:border-primary flex h-full flex-col rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors duration-300">
        {name}
      </h3>
      <p className="text-muted-foreground group-hover:text-foreground/80 mb-4 grow text-sm transition-colors duration-300">
        {description}
      </p>
      <div className="mt-auto flex justify-end">
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 group-hover:scale-105"
        >
          <Link href={href} className="no-underline">
            Ver Mais
          </Link>
        </Button>
      </div>
    </div>
  );
}
