import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../global.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Elo | Conexão direta com quem trabalha",
  description:
    "Diretório de empresas que contratam trabalhadores de obra. Busque por função e envie seu currículo direto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased ${inter.variable} ${poppins.variable}`}
    >
      <body className="min-h-full flex flex-col bg-app-bg text-text-primary">
        {children}
      </body>
    </html>
  );
}
