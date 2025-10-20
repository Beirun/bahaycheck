import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { license } from "@/schema/license";
import path from "path";
import fs from "fs";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";

export const config = { api: { bodyParser: false } };

export async function PUT(req: NextRequest) {
  try {
    console.log("=== PROFILE UPDATE START ===");

    const { userId } = await authenticateToken(req);
    console.log("Authenticated userId:", userId);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const firstName = formData.get("firstName")?.toString() || null;
    const lastName = formData.get("lastName")?.toString() || null;
    const currentPassword = formData.get("currentPassword")?.toString() || "";
    const newPassword = formData.get("newPassword")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const licenseFile = formData.get("licenseImage") as File | null;

    console.log("Received form data:", {
      firstName,
      lastName,
      currentPassword: !!currentPassword,
      newPassword: !!newPassword,
      confirmPassword: !!confirmPassword,
      hasLicenseFile: !!licenseFile,
    });

    const [u] = await db.select().from(user).where(eq(user.userId, userId));
    console.log("Fetched user:", u ? "Found" : "Not found");
    if (!u)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (currentPassword || newPassword || confirmPassword) {
      console.log("Password update requested");

      if (!currentPassword) {
        console.warn("Missing current password");
        return NextResponse.json(
          { error: "Please enter your current password" },
          { status: 400 }
        );
      } else if (!newPassword) {
        console.warn("Missing new password");
        return NextResponse.json(
          { error: "Please enter a new password" },
          { status: 400 }
        );
      } else if (!confirmPassword) {
        console.warn("Missing confirm password");
        return NextResponse.json(
          { error: "Please re-enter your new password" },
          { status: 400 }
        );
      }

      const valid = await bcryptjs.compare(currentPassword, u.passwordHash);
      console.log("Password valid:", valid);

      if (!valid)
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );

      if (newPassword !== confirmPassword) {
        console.warn("Passwords do not match");
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 400 }
        );
      }

      const hashed = await bcryptjs.hash(newPassword, 10);
      await db
        .update(user)
        .set({ passwordHash: hashed })
        .where(eq(user.userId, userId));
      console.log("Password updated successfully");
    }

    console.log("Updating user profile...");
    const updatedUser = await db
      .update(user)
      .set({
        firstName: firstName ?? u.firstName,
        lastName: lastName ?? u.lastName,
      })
      .where(eq(user.userId, userId))
      .returning();
    console.log("User updated:", updatedUser[0]);

    if (licenseFile) {
      console.log("License image upload detected:", licenseFile.name);

      const uploadDir = path.join(process.cwd(), "/public/uploads/license");
      if (!fs.existsSync(uploadDir)) {
        console.log("Creating upload directory:", uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(licenseFile.name);
      const fileName = `${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      console.log("Saving license image:", filePath);

      const buffer = Buffer.from(await licenseFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const licensePath = `/uploads/license/${fileName}`;
      console.log("Stored license path:", licensePath);

      const updatedLicense = await db
        .update(license)
        .set({ licenseImage: licensePath, isRejected: false })
        .where(eq(license.userId, userId))
        .returning();
      console.log("License record updated:", updatedLicense[0]);

      console.log("=== PROFILE UPDATE SUCCESS (WITH LICENSE) ===");
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

    console.log("=== PROFILE UPDATE SUCCESS (NO LICENSE) ===");
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
    console.error("Profile update error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
