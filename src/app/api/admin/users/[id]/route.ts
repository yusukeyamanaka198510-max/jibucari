import { NextResponse } from "next/server";
import {
  getUserById,
  getResumesByUserId,
  getActionLogsByUserId,
} from "@/lib/adminMockData";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user,
    resumes: getResumesByUserId(params.id),
    actionLogs: getActionLogsByUserId(params.id),
  });
}
