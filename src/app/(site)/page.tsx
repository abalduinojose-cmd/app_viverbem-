// HOME, na sequência da Formularis com o conteúdo da Viver Bem:
//   carrossel > pilares > como funciona > cada pessoa tem sua fórmula >
//   categorias > pronta entrega (só industrializado) > entrega e
//   retirada > reels > avaliações > (rodapé com "fale com a gente")
//
// Sem vitrine promocional de manipulado (mais procurados, novidades,
// combos): a RDC 67/2007 (item 5.14) não permite expor manipulado ao
// público para promoção. O convite da página é enviar a receita.
// O vídeo do carrossel é opcional: basta salvar public/hero.mp4.
import fs from "fs";
import path from "path";
import { obterCatalogo, obterAvaliacoes } from "@/lib/catalogo";
import { AVALIACOES_GOOGLE_NOTA, ehIndustrializado } from "@/lib/tipos";
import { HeroCarrossel } from "@/components/site/HeroCarrossel";
import { MarqueeMarca } from "@/components/site/MarqueeMarca";
import { ComoFunciona } from "@/components/site/ComoFunciona";
import { EnviarReceita } from "@/components/site/EnviarReceita";
import { SecaoCategorias } from "@/components/site/SecaoCategorias";
import { SecaoTitulo } from "@/components/site/SecaoTitulo";
import { FaixaProdutos } from "@/components/site/FaixaProdutos";
import { SecaoDelivery } from "@/components/site/SecaoDelivery";
import { ReelsInstagram } from "@/components/site/ReelsInstagram";
import { CarrosselAvaliacoes } from "@/components/site/CarrosselAvaliacoes";
import { Revelar } from "@/components/site/Revelar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ categorias, produtos }, avaliacoes] = await Promise.all([
    obterCatalogo(),
    obterAvaliacoes(),
  ]);

  // Industrializados com registro: os únicos com preço e carrinho.
  // Os marcados como destaque no painel vêm primeiro.
  const prontaEntrega = produtos
    .filter(ehIndustrializado)
    .sort((a, b) => Number(b.destaque) - Number(a.destaque));

  // Só as categorias que têm algo no site
  const categoriasComItens = categorias.filter((c) =>
    produtos.some((p) => p.categoriaId === c.id)
  );

  // O vídeo do carrossel só entra se o arquivo existir em public/hero.mp4
  const temVideo = fs.existsSync(path.join(process.cwd(), "public", "hero.mp4"));

  return (
    <main className="flex-1">
      {/* 1 ─ Carrossel */}
      <HeroCarrossel temVideo={temVideo} />

      {/* 2 ─ Pilares: os números da casa */}
      <MarqueeMarca />

      {/* 3 ─ Como funciona, em 4 passos */}
      <Revelar>
        <ComoFunciona />
      </Revelar>

      {/* 4 ─ Cada pessoa tem sua fórmula */}
      <Revelar>
        <EnviarReceita />
      </Revelar>

      {/* 5 ─ Categorias */}
      <Revelar>
        <SecaoCategorias categorias={categoriasComItens} />
      </Revelar>

      {/* 6 ─ Pronta entrega: só aparece quando houver industrializado */}
      {prontaEntrega.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20">
          <Revelar>
            <SecaoTitulo
              selo="com registro na Anvisa"
              titulo="Pronta entrega"
              descricao="Produtos industrializados, com preço, para pedir direto pelo site."
              verTudo="/produtos"
            />
            <FaixaProdutos produtos={prontaEntrega} />
          </Revelar>
        </section>
      )}

      {/* 7 ─ Entrega e retirada */}
      <Revelar>
        <SecaoDelivery />
      </Revelar>

      {/* 8 ─ Por dentro da Viver Bem (reels) */}
      <Revelar>
        <ReelsInstagram />
      </Revelar>

      {/* 9 ─ Avaliações do Google */}
      {avaliacoes.length > 0 && (
        <Revelar>
          <CarrosselAvaliacoes media={AVALIACOES_GOOGLE_NOTA} avaliacoes={avaliacoes} />
        </Revelar>
      )}

      {/* 10 ─ "Fale com a gente" abre o rodapé, logo abaixo */}
      <div className="pb-20" aria-hidden="true" />
    </main>
  );
}
