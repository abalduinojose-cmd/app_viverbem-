"use client";
// Ações da página do produto: escolher a dosagem (se houver),
// a quantidade e adicionar ao carrinho (que fecha pelo WhatsApp).
import { useState } from "react";
import { ProdutoDTO, listarDosagens } from "@/lib/tipos";
import { formatarPreco } from "@/lib/preco";
import { useCarrinho } from "@/lib/carrinho";

export function AcoesProduto({ produto }: { produto: ProdutoDTO }) {
  const { adicionar } = useCarrinho();
  const dosagens = listarDosagens(produto.dosagens);
  const [dosagem, setDosagem] = useState<string | null>(dosagens[0] ?? null);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  function adicionarAoCarrinho() {
    adicionar(
      {
        produtoId: produto.id,
        nome: produto.nome,
        precoCentavos: produto.precoCentavos,
        dosagem,
        fotoUrl: produto.fotoUrl,
      },
      quantidade
    );
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1600);
  }

  return (
    <div className="mt-auto">
      {/* Dosagens */}
      {dosagens.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-grafite mb-2.5">Escolha a dosagem</p>
          <div className="flex flex-wrap gap-2.5">
            {dosagens.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDosagem(d)}
                className={`rounded-xl px-6 py-3 text-lg font-semibold border transition-all active:scale-95 ${
                  dosagem === d
                    ? "bg-royal text-white border-royal"
                    : "bg-white text-grafite border-linha hover:border-royal/40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preço + quantidade */}
      <div className="flex items-end justify-between gap-4 mt-7">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-grafite-claro">Valor</p>
          <p className="text-4xl font-bold text-royal tracking-tight tabular-nums leading-none mt-1">
            {formatarPreco(produto.precoCentavos)}
          </p>
        </div>

        <div className="flex items-center bg-royal-nevoa border border-linha rounded-full p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="w-11 h-11 rounded-full bg-white text-royal text-2xl font-semibold flex items-center justify-center active:scale-90 transition-transform sombra-card"
          >
            −
          </button>
          <span className="text-xl font-bold text-grafite w-8 text-center tabular-nums">
            {quantidade}
          </span>
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.min(20, q + 1))}
            aria-label="Aumentar quantidade"
            className="w-11 h-11 rounded-full bg-white text-royal text-2xl font-semibold flex items-center justify-center active:scale-90 transition-transform sombra-card"
          >
            +
          </button>
        </div>
      </div>

      {/* Adicionar ao carrinho */}
      <button
        type="button"
        onClick={adicionarAoCarrinho}
        className={`w-full mt-5 flex items-center justify-center gap-3 text-white text-lg font-semibold rounded-2xl px-6 py-5 transition-all active:scale-[0.98] ${
          adicionado ? "bg-green-600" : "degrade-suave"
        }`}
      >
        {adicionado ? (
          "✓ Adicionado ao pedido!"
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            Adicionar ao pedido
          </>
        )}
      </button>
    </div>
  );
}
