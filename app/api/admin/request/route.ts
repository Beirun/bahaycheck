import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { request } from "@/schema/request";
import { eq, desc } from "drizzle-orm";
import { user } from '@/schema/user'
import { requestStatus } from "@/schema/requestStatus";
import { alias } from "drizzle-orm/pg-core";
export const config = {
  api: {
    bodyParser: false,
  },
};
const volunteer = alias(user, "volunteer");

// api/admin/request
export async function GET() {
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
        dateAssigned: request.dateAssigned,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        volunteerId: request.volunteerId,
        

        volunteerFirstName: volunteer.firstName,
        volunteerLastName: volunteer.lastName,
      })
      .from(request)
      .innerJoin(requestStatus,eq(requestStatus.requestStatusId, request.requestStatusId))
      .leftJoin(user, eq(user.userId, request.userId))
            .leftJoin(volunteer, eq(volunteer.userId, request.volunteerId))

      .orderBy(desc(request.dateUpdated));

    const mappedRequests = requests.map((r) => ({
      ...r,
      requestImage: r.requestImage || null,
      userName: `${r.firstName} ${r.lastName}`,
      volunteerName:
        r.volunteerFirstName && r.volunteerLastName
          ? `${r.volunteerFirstName} ${r.volunteerLastName}`
          : null,
    }));

    return NextResponse.json({ requests: mappedRequests });

    } catch {
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}