import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface RequestUpdate {
  requestDetails?: string;
  requestStatusId?: number;
  longitude?: number;
  latitude?: number;
  requestImage?: string;
  dateUpdated: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await authenticateToken(req);
    const formData = await req.formData();
    const requestDetails = formData.get("requestDetails")?.toString() || null;
    const requestStatusId = formData.get("requestStatusId")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const file = formData.get("requestImage") as File | null;

    if (!userId || !requestStatusId || !longitude || !latitude || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "/public/uploads/request");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to ArrayBuffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const dbPath = `/uploads/request/${fileName}`;

    const now = new Date();
    const inserted = await db.insert(request).values({
      userId: Number(userId),
      requestImage: dbPath,
      requestDetails,
      requestStatusId: Number(requestStatusId),
      longitude: Number(longitude),
      latitude: Number(latitude),
      dateCreated: now,
    }).returning();

    return NextResponse.json({ message: "Request created", request: inserted[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function PUT(req: NextRequest) {
  try {
    const { requestId } = await req.json();
    const reqId = requestId;
    if (isNaN(reqId)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });

    const record = await db.select().from(request).where(eq(request.requestId, reqId)).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const formData = await req.formData();
    const requestDetails = formData.get("requestDetails")?.toString();
    const requestStatusId = formData.get("requestStatus")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const file = formData.get("requestImage") as File | null;

    const updateData: RequestUpdate = {
      dateUpdated: new Date(),
    };
    if (requestDetails) updateData.requestDetails = requestDetails;
    if (requestStatusId) updateData.requestStatusId = Number(requestStatusId);
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


export async function GET(req: NextRequest) {
  try {

    const body = await req.json();
    const id = body.requestId;
    if (!id || isNaN(Number(id)))
      return NextResponse.json({ error: "Invalid or missing request ID" }, { status: 400 });

    const record = await db.select().from(request).where(eq(request.requestId, Number(id))).limit(1);
    if (!record[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    return NextResponse.json({ request: record[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}