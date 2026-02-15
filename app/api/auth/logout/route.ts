import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Securely clear the httpOnly cookie by setting its expiration date to the past.
  (await cookies()).set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
