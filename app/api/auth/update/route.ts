import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { license } from "@/schema/license";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";
import { put } from "@vercel/blob";

export const config = { api: { bodyParser: false } };

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await authenticateToken(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const firstName = formData.get("firstName")?.toString() || null;
    const lastName = formData.get("lastName")?.toString() || null;
    const currentPassword = formData.get("currentPassword")?.toString() || "";
    const newPassword = formData.get("newPassword")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const licenseFile = formData.get("licenseImage") as File | null;

    const [u] = await db.select().from(user).where(eq(user.userId, userId));
    if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword)
        return NextResponse.json({ error: "Please enter your current password" }, { status: 400 });
      if (!newPassword)
        return NextResponse.json({ error: "Please enter a new password" }, { status: 400 });
      if (!confirmPassword)
        return NextResponse.json({ error: "Please re-enter your new password" }, { status: 400 });

      const valid = await bcryptjs.compare(currentPassword, u.passwordHash);
      if (!valid)
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      if (newPassword !== confirmPassword)
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });

      const hashed = await bcryptjs.hash(newPassword, 10);
      await db.update(user).set({ passwordHash: hashed }).where(eq(user.userId, userId));
    }

    const updatedUser = await db
      .update(user)
      .set({ firstName: firstName ?? u.firstName, lastName: lastName ?? u.lastName })
      .where(eq(user.userId, userId))
      .returning();

    if (licenseFile) {
      const blob = await put(licenseFile.name, licenseFile, { access: "public" });

      const updatedLicense = await db
        .update(license)
        .set({ licenseImage: blob.url, isRejected: false })
        .where(eq(license.userId, userId))
        .returning();

      return NextResponse.json(
        {
          message: "Profile updated successfully",
          user: {
            userId: updatedUser[0].userId,
            firstName: updatedUser[0].firstName,
            lastName: updatedUser[0].lastName,
            phoneNumber: updatedUser[0].phoneNumber,
          },
          license: updatedLicense[0],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          userId: updatedUser[0].userId,
          firstName: updatedUser[0].firstName,
          lastName: updatedUser[0].lastName,
          phoneNumber: updatedUser[0].phoneNumber,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
