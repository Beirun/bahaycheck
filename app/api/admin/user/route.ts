import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { ne } from "drizzle-orm";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/user
export async function GET() {
  try {
    const records = await db
      .select()
      .from(user)
      .where(ne(user.roleId, 1))
      .orderBy(user.userId);

    return NextResponse.json(records);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
