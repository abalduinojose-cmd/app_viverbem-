// Monta o link de WhatsApp (wa.me) com o pedido pronto para a equipe.
import { WHATSAPP_NUMERO, ENTREGA_RETIRADA } from "./tipos";
import { formatarPreco } from "./preco";
import { ItemCarrinho } from "./carrinho";

function linkComMensagem(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

/** Gera um código curto de pedido para a recepção referenciar (ex.: "VB-8F3A"). */
export function gerarCodigoPedido(): string {
  return "VB-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export interface DadosPedido {
  nome: string;
  whatsapp: string;
  /** Só quando há item com preço; na receita o valor vem depois */
  pagamento: string;
  entrega: string; // "Retirada na loja" | "Entrega em casa"
  local: string; // a loja escolhida, ou o endereço da entrega
  observacao?: string;
  codigo: string;
  /** A pessoa vai mandar a foto da receita logo depois da mensagem */
  receita: boolean;
  /** Manipulado que ela abriu no site antes de pedir, se houver */
  produtoVisto?: string | null;
}

/** Link com o pedido completo: dados da pessoa, a receita (se houver)
 *  e os itens com preço, para a equipe receber e preparar. */
export function linkWhatsAppPedido(itens: ItemCarrinho[], dados: DadosPedido): string {
  const partes = [
    "🧾 *NOVO PEDIDO · SITE VIVER BEM*",
    `*Pedido:* ${dados.codigo}`,
    `*Cliente:* ${dados.nome}`,
  ];

  if (dados.whatsapp && dados.whatsapp.trim()) {
    partes.push(`*WhatsApp:* ${dados.whatsapp.trim()}`);
  }

  // Como o pedido chega: a equipe precisa disso antes de preparar
  if (dados.entrega) {
    partes.push(`*Como receber:* ${dados.entrega}`);
    if (dados.local && dados.local.trim()) {
      const rotulo = dados.entrega === ENTREGA_RETIRADA ? "Loja" : "Endereço";
      partes.push(`*${rotulo}:* ${dados.local.trim()}`);
    }
  }

  if (dados.receita) {
    partes.push("", "📄 *Receita:* vou enviar a foto em seguida.");
    if (dados.produtoVisto) partes.push(`*Vi no site:* ${dados.produtoVisto}`);
  }

  if (itens.length > 0) {
    const linhas = itens.map((item, i) => {
      const dosagem = item.dosagem ? ` (${item.dosagem})` : "";
      const unit = formatarPreco(item.precoCentavos);
      const subtotal = formatarPreco(item.precoCentavos * item.quantidade);
      return `${i + 1}) *${item.nome}*${dosagem}\n    Qtd: ${item.quantidade} × ${unit} = ${subtotal}`;
    });
    const total = itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0);
    partes.push("", "*Produtos:*", ...linhas, "", `*TOTAL DOS PRODUTOS: ${formatarPreco(total)}*`);
    if (dados.pagamento) partes.push(`*Pagamento:* ${dados.pagamento}`);
  }

  if (dados.observacao && dados.observacao.trim()) {
    partes.push("", `*Observação:* ${dados.observacao.trim()}`);
  }

  // A última linha convida a pessoa a anexar a foto logo abaixo
  partes.push(
    "",
    dados.receita
      ? "_Pedido feito pelo site. Segue a foto da receita:_"
      : "_Pedido feito pelo site. Favor conferir e preparar._"
  );

  return linkComMensagem(partes.join("\n"));
}
