"use client";
// Abertura da home em carrossel, no modelo da Formularis: três slides,
// um recado cada. A receita vem primeiro porque é o pedido do
// manipulado; depois a casa (19 anos, 3 lojas) e a entrega.
//
// As fotos são quadros dos reels da própria farmácia (laboratório e
// loja). Nenhuma mostra pote com nome de marca: isso seria vitrine de
// manipulado, o que a RDC 67/2007 (item 5.14) não permite.
//
// Comportamento: troca sozinho a cada 7 s, para quando o mouse ou o
// foco estão sobre ele, arrasta com o dedo no celular e fica parado para
// quem pediu menos movimento no sistema.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import {
  ANOS_TRADICAO,
  AVALIACOES_GOOGLE_NOTA,
  AVALIACOES_GOOGLE_TOTAL,
  PERFIL_GOOGLE_URL,
  UNIDADES,
} from "@/lib/tipos";
import { BotaoEnviarReceita } from "./BotaoEnviarReceita";
import { IconeMoto } from "./IconeMoto";

const INTERVALO = 7000;
// Quanto o dedo precisa andar para contar como arrasto
const ARRASTO_MINIMO = 40;

const classePrincipal =
  "degrade-marca inline-flex items-center justify-center gap-3 text-white text-base md:text-lg font-semibold rounded-2xl px-7 py-4 md:px-9 active:scale-[0.98] transition";
const classeSecundario =
  "inline-flex items-center justify-center gap-2 bg-white/90 backdrop-blur text-grafite border border-linha hover:border-royal/30 hover:text-royal text-sm md:text-base font-medium rounded-2xl px-6 py-3.5 md:py-4 transition active:scale-[0.98]";

function Seta() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SLIDES = [
  {
    selo: "manipulação e homeopatia",
    titulo: (
      <>
        Sua fórmula começa
        <br />
        <span className="italic text-royal">pela receita</span>
      </>
    ),
    texto:
      "Envie a foto da prescrição pelo WhatsApp. O farmacêutico confere e passa o valor, e você retira na loja ou recebe em casa.",
    acoes: (
      <>
        <BotaoEnviarReceita className={`${classePrincipal} animar-respirar`} />
        <Link href="#como-funciona" className={classeSecundario}>
          Como funciona
        </Link>
      </>
    ),
    foto: "/fotos/manipulacao.webp",
    alt: "Mãos com luvas preparando cápsulas no laboratório da Viver Bem",
    seloFoto: null,
  },
  {
    selo: "desde 2007",
    titulo: (
      <>
        {ANOS_TRADICAO} anos cuidando
        <br />
        <span className="italic text-royal">de Petrópolis</span>
      </>
    ),
    texto: `${UNIDADES.length} lojas para atender você: ${UNIDADES.map((u) => u.bairro).join(", ").replace(/, ([^,]*)$/, " e $1")}.`,
    acoes: (
      <>
        <Link href="/lojas" className={classePrincipal}>
          Ver as lojas
          <Seta />
        </Link>
        <Link href="/sobre#historia" className={classeSecundario}>
          Nossa história
        </Link>
      </>
    ),
    foto: "/fotos/loja.webp",
    alt: "Atendimento na loja da Viver Bem",
    seloFoto: null,
  },
  {
    selo: "até a sua porta",
    titulo: (
      <>
        Receba em casa
        <br />
        <span className="italic text-royal">ou retire na loja</span>
      </>
    ),
    texto:
      "A entrega é de moto, por toda Petrópolis. Na retirada, você escolhe a loja mais perto e a gente avisa quando estiver pronto.",
    acoes: (
      <>
        <Link href="#como-funciona" className={classePrincipal}>
          Como funciona
          <Seta />
        </Link>
        <Link href="/lojas" className={classeSecundario}>
          Endereços das lojas
        </Link>
      </>
    ),
    foto: "/fotos/preparo.webp",
    alt: "Sachês da Viver Bem na balança do laboratório",
    seloFoto: "de moto, por Petrópolis",
  },
];

// "Reduzir movimento" do sistema, acompanhando se mudar depois. No
// servidor não há como saber, então assume movimento normal.
const CONSULTA_MOVIMENTO = "(prefers-reduced-motion: reduce)";
function assinarMovimento(avisar: () => void) {
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}

