// Tipos compartilhados entre servidor e componentes de cliente.
// (Espelham o schema do Prisma, mas em formato serializável simples.)

export const TIPO_PRODUTO = "PRODUTO";
export const TIPO_COMBO = "COMBO";

export const PAPEL_ADMIN = "ADMIN";
export const PAPEL_OPERADOR = "OPERADOR";

// Como o produto pode ser oferecido no site. Manipulado não pode ser
// exposto ao público com preço para venda (RDC 67/2007, item 5.14):
// aparece sem preço e o pedido parte da receita. Industrializado com
// registro na Anvisa segue a venda normal, com preço e carrinho.
export const VENDA_MANIPULADO = "MANIPULADO";
export const VENDA_INDUSTRIALIZADO = "INDUSTRIALIZADO";

/** Na dúvida (registro antigo sem o campo), trata como manipulado. */
export function ehIndustrializado(p: { venda?: string | null }): boolean {
  return p.venda === VENDA_INDUSTRIALIZADO;
}

export interface CategoriaDTO {
  id: number;
  nome: string;
  slug: string;
  ordem: number;
}

export interface ProdutoDTO {
  id: number;
  nome: string;
  // Endereço do produto no site (ex.: "omega-3-viver-bem")
  slug: string;
  descricao: string;
  precoCentavos: number;
  tipo: string; // "PRODUTO" | "COMBO"
  venda: string; // "MANIPULADO" | "INDUSTRIALIZADO"
  aprovado: boolean;
  fotoUrl: string | null;
  ativo: boolean;
  novidade: boolean;
  destaque: boolean;
  ordem: number;
  categoriaId: number | null;
  categoriaNome?: string | null;
  // Dosagens disponíveis separadas por vírgula (ex.: "250mg, 500mg") ou null
  dosagens: string | null;
  // Campos ricos da página do produto (opcionais)
  composicao: string | null;
  modoUso: string | null;
  indicacoes: string | null;
  apresentacao: string | null;
}

export interface DepoimentoDTO {
  id: number;
  nome: string;
  texto: string;
  nota: number; // estrelas (1 a 5)
  fonte: string; // "Google" | "Loja"
  fotoUrl: string | null; // foto do cliente (opcional)
  ativo: boolean;
  ordem: number;
}

/** Quebra um texto em itens por quebra de linha ou ";".
 *  Não usa vírgula como separador porque ela aparece nos números
 *  (ex.: "Melatonina 0,21mg" precisa ficar em um item só). */
export function listarItens(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return texto
    .split(/[\n;]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** "250mg, 500mg" -> ["250mg", "500mg"]; null/vazio -> [] */
export function listarDosagens(dosagens: string | null | undefined): string[] {
  if (!dosagens) return [];
  return dosagens
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
}

// Contato oficial da loja
export const WHATSAPP_LOJA = "(24) 98873-3934"; // exibição
export const WHATSAPP_NUMERO = "5524988733934"; // formato do link wa.me
export const ANOS_TRADICAO = 19;

// As 3 lojas, conforme o perfil de cada uma no Google. Ficam aqui
// porque o rodapé, a página Sobre e a retirada no carrinho usam a
// mesma lista — se abrir uma loja nova, muda só neste ponto.
export const UNIDADES = [
  {
    bairro: "Centro",
    endereco: "Rua Dom Pedro Segundo, 31, Loja 37",
    telefone: "(24) 2242-3621",
  },
  {
    bairro: "Corrêas",
    endereco: "Rua Dr. Agostinho Goulão, 22",
    telefone: null,
  },
  {
    bairro: "Posse",
    endereco: "Estrada União e Indústria, 33.383",
    telefone: null,
  },
];

/** Link do Google Maps já com a busca da unidade pronta. */
export function linkMapaUnidade(bairro: string, endereco: string): string {
  const busca = `Manipulação Viver Bem, ${endereco}, ${bairro}, Petrópolis RJ`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
}

// Como o pedido chega até o cliente
export const ENTREGA_RETIRADA = "Retirada na loja";
export const ENTREGA_DELIVERY = "Entrega em casa";

export const INSTAGRAM_PERFIL = "manipulacaoviverbem";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_PERFIL}/`;

// Total de avaliações no perfil do Google (o site mostra só uma
// seleção delas). Conferido em ago/2026 — atualize quando crescer.
export const AVALIACOES_GOOGLE_TOTAL = 634;
export const AVALIACOES_GOOGLE_NOTA = 5.0;

/** Quantas avaliações em cada nota, do próprio perfil do Google.
 *  As notas baixas ficam à mostra de propósito: distribuição sem
 *  nenhuma nota baixa é o que parece inventado. */
export const AVALIACOES_GOOGLE_NOTAS = [
  { estrelas: 5, quantidade: 619 },
  { estrelas: 4, quantidade: 9 },
  { estrelas: 3, quantidade: 2 },
  { estrelas: 2, quantidade: 0 },
  { estrelas: 1, quantidade: 4 },
];

/** Assuntos que mais aparecem nas avaliações, com o número de vezes.
 *  Vem do próprio Google, não é escolha nossa. */
export const AVALIACOES_GOOGLE_ASSUNTOS = [
  { assunto: "preço", vezes: 25 },
  { assunto: "atenção", vezes: 14 },
  { assunto: "atendente", vezes: 13 },
  { assunto: "WhatsApp", vezes: 12 },
  { assunto: "educação", vezes: 9 },
  { assunto: "rapidez", vezes: 6 },
  { assunto: "eficiência", vezes: 6 },
  { assunto: "agilidade", vezes: 5 },
  { assunto: "confiança", vezes: 5 },
];
export const PERFIL_GOOGLE_URL =
  "https://www.google.com/maps/search/?api=1&query=Viver%20Bem%20-%20Farm%C3%A1cia%20de%20Manipula%C3%A7%C3%A3o&query_place_id=ChIJnz1PkICpmQARI67bD1sFiE8";
