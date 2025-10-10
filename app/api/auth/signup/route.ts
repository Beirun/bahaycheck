import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { code } from "@/schema/code";
import path from "path";
import fs from "fs";
import { eq } from "drizzle-orm";
import { license } from "@/schema/license";
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = new Twilio(accountSid, authToken);

export const config = { api: { bodyParser: false } };

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return NextResponse.json(
        { error: "Missing credentials or license image" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(user)
      .where(eq(user.phoneNumber, phoneNumber))
      .limit(1);
    if (existing.length > 0)
      return NextResponse.json(
        { error: "Phone number is already registered." },
        { status: 401 }
      );
    if (password !== confirmPassword)
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );

    const hashed = await bcryptjs.hash(password, 10);
    const inserted = await db
      .insert(user)
      .values({
        firstName,
        lastName,
        roleId:
          role.toLowerCase() === "admin"
            ? 1
            : role.toLowerCase() === "volunteer"
            ? 2
            : 3,
        phoneNumber: phoneNumber,
        passwordHash: hashed,
        dateCreated: new Date(),
      })
      .returning();

    if (licenseFile && role.toLowerCase() === "volunteer") {
      const uploadDir = path.join(process.cwd(), "/public/uploads/license");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileExt = path.extname(licenseFile.name);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await licenseFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      const licensePath = `/uploads/license/${fileName}`;
      await db
        .insert(license)
        .values({ userId: inserted[0].userId, specialization: specialization!, licenseImage: licensePath });
    }

    // Generate 6-digit verification code
    const verificationCode = generate6DigitCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    await db.insert(code).values({
      userId: inserted[0].userId,
      code: verificationCode,
      dateCreated: now,
      expiresAt: expiresAt,
      isUsed: false,
    });
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: twilioPhoneNumber,
      to: phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`, // ensure international format
    });

    return NextResponse.json({
      message: "A verification code has been sent to your phone.",
      user: inserted[0],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
