import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { notification } from "@/schema/notification";
import { eq } from "drizzle-orm";

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const data = await db.select().from(notification).where(eq(notification.userId, userId));
    return NextResponse.json({notifications: data});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = Number(params.id);
    if (isNaN(notificationId)) return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });

    const body = await req.json();
    const { title, description, status } = body;
    const dateUpdated = new Date();

    const updated = await db
      .update(notification)
      .set({ title, description, status, dateUpdated })
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