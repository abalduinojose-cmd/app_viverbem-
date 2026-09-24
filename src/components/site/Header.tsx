"use client";
// Cabeçalho do site, fixo no topo: transparente sobre o carrossel da
// home e branco ao rolar ou nas demais páginas.
//
// Menu no modelo da Formularis: "Enviar receita" na frente, como único
// destaque (é o pedido do manipulado), depois A Viver Bem e Categorias
// com submenu, Lojas e Contato, e a busca na lupa.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";
import { CategoriaDTO } from "@/lib/tipos";
import { BotaoEnviarReceita } from "./BotaoEnviarReceita";

// Itens do submenu "A Viver Bem" (âncoras da página Sobre)
const MENU_SOBRE = [
  { href: "/sobre#historia", rotulo: "Nossa história" },
  { href: "/sobre#como-funciona", rotulo: "Como funciona" },
  { href: "/sobre#avaliacoes", rotulo: "O que dizem os clientes" },
];

const LINKS = [
  { href: "/lojas", rotulo: "Lojas" },
  { href: "/contato", rotulo: "Contato" },
];

type Submenu = "sobre" | "categorias" | null;

function Seta({ aberto }: { aberto: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeLupa() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const classeItem = (ativo: boolean) =>
  `flex items-center gap-1.5 px-3.5 lg:px-4 py-2 rounded-xl text-[0.95rem] font-medium transition-colors ${
    ativo ? "text-royal bg-royal-claro" : "text-grafite-medio hover:text-royal hover:bg-royal-nevoa"
  }`;

const classeSubitem =
  "block px-4 py-2.5 rounded-xl text-[0.95rem] text-grafite-medio hover:text-royal hover:bg-royal-nevoa transition-colors";

// Item com submenu (A Viver Bem, Categorias). Fica fora do Header para
// não ser recriado a cada renderização, o que tiraria o foco do botão.
// Ao tirar o mouse espera um instante antes de fechar, senão o submenu
// some no caminho entre o botão e a lista.
function Grupo({
  rotulo,
  ativo,
  aberto,
  aoAbrir,
  aoFechar,
  aoAlternar,
  children,
}: {
  rotulo: string;
  ativo: boolean;
  aberto: boolean;
  aoAbrir: () => void;
  aoFechar: () => void;
  aoAlternar: () => void;
  children: React.ReactNode;
}) {
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);

  function aoEntrar() {
    if (espera.current) clearTimeout(espera.current);
    aoAbrir();
  }
  function aoSair() {
    espera.current = setTimeout(aoFechar, 160);
  }

  return (
    <div className="relative" onMouseEnter={aoEntrar} onMouseLeave={aoSair}>
      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        aria-haspopup="true"
        className={classeItem(ativo || aberto)}
      >
        {rotulo}
        <Seta aberto={aberto} />
      </button>
      {aberto && (
        <div className="absolute left-0 top-full pt-2 animar-surgir">
          <div className="w-64 bg-white rounded-2xl border border-linha shadow-[0_16px_44px_rgba(16,42,74,0.14)] p-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Na vitrine estática (GitHub Pages) a busca carrega a página inteira, e o
// catálogo lê o termo no endereço; com servidor, a navegação é instantânea
const EH_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

// Busca: vai para /produtos?busca=termo, que já abre filtrado
function CampoBusca({ aoBuscar, autoFoco = false }: { aoBuscar?: () => void; autoFoco?: boolean }) {
  const Formulario = EH_DEMO ? "form" : Form;
  return (
    <Formulario
      action={EH_DEMO ? asset("/produtos/") : "/produtos"}
      onSubmit={aoBuscar}
      className="relative w-full"
    >
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-grafite-claro">
        <IconeLupa />
      </span>
      <input
        type="search"
        name="busca"
        autoFocus={autoFoco}
        required
        placeholder="Buscar por nome ou ativo..."
        aria-label="Buscar no site"
        className="w-full bg-royal-nevoa border border-linha rounded-2xl pl-12 pr-4 py-3 text-base text-grafite placeholder:text-grafite-claro focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal/40 focus:bg-white transition-colors"
      />
    </Formulario>
  );
}

export function Header({ categorias }: { categorias: CategoriaDTO[] }) {
  const pathname = usePathname();
  const naHome = pathname === "/";
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [submenu, setSubmenu] = useState<Submenu>(null);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Fecha tudo ao trocar de página. Feito durante a renderização, ao
  // notar que o endereço mudou (em efeito, dispararia uma renderização
  // a mais a cada navegação).
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname);
  if (pathname !== caminhoAnterior) {
    setCaminhoAnterior(pathname);
    setMenuAberto(false);
    setBuscaAberta(false);
    setSubmenu(null);
  }

  // Esc fecha submenu e busca
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSubmenu(null);
        setBuscaAberta(false);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const solido = !naHome || rolou || menuAberto || buscaAberta;

  // Os dois submenus com os mesmos gestos. Fechar só vale se ainda for
  // ele o aberto: o atraso do grupo anterior não pode fechar o próximo.
  const gestos = (qual: Exclude<Submenu, null>) => ({
    aberto: submenu === qual,
    aoAbrir: () => setSubmenu(qual),
    aoFechar: () => setSubmenu((atual) => (atual === qual ? null : atual)),
    aoAlternar: () => setSubmenu((atual) => (atual === qual ? null : qual)),
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ${
        solido ? "bg-white/95 backdrop-blur-md shadow-[0_2px_16px_rgba(16,42,74,0.08)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 md:px-8 h-16 md:h-[4.5rem]">
        {/* Logo */}
        <Link href="/" className="shrink-0 active:scale-95 transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/logo.png")}
            alt="Manipulação Viver Bem"
            draggable={false}
            width={220}
            height={97}
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Navegação (computador) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Principal">
          <BotaoEnviarReceita className="mr-2 inline-flex items-center gap-2 bg-escarlate hover:bg-escarlate-escuro text-white text-sm font-semibold rounded-xl px-4 lg:px-5 py-2.5 active:scale-95 transition" />

          <Grupo rotulo="A Viver Bem" ativo={pathname.startsWith("/sobre")} {...gestos("sobre")}>
            {MENU_SOBRE.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSubmenu(null)} className={classeSubitem}>
                {l.rotulo}
              </Link>
            ))}
          </Grupo>

          <Grupo rotulo="Categorias" ativo={pathname.startsWith("/produto")} {...gestos("categorias")}>
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/produtos/${c.slug}`}
                onClick={() => setSubmenu(null)}
                className={classeSubitem}
              >
                {c.nome}
              </Link>
            ))}
            <div className="border-t border-linha my-1.5 mx-2" aria-hidden="true" />
            <Link
              href="/produtos"
              onClick={() => setSubmenu(null)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[0.95rem] font-semibold text-royal hover:bg-royal-nevoa transition-colors"
            >
              Ver todas
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Grupo>

          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={classeItem(pathname.startsWith(l.href))}>
              {l.rotulo}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setBuscaAberta((b) => !b)}
            aria-label={buscaAberta ? "Fechar busca" : "Buscar"}
            aria-expanded={buscaAberta}
            className="ml-1 w-11 h-11 rounded-xl text-grafite-medio hover:text-royal hover:bg-royal-nevoa flex items-center justify-center transition-colors"
          >
            <IconeLupa />
          </button>
        </nav>

        {/* Celular: lupa e menu */}
        <div className="md:hidden flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setBuscaAberta((b) => !b);
              setMenuAberto(false);
            }}
            aria-label={buscaAberta ? "Fechar busca" : "Buscar"}
            aria-expanded={buscaAberta}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-grafite"
          >
            <IconeLupa />
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuAberto((m) => !m);
              setBuscaAberta(false);
            }}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-grafite"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuAberto ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Busca aberta, logo abaixo da barra */}
      {buscaAberta && (
        <div className="border-t border-linha bg-white px-4 md:px-8 py-4 animar-surgir">
          <div className="max-w-2xl mx-auto">
            <CampoBusca autoFoco aoBuscar={() => setBuscaAberta(false)} />
          </div>
        </div>
      )}

      {/* Menu do celular: os grupos já abertos (no toque, submenu só atrapalha) */}
      {menuAberto && (
        <nav
          aria-label="Principal"
          className="md:hidden bg-white border-t border-linha px-4 pb-5 pt-3 flex flex-col gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto animar-surgir"
        >
          <BotaoEnviarReceita className="inline-flex items-center justify-center gap-2 bg-escarlate text-white font-semibold rounded-xl px-5 py-3.5 mb-2" />

          <p className="px-4 pt-2 pb-1 selo-secao text-grafite-claro">A Viver Bem</p>
          {MENU_SOBRE.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuAberto(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-grafite-medio hover:bg-royal-nevoa transition-colors"
            >
              {l.rotulo}
            </Link>
          ))}

          <p className="px-4 pt-4 pb-1 selo-secao text-grafite-claro">Categorias</p>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/produtos/${c.slug}`}
              className="px-4 py-3 rounded-xl text-base font-medium text-grafite-medio hover:bg-royal-nevoa transition-colors"
            >
              {c.nome}
            </Link>
          ))}
          <Link
            href="/produtos"
            className="px-4 py-3 rounded-xl text-base font-semibold text-royal hover:bg-royal-nevoa transition-colors"
          >
            Ver todas
          </Link>

          <div className="border-t border-linha my-2" aria-hidden="true" />

          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                pathname.startsWith(l.href) ? "text-royal bg-royal-claro" : "text-grafite-medio hover:bg-royal-nevoa"
              }`}
            >
              {l.rotulo}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
