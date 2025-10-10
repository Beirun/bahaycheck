import { NextResponse } from "next/server";
import { db } from "@/db/drizzle"; 
import { license } from "@/schema/license";
import { eq } from "drizzle-orm";

export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const updated = await db
      .update(license)
      .set({ isVerified: true })
      .where(eq(license.licenseId, id))
      .returning();

    if (updated.length === 0)
      return NextResponse.json({ error: "License not found" }, { status: 404 });

    return NextResponse.json({ message: "License verified", data: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
