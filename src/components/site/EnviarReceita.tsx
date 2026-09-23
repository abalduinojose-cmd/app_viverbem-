// "Cada pessoa tem sua fórmula": a seção de personalização da home (no
// lugar da que a Formularis tem), com o texto e o convite de um lado e
// quatro fatos do processo do outro. Sem as linhas de diagrama da
// referência: a cliente já pediu duas vezes para tirar linhas decorativas.
//
// ATENÇÃO AO TEXTO DESTA SEÇÃO. Farmácia de manipulação segue regras
// próprias de comunicação (RDC 67/2007 e RDC 96/2008), então o texto
// aqui é deliberadamente descritivo, e não promocional:
//   - fala em PRESCRIÇÃO, nunca em comprar manipulado sem receita;
//   - descreve o PROCESSO (avaliação farmacêutica, preparo, rótulo),
//     nunca resultado, eficácia ou benefício de saúde;
//   - não compara com industrializado nem sugere trocar/ajustar o que
//     o médico prescreveu;
//   - não menciona nome de ativo, indicação ou preço.
// Antes de mexer, confirme com o farmacêutico responsável da loja.
import { WHATSAPP_LOJA } from "@/lib/tipos";
import { BotaoEnviarReceita } from "./BotaoEnviarReceita";

// Fatos do processo, não do resultado
const FATOS = [
  {
    titulo: "Feita a partir da receita",
    texto: "Cada preparação é individual, conforme a prescrição.",
    icone: (
      <>
        <path d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    titulo: "Conferida pelo farmacêutico",
    texto: "A receita passa por avaliação farmacêutica antes do preparo.",
    icone: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 12.3l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    titulo: "Preparada depois do pedido",
    texto: "Nada fica pronto na prateleira: o preparo começa quando você pede.",
    icone: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7.5v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    titulo: "Rótulo com os seus dados",
    texto: "Seu nome, a composição e a validade.",
    icone: (
      <>
        <path d="M4 12.5V5.5a1.5 1.5 0 0 1 1.5-1.5h7l7.5 7.5-8.5 8.5L4 12.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
      </>
    ),
  },
];

export function EnviarReceita() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20">
      <div className="bg-royal-nevoa border border-linha rounded-[2rem] px-6 md:px-12 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 bg-white border border-linha rounded-full px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-escarlate" aria-hidden="true" />
            <span className="text-xs font-medium text-grafite-medio">mediante prescrição</span>
          </span>
          <h2 className="font-display text-3xl md:text-[2.6rem] font-semibold text-grafite leading-[1.08] mt-4">
            Cada pessoa
            <br />
            <span className="italic text-royal">tem sua fórmula</span>
          </h2>
          <p className="text-grafite-medio text-base md:text-lg leading-relaxed mt-4">
            O medicamento manipulado é preparado sob prescrição de profissional
            habilitado, na dose e na forma farmacêutica que constam da receita.
          </p>

          <BotaoEnviarReceita className="mt-8 degrade-marca inline-flex items-center justify-center gap-3 text-white text-lg font-semibold rounded-2xl px-8 py-4 active:scale-[0.98] transition" />

          {/* Aviso legal, discreto mas presente */}
          <p className="text-grafite-claro text-xs leading-relaxed mt-4 max-w-md">
            {WHATSAPP_LOJA} · Medicamentos manipulados são preparados somente mediante
            prescrição de profissional habilitado, dentro da validade. A sua receita e os
            seus dados ficam apenas com a nossa equipe.
          </p>
        </div>

        <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FATOS.map((f) => (
            <li key={f.titulo} className="bg-white border border-linha rounded-[1.5rem] p-6 sombra-card">
              <span className="w-12 h-12 rounded-2xl bg-royal-claro text-royal flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {f.icone}
                </svg>
              </span>
              <h3 className="font-display text-lg font-semibold text-grafite leading-snug mt-5">{f.titulo}</h3>
              <p className="text-grafite-medio leading-relaxed mt-1.5">{f.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
