// Converte o produto do banco para o formato que as telas recebem.
// Antes esse mapeamento estava copiado em três arquivos, e cada campo
// novo precisava ser lembrado nos três.
import type { Produto } from "@prisma/client";
import { ProdutoDTO, VENDA_MANIPULADO } from "./tipos";

export function produtoParaDTO(
  p: Produto & { categoria?: { nome: string } | null }
): ProdutoDTO {
  return {
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    descricao: p.descricao,
    precoCentavos: p.precoCentavos,
    tipo: p.tipo,
    venda: p.venda || VENDA_MANIPULADO,
    aprovado: p.aprovado,
    fotoUrl: p.fotoUrl,
    ativo: p.ativo,
    novidade: p.novidade,
    destaque: p.destaque,
    ordem: p.ordem,
    categoriaId: p.categoriaId,
    categoriaNome: p.categoria?.nome ?? null,
    dosagens: p.dosagens,
    composicao: p.composicao,
    modoUso: p.modoUso,
    indicacoes: p.indicacoes,
    apresentacao: p.apresentacao,
  };
}
