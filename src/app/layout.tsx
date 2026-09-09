import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calculadora de Desconto de Produtos",
  description: "Calcula o desconto de uma compra de acordo com a quantidade.",
};

// Aplica o tema salvo antes da página pintar, evitando "piscada" de cor.
const scriptTema =
  "try{var t=localStorage.getItem('tema');if(t)document.documentElement.dataset.tema=t}catch(e){}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={poppins.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
        {children}
      </body>
    </html>
  );
}
