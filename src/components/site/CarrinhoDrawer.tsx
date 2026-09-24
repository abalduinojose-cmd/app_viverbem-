"use client";
// Gaveta "Seu pedido", em duas etapas:
//   1) "pedido" -> a receita ("vou enviar uma receita") e, se houver,
//                  os produtos industrializados com preço
//   2) "dados"  -> nome, WhatsApp, como receber e, só quando há produto
//                  com preço, a forma de pagamento
// No final tudo vira uma mensagem pronta no WhatsApp da loja, com o
// código do pedido. A foto da receita a pessoa anexa na própria conversa:
// ela nunca passa pelo site.
//
// Manipulado não tem preço nem carrinho (RDC 67/2007, item 5.14): o
// pedido dele é a receita. Por isso a receita vem primeiro aqui.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCarrinho } from "@/lib/carrinho";
import { formatarPreco } from "@/lib/preco";
import { linkWhatsAppPedido, gerarCodigoPedido } from "@/lib/whatsapp";
import { UNIDADES, ENTREGA_RETIRADA, ENTREGA_DELIVERY } from "@/lib/tipos";
import { IconeMoto } from "./IconeMoto";
import { FotoProduto } from "./FotoProduto";
import { IconeReceita } from "./BotaoEnviarReceita";

type Etapa = "pedido" | "dados";

const ETAPAS: { chave: Etapa; rotulo: string }[] = [
  { chave: "pedido", rotulo: "Seu pedido" },
  { chave: "dados", rotulo: "Seus dados" },
];

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão de débito", "Cartão de crédito"];

