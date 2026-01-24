import { NextResponse } from "next/server";
import { authService } from "@/src/services/authService";

// --- VULNERABILITY: ENCODED PASSWORD EXPOSURE ---
// The vulnerability is HERE (using GET), passing params via URL.
export async function GET(request: Request) {
  
  // Controller Logic: Parse URL
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing email or password in query parameters" },
      { status: 400 }
    );
  }

  // Call the Service
  const result = await authService.login(email, password);

  // Return Response
  return NextResponse.json(
    result,
    { status: result.status }
  );
}