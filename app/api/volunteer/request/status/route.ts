
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { and, eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";
import { requestStatus } from "@/schema/requestStatus";
import { user } from "@/schema/user";
import { sendSMS } from "@/utils/sms";


// api/volunteer/request
export async function PUT(req: NextRequest) {
  try {
    const { userId, error} = await authenticateToken(req);
    if(error) return error;
    const { requestId } = await req.json();
    if (isNaN(requestId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    if (isNaN(userId!)) return NextResponse.json({ error: "Invalid volunteer ID" }, { status: 400 });


    const record = await db.select({phoneNumber: user.phoneNumber}).from(request).innerJoin(user,eq(request.userId,user.userId)).where(and(eq(request.requestId, requestId),eq(request.volunteerId, userId!))).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });


    const updateData = {
      dateUpdated: new Date(),
      requestStatusId: 3,
    };

    const updated = await db
      .update(request)
      .set(updateData)
      .where(eq(request.requestId, requestId))
      .returning();

    const status = await db.select({requestStatus: requestStatus.requestStatusName}).from(request)
      .innerJoin(
        requestStatus,
        eq(requestStatus.requestStatusId, request.requestStatusId)
      ).where(eq(requestStatus.requestStatusId,updated[0].requestStatusId))
      .limit(1)

        await sendSMS(record[0].phoneNumber,"A volunteer has accepted the request. They will be in your location after.")
    
    return NextResponse.json({ message: "Request updated", ...status[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
