import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { notification } from "@/schema/notification";
import { eq } from "drizzle-orm";


// api/notification/status
export async function PUT(req: NextRequest) {
  try {
    const { notificationId, status } = await req.json(); 
    if (isNaN(notificationId)) return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });

    const dateUpdated = new Date();

    const updated = await db
      .update(notification)
      .set({status, dateUpdated })
      .where(eq(notification.notificationId, notificationId))
      .returning();

    if (updated.length === 0)
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });

    return NextResponse.json({ message: "Notification updated", data: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}