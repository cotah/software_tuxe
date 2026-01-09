import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/shell/TopBar";
import { CommandBar } from "@/components/shell/CommandBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BTRIX - Sistema de Gestão para Oficinas de Bicicletas",
  description: "Gerencie sua oficina de bicicletas com eficiência e simplicidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-muted/30">
              <TopBar />
              <div className="pt-20 pb-12">
                {children}
              </div>
            </div>
            <CommandBar />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
