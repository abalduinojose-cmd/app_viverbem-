// Categorias da home, no lugar dos "Lançamentos" e dos banners de
// categoria da Formularis: um cartão por área, levando para a página da
// categoria. Mostra o que a farmácia prepara em cada área, nunca para
// que serve (manipulado não pode ter promessa de efeito).
import Link from "next/link";
import { asset } from "@/lib/asset";
import { CategoriaDTO } from "@/lib/tipos";
import { infoCategoria } from "@/lib/categorias";
import { SecaoTitulo } from "./SecaoTitulo";

export function SecaoCategorias({ categorias }: { categorias: CategoriaDTO[] }) {
  if (categorias.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20">
      <SecaoTitulo
        selo="o que manipulamos"
        titulo="Categorias"
        descricao="Escolha a área e veja o que preparamos a partir da receita."
        verTudo="/produtos"
      />

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {categorias.map((c) => {
          const info = infoCategoria(c.slug);
          return (
            <li key={c.id}>
              <Link
                href={`/produtos/${c.slug}`}
                className="group h-full bg-white border border-linha rounded-3xl overflow-hidden flex flex-col hover:border-royal/25 hover:sombra-card-hover hover:-translate-y-1 active:scale-[0.98] transition duration-300"
              >
                <div className="relative bg-royal-nevoa aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(info.imagem)}
                    alt=""
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                </div>
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <h3 className="font-display text-lg md:text-xl font-semibold text-grafite leading-snug">
                    {c.nome}
                  </h3>
                  <p className="hidden sm:block text-grafite-medio text-sm md:text-base leading-relaxed mt-1.5 flex-1">
                    {info.descricao}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-royal text-sm font-semibold mt-3 group-hover:gap-2.5 transition-[gap]">
                    Ver categoria
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
