import { NextResponse } from "next/server";
import { authService } from "@/src/services/authService";

// We use POST for the form, but the vulnerability remains in the logic (weak JWT)
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
    console.error(error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