export function HeroCarrossel({ temVideo }: { temVideo: boolean }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const semMovimento = useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA_MOVIMENTO).matches,
    () => false
  );
  const inicioToque = useRef<number | null>(null);

  // Troca automática. "atual" nas dependências reinicia a contagem
  // quando a pessoa troca na mão, para o slide não virar logo em seguida.
  useEffect(() => {
    if (pausado || semMovimento) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setAtual((a) => (a + 1) % SLIDES.length);
      }
    }, INTERVALO);
    return () => window.clearInterval(id);
  }, [pausado, semMovimento, atual]);

  const irPara = (i: number) => setAtual((i + SLIDES.length) % SLIDES.length);

  function aoPressionar(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    inicioToque.current = e.clientX;
  }
  function aoSoltar(e: React.PointerEvent) {
    if (inicioToque.current === null) return;
    const distancia = e.clientX - inicioToque.current;
    inicioToque.current = null;
    if (Math.abs(distancia) >= ARRASTO_MINIMO) irPara(atual + (distancia < 0 ? 1 : -1));
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da Viver Bem"
      className="relative overflow-hidden bg-white"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onPointerDown={aoPressionar}
      onPointerUp={aoSoltar}
      onPointerCancel={() => (inicioToque.current = null)}
    >
      {/* Fundo: vídeo (quando existir) ou o halo suave da marca */}
      {temVideo ? (
        <>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={asset("/hero.mp4")}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40"
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 halo-marca" aria-hidden="true" />
      )}

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full pt-24 pb-10 md:pt-32 md:pb-16">
        {/* Os slides ocupam a mesma célula da grade: a altura é a do
            maior, e a troca é só de opacidade, sem pulo de layout */}
        <div className="grid">
          {SLIDES.map((s, i) => {
            const ativo = i === atual;
            const Titulo = i === 0 ? "h1" : "h2";
            return (
              <div
                key={s.foto}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${SLIDES.length}`}
                aria-hidden={!ativo}
                inert={!ativo}
                className={`[grid-area:1/1] grid grid-cols-1 md:grid-cols-12 gap-10 items-center transition-opacity duration-700 ${
                  ativo ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="md:col-span-7">
                  {i === 0 ? (
                    // Prova social já no primeiro slide
                    <a
                      href={PERFIL_GOOGLE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-10 gap-2 bg-white border border-linha rounded-full pl-3 pr-4 py-2 sombra-card hover:border-royal/30 transition-colors"
                    >
                      <span className="flex items-center gap-0.5 text-[#f5a623]" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((e) => (
                          <svg key={e} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
                          </svg>
                        ))}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-grafite-medio">
                        {AVALIACOES_GOOGLE_NOTA.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} no Google
                        <span className="hidden sm:inline text-grafite-claro"> · {AVALIACOES_GOOGLE_TOTAL} avaliações</span>
                      </span>
                    </a>
                  ) : (
                    <p className="selo-secao text-escarlate min-h-10 flex items-center">{s.selo}</p>
                  )}

                  <Titulo className="font-display text-[2.1rem] sm:text-[2.6rem] md:text-[3.9rem] font-semibold text-grafite leading-[1.05] mt-4 md:mt-6">
                    {s.titulo}
                  </Titulo>

                  <p className="text-grafite-medio text-base md:text-xl leading-relaxed mt-4 md:mt-6 max-w-lg">
                    {s.texto}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 md:gap-4 mt-7 md:mt-9">
                    {s.acoes}
                  </div>
                </div>

                {/* Foto (some no celular, para a abertura caber na tela) */}
                <div className="hidden md:block md:col-span-5">
                  <div className="relative max-w-[26rem] ml-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(s.foto)}
                      alt={s.alt}
                      width={720}
                      height={900}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                      className="w-full aspect-[4/5] object-cover rounded-[2.25rem] shadow-[0_24px_60px_rgba(16,42,74,0.18)]"
                    />
                    {s.seloFoto && (
                      <span className="absolute -left-5 bottom-8 inline-flex items-center gap-2.5 bg-white rounded-2xl border border-linha sombra-card pl-3 pr-4 py-3 text-sm font-semibold text-grafite">
                        <span className="w-9 h-9 rounded-xl bg-royal-claro text-royal flex items-center justify-center">
                          <IconeMoto tamanho={22} />
                        </span>
                        {s.seloFoto}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4 mt-8 md:mt-10">
          <div className="flex items-center gap-1" role="group" aria-label="Escolher slide">
            {SLIDES.map((s, i) => (
              <button
                key={s.foto}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === atual ? "true" : undefined}
                className="w-11 h-11 flex items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                    i === atual ? "w-8 bg-royal" : "w-2.5 bg-grafite-claro/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {[
              { rotulo: "Slide anterior", passo: -1, d: "M19 12H5m0 0 6-6m-6 6 6 6" },
              { rotulo: "Próximo slide", passo: 1, d: "M5 12h14m0 0-6-6m6 6-6 6" },
            ].map((b) => (
              <button
                key={b.rotulo}
                type="button"
                onClick={() => irPara(atual + b.passo)}
                aria-label={b.rotulo}
                className="w-11 h-11 rounded-full bg-white border border-linha text-grafite-medio hover:text-royal hover:border-royal/40 flex items-center justify-center transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d={b.d} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
