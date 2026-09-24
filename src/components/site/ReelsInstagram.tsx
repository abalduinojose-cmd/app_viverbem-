"use client";
// Vitrine dos vídeos do Instagram da farmácia, no formato vertical
// dos reels. Os arquivos ficam em public/videos/.
//
// Os vídeos NÃO tocam sozinhos: cada cartão mostra um quadro de
// prévia e só carrega o arquivo inteiro quando a pessoa aperta o
// play, para a home não pesar. Tocar um pausa o anterior.

import { useEffect, useRef, useState } from "react";
import { INSTAGRAM_PERFIL, INSTAGRAM_URL } from "@/lib/tipos";
import { asset } from "@/lib/asset";

// O "#t=" faz o navegador mostrar esse segundo como capa, sem
// precisarmos gerar imagem de pôster para cada vídeo.
//
// Só os reels institucionais (equipe, laboratório, loja). O terceiro
// saiu: mostrava manipulados pelo nome de marca e chamava para
// "conhecer esses produtos", o caso que a Anvisa puniu (RE 3.547/2026).
// Antes de colocar um reel novo aqui, o farmacêutico precisa ver (e
// ouvir) o vídeo inteiro.
const REELS = [
  { arquivo: "/videos/reel-1.mp4", capaEm: 3, titulo: "Curiosidades da manipulação" },
  { arquivo: "/videos/reel-2.mp4", capaEm: 2, titulo: "Quem faz a Viver Bem" },
];

function IconeInstagram({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function ReelsInstagram() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [tocando, setTocando] = useState<number | null>(null);

  function alternar(indice: number) {
    const video = refs.current[indice];
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setTocando(null);
      return;
    }

    // Só um vídeo por vez
    refs.current.forEach((v, i) => {
      if (v && i !== indice) v.pause();
    });
    video.play();
    setTocando(indice);
  }

  // Pausa o que estiver tocando quando sai da tela
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) {
            const video = e.target as HTMLVideoElement;
            if (!video.paused) {
              video.pause();
              setTocando(null);
            }
          }
        });
      },
      { threshold: 0.35 }
    );
    refs.current.forEach((v) => v && observador.observe(v));
    return () => observador.disconnect();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20">
      {/* Com dois vídeos, o texto vai ao lado deles: lado a lado e na
          largura toda, cada reel vertical ficaria alto demais */}
      <div className="bg-royal-nevoa border border-linha rounded-[2rem] px-6 md:px-12 py-12 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-12 items-center">
        {/* Cabeçalho */}
        <div className="lg:col-span-5">
          <p className="selo-secao text-escarlate">acompanhe a gente</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-grafite leading-tight mt-2">
            Por dentro da
            <br />
            <span className="italic text-royal">Viver Bem</span>
          </h2>
          <p className="text-grafite-medio text-base md:text-lg leading-relaxed mt-4 max-w-md">
            O laboratório, a loja e quem faz a farmácia no dia a dia, direto do nosso
            Instagram.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2.5 degrade-marca text-white font-semibold rounded-2xl px-6 py-3.5 active:scale-95 transition-transform"
          >
            <IconeInstagram />@{INSTAGRAM_PERFIL}
          </a>
        </div>

        {/* Vídeos */}
        <div className="lg:col-span-7 flex gap-4 md:gap-6 overflow-x-auto rolagem-sem-barra snap-x snap-mandatory -mx-1 px-1 pb-2 lg:justify-end">
          {REELS.map((reel, i) => (
            <div
              key={reel.arquivo}
              className="snap-start shrink-0 w-[15rem] sm:w-[16.5rem] relative rounded-[1.5rem] overflow-hidden bg-grafite aspect-[9/16] sombra-card group"
            >
              <video
                ref={(el) => {
                  refs.current[i] = el;
                }}
                src={`${asset(reel.arquivo)}#t=${reel.capaEm}`}
                preload="metadata"
                playsInline
                loop
                onEnded={() => setTocando(null)}
                className="w-full h-full object-cover"
              />

              {/* Botão de play sobre o vídeo */}
              <button
                type="button"
                onClick={() => alternar(i)}
                aria-label={tocando === i ? `Pausar: ${reel.titulo}` : `Assistir: ${reel.titulo}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* A cortina escura some enquanto o vídeo roda */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20 transition-opacity ${
                    tocando === i ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`relative w-16 h-16 rounded-full bg-white/95 text-royal flex items-center justify-center sombra-card transition-all ${
                    tocando === i
                      ? "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                      : "opacity-100 group-hover:scale-110"
                  }`}
                >
                  {tocando === i ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="5" width="4" height="14" rx="1.2" />
                      <rect x="14" y="5" width="4" height="14" rx="1.2" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Selo do Instagram, fora do botão para poder ser clicado */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver no Instagram de @${INSTAGRAM_PERFIL}`}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/35 flex items-center justify-center transition-all ${
                  tocando === i ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
              >
                <IconeInstagram tamanho={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
