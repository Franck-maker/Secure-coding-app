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
 * - No authentication check (anyone can update any profile)
 * - Insecure deserialization 
 */
export const PUT = withAuth(async (req: Request, context) => {
  try {
    // Insecure Deserialization vulnerability
    // Extremely dangerous, as it allows, for example, to shutdown the server: 
    // req.body = `{"something": ( () => process.exit(1) )() }`
    const body = eval(`[${(await req.text())}]`)[0]; 
    const { userId, email } = body;

    // Action
    const result = await userService.updateProfile(context.decoded.id, userId ?? undefined, email);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    
    return NextResponse.json(result.user);

  } catch (error) {
    console.error(`Profile update error: ${error}`);
    return NextResponse.json({ message: "Profile update failed", error }, { status: 500 });
  }
})
