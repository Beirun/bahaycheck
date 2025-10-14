import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { license } from "@/schema/license";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/license
export async function GET() {
  try {
    const records = await db
      .select()
      .from(license)
      .orderBy(license.licenseId);

    return NextResponse.json(records);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
