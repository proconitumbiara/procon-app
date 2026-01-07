import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface NewsCardProps {
  id: string | number;
  title: string;
  image: string;
  description: string;
  slug: string; // ou href
  imageAlt?: string;
  publishedAt?: string | Date;
  status?: "published" | "draft";
}

export default function NewsCard({
  title,
  image,
  description,
  imageAlt,
  slug,
  publishedAt,
  status,
  id,
}: NewsCardProps) {
  const altText = imageAlt || title;
  const href = slug ? `/noticias/${slug}` : `/noticias/${id}`;
  const publishedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("pt-BR")
    : null;
  const isPublished = status === "published";

  return (
    <div className="bg-card border-border group hover:border-primary flex h-full flex-col rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={altText}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground group-hover:text-foreground/80 mb-4 grow text-sm transition-colors duration-300">
        {description}
      </p>
      {isPublished && publishedDate && (
        <p className="text-muted-foreground mb-4 text-sm">
          Publicado em: {publishedDate}
        </p>
      )}
      <Button
        asChild
        variant="outline"
        className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary mt-auto w-full transition-all duration-300 group-hover:scale-105"
      >
        <Link href={href} className="no-underline">
          Ler Mais
        </Link>
      </Button>
    </div>
  );
}
