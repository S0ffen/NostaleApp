// app/layout.tsx
import ClientWrapper from "@/components/ClientWrapper";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-900 text-white min-h-screen">
        <ClientWrapper />
        {children}
      </body>
    </html>
  );
}
