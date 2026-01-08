import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface PriceSearchCardProps {
  id: string | number;
  title: string;
  description?: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  year?: number;
}

export default function PriceSearchCard({
  title,
  description,
  slug,
  image = "/LogoVertical.png",
  imageAlt,
  year,
  id,
}: PriceSearchCardProps) {
  const altText = imageAlt || title;
  const href = slug ? `/pesquisas/${slug}` : `/pesquisas/${id}`;

  return (
    <div className="bg-card border-border group hover:border-primary flex h-full flex-col rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
      <div className="bg-muted/50 relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={altText}
          fill
          className="object-contain transition-all duration-300 group-hover:scale-110 md:grayscale md:group-hover:grayscale-0"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors duration-300">
        {title}
      </h3>
      {year && (
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          Ano: {year}
        </p>
      )}
      {description && (
        <p className="text-muted-foreground group-hover:text-foreground/80 mb-4 grow text-sm transition-colors duration-300">
          {description}
        </p>
      )}
      <div className="mt-auto flex justify-end">
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 group-hover:scale-105"
        >
          <Link href={href} className="no-underline">
            Ver Pesquisa
          </Link>
        </Button>
      </div>
    </div>
  );
}

