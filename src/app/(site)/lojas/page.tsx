// LOJAS — as 3 unidades da Viver Bem em Petrópolis.
//
// Eram três cartões em colunas, cada um com dois botões empilhados:
// muita caixa e muita borda para pouca informação. Virou uma lista de
// linhas largas, com o endereço respirando e as ações na ponta.
import type { Metadata } from "next";
import {
  UNIDADES,
  linkMapaUnidade,
  WHATSAPP_LOJA,
  WHATSAPP_NUMERO,
} from "@/lib/tipos";
import { HorarioAtendimento } from "@/components/site/HorarioAtendimento";
import { BotaoEnviarReceita } from "@/components/site/BotaoEnviarReceita";

export const metadata: Metadata = {
  title: "Lojas · Manipulação Viver Bem",
  description:
    "As 3 unidades da Viver Bem em Petrópolis: Centro, Corrêas e Posse. Endereços, horários e como chegar.",
};

export default function PaginaLojas() {
  return (
    <main className="flex-1 pt-16 md:pt-[4.5rem]">
      {/* Abertura */}
      <section className="halo-marca px-4 md:px-8 pt-12 md:pt-16 pb-8">
        <div className="max-w-5xl mx-auto">
          <p className="selo-secao text-escarlate">onde nos encontrar</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-2">
            <h1 className="font-display text-3xl md:text-[3rem] font-semibold text-grafite tracking-tight leading-[1.05]">
              {UNIDADES.length} lojas em
              <br />
              <span className="italic text-royal">Petrópolis</span>
            </h1>
            <p className="text-grafite-medio md:text-lg md:text-right md:max-w-xs leading-relaxed">
              Retire sem taxa em qualquer unidade, ou receba em casa de moto.
            </p>
          </div>
        </div>
      </section>

      {/* As unidades, em linhas */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto">
        <ul className="flex flex-col divide-y divide-linha border-y border-linha">
          {UNIDADES.map((u, i) => (
            <li
              key={u.bairro}
              className="group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 py-7 md:py-8"
            >
              {/* Número da unidade */}
              <span
                className="font-display text-4xl md:text-5xl font-semibold text-linha group-hover:text-royal/25 leading-none tabular-nums transition-colors shrink-0"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl md:text-[1.75rem] font-semibold text-grafite">
                  {u.bairro}
                </h2>
                <p className="text-grafite-medio leading-relaxed mt-1">{u.endereco}</p>
                {u.telefone && (
                  <p className="text-grafite-claro text-sm mt-1.5 tabular-nums">
                    Telefone {u.telefone}
                  </p>
                )}
              </div>

              {/* Ações na ponta */}
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <a
                  href={linkMapaUnidade(u.bairro, u.endereco)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-royal hover:bg-royal-escuro text-white font-semibold rounded-2xl px-5 py-3 transition-colors active:scale-[0.98]"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s-6.5-5.1-6.5-10a6.5 6.5 0 1 1 13 0c0 4.9-6.5 10-6.5 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="11" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Como chegar
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMERO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Falar no WhatsApp sobre a unidade ${u.bairro}`}
                  className="inline-flex items-center justify-center w-12 h-12 border border-linha hover:border-royal/40 rounded-2xl transition-colors active:scale-[0.98]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#25D366]">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0-.1 0 .6-.2 1.3Z" />
                  </svg>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Horário e atalho */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto pt-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div>
            <p className="selo-secao text-escarlate">horário de atendimento</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-grafite mt-2">
              O mesmo nas {UNIDADES.length} unidades
            </h2>
            <p className="text-grafite-medio leading-relaxed mt-3">
              Prefere pedir sem sair de casa? Envie a foto da receita pelo site e finalize
              no WhatsApp, no {WHATSAPP_LOJA}. A gente entrega de moto ou separa na loja que
              você escolher.
            </p>
            <BotaoEnviarReceita className="mt-6 inline-flex items-center gap-2.5 degrade-marca text-white font-semibold rounded-2xl px-6 py-3.5 active:scale-[0.98] transition-transform" />
          </div>

          {/* O mesmo bloco do rodapé, que já diz se está aberto agora */}
          <div className="bg-noite rounded-[1.75rem] p-5">
            <HorarioAtendimento />
          </div>
        </div>
      </section>
    </main>
  );
}