function IconeCarrinho({ tamanho = 24 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.8h7.9a2 2 0 0 0 2-1.6L21 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20.5" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CarrinhoDrawer() {
  const {
    itens,
    totalItens,
    totalCentavos,
    mudarQuantidade,
    remover,
    limpar,
    receita,
    setReceita,
    produtoVisto,
    setProdutoVisto,
    aberto,
    abrirPedido,
    fecharPedido,
  } = useCarrinho();

  const [etapa, setEtapa] = useState<Etapa>("pedido");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [entrega, setEntrega] = useState("");
  const [unidade, setUnidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacao, setObservacao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  // Guardado no envio, porque limpar() zera a receita logo em seguida
  const [enviouReceita, setEnviouReceita] = useState(false);

  // Fechar sempre volta para a primeira etapa, então a próxima abertura
  // começa do início. Os dados digitados ficam, para não redigitar.
  const fechar = useCallback(() => {
    setEtapa("pedido");
    setEnviado(false);
    fecharPedido();
  }, [fecharPedido]);

  // Esc fecha
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, fechar]);

  // O "Enviar receita" flutuante só aparece depois de rolar: na primeira
  // tela a página já tem o mesmo botão, e os dois juntos se repetem
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 400);
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const temProdutos = itens.length > 0;
  const temAlgo = receita || temProdutos;

  // Retirada: precisa da loja. Entrega: precisa do endereço.
  const ehRetirada = entrega === ENTREGA_RETIRADA;
  const local = ehRetirada ? unidade : endereco.trim();
  const entregaResolvida = entrega.length > 0 && local.length > 0;

  // Pagamento só é pedido quando há produto com preço
  const digitosWhats = whatsapp.replace(/\D/g, "");
  const podeEnviar =
    temAlgo &&
    nome.trim().length > 0 &&
    digitosWhats.length >= 10 &&
    entregaResolvida &&
    (!temProdutos || pagamento.length > 0);

  // Trocar de modo zera a escolha do outro, para não enviar os dois
  function escolherEntrega(modo: string) {
    setEntrega(modo);
    if (modo === ENTREGA_RETIRADA) setEndereco("");
    else setUnidade("");
  }

  function irParaDados() {
    setCodigo(gerarCodigoPedido());
    setEtapa("dados");
  }

  // Registra o pedido na base do painel e abre o WhatsApp, sem travar o
  // envio caso o registro falhe. Na vitrine estática (GitHub Pages) não
  // há servidor para registrar: o pedido vai direto para o WhatsApp.
  function enviarPedido() {
    if (!podeEnviar) return;

    if (process.env.NEXT_PUBLIC_DEMO !== "1") fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        pagamento: temProdutos ? pagamento : "",
        entrega,
        local,
        codigo,
        receita,
        itens: itens.map((i) => ({
          nome: i.nome,
          dosagem: i.dosagem,
          quantidade: i.quantidade,
          precoCentavos: i.precoCentavos,
        })),
      }),
    }).catch(() => {
      /* o pedido segue para o WhatsApp mesmo sem o registro */
    });

    const url = linkWhatsAppPedido(itens, {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      pagamento: temProdutos ? pagamento : "",
      entrega,
      local,
      observacao,
      codigo,
      receita,
      produtoVisto,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setEnviouReceita(receita);
    setEnviado(true);
    limpar();
  }

  const classeCampo =
    "bg-white border border-linha rounded-2xl px-4 py-3.5 text-base placeholder:text-grafite-claro/70 focus:outline-none focus:border-royal focus:ring-4 focus:ring-royal/10 transition-shadow";

  return (
    <>
      {/* Botão flutuante. Com produto no pedido, mostra o total em
          qualquer tela. Sem produto, vira o "Enviar receita" do celular
          (no computador esse botão já está fixo no cabeçalho). */}
      {temProdutos ? (
        <button
          type="button"
          onClick={() => abrirPedido()}
          aria-label="Abrir seu pedido"
          className="degrade-suave fixed bottom-6 right-6 z-40 text-white rounded-full h-14 pl-5 pr-6 flex items-center gap-3 shadow-[0_10px_30px_rgba(224,33,41,0.35)] active:scale-95 transition"
        >
          <span className="relative">
            <IconeCarrinho />
            <span className="absolute -top-2.5 -right-2.5 bg-white text-escarlate text-[0.7rem] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm">
              {totalItens}
            </span>
          </span>
          <span className="font-semibold tabular-nums">{formatarPreco(totalCentavos)}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => abrirPedido({ receita: true })}
          tabIndex={rolou ? 0 : -1}
          aria-hidden={!rolou}
          className={`md:hidden degrade-suave fixed bottom-5 right-5 z-40 text-white rounded-full h-14 pl-5 pr-6 flex items-center gap-2.5 shadow-[0_10px_30px_rgba(224,33,41,0.35)] active:scale-95 transition duration-300 ${
            rolou ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <IconeReceita tamanho={22} />
          <span className="font-semibold">Enviar receita</span>
        </button>
      )}

      {/* Gaveta lateral */}
      {aberto && (
        <div
          className="fixed inset-0 z-50 bg-noite/60 backdrop-blur-sm flex justify-end md:p-3"
          onClick={fechar}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-pedido"
            className="bg-[#f7f9fc] w-full max-w-md h-full flex flex-col animar-surgir shadow-2xl md:rounded-[1.75rem] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---------- Cabeçalho ---------- */}
            <div className="bg-noite text-white px-6 pt-6 pb-5 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {etapa === "dados" && !enviado && (
                    <button
                      type="button"
                      onClick={() => setEtapa("pedido")}
                      aria-label="Voltar"
                      className="shrink-0 w-10 h-10 -ml-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  <h2 id="titulo-pedido" className="font-display text-2xl font-semibold tracking-tight truncate">
                    {enviado ? "Tudo certo" : etapa === "pedido" ? "Seu pedido" : "Seus dados"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={fechar}
                  aria-label="Fechar"
                  className="shrink-0 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center active:scale-90 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Passos do pedido */}
              {!enviado && temAlgo && (
                <div className="flex items-center gap-2 mt-5">
                  {ETAPAS.map((e, i) => {
                    const atual = e.chave === etapa;
                    const passou = e.chave === "pedido" && etapa === "dados";
                    return (
                      <div key={e.chave} className="flex-1 flex flex-col gap-1.5">
                        <span
                          className={`h-1 rounded-full transition-colors ${
                            atual || passou ? "bg-escarlate" : "bg-white/15"
                          }`}
                        />
                        <span
                          className={`text-[0.7rem] tracking-wide transition-colors ${
                            atual ? "text-white" : "text-white/45"
                          }`}
                        >
                          {i + 1}. {e.rotulo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resumo: aparece com produto com preço */}
              {!enviado && temProdutos && (
                <div className="flex items-end justify-between mt-5 pt-4 border-t border-white/10">
                  <span className="text-white/60 text-sm">
                    {receita ? "Receita + " : ""}
                    {totalItens} {totalItens === 1 ? "produto" : "produtos"}
                    {etapa === "dados" && codigo ? ` · ${codigo}` : ""}
                  </span>
                  <span className="font-display text-3xl font-semibold tracking-tight tabular-nums">
                    {formatarPreco(totalCentavos)}
                  </span>
                </div>
              )}
            </div>

            {/* ---------- Confirmação de envio ---------- */}
            {enviado ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-grafite">Pedido enviado</h3>
                <p className="text-grafite-medio leading-relaxed">
                  Abrimos o WhatsApp com o seu pedido <b className="text-grafite">{codigo}</b>.{" "}
                  {enviouReceita
                    ? "Agora é só anexar a foto da receita na conversa. O farmacêutico confere e passa o valor."
                    : "Envie a mensagem e a nossa equipe combina o pagamento e a entrega com você."}
                </p>
                <button
                  type="button"
                  onClick={fechar}
                  className="mt-2 bg-royal hover:bg-royal-escuro text-white font-semibold rounded-2xl px-8 py-3.5 active:scale-95 transition"
                >
                  Concluir
                </button>
              </div>
            ) : etapa === "pedido" ? (
              /* ---------- Etapa 1: o pedido ---------- */
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
                  {/* A receita: o pedido do manipulado */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={receita}
                    onClick={() => setReceita(!receita)}
                    className={`text-left rounded-[1.35rem] border p-4 flex items-start gap-3.5 transition ${
                      receita
                        ? "bg-white border-royal ring-4 ring-royal/10"
                        : "bg-white border-linha hover:border-royal/40"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                        receita ? "bg-royal text-white" : "bg-royal-claro text-royal"
                      }`}
                    >
                      <IconeReceita tamanho={22} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-grafite">Vou enviar uma receita</span>
                      <span className="block text-sm text-grafite-medio leading-snug mt-1">
                        Você anexa a foto da receita na conversa do WhatsApp. O farmacêutico
                        confere e passa o valor.
                      </span>
                    </span>
                    {/* Chave visual do switch */}
                    <span
                      aria-hidden="true"
                      className={`shrink-0 mt-1 w-11 h-6 rounded-full p-0.5 transition-colors ${
                        receita ? "bg-royal" : "bg-linha"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          receita ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </button>

                  {/* De qual manipulado a pessoa veio */}
                  {receita && produtoVisto && (
                    <div className="flex items-center gap-2 bg-royal-claro/70 border border-royal/15 rounded-2xl pl-4 pr-1.5 py-1.5">
                      <span className="flex-1 min-w-0 text-sm text-grafite-medio truncate">
                        Você viu: <b className="text-grafite font-semibold">{produtoVisto}</b>
                      </span>
                      <button
                        type="button"
                        onClick={() => setProdutoVisto(null)}
                        aria-label="Tirar do pedido"
                        className="shrink-0 w-9 h-9 rounded-full text-grafite-claro hover:text-escarlate hover:bg-white flex items-center justify-center transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Produtos com preço (industrializados) */}
                  {temProdutos && (
                    <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-grafite-claro mt-3 px-1">
                      Produtos
                    </p>
                  )}
                  {itens.map((item, i) => (
                    <div
                      key={`${item.produtoId}-${item.dosagem ?? ""}`}
                      className="animar-surgir bg-white border border-linha rounded-[1.35rem] p-3.5 flex gap-3.5 sombra-card"
                      style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                    >
                      <div className="shrink-0 w-[4.5rem] rounded-2xl bg-royal-nevoa border border-linha/70 overflow-hidden flex items-center justify-center p-1.5 self-stretch">
                        <FotoProduto
                          fotoUrl={item.fotoUrl ?? null}
                          nome={item.nome}
                          className="max-w-full max-h-full !object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-grafite leading-snug line-clamp-2">
                              {item.nome}
                            </p>
                            {item.dosagem && (
                              <span className="inline-block mt-1 bg-royal-claro text-royal text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full">
                                {item.dosagem}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remover(item.produtoId, item.dosagem)}
                            aria-label={`Remover ${item.nome}`}
                            className="shrink-0 w-9 h-9 -mr-2 -mt-1.5 rounded-full text-grafite-claro hover:text-escarlate hover:bg-escarlate/10 flex items-center justify-center transition-colors"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-2.5">
                          <div className="flex items-center bg-royal-nevoa border border-linha rounded-full p-0.5">
                            <button
                              type="button"
                              onClick={() => mudarQuantidade(item.produtoId, item.dosagem, -1)}
                              aria-label="Diminuir"
                              className="w-8 h-8 rounded-full bg-white text-grafite-medio hover:text-royal sombra-card text-base flex items-center justify-center active:scale-90 transition"
                            >
                              −
                            </button>
                            <span className="text-sm font-bold text-grafite w-7 text-center tabular-nums">
                              {item.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => mudarQuantidade(item.produtoId, item.dosagem, 1)}
                              aria-label="Aumentar"
                              className="w-8 h-8 rounded-full bg-white text-grafite-medio hover:text-royal sombra-card text-base flex items-center justify-center active:scale-90 transition"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            {item.quantidade > 1 && (
                              <p className="text-[0.7rem] text-grafite-claro tabular-nums leading-none mb-1">
                                {item.quantidade} × {formatarPreco(item.precoCentavos)}
                              </p>
                            )}
                            <p className="text-grafite font-bold tabular-nums leading-none">
                              {formatarPreco(item.precoCentavos * item.quantidade)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Nada escolhido ainda */}
                  {!temAlgo && (
                    <p className="text-sm text-grafite-claro text-center leading-relaxed px-4 pt-4">
                      Marque a receita acima para começar, ou{" "}
                      <Link href="/produtos" onClick={fechar} className="text-royal font-medium hover:underline">
                        veja os produtos
                      </Link>
                      .
                    </p>
                  )}
                </div>

                <div className="bg-white border-t border-linha px-5 pt-4 pb-5">
                  {temProdutos && (
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-grafite-medio">
                        Produtos ({totalItens} {totalItens === 1 ? "item" : "itens"})
                      </span>
                      <span className="font-bold text-grafite tabular-nums">
                        {formatarPreco(totalCentavos)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-grafite-claro mb-4">
                    {receita
                      ? "Na próxima etapa você escolhe se retira na loja ou recebe em casa."
                      : "Entrega ou retirada e pagamento na próxima etapa."}
                  </p>
                  <button
                    type="button"
                    onClick={irParaDados}
                    disabled={!temAlgo}
                    className="degrade-suave w-full flex items-center justify-center gap-3 text-white text-lg font-semibold rounded-2xl px-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
                  >
                    Continuar
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {temProdutos && (
                    <button
                      type="button"
                      onClick={() => itens.forEach((i) => remover(i.produtoId, i.dosagem))}
                      className="w-full mt-1.5 min-h-11 text-grafite-claro hover:text-escarlate font-medium text-sm transition-colors"
                    >
                      Tirar todos os produtos
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* ---------- Etapa 2: dados ---------- */
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="font-semibold text-grafite text-sm">Seu nome *</span>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      autoFocus
                      autoComplete="name"
                      placeholder="Como podemos te chamar?"
                      className={classeCampo}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-semibold text-grafite text-sm">Seu WhatsApp *</span>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(24) 99999-9999"
                      className={classeCampo}
                    />
                  </label>

                  {/* Como receber o pedido */}
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-grafite text-sm">Como você quer receber *</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          modo: ENTREGA_RETIRADA,
                          titulo: "Retirar na loja",
                          apoio: "sem taxa",
                          icone: (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 9.5 5.4 5A1.5 1.5 0 0 1 6.8 4h10.4a1.5 1.5 0 0 1 1.4 1L20 9.5M4 9.5h16M4 9.5v9A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-9M9.5 13h5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ),
                        },
                        {
                          modo: ENTREGA_DELIVERY,
                          titulo: "Receber em casa",
                          apoio: "de moto",
                          icone: <IconeMoto tamanho={24} />,
                        },
                      ].map((opcao) => (
                        <button
                          key={opcao.modo}
                          type="button"
                          onClick={() => escolherEntrega(opcao.modo)}
                          aria-pressed={entrega === opcao.modo}
                          className={`rounded-2xl px-3 py-4 border transition active:scale-95 flex flex-col items-center gap-1.5 text-center ${
                            entrega === opcao.modo
                              ? "bg-royal text-white border-royal"
                              : "bg-white text-grafite border-linha hover:border-royal/40"
                          }`}
                        >
                          {opcao.icone}
                          <span className="text-sm font-medium leading-tight mt-0.5">{opcao.titulo}</span>
                          <span
                            className={`text-[0.7rem] leading-none ${
                              entrega === opcao.modo ? "text-white/65" : "text-grafite-claro"
                            }`}
                          >
                            {opcao.apoio}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Retirada: escolher em qual das 3 lojas */}
                    {ehRetirada && (
                      <div className="flex flex-col gap-2 mt-1.5">
                        <span className="text-sm text-grafite-medio">Em qual unidade você prefere retirar?</span>
                        {UNIDADES.map((u) => {
                          const marcada = unidade.startsWith(u.bairro);
                          return (
                            <button
                              key={u.bairro}
                              type="button"
                              onClick={() => setUnidade(`${u.bairro}, ${u.endereco}`)}
                              aria-pressed={marcada}
                              className={`text-left rounded-2xl px-4 py-3 border transition active:scale-[0.98] flex items-start gap-3 ${
                                marcada ? "bg-royal-claro border-royal" : "bg-white border-linha hover:border-royal/40"
                              }`}
                            >
                              <span
                                className={`shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors ${
                                  marcada ? "border-royal" : "border-grafite-claro"
                                }`}
                                aria-hidden="true"
                              >
                                {marcada && <span className="w-2 h-2 rounded-full bg-royal" />}
                              </span>
                              <span className="min-w-0">
                                <span className="block font-semibold text-grafite text-sm">{u.bairro}</span>
                                <span className="block text-grafite-medio text-xs leading-snug mt-0.5">
                                  {u.endereco}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Entrega: endereço, senão a equipe não tem para onde levar */}
                    {entrega === ENTREGA_DELIVERY && (
                      <label className="flex flex-col gap-2 mt-1.5">
                        <span className="text-sm text-grafite-medio">Endereço da entrega</span>
                        <textarea
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          rows={2}
                          autoComplete="street-address"
                          placeholder="Rua, número, complemento e bairro"
                          className={`${classeCampo} resize-y`}
                        />
                        <span className="text-xs text-grafite-claro leading-relaxed">
                          A equipe confirma a taxa e o prazo da entrega pelo WhatsApp.
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Forma de pagamento: só para produto com preço. Na
                      receita o valor ainda vai ser passado. */}
                  {temProdutos && (
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-grafite text-sm">Forma de pagamento *</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {FORMAS_PAGAMENTO.map((forma) => (
                          <button
                            key={forma}
                            type="button"
                            onClick={() => setPagamento(forma)}
                            aria-pressed={pagamento === forma}
                            className={`rounded-2xl px-4 py-3.5 text-sm font-medium border transition active:scale-95 ${
                              pagamento === forma
                                ? "bg-royal text-white border-royal"
                                : "bg-white text-grafite border-linha hover:border-royal/40"
                            }`}
                          >
                            {forma}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex flex-col gap-2">
                    <span className="font-semibold text-grafite text-sm">
                      Observação <span className="text-grafite-claro font-normal">(opcional)</span>
                    </span>
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={3}
                      placeholder="Alguma preferência ou informação para a equipe?"
                      className={`${classeCampo} resize-y`}
                    />
                  </label>

                  {/* Resumo */}
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-grafite text-sm">Resumo</span>
                    {receita && (
                      <div className="bg-white border border-linha rounded-2xl p-2.5 flex items-center gap-3">
                        <span className="shrink-0 w-11 h-11 rounded-xl bg-royal-claro text-royal flex items-center justify-center">
                          <IconeReceita tamanho={20} />
                        </span>
                        <span className="flex-1 min-w-0 text-sm text-grafite leading-snug">
                          Receita, com a foto no WhatsApp
                          {produtoVisto && (
                            <span className="block text-xs text-grafite-claro truncate">Você viu: {produtoVisto}</span>
                          )}
                        </span>
                        <span className="text-xs text-grafite-claro shrink-0">valor a combinar</span>
                      </div>
                    )}
                    {itens.map((item) => (
                      <div
                        key={`r-${item.produtoId}-${item.dosagem ?? ""}`}
                        className="bg-white border border-linha rounded-2xl p-2.5 flex items-center gap-3"
                      >
                        <div className="shrink-0 w-11 h-11 rounded-xl bg-royal-nevoa overflow-hidden flex items-center justify-center p-1">
                          <FotoProduto
                            fotoUrl={item.fotoUrl ?? null}
                            nome={item.nome}
                            className="max-w-full max-h-full !object-contain"
                          />
                        </div>
                        <span className="flex-1 min-w-0 text-sm text-grafite truncate">
                          {item.quantidade}× {item.nome}
                          {item.dosagem ? ` (${item.dosagem})` : ""}
                        </span>
                        <span className="text-sm font-semibold text-grafite tabular-nums">
                          {formatarPreco(item.precoCentavos * item.quantidade)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border-t border-linha px-5 py-5">
                  <button
                    type="button"
                    onClick={enviarPedido}
                    disabled={!podeEnviar}
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1eb857] disabled:opacity-40 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-2xl px-6 py-4 transition active:scale-[0.98]"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0-.1 0 .6-.2 1.3Z" />
                    </svg>
                    Enviar pedido no WhatsApp
                  </button>
                  <p className="text-xs text-grafite-claro text-center mt-3 leading-relaxed">
                    {receita && "Anexe a foto da receita logo depois da mensagem. "}
                    Seus dados (nome e WhatsApp) ficam com a Viver Bem apenas para
                    atendimento e ofertas, conforme a LGPD.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
