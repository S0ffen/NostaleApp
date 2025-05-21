import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies(); // Next.js 15.3+ wymaga await
  cookieStore.delete("token"); // ✅ usuń ciasteczko
  console.log("User successfully logged out, token deleted from cookies");
  return NextResponse.json({ success: true });
}
