import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { code } from "@/schema/code";
import { license } from "@/schema/license";
import { eq } from "drizzle-orm";
import { generate6DigitCode, sendSMS } from "@/utils/sms";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const role = formData.get("role")?.toString();
    const specialization = formData.get("specialization")?.toString();
    const licenseFile = formData.get("licenseImage") as File | null;

    if (!firstName || !lastName || !phoneNumber || !password || !confirmPassword || !role)
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    const existing = await db.select().from(user).where(eq(user.phoneNumber, phoneNumber)).limit(1);
    if (existing.length > 0)
      return NextResponse.json({ error: "Phone number is already registered." }, { status: 400 });
    if (password !== confirmPassword)
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

    const hashed = await bcryptjs.hash(password, 10);
    const found = await db.select().from(user).limit(1);
    const inserted = await db.insert(user).values({
      firstName,
      lastName,
      roleId:
        role.toLowerCase() === "admin" || found.length === 0
          ? 1
          : role.toLowerCase() === "volunteer"
          ? 2
          : 3,
      phoneNumber,
      passwordHash: hashed,
      dateCreated: new Date(),
    }).returning();

    if (licenseFile && role.toLowerCase() === "volunteer") {
      const arrayBuffer = await licenseFile.arrayBuffer();
      const base64License = `data:${licenseFile.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

      await db.insert(license).values({
        userId: inserted[0].userId,
        specialization: specialization!,
        licenseImage: base64License,
      });
    }

    // Generate 6-digit verification code
    const verificationCode = generate6DigitCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    await db.insert(code).values({
      userId: inserted[0].userId,
      code: verificationCode,
      dateCreated: now,
      expiresAt,
      isUsed: false,
    });

    await sendSMS(phoneNumber, `Your verification code is: ${verificationCode}`);

    return NextResponse.json({
      message: "A verification code has been sent to your phone.",
      user: inserted[0],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
