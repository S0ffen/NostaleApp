"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getFirebaseErrorMessage } from "@/lib/getFirebaseErrorMessage";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const email = login;
      // Waiting for user to sign in
      const usersCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Sending the token to the server
      const token = await usersCredentials.user.getIdToken();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data?.error?.message || "Błąd logowania po stronie serwera."
        );
      }

      console.log("Token from Firebase:", token);
      // Routing to the protected page
      toast.success("Zalogowano pomyślnie!");
      router.push("/protected/calendar");
    } catch (error: any) {
      console.error("Błąd logowania:", error);
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Logowanie</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Nazwa użytkownika
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Hasło</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </main>
  );
}
