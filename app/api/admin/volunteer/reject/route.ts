import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { license } from "@/schema/license";
import { sendSMS } from "@/utils/sms";
import { user } from "@/schema/user";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/volunteer/reject
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

    const record = await db.select({phoneNumber: user.phoneNumber}).from(license).innerJoin(user,eq(license.userId,user.userId)).where(eq(license.userId, userId)).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });


    const updated = await db
      .update(license)
      .set({isRejected : true})
      .where(eq(license.userId, userId))
      .returning();

        await sendSMS(record[0].phoneNumber,"Your license has been rejected. Please check your account and submit a valid license.")
    
    return NextResponse.json({ message: "Volunteer successfully verified", license: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}