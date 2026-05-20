import { NextRequest, NextResponse } from "next/server";
import { getAllProfiles, saveProfile, deleteProfile } from "@/lib/db";
import { createLanguageSchema } from "@/lib/schemas";

export const GET = async (): Promise<NextResponse> => {
  const profiles = getAllProfiles();
  return NextResponse.json(profiles);
};

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const parsed = createLanguageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { id, language, level, interests } = parsed.data;
  const profile = saveProfile(id, language, level, interests);
  return NextResponse.json(profile);
};

export const DELETE = async (req: NextRequest): Promise<NextResponse> => {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteProfile(id as string);
  return NextResponse.json({ ok: true });
};
