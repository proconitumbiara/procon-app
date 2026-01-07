import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  children?: ReactNode;
  description?: string;
  className?: string;
  variant?: "default" | "alternate";
  actionLink?: string;
  actionLabel?: string;
}

export default function Section({
  id,
  title,
  children,
  description,
  className = "",
  variant = "default",
  actionLink,
  actionLabel,
}: SectionProps) {
  const bgClass = variant === "alternate" ? "bg-muted/30" : "bg-background";

  return (
    <section
      id={id}
      className={`py-4 sm:py-6 lg:py-8 ${bgClass} ${className}`}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-card border-border rounded-xl border p-6 shadow-sm sm:p-8 lg:p-10">
            {/* Header com título e botão de ação */}
            <div className="mb-2 flex flex-row items-center justify-between gap-4">
              <h2
                id={id ? `${id}-title` : undefined}
                className="text-foreground min-w-0 flex-1 text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {title}
              </h2>
              {actionLink && actionLabel && (
                <Link
                  href={actionLink}
                  className="text-primary hover:text-primary/80 group inline-flex shrink-0 items-center gap-1 font-medium whitespace-nowrap no-underline transition-colors"
                >
                  <span className="text-xs sm:text-sm lg:text-base">
                    {actionLabel}
                  </span>
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            {/* Descrição */}
            {description && (
              <p className="text-muted-foreground mb-6 text-base leading-7 sm:text-lg">
                {description}
              </p>
            )}

            {/* Conteúdo */}
            {children && (
              <div className="prose prose-lg max-w-none">{children}</div>
            )}
            {!children && (
              <div>
                <p className="text-muted-foreground text-center text-base leading-7">
                  Conteúdo a ser preenchido no futuro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
