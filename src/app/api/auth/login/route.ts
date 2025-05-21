// app/api/session/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const cookieStore = await cookies(); // ✅

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  });
  console.log("User succesfully logged in, token set in cookies:", token);
  return NextResponse.json({ success: true });
}
