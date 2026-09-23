// Layout do SITE público: header fixo, rodapé e o pedido (receita e
// produtos com preço) disponível em todas as páginas, fechando pelo
// WhatsApp. O painel administrativo (/admin) tem layout próprio.
import { CarrinhoGlobal } from "@/components/site/CarrinhoGlobal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { obterCategorias } from "@/lib/catalogo";

export default async function LayoutSite({ children }: { children: React.ReactNode }) {
  // O menu "Categorias" lista as categorias do banco
  const categorias = await obterCategorias();

  return (
    <CarrinhoGlobal>
      <Header categorias={categorias} />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer categorias={categorias} />
    </CarrinhoGlobal>
  );
}
