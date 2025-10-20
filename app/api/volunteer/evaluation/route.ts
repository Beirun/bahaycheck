import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { evaluation } from "@/schema/evaluation";
import { request } from "@/schema/request";
import { houseCategory } from "@/schema/houseCategory";
import { damageCategory } from "@/schema/damageCategory";
import { and, eq } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";
import { user } from "@/schema/user";
import { sendSMS } from "@/utils/sms";

export const config = {
  api: {
    bodyParser: true,
  },
};

// api/volunteer/evaluation
export async function POST(req: NextRequest) {
  try {
    const {userId} = await authenticateToken(req);
    const body = await req.json();
    const { requestId, houseCategoryId, damageCategoryId, note } = body;

    if (!requestId || !houseCategoryId || !damageCategoryId)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    // Validate foreign keys
    const reqExists = await db
      .select()
      .from(request)
      .where(eq(request.requestId, requestId))
      .limit(1);
    if (!reqExists[0])
      return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (reqExists[0].volunteerId !== userId)
      return NextResponse.json(
        { error: "Not assigned to that request" },
        { status: 400 }
      );

    const houseExists = await db
      .select()
      .from(houseCategory)
      .where(eq(houseCategory.houseCategoryId, houseCategoryId))
      .limit(1);
    if (!houseExists[0])
      return NextResponse.json(
        { error: "House category not found" },
        { status: 404 }
      );

    const damageExists = await db
      .select()
      .from(damageCategory)
      .where(eq(damageCategory.damageCategoryId, damageCategoryId))
      .limit(1);
    if (!damageExists[0])
      return NextResponse.json(
        { error: "Damage category not found" },
        { status: 404 }
      );

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
      
    await db.update(request).set({requestStatusId: 4}).where(eq(request.requestId,requestId));

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
      .innerJoin(
        houseCategory,
        eq(evaluation.houseCategoryId, houseCategory.houseCategoryId)
      )
      .innerJoin(
        damageCategory,
        eq(evaluation.damageCategoryId, damageCategory.damageCategoryId)
      )
      .where(
        and(isNull(evaluation.dateDeleted), eq(request.volunteerId, userId),eq(evaluation.evaluationId,newEval.evaluationId))
      )
      .orderBy(evaluation.evaluationId)
      .limit(1);
     const citizen = await db.select({phoneNumber: user.phoneNumber}).from(request).innerJoin(user,eq(request.userId,user.userId)).where(eq(request.requestId, records[0].requestId));

        await sendSMS(citizen[0].phoneNumber, "Your recent request has just been evaluated.");
    
      
    return NextResponse.json({
      message: "Evaluation created successfully",
      evaluation: records[0],
      requestStatus: "Completed"
    });
    
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await authenticateToken(req);
    if(error) return error;
    
    if (!userId)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
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
      .innerJoin(
        houseCategory,
        eq(evaluation.houseCategoryId, houseCategory.houseCategoryId)
      )
      .innerJoin(
        damageCategory,
        eq(evaluation.damageCategoryId, damageCategory.damageCategoryId)
      )
      .where(
        and(isNull(evaluation.dateDeleted), eq(request.volunteerId, userId))
      )
      .orderBy(evaluation.evaluationId);

    return NextResponse.json(records);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
