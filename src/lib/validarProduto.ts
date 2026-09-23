// Valida e normaliza o corpo do produto enviado pelo formulário do
// painel (usado nas rotas de criar e editar produto).
//
// Regra de conformidade aplicada aqui, e não só na tela, para valer
// qualquer que seja o caminho: produto MANIPULADO não guarda o que
// faria dele um "produto de prateleira" no site (dosagem escolhível,
// apresentação fixa, modo de uso, indicações de efeito, selos de
// novidade e destaque). O preço, se vier, fica só para uso interno.
import {
  TIPO_COMBO,
  TIPO_PRODUTO,
  VENDA_INDUSTRIALIZADO,
  VENDA_MANIPULADO,
} from "@/lib/tipos";

function textoOuNulo(valor: unknown): string | null {
  return valor ? String(valor).trim() || null : null;
}

export function validarCorpoProduto(corpo: Record<string, unknown>) {
  const nome = String(corpo.nome ?? "").trim();
  const descricao = String(corpo.descricao ?? "").trim();
  const tipo = corpo.tipo === TIPO_COMBO ? TIPO_COMBO : TIPO_PRODUTO;
  const venda = corpo.venda === VENDA_INDUSTRIALIZADO ? VENDA_INDUSTRIALIZADO : VENDA_MANIPULADO;
  const industrializado = venda === VENDA_INDUSTRIALIZADO;

  // Preço só é obrigatório para quem é vendido com preço
  const precoBruto = corpo.precoCentavos;
  const precoCentavos = precoBruto === null || precoBruto === undefined || precoBruto === "" ? 0 : Number(precoBruto);

  if (!nome) return { erro: "Informe o nome do produto." } as const;
  if (!descricao) return { erro: "Informe a descrição." } as const;
  if (!Number.isInteger(precoCentavos) || precoCentavos < 0)
    return { erro: "Preço inválido." } as const;
  if (industrializado && precoCentavos === 0)
    return { erro: "Produto industrializado precisa de preço." } as const;

  return {
    dados: {
      nome,
      descricao,
      precoCentavos,
      tipo,
      venda,
      fotoUrl: corpo.fotoUrl ? String(corpo.fotoUrl) : null,
      ativo: corpo.ativo !== false,
      novidade: industrializado && corpo.novidade === true,
      destaque: industrializado && corpo.destaque === true,
      categoriaId: corpo.categoriaId ? Number(corpo.categoriaId) : null,
      // Dosagens: texto livre separado por vírgula (ex.: "250mg, 500mg")
      dosagens: industrializado ? textoOuNulo(corpo.dosagens) : null,
      composicao: textoOuNulo(corpo.composicao),
      modoUso: industrializado ? textoOuNulo(corpo.modoUso) : null,
      indicacoes: industrializado ? textoOuNulo(corpo.indicacoes) : null,
      apresentacao: industrializado ? textoOuNulo(corpo.apresentacao) : null,
    },
  } as const;
}
