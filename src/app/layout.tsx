import type { Metadata } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yanyan's Cybernook",
  description: "Internet Cafe · Layout Design · Print · Bills Payment · Online Shop",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-dark text-text">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
