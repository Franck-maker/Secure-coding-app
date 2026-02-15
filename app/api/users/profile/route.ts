import { userService } from "@/src/services/userService";
import { NextResponse } from "next/server";
import { withAuth } from "@/src/lib/auth";

/**
 * Update user profile information (email).
 * 
 * @param req
 * @param req.body - JSON object
 * @param req.body.userId - Current user ID
 * @param req.body.email - New email address
 * @return JSON response with success status and new user data
 * 
 * Vulnerabilities: 
 * - Insecure deserialization 
 */
const PutHandler = async (req: Request, context: {
  params?: unknown,
  decoded: { id: number, email: string, isAdmin: boolean }
}) => {
  try {
    // FIX: Insecure Deserialization vulnerability 
    const body = await req.json();
    const { userId, email } = body;

    // Action
    const result = await userService.updateProfile(context.decoded.id, userId ?? undefined, email);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json(result.user);

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`JSON parsing error: ${error}`);
      return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });
    }
    console.error(`Profile update error: ${error}`);
    return NextResponse.json({ message: "Profile update failed", error }, { status: 500 });
  }
}

export const PUT = withAuth(PutHandler);
