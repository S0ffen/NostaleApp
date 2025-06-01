// app/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("Token from cookies:", token);

  if (!token) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
