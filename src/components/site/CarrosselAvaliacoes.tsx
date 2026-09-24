"use client";
// Avaliações do Google em carrossel horizontal (rola para o lado),
// com foto do cliente (ou inicial do nome), estrelas e selo do Google.

import { useRef } from "react";
import {
  DepoimentoDTO,
  AVALIACOES_GOOGLE_TOTAL,
  AVALIACOES_GOOGLE_NOTAS,
  AVALIACOES_GOOGLE_ASSUNTOS,
  PERFIL_GOOGLE_URL,
} from "@/lib/tipos";
import { Estrelas } from "./Estrelas";
import { asset } from "@/lib/asset";

// Logotipo "G" do Google
function IconeGoogle({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-3l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.6-4.8h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC04" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.4 6.8 9 4.8 12 4.8z" />
    </svg>
  );
}

export function CarrosselAvaliacoes({
  avaliacoes,
  media,
}: {
  avaliacoes: DepoimentoDTO[];
  media: number;
}) {
  const faixaRef = useRef<HTMLDivElement>(null);

  // Rola uma "página" de cards para o lado
  function rolar(direcao: -1 | 1) {
    const faixa = faixaRef.current;
    if (!faixa) return;
    faixa.scrollBy({ left: direcao * (faixa.clientWidth * 0.8), behavior: "smooth" });
  }

  const SetaBotao = ({ direcao, rotulo }: { direcao: -1 | 1; rotulo: string }) => (
    <button
      type="button"
      onClick={() => rolar(direcao)}
      aria-label={rotulo}
      className="w-12 h-12 rounded-full bg-white border border-linha text-grafite-medio hover:text-royal hover:border-royal/40 sombra-card flex items-center justify-center active:scale-90 transition-all"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direcao === -1 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <section className="mt-16">
      <div className="px-4 md:px-8 max-w-6xl mx-auto">
        <div className="md:text-center md:max-w-2xl md:mx-auto">
          <p className="selo-secao text-escarlate">quem já é cliente</p>
          <h2 className="font-display text-3xl md:text-[2.6rem] font-semibold text-grafite leading-tight mt-2">
            O que dizem <span className="italic text-royal">sobre a gente</span>
          </h2>
        </div>

        {/* Resumo do perfil: a nota, a distribuição das notas e o que
            os clientes mais citam. Tudo vem do Google. */}
        <div className="bg-white border border-linha rounded-[1.75rem] sombra-card mt-7 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-9 p-6 md:p-8">
            {/* Nota */}
            <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
              <IconeGoogle tamanho={30} />
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-4xl md:text-5xl font-semibold text-grafite leading-none">
                    {media.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
                  </span>
                  <Estrelas nota={Math.round(media)} tamanho={17} />
                </div>
                <a
                  href={PERFIL_GOOGLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-grafite-claro hover:text-royal text-sm mt-2 transition-colors"
                >
                  {AVALIACOES_GOOGLE_TOTAL} avaliações no Google
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 17 17 7m0 0H8m9 0v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Distribuição das notas: barra por estrela, uma cor só */}
            <ul className="flex flex-col gap-1.5 min-w-0">
              {AVALIACOES_GOOGLE_NOTAS.map((n) => (
                <li key={n.estrelas} className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-grafite-claro tabular-nums w-6 shrink-0">
                    {n.estrelas}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#f5a623]">
                      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
                    </svg>
                  </span>
                  <span className="flex-1 h-2 rounded-full bg-royal-nevoa overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-royal"
                      style={{ width: `${(n.quantidade / AVALIACOES_GOOGLE_TOTAL) * 100}%` }}
                    />
                  </span>
                  <span className="text-grafite-medio tabular-nums w-9 text-right shrink-0">
                    {n.quantidade}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* O que os clientes mais citam */}
          <div className="border-t border-linha bg-royal-nevoa/50 px-6 md:px-8 py-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-grafite-claro">
              O que mais citam
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {AVALIACOES_GOOGLE_ASSUNTOS.map((a) => (
                <span
                  key={a.assunto}
                  className="inline-flex items-center gap-1.5 bg-white border border-linha rounded-full pl-3 pr-2 py-1.5 text-sm text-grafite"
                >
                  {a.assunto}
                  <span className="text-[0.7rem] font-semibold text-royal bg-royal-claro rounded-full px-1.5 py-0.5 tabular-nums">
                    {a.vezes}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Faixa rolável */}
      <div
        ref={faixaRef}
        className="flex gap-5 overflow-x-auto rolagem-sem-barra mt-7 px-4 md:px-8 pb-3 snap-x snap-mandatory"
      >
        {/* espaçador para alinhar com o container central em telas largas */}
        <div className="shrink-0 w-0 md:w-[max(0px,calc((100vw-72rem)/2))]" aria-hidden="true" />

        {avaliacoes.map((a) => (
          <figure
            key={a.id}
            className="relative snap-start shrink-0 w-[17.5rem] md:w-[22rem] bg-white rounded-[1.75rem] border border-linha sombra-card hover:sombra-card-hover hover:-translate-y-1 p-6 md:p-7 flex flex-col transition-all duration-300"
          >
            {/* Aspas decorativas, marcando que é um depoimento */}
            <span
              aria-hidden="true"
              className="absolute top-4 right-6 font-display text-6xl leading-none text-royal/10 select-none"
            >
              ”
            </span>

            <div className="relative flex items-center gap-3.5">
              {/* Foto do cliente ou inicial do nome */}
              {a.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset(a.fotoUrl)}
                  alt={a.nome}
                  loading="lazy"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-[0_2px_10px_rgba(16,42,74,0.15)]"
                  draggable={false}
                />
              ) : (
                <span className="w-14 h-14 rounded-full degrade-marca text-white flex items-center justify-center font-bold text-xl">
                  {a.nome.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <figcaption className="font-semibold text-grafite truncate">{a.nome}</figcaption>
                <div className="flex items-center gap-2 mt-0.5">
                  <Estrelas nota={a.nota} tamanho={15} />
                  {a.fonte === "Google" && <IconeGoogle tamanho={14} />}
                </div>
              </div>
            </div>

            <blockquote className="relative text-grafite-medio leading-relaxed mt-5 flex-1">
              {a.texto}
            </blockquote>
          </figure>
        ))}

        <div className="shrink-0 w-2" aria-hidden="true" />
      </div>

      {/* Setas embaixo e centralizadas, para acompanhar o cabeçalho.
          No celular a pessoa arrasta, então elas nem aparecem. */}
      <div className="hidden sm:flex justify-center gap-3 mt-7">
        <SetaBotao direcao={-1} rotulo="Ver avaliações anteriores" />
        <SetaBotao direcao={1} rotulo="Ver próximas avaliações" />
      </div>
    </section>
  );
}
