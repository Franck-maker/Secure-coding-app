import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import jwt from "jsonwebtoken";
import { SECRET } from "@/src/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- AUTHENTICATION CHECK (Vulnerable Implementation) ---
    // On récupère le token du Header 'Authorization'
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "No session (cookie) found" }, { status: 401 });
    }

    // Prevent CSRF attacks
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (!(secFetchSite === "same-origin" || secFetchSite === "same-site")) {
      return NextResponse.json({ message: "Cross-origin request suspected, Sec-Fetch-Site header is not same-origin or same-site." }, { status: 403 })
    }

    // Token verification
    const decoded: any = jwt.verify(token, SECRET);

    // Action
    const result = await transactionService.transfer(decoded.id, body.receiverEmail, Number(body.amount));

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ message: "Transfer failed", error }, { status: 500 });
  }
}