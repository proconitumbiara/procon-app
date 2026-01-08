"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: "/", label: "Início" },
    { href: "/servicos", label: "Serviços" },
    { href: "/projetos", label: "Projetos" },
    { href: "/noticias", label: "Notícias" },
    { href: "/pesquisas", label: "Pesquisas" },
    { href: "/#cdc", label: "CDC" },
    { href: "/#contato", label: "Contato" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/17edDvLVun/?mibextid=wwXIfr",
      icon: (
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/proconitumbiara?igsh=MWltYjdoNXh2bm43bA==",
      icon: (
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      ),
    },
    // {
    //   name: "YouTube",
    //   href: "#",
    //   icon: (
    //     <svg
    //       className="h-5 w-5"
    //       fill="currentColor"
    //       viewBox="0 0 24 24"
    //       aria-hidden="true"
    //     >
    //       <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    //     </svg>
    //   ),
    // },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full" role="banner">
      {/* Seção Superior - Azul Escuro */}
      <div className="bg-white text-[#192f58]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between md:h-16">
            {/* Logo */}
            <div className="flex w-full items-center justify-center md:w-auto md:justify-start">
              <Link href="/" aria-label="Ir para o início">
                <Image
                  src="/LogoHorizontal.png"
                  alt="Procon"
                  width={100}
                  height={100}
                  className="mx-auto h-auto max-h-32 w-auto md:mx-0 md:max-h-48"
                />
              </Link>
            </div>

            {/* Direita: Redes Sociais, Busca e Acesso à Informação */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Redes Sociais */}
              <div className="hidden items-center gap-2 md:flex">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#192f58] text-white transition-colors hover:bg-[#192f58]/80 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-white focus:outline-none"
                    aria-label={`Visite nosso ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Barra de Busca */}
              <form
                onSubmit={handleSearch}
                className="hidden items-center lg:flex"
              >
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar no site"
                    className="h-9 w-48 rounded-lg border border-[#192f58] bg-white px-4 pr-10 text-sm text-[#192f58] outline-none placeholder:text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-white"
                    aria-label="Buscar no site"
                  />
                  <button
                    type="submit"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-[#192f58] hover:text-[#192f58]/80 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-white focus:outline-none"
                    aria-label="Buscar"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior - Navegação Branca */}
      <div className="border-b border-[#192f58] bg-[#192f58]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-center">
            {/* Navegação Desktop */}
            <nav
              className="hidden justify-center md:flex md:items-center md:gap-1"
              role="navigation"
              aria-label="Navegação principal"
            >
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-8 py-2 text-sm font-medium no-underline transition-colors ${
                      active
                        ? "bg-white text-[#192f58]"
                        : "text-white hover:bg-white/20"
                    } `}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white md:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={toggleMenu}
            >
              <span className="sr-only">
                {isMenuOpen ? "Fechar menu" : "Abrir menu"}
              </span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav
              id="mobile-menu"
              className="border-t border-gray-200 py-4 md:hidden"
              role="navigation"
              aria-label="Navegação mobile"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-md px-3 py-2 text-base font-medium no-underline transition-colors ${
                        active
                          ? "bg-white text-[#192f58]"
                          : "text-white hover:bg-white/80"
                      } focus:ring-2 focus:ring-[#192f58] focus:ring-offset-2 focus:outline-none`}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
