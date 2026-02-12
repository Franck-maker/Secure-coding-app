import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import { prisma } from "@/src/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const WEAK_SECRET = "12345";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, WEAK_SECRET);
    const userId = decoded.userId;

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