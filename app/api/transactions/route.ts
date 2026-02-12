import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import { prisma } from "@/src/lib/prisma";
import jwt from "jsonwebtoken";
import { SECRET } from "@/src/lib/constants";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, SECRET);
    const userId = decoded.id; // Corrected: key is 'id', not 'userId'

    // Retrieve History and Balance
    const transactions = await transactionService.getHistory(userId);
    
    // 2. Retrieve updated balance
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });

    return NextResponse.json({ 
        transactions,
        balance: user?.balance 
    });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}