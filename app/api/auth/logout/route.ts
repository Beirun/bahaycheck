import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    
    const token = req.cookies.get('refreshToken');

    const res = NextResponse.json({ message: "Logged out successfully" });
    if(token){
        res.cookies.delete('refreshToken')
    }
    
  return res;
}
