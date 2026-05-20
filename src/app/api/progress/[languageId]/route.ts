import { NextRequest, NextResponse } from "next/server";
import { getProgress } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = async (
  _req: NextRequest,
  { params }: { params: { languageId: string } }
): Promise<NextResponse> => {
  const summary = getProgress(params.languageId);
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "no-store" },
  });
};
