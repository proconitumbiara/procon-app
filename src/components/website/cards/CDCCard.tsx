import { ExternalLink, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CDCCardProps {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
}

export default function CDCCard({
  title,
  description,
  href,
  icon: Icon,
}: CDCCardProps) {
  return (
    <div className="bg-card border-border group hover:border-primary relative flex h-full flex-col overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
      {Icon && (
        <Icon
          className="text-muted-foreground/10 group-hover:text-primary/20 absolute bottom-0 left-0 h-22 w-22 -translate-x-6 translate-y-6 transition-all duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
      )}
      <h3 className="text-foreground group-hover:text-primary relative z-10 mb-2 text-xl font-semibold transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground group-hover:text-foreground/80 relative z-10 mb-4 grow text-sm transition-colors duration-300">
        {description}
      </p>
      <div className="relative z-10 mt-auto flex justify-end">
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 group-hover:scale-105"
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 no-underline"
            aria-label={`${title} (abre em nova aba)`}
          >
            Acessar
            <ExternalLink
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              aria-hidden="true"
            />
          </a>
        </Button>
      </div>
    </div>
  );
}
