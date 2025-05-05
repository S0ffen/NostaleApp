import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const events = await req.json();
    const filePath = path.join(process.cwd(), "public", "steam-events.json");

    await writeFile(filePath, JSON.stringify(events, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Błąd zapisu JSON:", err);
    return NextResponse.json(
      { success: false, error: "Błąd zapisu" },
      { status: 500 }
    );
  }
}
