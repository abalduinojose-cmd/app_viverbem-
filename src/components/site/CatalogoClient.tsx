"use client";
// Catálogo do site: /produtos (tudo) e /produtos/[categoria].
//
// Estrutura no modelo da Formularis: as categorias no alto como
// caminho, a busca, e o conteúdo agrupado por área. Sem vitrine
// promocional ("mais procurados", "novidades", combos): manipulado não
// pode ser promovido. O convite é sempre o mesmo, enviar a receita.
//
// Os chips de categoria são links, então cada categoria tem endereço
// próprio (dá para mandar o link de uma área inteira).

import { useMemo, useState } from "react";
import Link from "next/link";
import { CategoriaDTO, ProdutoDTO, ehIndustrializado } from "@/lib/tipos";
import { infoCategoria } from "@/lib/categorias";
import { ProdutoCard } from "./ProdutoCard";
import { BotaoEnviarReceita } from "./BotaoEnviarReceita";

// Fora do componente de propósito: declarada lá dentro, a grade seria
// recriada a cada letra digitada na busca e os cartões piscariam.
function Grade({ lista }: { lista: ProdutoDTO[] }) {
  if (lista.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-xl font-semibold text-grafite">Nada encontrado</p>
        <p className="text-grafite-claro mt-1">
          Tente outra palavra, ou envie a sua receita que a gente confere para você.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
      {lista.map((p) => (
        <ProdutoCard key={p.id} produto={p} />
      ))}
    </div>
  );
}

