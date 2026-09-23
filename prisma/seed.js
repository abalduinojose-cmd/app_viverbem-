// ============================================================
// Seed — popula o banco com dados de exemplo para demonstração.
//
// Rode com: npm run db:seed
// ATENÇÃO: este script APAGA os produtos/categorias existentes
// e recria os de exemplo. Não rode em produção com dados reais.
// O usuário admin é criado apenas se ainda não existir.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const avaliacoesGoogle = require("./avaliacoes-google");
const conformidade = require("./conformidade");

const db = new PrismaClient();

// Gera o slug do produto (mesma regra de src/lib/slug.ts)
function slugificar(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // ---------- Usuário admin (não recria se já existir) ----------
  const adminExiste = await db.usuario.findUnique({
    where: { email: "admin@viverbem.com.br" },
  });
  if (!adminExiste) {
    await db.usuario.create({
      data: {
        nome: "Administrador",
        email: "admin@viverbem.com.br",
        // Senha inicial: viverbem123 (troque depois!)
        senhaHash: bcrypt.hashSync("viverbem123", 10),
        papel: "ADMIN",
      },
    });
    console.log("Usuário admin criado: admin@viverbem.com.br / viverbem123");
  }

  // ---------- Usuário operador de exemplo (Fase 2: acesso restrito) ----------
  const operadorExiste = await db.usuario.findUnique({
    where: { email: "operador@viverbem.com.br" },
  });
  if (!operadorExiste) {
    await db.usuario.create({
      data: {
        nome: "Operador da Loja",
        email: "operador@viverbem.com.br",
        // Senha inicial: operador123 (troque depois!)
        senhaHash: bcrypt.hashSync("operador123", 10),
        papel: "OPERADOR",
      },
    });
    console.log("Usuário operador criado: operador@viverbem.com.br / operador123");
  }

  // ---------- Avaliacoes reais do Google ----------
  // Vem de prisma/avaliacoes-google.js, gerado a partir do perfil
  // do Google da farmacia. O gestor pode editar cada uma no painel.
  await db.depoimento.deleteMany();
  const depoimentos = avaliacoesGoogle.map((a) => ({
    nome: a.nome,
    texto: a.texto,
    fotoUrl: a.fotoUrl,
    nota: 5,
    fonte: "Google",
  }));
  for (let i = 0; i < depoimentos.length; i++) {
    await db.depoimento.create({ data: { ...depoimentos[i], ordem: i } });
  }

  // ---------- Limpa e recria categorias/produtos de exemplo ----------
  await db.produto.deleteMany();
  await db.categoria.deleteMany();

  const categorias = {};
  const listaCategorias = [
    { nome: "Dermatologia & Estética", slug: "dermatologia-estetica" },
    { nome: "Vitaminas & Suplementos", slug: "vitaminas-suplementos" },
    { nome: "Cabelos & Unhas", slug: "cabelos-unhas" },
    { nome: "Saúde da Mulher", slug: "saude-da-mulher" },
    { nome: "Saúde do Homem", slug: "saude-do-homem" },
    { nome: "Homeopatia & Florais", slug: "homeopatia-florais" },
  ];
  for (let i = 0; i < listaCategorias.length; i++) {
    const c = listaCategorias[i];
    categorias[c.slug] = await db.categoria.create({
      data: { nome: c.nome, slug: c.slug, ordem: i },
    });
  }

  // Produtos de exemplo (fotos são placeholders SVG em public/uploads/)
  const produtos = [
    // --- Dermatologia & Estética ---
    {
      nome: "Creme Facial Ácido Hialurônico",
      descricao:
        "Hidratação profunda e preenchimento de linhas finas. Fórmula personalizada para o seu tipo de pele. 30g.",
      precoCentavos: 8990,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/creme.svg",
      novidade: true,
    },
    {
      nome: "Sérum Vitamina C 10%",
      descricao:
        "Ação antioxidante, clareadora e iluminadora. Uniformiza o tom da pele e previne o envelhecimento. 30ml.",
      precoCentavos: 7990,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/serum.svg",
    },
    {
      nome: "Gel Redutor de Medidas",
      descricao:
        "Gel corporal com ativos que auxiliam na firmeza da pele e na redução de medidas. 150g.",
      precoCentavos: 6990,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/gel.svg",
    },
    // --- Vitaminas & Suplementos ---
    {
      nome: "Colágeno Verisol® 30 doses",
      descricao:
        "Colágeno hidrolisado com peptídeos bioativos para firmeza da pele, cabelos e unhas.",
      precoCentavos: 9850,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/capsulas.svg",
    },
    {
      nome: "Vitamina D3",
      descricao:
        "Suporte para imunidade e saúde dos ossos. 60 cápsulas manipuladas na dosagem ideal para você.",
      precoCentavos: 5490,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/vitamina.svg",
      dosagens: "1.000UI, 2.000UI, 5.000UI",
    },
    {
      nome: "Polivitamínico Energia 30 doses",
      descricao:
        "Combinação completa de vitaminas e minerais para disposição no dia a dia. Fórmula sob medida.",
      precoCentavos: 6200,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/vitamina.svg",
      novidade: true,
    },
    {
      nome: "Fórmula Sono Reparador",
      apresentacao: "30 cápsulas",
      indicacoes: "Regula o ciclo do sono\nPromove o relaxamento\nRestaura a energia\nMelhora o humor",
      composicao: "Melatonina 0,21mg\nTriptofano 100mg\nMagnésio quelado 200mg\nVitamina B6 30mg",
      modoUso: "Tomar 1 cápsula 30 minutos antes de dormir, ou conforme orientação do prescritor.",
      descricao:
        "Melatonina, triptofano, magnésio quelado e Vit. B6. Regula o ciclo do sono, promove o relaxamento e você acorda com mais energia e bom humor. 30 cápsulas.",
      precoCentavos: 7490,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/sono.svg",
      novidade: true,
    },
    // --- Linha própria Viver Bem (fotos reais) — todos em destaque ---
    {
      nome: "CitoRepair™ 2.0",
      apresentacao: "30 cápsulas",
      indicacoes: "Longevidade celular\nImita os efeitos do jejum\nContribui para a renovação das células\nApoia a disposição no dia a dia",
      composicao: "Espermidina\nResveratrol\nNAD+ precursores\nCoenzima Q10",
      modoUso: "Tomar 1 cápsula ao dia, preferencialmente em jejum, ou conforme orientação do prescritor.",
      descricao:
        "Longevidade celular: imita os efeitos do jejum e contribui para a renovação das células. 30 cápsulas.",
      precoCentavos: 18900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/citorepair.png",
      novidade: true,
      destaque: true,
    },
    {
      nome: "Ômega 3 Viver Bem",
      apresentacao: "90 cápsulas · 126g",
      indicacoes: "Saúde cardiovascular\nApoio à função cerebral\nAção anti-inflamatória\nSaúde dos olhos",
      composicao: "Óleo de peixe concentrado\nEPA\nDHA\nVitamina E (antioxidante)",
      modoUso: "Tomar 1 a 3 cápsulas ao dia, junto às refeições.",
      descricao:
        "Suplemento de óleo de peixe em cápsulas, rico em EPA e DHA para o coração e o cérebro. 90 cápsulas.",
      precoCentavos: 8900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/omega3.png",
      destaque: true,
    },
    {
      nome: "VitaFlex",
      apresentacao: "60 cápsulas de 500mg",
      indicacoes: "Saúde das articulações\nConforto ao se movimentar\nApoio à cartilagem\nAção antioxidante",
      composicao: "Curcumina\nColágeno tipo II\nÁcido hialurônico\nMagnésio\nVitaminas C, D e K",
      modoUso: "Tomar 2 cápsulas ao dia, junto às refeições.",
      descricao:
        "Curcumina, colágeno, ácido hialurônico, magnésio e vitaminas C, D e K para articulações. 60 cápsulas de 500mg.",
      precoCentavos: 12900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/vitaflex.png",
      destaque: true,
    },
    {
      nome: "Creatina Gummy",
      apresentacao: "Pote com gomas · sabor frutas vermelhas",
      indicacoes: "Ganho de força\nDesempenho nos treinos\nPrática de tomar\nSem precisar dissolver",
      composicao: "Creatina monoidratada\nSabor natural de frutas vermelhas",
      modoUso: "Consumir as gomas conforme a porção indicada, uma vez ao dia.",
      descricao:
        "Creatina em gomas sabor frutas vermelhas — prática e gostosa de tomar todos os dias.",
      precoCentavos: 9900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/creatina-gummy.png",
      novidade: true,
      destaque: true,
    },
    {
      nome: "Caramelo de Creatina",
      apresentacao: "500g · 35 unidades de 10g",
      indicacoes: "Energia com sabor\nGanho de força\nPrático para levar\nÓtima adesão",
      composicao: "Creatina monoidratada\nFarinha de amêndoa\nCaramelo",
      modoUso: "Consumir 1 unidade ao dia, preferencialmente antes do treino.",
      descricao:
        "Creatina em caramelo com farinha de amêndoa. 500g com 35 unidades de 10g — energia com sabor.",
      precoCentavos: 11900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/caramelo-creatina.png",
      novidade: true,
      destaque: true,
    },
    {
      nome: "Composto Emagrecedor",
      apresentacao: "30 doses",
      indicacoes: "Controle do apetite\nSensação de saciedade\nApoio ao emagrecimento\nFórmula personalizada",
      composicao: "Fórmula manipulada conforme o seu perfil e a avaliação do prescritor",
      modoUso: "Tomar conforme a orientação do prescritor.",
      descricao:
        "Fórmula para controle do apetite e saciedade, manipulada conforme o seu perfil. 30 doses.",
      precoCentavos: 13900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/composto-emagrecedor.png",
      destaque: true,
    },
    {
      nome: "Glow Cream",
      apresentacao: "Pote 30g",
      indicacoes: "Viço e luminosidade\nFirmeza da pele\nHidratação profunda\nUniformiza o tom",
      composicao: "Ceramida 6%\nNiacinamida 4%\nÁcido hialurônico 0,5%\nOligo HA 0,1%\nCopper Peptide 1%",
      modoUso: "Aplicar à noite no rosto limpo, com movimentos suaves, ou conforme orientação do prescritor.",
      descricao:
        "Ceramida 6% + Niacinamida 4% + Ácido Hialurônico 0,5% + Copper Peptide. Viço e firmeza para o rosto.",
      precoCentavos: 16900,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/glow-cream.png",
      novidade: true,
      destaque: true,
    },
    {
      nome: "Firm Defense Serum",
      apresentacao: "Frasco 30ml",
      indicacoes: "Firmeza e sustentação\nFortalece a barreira da pele\nReduz a sensibilidade\nEfeito antioxidante",
      composicao: "Ceramidas\nCentella asiatica\nColágeno\nDunalina",
      modoUso: "Aplicar 2 vezes ao dia no rosto limpo, antes do hidratante.",
      descricao:
        "Ceramidas + Centella + Colágeno. Sérum de firmeza e proteção da barreira da pele. Uso 2x ao dia.",
      precoCentavos: 15900,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/firm-defense-serum.png",
      destaque: true,
    },
    {
      nome: "ZincBlock FPS",
      apresentacao: "Frasco 40g",
      indicacoes: "Alta proteção solar\nToque seco, sem oleosidade\nIndicado para peles sensíveis\nNão obstrui os poros",
      composicao: "Óxido de zinco\nDióxido de titânio\nVitamina E\nBase oil free",
      modoUso: "Aplicar pela manhã no rosto limpo e reaplicar a cada 2 horas de exposição solar.",
      descricao:
        "Protetor solar mineral com óxido de zinco, toque seco e alta proteção. Ideal para peles sensíveis.",
      precoCentavos: 11900,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/zincblock-fps.png",
      novidade: true,
      destaque: true,
    },
    {
      nome: "Bastão Clareador",
      apresentacao: "Bastão 20g",
      indicacoes: "Clareia manchas localizadas\nUniformiza o tom\nAplicação prática e precisa\nHidrata a região",
      composicao: "Ativos clareadores manipulados\nVitamina C\nManteigas vegetais",
      modoUso: "Aplicar sobre a área desejada, à noite, conforme orientação do prescritor.",
      descricao:
        "Bastão prático para áreas de manchas e hiperpigmentação, com ativos clareadores manipulados.",
      precoCentavos: 9900,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/bastao-clareador.png",
      destaque: true,
    },
    {
      nome: "Pó Finalizador FPB 20",
      apresentacao: "Pote 20g",
      indicacoes: "Sela a maquiagem\nControla a oleosidade\nAcabamento natural\nProteção adicional",
      composicao: "Sílica\nÓxidos minerais\nAtivos com proteção",
      modoUso: "Aplicar com pincel sobre a maquiagem, quantas vezes quiser ao longo do dia.",
      descricao:
        "Pó finalizador com proteção, controla a oleosidade e sela a maquiagem com acabamento natural.",
      precoCentavos: 8900,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/po-finalizador.png",
      destaque: true,
    },
    {
      nome: "Ômega 3 Concentrado",
      descricao:
        "EPA e DHA de alta pureza para saúde cardiovascular e cerebral. 60 cápsulas.",
      precoCentavos: 7500,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/capsulas.svg",
    },
    // --- Cabelos & Unhas ---
    {
      nome: "Loção Capilar Minoxidil",
      descricao:
        "Estimula o crescimento dos fios e reduz a queda. Uso contínuo com acompanhamento. 100ml.",
      precoCentavos: 6590,
      categoria: "cabelos-unhas",
      fotoUrl: "/uploads/locao.svg",
      dosagens: "2%, 5%",
    },
    {
      nome: "Cápsulas Cabelos & Unhas Fortes",
      descricao:
        "Biotina, silício orgânico e nutrientes essenciais para fios mais fortes e unhas saudáveis. 60 cápsulas.",
      precoCentavos: 8490,
      categoria: "cabelos-unhas",
      fotoUrl: "/uploads/capsulas.svg",
    },
    // --- Saúde da Mulher ---
    {
      nome: "Composto Feminino Equilíbrio",
      descricao:
        "Blend natural para bem-estar e equilíbrio hormonal feminino. 30 doses personalizadas.",
      precoCentavos: 9200,
      categoria: "saude-da-mulher",
      fotoUrl: "/uploads/feminino.svg",
      novidade: true,
    },
    {
      nome: "Cranberry",
      descricao:
        "Auxilia na saúde do trato urinário. 60 cápsulas com extrato concentrado.",
      precoCentavos: 5890,
      categoria: "saude-da-mulher",
      fotoUrl: "/uploads/capsulas.svg",
      dosagens: "250mg, 500mg",
    },
    // --- Saúde do Homem ---
    {
      nome: "Composto Masculino Vigor",
      descricao:
        "Fórmula com nutrientes que auxiliam a energia, disposição e vitalidade masculina. 30 doses.",
      precoCentavos: 9600,
      categoria: "saude-do-homem",
      fotoUrl: "/uploads/capsulas.svg",
    },
    {
      nome: "Saw Palmetto",
      descricao:
        "Extrato padronizado que auxilia na saúde da próstata. 60 cápsulas.",
      precoCentavos: 7250,
      categoria: "saude-do-homem",
      fotoUrl: "/uploads/capsulas.svg",
      dosagens: "160mg, 320mg",
    },
    // --- Homeopatia & Florais ---
    {
      nome: "Floral Tranquilidade 30ml",
      descricao:
        "Composição floral para momentos de tensão e ansiedade do dia a dia. Uso sublingual.",
      precoCentavos: 4500,
      categoria: "homeopatia-florais",
      fotoUrl: "/uploads/floral.svg",
    },
    {
      nome: "Homeopatia Personalizada",
      descricao:
        "Medicamento homeopático preparado conforme a receita do seu prescritor. Consulte nossos farmacêuticos.",
      precoCentavos: 3990,
      categoria: "homeopatia-florais",
      fotoUrl: "/uploads/floral.svg",
    },
    // --- Mais produtos de exemplo ---
    {
      nome: "Magnésio Dimalato",
      descricao:
        "Auxilia na função muscular, no combate ao cansaço e no relaxamento. 60 cápsulas manipuladas.",
      precoCentavos: 5990,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/capsulas.svg",
      dosagens: "300mg, 600mg",
    },
    {
      nome: "Creatina Monohidratada",
      descricao:
        "Ganho de força e desempenho nos treinos. Pura, sem aditivos, na dose que você precisa.",
      precoCentavos: 8990,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/vitamina.svg",
      dosagens: "3g, 5g",
    },
    {
      nome: "Coenzima Q10",
      descricao:
        "Antioxidante que apoia a saúde do coração e a energia celular. 30 cápsulas.",
      precoCentavos: 11900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/capsulas.svg",
      dosagens: "100mg, 200mg",
    },
    {
      nome: "Protetor Solar Facial FPS 50",
      descricao:
        "Toque seco, sem oleosidade, com proteção UVA/UVB. Base ideal para peles sensíveis. 50g.",
      precoCentavos: 7890,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/creme.svg",
      novidade: true,
    },
    {
      nome: "Creme Ácido Retinoico",
      descricao:
        "Renovação celular, controle da acne e antienvelhecimento. Uso noturno com orientação. 30g.",
      precoCentavos: 6490,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/creme.svg",
      dosagens: "0,025%, 0,05%",
    },
    {
      nome: "Shampoo Antiqueda",
      descricao:
        "Fortalece o couro cabeludo e reduz a queda, com ativos manipulados. 200ml.",
      precoCentavos: 5490,
      categoria: "cabelos-unhas",
      fotoUrl: "/uploads/locao.svg",
    },
    {
      nome: "Colágeno + Ácido Hialurônico",
      descricao:
        "Firmeza e hidratação da pele de dentro para fora. Sabor neutro, fácil de dissolver. 30 doses.",
      precoCentavos: 10900,
      categoria: "saude-da-mulher",
      fotoUrl: "/uploads/feminino.svg",
      novidade: true,
    },
    {
      nome: "Testoviver Homem 45+",
      descricao:
        "Blend com zinco, maca peruana e tribulus para energia e vitalidade masculina. 30 doses.",
      precoCentavos: 9900,
      categoria: "saude-do-homem",
      fotoUrl: "/uploads/capsulas.svg",
    },

    // --- Combos ---
    {
      nome: "Combo Pele Radiante",
      descricao:
        "Sérum Vitamina C 10% + Creme Facial Ácido Hialurônico. A dupla perfeita para uma pele iluminada e hidratada.",
      precoCentavos: 14990,
      categoria: "dermatologia-estetica",
      fotoUrl: "/uploads/combo.svg",
      tipo: "COMBO",
    },
    {
      nome: "Combo Cabelos Fortes",
      descricao:
        "Loção Capilar Minoxidil 5% + Cápsulas Cabelos & Unhas. Tratamento completo de dentro para fora.",
      precoCentavos: 12990,
      categoria: "cabelos-unhas",
      fotoUrl: "/uploads/combo.svg",
      tipo: "COMBO",
      novidade: true,
    },
    {
      nome: "Combo Imunidade em Dia",
      descricao:
        "Vitamina D3 + Ômega 3 + Polivitamínico Energia. Proteção e disposição para toda a estação.",
      precoCentavos: 16900,
      categoria: "vitaminas-suplementos",
      fotoUrl: "/uploads/combo.svg",
      tipo: "COMBO",
    },
  ];

  // Os textos acima são o catálogo de exemplo original. Antes de gravar,
  // cada item passa pelo mapa de conformidade: nome genérico, descrição
  // sem promessa de efeito e vitrine promocional desligada, porque
  // manipulado não pode ser exposto como produto de prateleira
  // (ver prisma/conformidade.js).
  const slugsUsados = new Set();
  for (let i = 0; i < produtos.length; i++) {
    const original = produtos[i];
    const conforme = conformidade[original.nome] || {};
    const p = { ...original, ...conforme };
    // Slug único: se repetir, ganha um sufixo numérico
    let slug = slugificar(p.nome);
    let n = 2;
    while (slugsUsados.has(slug)) slug = slugificar(p.nome) + "-" + n++;
    slugsUsados.add(slug);
    await db.produto.create({
      data: {
        nome: p.nome,
        slug,
        descricao: p.descricao,
        precoCentavos: p.precoCentavos,
        tipo: p.tipo || "PRODUTO",
        venda: "MANIPULADO",
        fotoUrl: p.fotoUrl,
        ativo: conforme.ativo !== false,
        novidade: false,
        destaque: false,
        dosagens: p.dosagens || null,
        apresentacao: p.apresentacao || null,
        indicacoes: null,
        composicao: p.composicao || null,
        modoUso: p.modoUso || null,
        ordem: i,
        categoriaId: categorias[p.categoria].id,
      },
    });
  }

  console.log(`Seed concluído: ${listaCategorias.length} categorias, ${produtos.length} produtos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
