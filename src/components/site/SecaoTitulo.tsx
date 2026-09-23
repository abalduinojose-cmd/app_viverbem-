// Cabeçalho padrão das seções: selo espaçado em caixa alta, título na
// serif da marca e, se houver, o atalho "Ver tudo" à direita.
import Link from "next/link";

export function SecaoTitulo({
  selo,
  titulo,
  descricao,
  verTudo,
  corSelo = "royal",
}: {
  selo: string;
  titulo: string;
  descricao?: string;
  verTudo?: string;
  corSelo?: "royal" | "escarlate";
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <p
          className={`selo-secao ${
            corSelo === "escarlate" ? "text-escarlate" : "text-royal"
          }`}
        >
          {selo}
        </p>
        <h2 className="font-display text-3xl md:text-[2.6rem] font-semibold text-grafite mt-1.5">
          {titulo}
        </h2>
        {descricao && <p className="text-grafite-medio text-lg mt-2">{descricao}</p>}
      </div>
      {verTudo && (
        <Link
          href={verTudo}
          className="shrink-0 inline-flex items-center min-h-11 gap-2 text-royal font-semibold hover:gap-3 transition-[gap]"
        >
          Ver tudo
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}
