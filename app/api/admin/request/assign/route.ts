import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { eq } from "drizzle-orm";
import { sendSMS } from "@/utils/sms";
import { user } from "@/schema/user";

// api/admin/request/assign
export async function PUT(req: NextRequest) {
  try {
    const { requestId, userId } = await req.json();
    if (isNaN(requestId))
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    if (isNaN(userId))
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 }
      );

    const record = await db
      .select()
      .from(request)
      .where(eq(request.requestId, requestId))
      .limit(1);
    if (!record[0])
      return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const updateData = {
      dateUpdated: new Date(),
      requestStatusId: 2,
      volunteerId: Number(userId),
      dateAssigned: new Date(),
    };

    const updated = await db
      .update(request)
      .set(updateData)
      .where(eq(request.requestId, requestId))
      .returning();

    const citizen = await db
      .select({ phoneNumber: user.phoneNumber })
      .from(user)
      .where(eq(user.userId, updated[0].userId));
    const volunteer = await db
      .select({ phoneNumber: user.phoneNumber })
      .from(user)
      .where(eq(user.userId, userId));

    await Promise.all([
      sendSMS(
        citizen[0].phoneNumber,
        "A volunteer has been assigned to your recent request."
      ),
      sendSMS(
        volunteer[0].phoneNumber,
        "Your have been assigned to a request. Please check your account for more info."
      ),
    ]);

    return NextResponse.json({
      message: "Request updated",
      request: updated[0],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
