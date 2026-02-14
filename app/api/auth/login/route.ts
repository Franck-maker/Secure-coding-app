import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/src/services/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const result = await authService.login(email, password);

    if (!result.success) {
      return NextResponse.json(result, { status: result.status });
    }

    // Create the response
    const response = NextResponse.json({
      success: true, 
      message: "Login successful",
      token: result.token,
      user: result.user}, { status: 200 });

      // --- VULNERABILITY ENABLER ---
    // We set the token in a COOKIE.
    // By default, this cookie will be sent with every request to our domain.
    // We intentionally do NOT set 'SameSite: Strict' to allow the attack later.
    response.cookies.set({
      name: "token",
      value: result.token || "",
      httpOnly: true, // JavaScript cannot read it (good for XSS, bad for CSRF if no other protection)
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}


/**
 * VULNERABILITY: Encoded Password Exposure (via GET request)
 * This handler reads credentials directly from the URL.
 * It is not used by the UI but can be exploited directly.
 */
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const email = searchParams.get('email');
      const password = searchParams.get('password');
  
      if (!email || !password) {
        return NextResponse.json({ success: false, message: "Email and password are required in URL parameters" }, { status: 400 });
      }
  
      const result = await authService.login(email, password);
  
      if (!result.success) {
        return NextResponse.json(result, { status: result.status });
      }
  
      // Create the response
      const response = NextResponse.json({
        success: true,
        message: "Login successful (from insecure GET)",
        user: result.user
      }, { status: 200 });
  
      // Set the same cookie as the POST route to complete the login
      response.cookies.set({
        name: "token",
        value: result.token || "",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });

      return response;
  
    } catch (error) {
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
