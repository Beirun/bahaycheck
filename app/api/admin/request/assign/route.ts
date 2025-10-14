import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { eq } from "drizzle-orm";


// api/admin/request/assign
export async function PUT(req: NextRequest) {
  try {
    const { requestId, userId } = await req.json();
    if (isNaN(requestId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid volunteer ID" }, { status: 400 });

    const record = await db.select().from(request).where(eq(request.requestId, requestId)).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });


    const updateData = {
      dateUpdated: new Date(),
      requestStatusId: 2,
      volunteerId: Number(userId)
    };

    const updated = await db
      .update(request)
      .set(updateData)
      .where(eq(request.requestId, requestId))
      .returning();

    return NextResponse.json({ message: "Request updated", request: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
