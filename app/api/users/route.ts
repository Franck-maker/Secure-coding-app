import { NextResponse } from "next/server";
import { userService } from "@/src/services/userService";
import { withAuth } from "@/src/lib/auth";

export const GET = withAuth(async (req: Request, context) => {
  try {
    // VULNERABILITY: Trusting the token claim 'isAdmin' without database verification
    // This allows privilege escalation if the token is forged (which it can be due to weak secret)
    if (!context.decoded.isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const users = await userService.getAllUsers();
    return NextResponse.json(users);

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
})
