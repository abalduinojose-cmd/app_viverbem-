// Texto e ilustração de cada categoria, para a home e as páginas de
// categoria. O texto descreve O QUE a farmácia prepara em cada área,
// nunca para que serve: manipulado não pode ter promessa de efeito.
// Categoria nova cadastrada no painel cai no texto e na ilustração padrão.

const POR_SLUG: Record<string, { descricao: string; imagem: string }> = {
  "dermatologia-estetica": {
    descricao: "Cremes, séruns, géis e loções preparados a partir da prescrição.",
    imagem: "/uploads/creme.svg",
  },
  "vitaminas-suplementos": {
    descricao: "Cápsulas, pós e gomas com os ativos e as doses indicados na prescrição.",
    imagem: "/uploads/capsulas.svg",
  },
  "cabelos-unhas": {
    descricao: "Loções, shampoos e cápsulas manipulados conforme a prescrição.",
    imagem: "/uploads/locao.svg",
  },
  "saude-da-mulher": {
    descricao: "Fórmulas em cápsulas e em pó preparadas conforme a prescrição.",
    imagem: "/uploads/feminino.svg",
  },
  "saude-do-homem": {
    descricao: "Fórmulas em cápsulas preparadas conforme a prescrição.",
    imagem: "/uploads/serum.svg",
  },
  "homeopatia-florais": {
    descricao: "Medicamentos homeopáticos e florais preparados conforme a receita.",
    imagem: "/uploads/floral.svg",
  },
};

const PADRAO = {
  descricao: "Fórmulas preparadas conforme a prescrição.",
  imagem: "/uploads/capsulas.svg",
};

export function infoCategoria(slug: string) {
  return POR_SLUG[slug] ?? PADRAO;
}
