import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { evaluation } from "@/schema/evaluation";
import { request } from "@/schema/request";
import { houseCategory } from "@/schema/houseCategory";
import { damageCategory } from "@/schema/damageCategory";
import { eq } from "drizzle-orm";

export const config = {
  api: {
    bodyParser: true,
  },
};

// api/volunteer/evaluation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, houseCategoryId, damageCategoryId, note } = body;

    if (!requestId || !houseCategoryId || !damageCategoryId)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // Validate foreign keys
    const reqExists = await db.select().from(request).where(eq(request.requestId, requestId)).limit(1);
    if (!reqExists[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if(reqExists[0].volunteerId !== 1) return NextResponse.json({ error: "Not assigned to that request" }, { status: 400 });

    const houseExists = await db.select().from(houseCategory).where(eq(houseCategory.houseCategoryId, houseCategoryId)).limit(1);
    if (!houseExists[0]) return NextResponse.json({ error: "House category not found" }, { status: 404 });

    const damageExists = await db.select().from(damageCategory).where(eq(damageCategory.damageCategoryId, damageCategoryId)).limit(1);
    if (!damageExists[0]) return NextResponse.json({ error: "Damage category not found" }, { status: 404 });

    const [newEval] = await db
      .insert(evaluation)
      .values({
        requestId,
        houseCategoryId,
        damageCategoryId,
        note: note || null,
        dateCreated: new Date(),
      })
      .returning();

    return NextResponse.json({ message: "Evaluation created successfully", evaluation: newEval });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
