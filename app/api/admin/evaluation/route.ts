import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { evaluation } from "@/schema/evaluation";
import { request } from "@/schema/request";
import { houseCategory } from "@/schema/houseCategory";
import { damageCategory } from "@/schema/damageCategory";
import { eq, isNull } from "drizzle-orm";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/evaluation
export async function GET() {
  try {
    const records = await db
      .select({
        evaluationId: evaluation.evaluationId,
        note: evaluation.note,
        dateCreated: evaluation.dateCreated,
        dateUpdated: evaluation.dateUpdated,
        requestId: request.requestId,
        houseCategory: houseCategory.houseCategoryName,
        damageCategory: damageCategory.damageCategoryName,
      })
      .from(evaluation)
      .innerJoin(request, eq(evaluation.requestId, request.requestId))
      .innerJoin(houseCategory, eq(evaluation.houseCategoryId, houseCategory.houseCategoryId))
      .innerJoin(damageCategory, eq(evaluation.damageCategoryId, damageCategory.damageCategoryId))
      .where(isNull(evaluation.dateDeleted))
      .orderBy(evaluation.evaluationId);

    return NextResponse.json(records);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
