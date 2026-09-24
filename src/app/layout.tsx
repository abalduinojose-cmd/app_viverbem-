import type { Metadata, Viewport } from "next";
import { Figtree, Inter, Kaushan_Script } from "next/font/google";
import "./globals.css";

// Figtree: títulos — geométrica moderna, clean, ótima para saúde
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Inter: corpo — altamente legível, moderna e neutra
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Kaushan Script: usada só no fallback do wordmark "Viver Bem"
const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Manipulação Viver Bem",
  description:
    "Manipulação e Homeopatia — há 19 anos cuidando de você em Petrópolis.",
  // A vitrine do GitHub Pages é só uma prévia para mostrar ao cliente:
  // fica fora do Google
  ...(process.env.DEMO === "1" ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Impede zoom por pinça no tablet do totem (modo quiosque)
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} ${inter.variable} ${kaushan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