export function CatalogoClient({
  categorias,
  produtos,
  categoriaAtiva = null,
  buscaInicial = "",
}: {
  categorias: CategoriaDTO[];
  /** Na página de categoria, já vem só a categoria */
  produtos: ProdutoDTO[];
  categoriaAtiva?: CategoriaDTO | null;
  buscaInicial?: string;
}) {
  const [busca, setBusca] = useState(buscaInicial);
  const termo = busca.trim().toLowerCase();
  const buscando = termo.length > 0;

  const resultadoBusca = useMemo(() => {
    if (!termo) return [];
    return produtos.filter(
      (p) => p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)
    );
  }, [termo, produtos]);

  const industrializados = useMemo(() => produtos.filter(ehIndustrializado), [produtos]);

  // Só as categorias que têm algo para mostrar
  const categoriasComItens = useMemo(
    () => categorias.filter((c) => produtos.some((p) => p.categoriaId === c.id)),
    [categorias, produtos]
  );

  const classeChip = (ativo: boolean) =>
    `shrink-0 inline-flex items-center min-h-11 rounded-full px-5 text-sm md:text-base font-medium transition-colors ${
      ativo
        ? "bg-royal text-white"
        : "bg-white text-grafite-medio border border-linha hover:border-royal/40 hover:text-royal"
    }`;

  const titulo = categoriaAtiva ? categoriaAtiva.nome : "O que manipulamos";
  const apoio = categoriaAtiva
    ? infoCategoria(categoriaAtiva.slug).descricao
    : "Fórmulas preparadas a partir da receita, separadas por área.";

  return (
    <div className="flex-1 flex flex-col min-h-screen pt-16 md:pt-[4.5rem]">
      {/* ---------- Abertura ---------- */}
      <div className="halo-marca px-4 md:px-8 pt-8 md:pt-10 pb-7">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-grafite-claro min-h-10" aria-label="Você está em">
            <Link href="/" className="hover:text-royal transition-colors">Início</Link>
            <span aria-hidden="true">/</span>
            {categoriaAtiva ? (
              <>
                <Link href="/produtos" className="hover:text-royal transition-colors">Categorias</Link>
                <span aria-hidden="true">/</span>
                <span className="text-grafite-medio">{categoriaAtiva.nome}</span>
              </>
            ) : (
              <span className="text-grafite-medio">Categorias</span>
            )}
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-3">
            <div className="max-w-2xl">
              <p className="selo-secao text-escarlate">
                {categoriaAtiva ? "categoria" : "categorias"}
              </p>
              <h1 className="font-display text-3xl md:text-[2.8rem] font-semibold text-grafite tracking-tight leading-tight mt-2">
                {titulo}
              </h1>
              <p className="text-grafite-medio text-base md:text-lg leading-relaxed mt-3">{apoio}</p>
            </div>

            {/* O convite da página: a receita */}
            <div className="shrink-0 bg-white border border-linha rounded-2xl p-4 flex items-center gap-4 sombra-card">
              <p className="text-sm text-grafite-medio leading-snug max-w-[13rem]">
                Tem a receita? O farmacêutico confere e passa o valor.
              </p>
              <BotaoEnviarReceita className="shrink-0 degrade-marca inline-flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-4 py-3 active:scale-95 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Busca e categorias (grudam abaixo do cabeçalho) ---------- */}
      <div className="sticky top-16 md:top-[4.5rem] z-40 bg-white/95 backdrop-blur-md border-y border-linha">
        <div className="px-4 md:px-8 pt-4 pb-3 max-w-7xl mx-auto w-full">
          <div className="relative max-w-2xl">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-grafite-claro"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={categoriaAtiva ? `Buscar em ${categoriaAtiva.nome}...` : "Buscar por nome ou ativo..."}
              aria-label="Buscar"
              className="w-full bg-royal-nevoa border border-linha rounded-2xl pl-11 pr-11 py-3 text-base text-grafite placeholder:text-grafite-claro focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal/40 focus:bg-white transition-colors"
            />
            {buscando && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-grafite-claro hover:text-grafite w-9 h-9 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav
          aria-label="Categorias"
          className="flex gap-2.5 overflow-x-auto rolagem-sem-barra px-4 md:px-8 pb-3.5 max-w-7xl mx-auto w-full"
        >
          <Link href="/produtos" className={classeChip(!categoriaAtiva)} aria-current={!categoriaAtiva ? "page" : undefined}>
            Todas
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/produtos/${c.slug}`}
              className={classeChip(categoriaAtiva?.id === c.id)}
              aria-current={categoriaAtiva?.id === c.id ? "page" : undefined}
            >
              {c.nome}
            </Link>
          ))}
        </nav>
      </div>

      {/* ---------- Conteúdo ---------- */}
      <main className="flex-1 px-4 md:px-8 py-8 pb-24 max-w-7xl mx-auto w-full">
        {buscando ? (
          <>
            <h2 className="font-display text-2xl font-semibold text-grafite mb-5 tracking-tight">
              {resultadoBusca.length} {resultadoBusca.length === 1 ? "resultado" : "resultados"} para “
              {busca.trim()}”
            </h2>
            <Grade lista={resultadoBusca} />
          </>
        ) : categoriaAtiva ? (
          <Grade lista={produtos} />
        ) : (
          <div className="flex flex-col gap-14">
            {/* Industrializados com registro, os únicos com preço */}
            {industrializados.length > 0 && (
              <section>
                <div className="mb-5">
                  <p className="selo-secao text-escarlate">com registro na Anvisa</p>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-grafite tracking-tight mt-1">
                    Pronta entrega
                  </h2>
                </div>
                <Grade lista={industrializados} />
              </section>
            )}

            {categoriasComItens.map((c) => (
              <section key={c.id}>
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-grafite tracking-tight">
                      {c.nome}
                    </h2>
                    <p className="text-grafite-claro text-sm md:text-base mt-1">{infoCategoria(c.slug).descricao}</p>
                  </div>
                  <Link
                    href={`/produtos/${c.slug}`}
                    className="shrink-0 hidden sm:inline-flex items-center min-h-11 gap-2 text-royal font-semibold hover:gap-3 transition-[gap]"
                  >
                    Ver categoria
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                <Grade lista={produtos.filter((p) => p.categoriaId === c.id)} />
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
