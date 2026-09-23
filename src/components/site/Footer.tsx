// Rodapé do site em azul profundo, para fechar a página com peso.
//
// Abre com o "Fale com a gente" (no modelo da Formularis): WhatsApp,
// telefone e o horário ao vivo juntos, no mesmo cartão. Antes a chamada
// e o horário ficavam separados, e a chamada repetia a da home logo
// acima. Depois vêm as colunas (marca, navegação, categorias) e a linha
// legal.
import Link from "next/link";
import { asset } from "@/lib/asset";
import { HorarioAtendimento } from "./HorarioAtendimento";
import { BotaoEnviarReceita } from "./BotaoEnviarReceita";
import {
  ANOS_TRADICAO,
  CategoriaDTO,
  UNIDADES,
  WHATSAPP_LOJA,
  WHATSAPP_NUMERO,
  INSTAGRAM_URL,
} from "@/lib/tipos";

const LINK_WHATSAPP = `https://wa.me/${WHATSAPP_NUMERO}`;
const TELEFONE_FIXO = UNIDADES.find((u) => u.telefone)?.telefone ?? null;

const NAVEGACAO = [
  { href: "/", rotulo: "Início" },
  { href: "/sobre", rotulo: "A Viver Bem" },
  { href: "/sobre#como-funciona", rotulo: "Como funciona" },
  { href: "/lojas", rotulo: "Lojas" },
  { href: "/contato", rotulo: "Contato" },
];

function IconeWhatsApp({ tamanho = 22 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0-.1 0 .6-.2 1.3Z" />
    </svg>
  );
}

// Título de coluna, no mesmo padrão nas três
function TituloColuna({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
      {children}
    </p>
  );
}

const classeLink = "inline-flex items-center min-h-11 text-white/60 hover:text-white transition-colors";

export function Footer({ categorias }: { categorias: CategoriaDTO[] }) {
  return (
    <footer className="mt-auto bg-noite text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* ---------- Fale com a gente ---------- */}
        <section aria-labelledby="fale-com-a-gente" className="pt-14 md:pt-16">
          <div className="bg-white/[0.06] border border-white/10 rounded-[1.75rem] px-6 md:px-10 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="selo-secao text-white/60">fale com a gente</p>
              <h2
                id="fale-com-a-gente"
                className="font-display text-2xl md:text-[2rem] font-semibold mt-1.5 leading-tight"
              >
                WhatsApp, telefone ou na loja
              </h2>
              <p className="text-white/60 mt-3 leading-relaxed max-w-lg">
                Tire uma dúvida, envie a sua receita ou combine a retirada. A gente responde
                pelo WhatsApp no horário de atendimento.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-6">
                <a
                  href={LINK_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1eb857] text-white text-lg font-semibold rounded-2xl px-6 py-4 transition-colors active:scale-[0.98]"
                >
                  <IconeWhatsApp />
                  {WHATSAPP_LOJA}
                </a>
                <BotaoEnviarReceita className="inline-flex items-center justify-center gap-2.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold rounded-2xl px-6 py-4 transition active:scale-[0.98]" />
              </div>

              {TELEFONE_FIXO && (
                <p className="text-white/45 text-sm mt-4">
                  Telefone fixo:{" "}
                  <a
                    href={`tel:+55${TELEFONE_FIXO.replace(/\D/g, "")}`}
                    className="inline-flex items-center min-h-11 text-white/75 hover:text-white underline-offset-4 hover:underline"
                  >
                    {TELEFONE_FIXO}
                  </a>
                </p>
              )}
            </div>

            <div className="lg:col-span-5">
              <HorarioAtendimento />
            </div>
          </div>
        </section>

        {/* ---------- Colunas ---------- */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12">
          {/* Marca */}
          <div className="col-span-2 md:col-span-5">
            {/* O logo é colorido, então some no escuro: viramos ele em branco */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/logo.png")}
              alt="Manipulação Viver Bem"
              draggable={false}
              loading="lazy"
              decoding="async"
              width={220}
              height={97}
              className="h-11 w-auto object-contain brightness-0 invert"
            />
            <p className="text-white/60 leading-relaxed mt-5 max-w-xs">
              Há {ANOS_TRADICAO} anos em Petrópolis, com manipulação, homeopatia e
              atendimento de gente que conhece você pelo nome.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              <a
                href={LINK_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-11 h-11 rounded-xl bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.14] flex items-center justify-center transition-colors"
              >
                <IconeWhatsApp tamanho={19} />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-11 h-11 rounded-xl bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.14] flex items-center justify-center transition-colors"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div className="md:col-span-3">
            <TituloColuna>Navegação</TituloColuna>
            <ul className="flex flex-col -my-1.5">
              {NAVEGACAO.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={classeLink}>
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div className="md:col-span-4">
            <TituloColuna>Categorias</TituloColuna>
            <ul className="flex flex-col -my-1.5">
              {categorias.map((c) => (
                <li key={c.id}>
                  <Link href={`/produtos/${c.slug}`} className={classeLink}>
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Linha final ---------- */}
        <div className="border-t border-white/10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-white/40 text-xs leading-relaxed max-w-xl">
            Medicamentos manipulados são preparados somente mediante prescrição de
            profissional habilitado. Os dados informados no pedido (nome e WhatsApp) são
            usados apenas pela Viver Bem para atendimento e ofertas, conforme a LGPD.
          </p>
          <p className="text-white/40 text-xs md:text-right whitespace-nowrap">
            © {new Date().getFullYear()} Manipulação Viver Bem
          </p>
        </div>
      </div>
    </footer>
  );
}
