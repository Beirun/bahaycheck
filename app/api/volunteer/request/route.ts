import { desc } from "drizzle-orm";
import { user } from "@/schema/user";
import { requestStatus } from "@/schema/requestStatus";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await authenticateToken(req);
    if (error) return error;
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
      })
      .from(request)
      .innerJoin(
        requestStatus,
        eq(requestStatus.requestStatusId, request.requestStatusId)
      )
      .leftJoin(user, eq(user.userId, request.userId))
      .orderBy(desc(request.dateUpdated))
      .where(eq(request.volunteerId, userId!));

    const mappedRequests = requests.map((r) => ({
      ...r,
      requestImage: r.requestImage || null,
      userName: `${r.firstName} ${r.lastName}`,
    }));

    return NextResponse.json({ requests: mappedRequests });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
