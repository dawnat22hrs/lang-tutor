import { NextRequest } from "next/server";
import { getAllItems, getDueItems } from "@/lib/db";

export const GET = async (
  _req: NextRequest,
  { params }: { params: { languageId: string } }
): Promise<Response> => {
  const { languageId } = params;
  const learned = getAllItems(languageId).filter((i) => i.repetitions > 0);
  const due = getDueItems(languageId, 200);
  return Response.json({ learned, due });
};
