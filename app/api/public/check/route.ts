import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const fingerprint = request.nextUrl.searchParams.get("fingerprint");
  if (!fingerprint) {
    return NextResponse.json({ exists: false });
  }

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("public_lists")
    .select("id")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  return NextResponse.json({ exists: !!data });
}
