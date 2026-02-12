import { NextResponse } from "next/server";
import { userService } from "@/src/services/userService";
import jwt from "jsonwebtoken";
import { SECRET } from "@/src/lib/constants";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, SECRET);

    // VULNERABILITY: Trusting the token claim 'isAdmin' without database verification
    // This allows privilege escalation if the token is forged (which it can be due to weak secret)
    if (!decoded.isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const users = await userService.getAllUsers();
    return NextResponse.json(users);

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
