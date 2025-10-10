import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
interface Payload extends JwtPayload {
  role: string;
  userId: number;
  phone: string;
}
export async function authenticateToken(req: AuthRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY) as Payload;
    req.user = payload;
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
