import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { desc, eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";
import { requestStatus } from "@/schema/requestStatus";
import { user } from "@/schema/user";
import { alias } from "drizzle-orm/pg-core";
import { sendSMS } from "@/utils/sms";

interface RequestUpdate {
  requestDetails?: string;
  requestStatusId?: number;
  longitude?: number;
  latitude?: number;
  requestImage?: string; // store base64 here
  dateUpdated: Date;
}

const volunteer = alias(user, "volunteer");

export async function POST(req: NextRequest) {
  try {
    const payload = await authenticateToken(req);
    if (payload.error) return payload.error;

    const formData = await req.formData();
    const requestDetails = formData.get("requestDetails")?.toString() || null;
    const requestStatusId = formData.get("requestStatusId")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const file = formData.get("requestImage") as File | null;
    const userId = payload.userId;

    if (!userId || !requestStatusId || !longitude || !latitude || !file)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    const now = new Date();

    const inserted = await db
      .insert(request)
      .values({
        userId: Number(userId),
        requestImage: base64Image,
        requestDetails,
        requestStatusId: Number(requestStatusId),
        longitude: Number(longitude),
        latitude: Number(latitude),
        dateCreated: now,
      })
      .returning();

    const admins = await db
      .select({ phoneNumber: user.phoneNumber })
      .from(user)
      .where(eq(user.roleId, 1));

    await Promise.all(
      admins.map(a =>
        sendSMS(a.phoneNumber, "A new request has been submitted. Please check it out immediately!")
      )
    );

    return NextResponse.json({
      message: "Request created",
      request: inserted[0],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const requestId = formData.get("requestId")?.toString();
    if (!requestId || isNaN(Number(requestId)))
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

    const record = await db
      .select()
      .from(request)
      .where(eq(request.requestId, Number(requestId)))
      .limit(1);
    if (!record[0])
      return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const requestDetails = formData.get("requestDetails")?.toString();
    const requestStatusId = formData.get("requestStatus")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const file = formData.get("requestImage") as File | null;

    const updateData: RequestUpdate = { dateUpdated: new Date() };
    if (requestDetails) updateData.requestDetails = requestDetails;
    if (requestStatusId) updateData.requestStatusId = Number(requestStatusId);
    if (longitude) updateData.longitude = Number(longitude);
    if (latitude) updateData.latitude = Number(latitude);

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      updateData.requestImage = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    }

    const updated = await db
      .update(request)
      .set(updateData)
      .where(eq(request.requestId, Number(requestId)))
      .returning();

    const requests = await db
      .select({
        requestId: request.requestId,
        userId: request.userId,
        requestImage: request.requestImage,
        requestDetails: request.requestDetails,
        requestStatus: requestStatus.requestStatusName,
        longitude: request.longitude,
        latitude: request.latitude,
        dateCreated: request.dateCreated,
        dateUpdated: request.dateUpdated,
        dateAssigned: request.dateAssigned,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        volunteerId: request.volunteerId,
        volunteerFirstName: volunteer.firstName,
        volunteerLastName: volunteer.lastName,
      })
      .from(request)
      .innerJoin(requestStatus, eq(requestStatus.requestStatusId, request.requestStatusId))
      .leftJoin(user, eq(user.userId, request.userId))
      .leftJoin(volunteer, eq(volunteer.userId, request.volunteerId))
      .orderBy(desc(request.dateUpdated))
      .where(eq(request.requestId, updated[0].requestId));

    const mappedRequests = requests.map(r => ({
      ...r,
      requestImage: r.requestImage || null,
      userName: `${r.firstName} ${r.lastName}`,
      volunteerName:
        r.volunteerFirstName && r.volunteerLastName
          ? `${r.volunteerFirstName} ${r.volunteerLastName}`
          : null,
    }));

    return NextResponse.json({
      message: "Request updated",
      request: mappedRequests[0],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await authenticateToken(req);
    const requests = await db
      .select({
        requestId: request.requestId,
        userId: request.userId,
        requestImage: request.requestImage,
        requestDetails: request.requestDetails,
        requestStatus: requestStatus.requestStatusName,
        longitude: request.longitude,
        latitude: request.latitude,
        dateCreated: request.dateCreated,
        dateUpdated: request.dateUpdated,
        dateAssigned: request.dateAssigned,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        volunteerId: request.volunteerId,
        volunteerFirstName: volunteer.firstName,
        volunteerLastName: volunteer.lastName,
      })
      .from(request)
      .innerJoin(requestStatus, eq(requestStatus.requestStatusId, request.requestStatusId))
      .leftJoin(user, eq(user.userId, request.userId))
      .leftJoin(volunteer, eq(volunteer.userId, request.volunteerId))
      .orderBy(desc(request.dateUpdated))
      .where(eq(request.userId, userId!));

    const mappedRequests = requests.map(r => ({
      ...r,
      requestImage: r.requestImage || null,
      userName: `${r.firstName} ${r.lastName}`,
      volunteerName:
        r.volunteerFirstName && r.volunteerLastName
          ? `${r.volunteerFirstName} ${r.volunteerLastName}`
          : null,
    }));

    return NextResponse.json({ requests: mappedRequests });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
