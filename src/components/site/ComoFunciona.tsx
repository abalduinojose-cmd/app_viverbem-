// "Como funciona": os 4 passos do pedido pela receita, da foto da
// prescrição até a entrega. Aparece na home e na página A Viver Bem.
//
// Trilha numerada: no computador corre na horizontal, com a linha
// ligando os passos; no celular desce na vertical.
//
// Texto de processo, não de resultado: manipulado não pode ter
// promessa de efeito (RDC 67/2007).
import { WHATSAPP_NUMERO, UNIDADES } from "@/lib/tipos";
import { IconeMoto } from "./IconeMoto";
import { BotaoEnviarReceita, IconeReceita } from "./BotaoEnviarReceita";

const PASSOS = [
  {
    titulo: "Envie a receita",
    texto: "Mande a foto da prescrição pelo WhatsApp, ou traga na loja.",
    detalhe: "Pelo site, o pedido já chega com o seu código.",
    icone: "receita" as const,
  },
  {
    titulo: "O farmacêutico confere",
    texto: "Ele avalia a receita e passa o valor e o prazo de preparo.",
    detalhe: "Você só confirma se estiver de acordo.",
    icone: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 12.3l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    titulo: "Manipulação",
    texto: "A fórmula é preparada no laboratório, conforme a prescrição.",
    detalhe: "O rótulo sai com o seu nome, a composição e a validade.",
    icone: (
      <>
        <path d="M9.5 3.5h5M10.5 3.5v5.2L5.6 17.4A2 2 0 0 0 7.4 20.5h9.2a2 2 0 0 0 1.8-3.1l-4.9-8.7V3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.8 14.5h8.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    titulo: "Retire ou receba",
    texto: "Na loja que você escolher, ou em casa, de moto.",
    detalhe: `A retirada é sem taxa, em ${UNIDADES.length} lojas.`,
    icone: "moto" as const,
  },
];

export function ComoFunciona({ className = "pt-20" }: { className?: string }) {
  return (
    <section id="como-funciona" className={`px-4 md:px-8 max-w-6xl mx-auto scroll-mt-24 ${className}`}>
      <div className="text-center max-w-xl mx-auto">
        <p className="selo-secao text-escarlate">simples assim</p>
        <h2 className="font-display text-3xl md:text-[2.6rem] font-semibold text-grafite tracking-tight mt-2">
          Como funciona
        </h2>
        <p className="text-grafite-medio text-base md:text-lg mt-3 leading-relaxed">
          Da foto da receita até a sua mão, em 4 passos.
        </p>
      </div>

      {/* Trilha: horizontal no computador, vertical no celular */}
      <ol className="relative mt-10 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-5">
        <span aria-hidden="true" className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-linha" />
        <span aria-hidden="true" className="md:hidden absolute top-6 bottom-6 left-7 w-px bg-linha" />

        {PASSOS.map((p, i) => (
          <li key={p.titulo} className="relative flex md:flex-col gap-4 md:gap-0 md:text-center">
            <div className="shrink-0 md:mx-auto relative">
              <span className="w-14 h-14 rounded-2xl bg-white border border-linha sombra-card text-royal flex items-center justify-center">
                {p.icone === "moto" ? (
                  <IconeMoto tamanho={24} />
                ) : p.icone === "receita" ? (
                  <IconeReceita tamanho={24} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {p.icone}
                  </svg>
                )}
              </span>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full degrade-marca text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                {i + 1}
              </span>
            </div>

            <div className="md:mt-5">
              <h3 className="font-display text-lg font-semibold text-grafite leading-snug">{p.titulo}</h3>
              <p className="text-grafite-medio leading-relaxed mt-1.5">{p.texto}</p>
              <p className="text-grafite-claro text-sm leading-relaxed mt-2">{p.detalhe}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Saídas: começar pela receita ou tirar a dúvida antes */}
      <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-10">
        <BotaoEnviarReceita className="degrade-marca inline-flex items-center justify-center gap-3 text-white text-lg font-semibold rounded-2xl px-8 py-4 active:scale-[0.98] transition" />
        <a
          href={`https://wa.me/${WHATSAPP_NUMERO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 bg-white text-grafite border border-linha hover:border-royal/40 hover:text-royal font-medium rounded-2xl px-7 py-4 transition-colors active:scale-[0.98]"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#25D366]">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0-.1 0 .6-.2 1.3Z" />
          </svg>
          Tirar uma dúvida antes
        </a>
      </div>
    </section>
  );
}
