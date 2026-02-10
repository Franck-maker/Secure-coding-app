import { userService } from "@/src/services/userService";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const WEAK_SECRET = "12345"; // Same as login

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
    // req.body = `{"something": ( () => process.exit(1) )() }`
    const body = eval(`[${(await req.text())}]`)[0]; 
    const { userId, email } = body;

    // --- AUTHENTICATION CHECK (Vulnerable Implementation) ---
    // Get the "authorization" header and extract the token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    // Prevent CSRF attacks
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (!(secFetchSite === "same-origin" || secFetchSite === "same-site")) {
      return NextResponse.json({ message: "Cross-origin request suspected, Sec-Fetch-Site header is not same-origin or same-site." }, { status: 403 })
    }

    // Token verification (vulnerable due to weak secret)
    const decoded: any = jwt.verify(token, WEAK_SECRET);

    if (!decoded.userId || typeof decoded.userId !== "number") {
      return NextResponse.json({ message: `${decoded.userId} is not a valid user ID` }, { status: 400 });
    }

    // Action
    const result = await userService.updateProfile(decoded.userId, userId ?? undefined, email);

    if (result?.success === false) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    return NextResponse.json(result);

  } catch (error) {
    console.error(`Profile update error: ${error}`);
    return NextResponse.json({ message: "Profile update failed", error }, { status: 500 });
  }
}
