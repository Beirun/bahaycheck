import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { eq, desc } from "drizzle-orm";
import { user } from '@/schema/user'
import { requestStatus } from "@/schema/requestStatus";
export const config = {
  api: {
    bodyParser: false,
  },
};

// api/admin/request
export async function GET(req: NextRequest) {
    try {
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
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      })
      .from(request)
      .innerJoin(requestStatus,eq(requestStatus.requestStatusId, request.requestStatusId))
      .leftJoin(user, eq(user.userId, request.userId))
      .orderBy(desc(request.dateUpdated));

    const host = req.nextUrl.origin; // e.g., https://example.com
    const mappedRequests = requests.map((r) => ({
      ...r,
      requestImage: r.requestImage ? `${host}${r.requestImage}` : null,
      userName: `${r.firstName} ${r.lastName}`,
    }));

    return NextResponse.json({ requests: mappedRequests });

    } catch {
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}