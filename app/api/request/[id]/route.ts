import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { user } from "@/schema/user";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface RequestUpdate {
  requestDetails?: string;
  requestStatus?: string;
  longitude?: number;
  latitude?: number;
  requestImage?: string;
  volunteerId: number;
  dateUpdated: Date;
}

// GET /api/request/[id]
export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const reqId = Number(params.id);
  if (isNaN(reqId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

  const record = await db
    .select({
      requestId: request.requestId,
      userId: request.userId,
      requestImage: request.requestImage,
      requestDetails: request.requestDetails,
      requestStatus: request.requestStatus,
      longitude: request.longitude,
      latitude: request.latitude,
      dateCreated: request.dateCreated,
      dateUpdated: request.dateUpdated,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    })
    .from(request)
    .leftJoin(user, eq(user.userId, request.userId))
    .where(eq(request.requestId, reqId))
    .limit(1);

  if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const host = req.nextUrl.origin;
  const r = record[0];
  const mapped = {
    ...r,
    requestImage: r.requestImage ? `${host}${r.requestImage}` : null,
    userName: `${r.firstName} ${r.lastName}`,
  };

  return NextResponse.json({ request: mapped });
}

// PUT /api/request/[id]
export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    const reqId = Number(params.id);
    if (isNaN(reqId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

    const record = await db.select().from(request).where(eq(request.requestId, reqId)).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const formData = await req.formData();
    const requestDetails = formData.get("requestDetails")?.toString();
    const requestStatus = formData.get("requestStatus")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const volunteerId = formData.get("volunteerId")?.toString();
    const file = formData.get("requestImage") as File | null;

    const updateData: RequestUpdate = {
      dateUpdated: new Date(),
      volunteerId: Number(volunteerId)
    };
    if (requestDetails) updateData.requestDetails = requestDetails;
    if (requestStatus) updateData.requestStatus = requestStatus;
    if (longitude) updateData.longitude = Number(longitude);
    if (latitude) updateData.latitude = Number(latitude);

    if (file) {
      const uploadDir = path.join(process.cwd(), "/public/uploads/request");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileExt = path.extname(file.name);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      updateData.requestImage = `/uploads/request/${fileName}`;
    }

    const updated = await db
      .update(request)
      .set(updateData)
      .where(eq(request.requestId, reqId))
      .returning();

    return NextResponse.json({ message: "Request updated", request: updated[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
