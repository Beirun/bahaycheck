import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import fs from "fs";
import path from "path";
import { user } from "@/schema/user";
import { desc, eq } from "drizzle-orm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: AuthRequest) {
  try {
      const userId = req.user.userId;
    const formData = await req.formData();
    const requestDetails = formData.get("requestDetails")?.toString() || null;
    const requestStatus = formData.get("requestStatus")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const file = formData.get("requestImage") as File | null;

    if (!userId || !requestStatus || !longitude || !latitude || !file) {
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
      requestStatus,
      longitude: Number(longitude),
      latitude: Number(latitude),
      dateCreated: now,
      dateUpdated: now,
    }).returning();

    return NextResponse.json({ message: "Request created", request: inserted[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(req: AuthRequest) {
  if (req.user.role === "admin") {
    const requests = await db
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
        phoneNumber: user.phoneNumber
      })
      .from(request)
      .leftJoin(user, eq(user.userId, request.userId))
      .orderBy(desc(request.dateUpdated));

    const host = req.nextUrl.origin; // e.g., https://example.com
    const mappedRequests = requests.map((r) => ({
      ...r,
      requestImage: r.requestImage ? `${host}${r.requestImage}` : null,
      userName: `${r.firstName} ${r.lastName}`,
    }));

    return NextResponse.json({ requests: mappedRequests });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
