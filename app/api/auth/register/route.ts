import { NextResponse } from "next/server";
import { authService } from "@/src/services/authService"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic Input Validation (Controller responsibility)
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Call the Service
    const result = await authService.register(body);

    // Return the response based on what the service decided
    return NextResponse.json(
      { message: result.message, user: result.user },
      { status: result.status }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}