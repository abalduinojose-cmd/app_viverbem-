// Pilares da marca, logo abaixo do carrossel (no lugar da faixa de
// pilares da Formularis), no modelo aprovado pela cliente: número
// grande em degradê + rótulo pequeno embaixo, sobre fundo claro. Cada
// coluna entra em cascata quando aparece na tela.
//
// Só números que dá para comprovar: anos, lojas e avaliações do Google.
// O antigo "100% sob medida" saiu por não ter como provar.
import { Revelar } from "./Revelar";
import {
  ANOS_TRADICAO,
  UNIDADES,
  AVALIACOES_GOOGLE_TOTAL,
} from "@/lib/tipos";

const DADOS = [
  {
    numero: `+${ANOS_TRADICAO}`,
    unidade: "anos",
    rotulo: "de tradição em Petrópolis",
  },
  {
    numero: `${UNIDADES.length}`,
    unidade: "unidades",
    rotulo: "Centro, Corrêas e Posse",
  },
  {
    numero: `+${AVALIACOES_GOOGLE_TOTAL}`,
    unidade: "avaliações",
    rotulo: "com nota 5,0 no Google",
  },
];

export function MarqueeMarca() {
  return (
    <section className="bg-white border-y border-linha">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
        {DADOS.map((d, i) => (
          <Revelar key={d.rotulo} atraso={i * 130} className={i === 2 ? "col-span-2 md:col-span-1" : ""}>
            <div>
              {/* Sem nowrap: em tela estreita o número e a unidade
                  precisam poder quebrar, senão invadem a coluna do lado */}
              <p className="font-display font-semibold leading-[1.1]">
                <span className="texto-degrade text-[2rem] md:text-5xl tracking-tight tabular-nums">
                  {d.numero}
                </span>{" "}
                <span className="texto-degrade text-xl md:text-3xl italic">
                  {d.unidade}
                </span>
              </p>
              <p className="text-grafite-claro text-sm md:text-base mt-2 leading-snug">
                {d.rotulo}
              </p>
            </div>
          </Revelar>
        ))}
      </div>
    </section>
  );
}
