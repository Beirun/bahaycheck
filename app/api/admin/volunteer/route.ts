import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { license } from "@/schema/license";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/volunteer
export async function PUT(req: NextRequest) {
  try {
    const { licenseId } = await req.json();
    if (isNaN(licenseId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

    const record = await db.select().from(license).where(eq(license.licenseId, licenseId)).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });


    const updated = await db
      .update(license)
      .set({isVerified : true})
      .where(eq(license.licenseId, licenseId))
      .returning();

    return NextResponse.json({ message: "Volunteer successfully verified", license: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}