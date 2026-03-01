import type { Metadata } from "next";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";

export const metadata: Metadata = {
  title: "RAMP Staffing Search",
  description: "Find staff by availability and skills",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">RAMP Staffing Search</h1>
              <p className="text-gray-600 text-sm">Find available staff by skills and availability</p>
            </div>
          </header>
          <nav className="bg-gray-50 border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-2 flex gap-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="/search" className="text-gray-700 hover:text-blue-600 font-medium">Search</a>
              <a href="/feedback" className="text-gray-700 hover:text-blue-600 font-medium">Feedback Board</a>
            </div>
          </nav>
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <FeedbackWidget />
        </div>
      </body>
    </html>
  );
}
