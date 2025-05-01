"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null; // Ukryj navbar jeśli jesteś na stronie logowania
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex gap-8 text-sm text-white">
      <Link href="/" className="hover:text-blue-400 font-semibold">
        🏠 Strona główna
      </Link>
      <Link href="/calendar" className="hover:text-blue-400 font-semibold">
        📅 Kalendarz
      </Link>
      <Link href="/simulator" className="hover:text-blue-400 font-semibold">
        📊 Symulator
      </Link>
    </nav>
  );
}
