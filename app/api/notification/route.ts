import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { notification } from "@/schema/notification";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";

export async function DELETE(req: NextRequest) {
  try {
    const { notificationId } = await req.json(); 
    if (isNaN(notificationId)) return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });

    const now = new Date();

    const updated = await db
      .update(notification)
      .set({ dateUpdated: now, dateDeleted: now })
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


export async function GET(req: NextRequest){
  try {
    const { userId, error } = await authenticateToken(req);
    if(error) return error;
    if (isNaN(userId!)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const data = await db.select().from(notification).where(eq(notification.userId, userId!));
    return NextResponse.json({notifications: data});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(){
  try {
    
    return NextResponse.json({message: "test"});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}