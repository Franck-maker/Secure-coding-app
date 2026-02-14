import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import { prisma } from "@/src/lib/prisma";
import { withAuth } from "@/src/lib/auth";

export const GET = withAuth(async (req: Request, context) => {
  try {
    const userId = context.decoded.id; 

    // Retrieve History and Balance
    const transactions = await transactionService.getHistory(userId);
    
    // 2. Retrieve updated balance
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } });

    return NextResponse.json({ 
        transactions,
        balance: user?.balance 
    });

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
})
