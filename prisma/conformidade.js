// Nomes genéricos e descrições neutras dos manipulados do catálogo de
// exemplo. Proposta de 23/09/2026, A VALIDAR PELO FARMACÊUTICO RESPONSÁVEL
// antes de o site ir ao ar.
//
// Por quê: manipulado não pode ser exposto ao público como produto de
// prateleira (RDC 67/2007, item 5.14; caso PHARMES na RE nº 3.547/2026).
// Então o nome sai da marca de fantasia e passa a ser a composição, e a
// descrição diz o que é, sem promessa de efeito ou resultado.
//
// A chave é o nome ANTIGO. Usado por scripts/aplicar-conformidade.js
// (banco que já existe) e por prisma/seed.js (banco novo).
//
//   ativo: false  -> sai do site. Produto sem composição definida, em
//                    que o próprio nome era a promessa, ou combo.
//   fotoUrl       -> troca a foto de pote com marca no rótulo por uma
//                    ilustração neutra. A foto original continua em
//                    public/uploads/, para o caso de o farmacêutico
//                    classificar o item como industrializado.

module.exports = {
  // --- Dermatologia & Estética ---
  "Creme Facial Ácido Hialurônico": {
    nome: "Creme facial com ácido hialurônico",
    descricao: "Creme facial com ácido hialurônico, manipulado conforme a prescrição.",
  },
  "Sérum Vitamina C 10%": {
    nome: "Sérum com vitamina C",
    descricao: "Sérum facial com vitamina C, na concentração indicada na prescrição.",
  },
  "Gel Redutor de Medidas": {
    nome: "Gel corporal",
    descricao: "Gel de uso corporal, manipulado com os ativos indicados na prescrição.",
  },
  "Glow Cream": {
    nome: "Creme facial com ceramida e niacinamida",
    descricao:
      "Creme facial com ceramida, niacinamida e ácido hialurônico, manipulado conforme a prescrição.",
    fotoUrl: "/uploads/creme.svg",
  },
  "Firm Defense Serum": {
    nome: "Sérum com ceramidas e centella",
    descricao:
      "Sérum facial com ceramidas e Centella asiatica, manipulado conforme a prescrição.",
    fotoUrl: "/uploads/serum.svg",
  },
  "ZincBlock FPS": {
    nome: "Protetor solar com óxido de zinco",
    descricao:
      "Fotoprotetor com óxido de zinco e dióxido de titânio, manipulado conforme a prescrição.",
    fotoUrl: "/uploads/creme.svg",
  },
  "Bastão Clareador": {
    nome: "Bastão com vitamina C",
    descricao:
      "Bastão de uso tópico com vitamina C e manteigas vegetais, manipulado conforme a prescrição.",
    fotoUrl: "/uploads/gel.svg",
  },
  "Pó Finalizador FPB 20": {
    nome: "Pó facial finalizador",
    descricao: "Pó facial com sílica e óxidos minerais, manipulado conforme a prescrição.",
    fotoUrl: "/uploads/creme.svg",
  },
  "Protetor Solar Facial FPS 50": {
    nome: "Protetor solar facial",
    descricao: "Fotoprotetor facial manipulado conforme a prescrição.",
  },
  "Creme Ácido Retinoico": {
    nome: "Creme com ácido retinoico",
    descricao: "Creme com ácido retinoico, na concentração indicada na prescrição.",
  },

  // --- Vitaminas & Suplementos ---
  "Colágeno Verisol® 30 doses": {
    nome: "Colágeno hidrolisado (Verisol®)",
    descricao: "Colágeno hidrolisado em peptídeos, na dose indicada na prescrição.",
  },
  "Vitamina D3": {
    nome: "Vitamina D3",
    descricao: "Vitamina D3 em cápsulas, na dose indicada na prescrição.",
  },
  "Polivitamínico Energia 30 doses": {
    nome: "Polivitamínico",
    descricao: "Vitaminas e minerais em cápsulas, na composição indicada na prescrição.",
  },
  "Fórmula Sono Reparador": {
    nome: "Fórmula com melatonina, triptofano e magnésio",
    descricao:
      "Cápsulas com melatonina, triptofano, magnésio quelado e vitamina B6, manipuladas conforme a prescrição.",
    fotoUrl: "/uploads/capsulas.svg",
  },
  "CitoRepair™ 2.0": {
    nome: "Fórmula com espermidina e resveratrol",
    descricao:
      "Cápsulas com espermidina, resveratrol, precursores de NAD+ e coenzima Q10, manipuladas conforme a prescrição.",
    fotoUrl: "/uploads/capsulas.svg",
  },
  "Ômega 3 Viver Bem": {
    nome: "Ômega 3 com EPA e DHA",
    descricao: "Óleo de peixe concentrado em cápsulas, com EPA e DHA, na dose indicada na prescrição.",
    fotoUrl: "/uploads/capsulas.svg",
  },
  VitaFlex: {
    nome: "Fórmula com curcumina e colágeno tipo II",
    descricao:
      "Cápsulas com curcumina, colágeno tipo II, ácido hialurônico, magnésio e vitaminas C, D e K, manipuladas conforme a prescrição.",
    fotoUrl: "/uploads/capsulas.svg",
  },
  "Creatina Gummy": {
    nome: "Creatina em gomas",
    descricao: "Creatina monoidratada em gomas, na dose indicada na prescrição.",
    fotoUrl: "/uploads/vitamina.svg",
  },
  "Caramelo de Creatina": {
    nome: "Caramelo de creatina",
    descricao:
      "Creatina monoidratada em caramelos com farinha de amêndoa, na dose indicada na prescrição.",
    fotoUrl: "/uploads/vitamina.svg",
  },
  "Composto Emagrecedor": {
    nome: "Fórmula em cápsulas",
    descricao: "Fórmula em cápsulas preparada com os ativos e as doses indicados na prescrição.",
    fotoUrl: "/uploads/capsulas.svg",
    ativo: false,
  },
  "Ômega 3 Concentrado": {
    nome: "Ômega 3 concentrado",
    descricao: "EPA e DHA em cápsulas, na dose indicada na prescrição.",
  },
  "Magnésio Dimalato": {
    nome: "Magnésio dimalato",
    descricao: "Magnésio dimalato em cápsulas, na dose indicada na prescrição.",
  },
  "Creatina Monohidratada": {
    nome: "Creatina monoidratada",
    descricao: "Creatina monoidratada, na dose indicada na prescrição.",
  },
  "Coenzima Q10": {
    nome: "Coenzima Q10",
    descricao: "Coenzima Q10 em cápsulas, na dose indicada na prescrição.",
  },

  // --- Cabelos & Unhas ---
  "Loção Capilar Minoxidil": {
    nome: "Loção capilar com minoxidil",
    descricao: "Loção capilar com minoxidil, na concentração indicada na prescrição.",
  },
  "Cápsulas Cabelos & Unhas Fortes": {
    nome: "Cápsulas com biotina e silício orgânico",
    descricao:
      "Cápsulas com biotina, silício orgânico e outros nutrientes, manipuladas conforme a prescrição.",
  },
  "Shampoo Antiqueda": {
    nome: "Shampoo manipulado",
    descricao: "Shampoo com os ativos indicados na prescrição.",
  },

  // --- Saúde da Mulher ---
  "Composto Feminino Equilíbrio": {
    nome: "Composto feminino",
    descricao: "Composto em cápsulas preparado conforme a prescrição.",
    ativo: false,
  },
  Cranberry: {
    nome: "Cranberry em cápsulas",
    descricao: "Extrato de cranberry em cápsulas, na dose indicada na prescrição.",
  },
  "Colágeno + Ácido Hialurônico": {
    nome: "Colágeno com ácido hialurônico",
    descricao:
      "Colágeno e ácido hialurônico em pó para dissolver, na dose indicada na prescrição.",
  },

  // --- Saúde do Homem ---
  "Composto Masculino Vigor": {
    nome: "Composto masculino",
    descricao: "Composto em cápsulas preparado conforme a prescrição.",
    ativo: false,
  },
  "Saw Palmetto": {
    nome: "Saw palmetto em cápsulas",
    descricao: "Extrato de saw palmetto em cápsulas, na dose indicada na prescrição.",
  },
  "Testoviver Homem 45+": {
    nome: "Fórmula com zinco, maca peruana e tribulus",
    descricao:
      "Cápsulas com zinco, maca peruana e tribulus, manipuladas conforme a prescrição.",
  },

  // --- Homeopatia & Florais ---
  "Floral Tranquilidade 30ml": {
    nome: "Floral manipulado",
    descricao: "Composição floral preparada conforme a prescrição. Uso sublingual.",
  },
  "Homeopatia Personalizada": {
    nome: "Homeopatia personalizada",
    descricao: "Medicamento homeopático preparado conforme a receita do prescritor.",
  },

  // --- Combos: promoção de manipulado não pode, então saem do site ---
  "Combo Pele Radiante": { ativo: false },
  "Combo Cabelos Fortes": { ativo: false },
  "Combo Imunidade em Dia": { ativo: false },
};
