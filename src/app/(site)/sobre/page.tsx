// A VIVER BEM, no formato do "Quem somos" da Formularis: abertura com
// foto e a história, depois as linhas no estilo missão/visão/valores,
// o "Como funciona" e as avaliações do Google.
//
// As linhas usam só o que a Viver Bem já tem (história, como trabalha,
// onde está). Missão, visão e valores não foram inventados: se a
// farmácia mandar os dela, entram no lugar destas linhas.
import Link from "next/link";
import type { Metadata } from "next";
import { asset } from "@/lib/asset";
import { obterAvaliacoes } from "@/lib/catalogo";
import { CarrosselAvaliacoes } from "@/components/site/CarrosselAvaliacoes";
import { ComoFunciona } from "@/components/site/ComoFunciona";
import { Revelar } from "@/components/site/Revelar";
import { ANOS_TRADICAO, AVALIACOES_GOOGLE_NOTA, UNIDADES, linkMapaUnidade } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A Viver Bem · Manipulação Viver Bem",
  description: `Há ${ANOS_TRADICAO} anos em Petrópolis, com manipulação e homeopatia. Conheça a nossa história, como funciona o pedido pela receita e as ${UNIDADES.length} lojas.`,
};

const LINHAS = [
  {
    rotulo: "Nossa história",
    texto:
      "Desde 2007 em Petrópolis, com manipulação, homeopatia e atendimento de gente que conhece você pelo nome.",
  },
  {
    rotulo: "Como trabalhamos",
    texto:
      "Toda fórmula parte de uma receita. O farmacêutico confere a prescrição antes do preparo, e o rótulo sai com o nome de quem vai usar, a composição e a validade.",
  },
];

export default async function PaginaSobre() {
  const avaliacoes = await obterAvaliacoes();

  return (
    <main className="flex-1 pt-16 md:pt-[4.5rem]">
      {/* ---------- Abertura: foto e história ---------- */}
      <section id="historia" className="halo-marca px-4 md:px-8 pt-12 md:pt-16 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-5 order-2 md:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/fotos/laboratorio.webp")}
              alt="Técnica no laboratório de manipulação da Viver Bem"
              width={576}
              height={720}
              decoding="async"
              className="w-full max-w-md mx-auto aspect-[4/5] object-cover rounded-[2.25rem] shadow-[0_24px_60px_rgba(16,42,74,0.16)]"
            />
          </div>

          <div className="md:col-span-7 order-1 md:order-2">
            <p className="selo-secao text-escarlate">a viver bem</p>
            <h1 className="font-display text-4xl md:text-[3.4rem] font-semibold text-grafite mt-3 tracking-tight leading-[1.05]">
              {ANOS_TRADICAO} anos cuidando
              <br />
              <span className="italic text-royal">de você em Petrópolis</span>
            </h1>
            <p className="text-grafite-medio text-lg md:text-xl mt-6 leading-relaxed">
              Somos especialistas em saúde personalizada e acreditamos que a beleza
              autêntica é o reflexo de uma autoestima lá no alto. Bem-estar é se sentir bem
              na sua própria pele.
            </p>
            <p className="text-grafite-medio text-lg mt-4 leading-relaxed">
              Manipulação e homeopatia, em {UNIDADES.length} lojas, com o atendimento de
              quem conhece você pelo nome.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Linhas: história, como trabalhamos, onde estamos ---------- */}
      <section className="px-4 md:px-8 pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto border-t border-linha">
          {LINHAS.map((l) => (
            <Revelar key={l.rotulo}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-10 py-9 md:py-12 border-b border-linha">
                <h2 className="md:col-span-5 font-display text-3xl md:text-[2.6rem] font-semibold text-grafite tracking-tight leading-tight">
                  {l.rotulo}
                </h2>
                <p className="md:col-span-7 text-grafite-medio text-lg leading-relaxed md:pt-2">{l.texto}</p>
              </div>
            </Revelar>
          ))}

          {/* Onde estamos: as lojas, com o mapa de cada uma */}
          <Revelar>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-10 py-9 md:py-12 border-b border-linha">
              <h2 className="md:col-span-5 font-display text-3xl md:text-[2.6rem] font-semibold text-grafite tracking-tight leading-tight">
                Onde estamos
              </h2>
              <div className="md:col-span-7 md:pt-2">
                <p className="text-grafite-medio text-lg leading-relaxed">
                  {UNIDADES.length} lojas em Petrópolis. Retire sem taxa na que for mais perto,
                  ou receba em casa, de moto.
                </p>
                <ul className="flex flex-col gap-2 mt-5">
                  {UNIDADES.map((u) => (
                    <li key={u.bairro}>
                      <a
                        href={linkMapaUnidade(u.bairro, u.endereco)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-linha hover:border-royal/30 bg-white px-4 py-3 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-royal">
                          <path d="M12 21s-6.5-5.1-6.5-10a6.5 6.5 0 1 1 13 0c0 4.9-6.5 10-6.5 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                          <circle cx="12" cy="11" r="2.3" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-grafite">{u.bairro}</span>
                          <span className="block text-grafite-medio text-sm leading-snug">{u.endereco}</span>
                        </span>
                        <span className="shrink-0 text-xs font-medium text-grafite-claro group-hover:text-royal transition-colors">
                          ver no mapa
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/lojas"
                  className="mt-4 inline-flex items-center min-h-11 gap-2 text-royal font-semibold hover:gap-3 transition-[gap]"
                >
                  Horários e contatos das lojas
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </Revelar>
        </div>
      </section>

      {/* ---------- Como funciona ---------- */}
      <Revelar>
        <ComoFunciona />
      </Revelar>

      {/* ---------- Avaliações ---------- */}
      {avaliacoes.length > 0 && (
        <div id="avaliacoes" className="scroll-mt-24 pb-20">
          <CarrosselAvaliacoes media={AVALIACOES_GOOGLE_NOTA} avaliacoes={avaliacoes} />
        </div>
      )}
    </main>
  );
}
