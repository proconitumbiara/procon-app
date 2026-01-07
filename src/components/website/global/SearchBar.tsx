"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "O que você procura?",
  onSearch,
  className,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        router.push(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="bg-card/95 border-border flex w-full items-center gap-3 rounded-lg border px-4 py-3 backdrop-blur-sm sm:py-4"
        role="search"
        aria-label="Barra de pesquisa"
      >
        <Search
          className="text-muted-foreground size-5 shrink-0 sm:size-6"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="text-foreground placeholder:text-muted-foreground flex-1 border-none bg-transparent text-sm outline-none sm:text-base"
          aria-label={placeholder}
        />
      </form>
    </div>
  );
}
