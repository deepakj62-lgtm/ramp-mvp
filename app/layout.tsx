import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ChatPageProvider } from "@/components/ChatContext";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Talent + Allocation | Linea",
  description: "Find available staff by skills and availability",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatPageProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-gradient-to-r from-jade to-jade-light">
              <div className="max-w-7xl mx-auto px-4 py-5">
                <h1 className="text-2xl font-heading font-bold text-white">Talent + Allocation</h1>
                <p className="text-sea text-sm font-body">Find available staff by skills and availability</p>
              </div>
            </header>
            <NavBar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
              {children}
            </main>
          </div>
          <ChatWidget />
        </ChatPageProvider>
      </body>
    </html>
  );
}
