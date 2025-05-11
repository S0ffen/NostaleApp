"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsub();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserEmail(null);
      router.push("/login");
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  if (pathname === "/login") return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between text-sm text-white">
      <div className="flex gap-8">
        <Link href="/" className="hover:text-blue-400 font-semibold">
          🏠 Strona główna
        </Link>
        <Link href="/calendar" className="hover:text-blue-400 font-semibold">
          📅 Kalendarz
        </Link>
        <Link href="/simulator" className="hover:text-blue-400 font-semibold">
          📊 Symulator
        </Link>
      </div>
      <div className="relative inline-block text-left text-xs text-gray-400">
        <button
          onClick={toggleDropdown}
          className="px-2 py-1 bg-white text-blue-600 rounded hover:bg-gray-100"
        >
          {userEmail}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
            >
              Wyloguj
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
