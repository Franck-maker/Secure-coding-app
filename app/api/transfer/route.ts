import { NextResponse } from "next/server";
import { transactionService } from "@/src/services/transactionService";
import { withAuth } from "@/src/lib/auth";

export const POST = withAuth(async (req: Request, context) => {
  try {
    const body = await req.json();

    // Action
    const result = await transactionService.transfer(context.decoded.id, body.receiverEmail, Number(body.amount));

    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Transfer failed" }, { status: 500 });
  }
})
