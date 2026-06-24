import { NextRequest, NextResponse } from "next/server";
import { containsSensitiveWord } from "@/lib/sensitive-words";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "";

  const trimmed = username.trim();
  if (!trimmed || trimmed.length > 20) {
    return NextResponse.json({ valid: false, reason: "invalid" });
  }

  if (await containsSensitiveWord(trimmed)) {
    return NextResponse.json({ valid: false, reason: "sensitive" });
  }

  return NextResponse.json({ valid: true });
}
