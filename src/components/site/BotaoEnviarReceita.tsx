"use client";
// "Enviar receita": abre a gaveta do pedido já com a receita marcada.
// É o caminho do manipulado, que não tem preço nem carrinho no site.
// Usado no cabeçalho, na home, na página de produto e no "Sobre".
import { useCarrinho } from "@/lib/carrinho";

export function IconeReceita({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function BotaoEnviarReceita({
  className = "",
  produtoVisto = null,
  comIcone = true,
  children,
}: {
  className?: string;
  /** Manipulado de onde a pessoa veio, para a equipe saber no WhatsApp */
  produtoVisto?: string | null;
  comIcone?: boolean;
  children?: React.ReactNode;
}) {
  const { abrirPedido } = useCarrinho();
  return (
    <button
      type="button"
      onClick={() => abrirPedido({ receita: true, produtoVisto })}
      className={className}
    >
      {comIcone && <IconeReceita />}
      {children ?? "Enviar receita"}
    </button>
  );
}
