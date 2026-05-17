import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/adminMockData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ users: MOCK_USERS });
}
