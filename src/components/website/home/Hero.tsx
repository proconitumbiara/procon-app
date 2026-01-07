import Image from "next/image";

import SearchBar from "../global/SearchBar";

interface HeroProps {
  title?: string;
  description?: string;
  popularSearches?: string[];
  onSearch?: (query: string) => void;
}

export default function Hero({
  title = "Bem-vindo ao Portal do Procon Itumbiara",
  onSearch,
}: HeroProps) {
  return (
    <section
      id="inicio"
      className="relative flex w-full items-center justify-center py-8 sm:py-12 lg:py-16"
      aria-labelledby="hero-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-border relative mx-auto max-w-7xl overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
          {/* Background Image */}
          <div className="relative aspect-video sm:aspect-16/8 lg:aspect-16/7">
            <Image
              src="/Hero.png"
              alt="Procon Itumbiara - Proteção e Defesa do Consumidor"
              fill
              className="object-cover"
              priority
              aria-hidden="true"
            />
            {/* Overlay para melhorar legibilidade do texto */}
            <div className="from-background/60 via-background/40 to-background/60 absolute inset-0 bg-linear-to-b" />

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="flex w-full max-w-4xl flex-col items-center justify-center">
                {/* Title and Description */}
                <div className="mb-4 flex flex-col items-center justify-center text-center sm:mb-8">
                  <h1
                    id="hero-title"
                    className="text-xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                    {title}
                  </h1>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-3xl pb-2">
                  <SearchBar onSearch={onSearch} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
