import { userService } from "@/src/services/userService";
import { NextResponse } from "next/server";

/**
 * Update user profile information (email or settings).
 * 
 * @param req
 * @param req.body - JSON object
 * @param req.body.userId - Current user ID
 * @param req.body.email - New email address
 * @param req.body.settings - New settings (JSON object)
 * @return JSON response with success status and new user data
 * 
 * Vulnerabilities: 
 * - No authentication check (anyone can update any profile)
 * - Insecure deserialization 
 */
export async function PUT(req: Request) {
  try {
    // Insecure Deserialization vulnerability
    // Extremely dangerous, as it allows, for example, to shutdown the server: 
    // req.body = `{"userId": ( () => process.exit(1) )() }`
    const body = eval(`[${(await req.text())}]`)[0]; 
    const { userId, email } = body;

    if (!userId || typeof userId !== "number") {
      return NextResponse.json({ message: `${userId} is not a valid user ID` }, { status: 400 });
    }

    // Action
    const result = await userService.updateProfile(userId, email);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error(`Profile update error: ${error}`);
    return NextResponse.json({ message: "Profile update failed", error }, { status: 500 });
  }
}
