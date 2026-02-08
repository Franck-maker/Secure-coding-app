import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import jwt from "jsonwebtoken";

const WEAK_SECRET = "12345"; // Same as login

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // --- AUTHENTICATION CHECK (Vulnerable Implementation) ---
    // Get the "authorization" header and extract the token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    // Token verification (vulnerable due to weak secret)
    const decoded: any = jwt.verify(token, WEAK_SECRET);
    
    // Action
    const result = await transactionService.transfer(decoded.userId, body.receiverEmail, Number(body.amount));
    
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ message: "Transfer failed", error }, { status: 500 });
  }
}