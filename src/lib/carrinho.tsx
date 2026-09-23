"use client";
// Pedido do site (estado no cliente + localStorage). Fecha pelo WhatsApp.
//
// Tem duas partes que podem ir juntas na mesma mensagem:
//   - a RECEITA: a pessoa avisa que vai mandar a foto da prescrição.
//     Vale para manipulado, que não tem preço nem carrinho no site;
//   - os ITENS: só produto industrializado com registro, que tem preço.
//
// A gaveta também mora aqui, para qualquer botão "Enviar receita" do
// site (cabeçalho, home, página de produto) conseguir abri-la.
//
// Uso: envolva a árvore com <CarrinhoProvider> e acesse com useCarrinho().

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ItemCarrinho {
  produtoId: number;
  nome: string;
  precoCentavos: number;
  dosagem: string | null; // dosagem escolhida (ex.: "500mg") ou null
  quantidade: number;
  fotoUrl?: string | null;
}

interface OpcoesAbertura {
  /** Já abre com "Vou enviar uma receita" marcado */
  receita?: boolean;
  /** Nome do manipulado de onde a pessoa veio, para a equipe saber */
  produtoVisto?: string | null;
}

interface ContextoCarrinho {
  itens: ItemCarrinho[];
  totalItens: number;
  totalCentavos: number;
  adicionar: (item: Omit<ItemCarrinho, "quantidade">, quantidade?: number) => void;
  mudarQuantidade: (produtoId: number, dosagem: string | null, delta: number) => void;
  remover: (produtoId: number, dosagem: string | null) => void;
  limpar: () => void;

  // Receita e gaveta
  receita: boolean;
  setReceita: (marcada: boolean) => void;
  produtoVisto: string | null;
  setProdutoVisto: (nome: string | null) => void;
  aberto: boolean;
  abrirPedido: (opcoes?: OpcoesAbertura) => void;
  fecharPedido: () => void;
}

const Contexto = createContext<ContextoCarrinho | null>(null);

// "v2": o carrinho antigo podia ter manipulado com preço. Trocando a
// chave, o que ficou salvo no navegador de quem já visitou é ignorado.
const CHAVE_STORAGE = "viverbem_pedido_v2";

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [receita, setReceita] = useState(false);
  const [produtoVisto, setProdutoVisto] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);

  // Carrega o que ficou salvo (sobrevive a navegações e recarregamentos)
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      /* storage indisponível ou corrompido: começa vazio */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      /* sem storage, o pedido vive só em memória */
    }
  }, [itens]);

  // Mesmo produto com dosagens diferentes = itens separados
  const mesmaLinha = (a: ItemCarrinho, produtoId: number, dosagem: string | null) =>
    a.produtoId === produtoId && a.dosagem === dosagem;

  const adicionar = useCallback(
    (item: Omit<ItemCarrinho, "quantidade">, quantidade = 1) => {
      setItens((atual) => {
        const existente = atual.find((i) => mesmaLinha(i, item.produtoId, item.dosagem));
        if (existente) {
          return atual.map((i) =>
            mesmaLinha(i, item.produtoId, item.dosagem)
              ? { ...i, quantidade: i.quantidade + quantidade }
              : i
          );
        }
        return [...atual, { ...item, quantidade }];
      });
    },
    []
  );

  const mudarQuantidade = useCallback(
    (produtoId: number, dosagem: string | null, delta: number) => {
      setItens((atual) =>
        atual
          .map((i) =>
            mesmaLinha(i, produtoId, dosagem) ? { ...i, quantidade: i.quantidade + delta } : i
          )
          .filter((i) => i.quantidade > 0)
      );
    },
    []
  );

  const remover = useCallback((produtoId: number, dosagem: string | null) => {
    setItens((atual) => atual.filter((i) => !mesmaLinha(i, produtoId, dosagem)));
  }, []);

  // Depois do envio: esvazia tudo, receita inclusive
  const limpar = useCallback(() => {
    setItens([]);
    setReceita(false);
    setProdutoVisto(null);
  }, []);

  const abrirPedido = useCallback((opcoes?: OpcoesAbertura) => {
    if (opcoes?.receita) setReceita(true);
    if (opcoes?.produtoVisto !== undefined) setProdutoVisto(opcoes.produtoVisto);
    setAberto(true);
  }, []);

  const fecharPedido = useCallback(() => setAberto(false), []);

  const valor = useMemo<ContextoCarrinho>(() => {
    const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);
    const totalCentavos = itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0);
    return {
      itens,
      totalItens,
      totalCentavos,
      adicionar,
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
    };
  }, [itens, adicionar, mudarQuantidade, remover, limpar, receita, produtoVisto, aberto, abrirPedido, fecharPedido]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrinho(): ContextoCarrinho {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>");
  }
  return contexto;
}
