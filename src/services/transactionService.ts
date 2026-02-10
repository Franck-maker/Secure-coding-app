import {prisma} from '../lib/prisma';

export class TransactionService {
    async transfer(senderId: number, receiverEmail: string, amount: number) {
        // Business logic flaw: no checking of the amount sign, 
        // allowing negative transfers which can be exploited to increase balance
        /* 
        if (amount <= 0) {
            return {
                success: false,
                message: `Amount ${amount} must be greater than zero`,
                status: 400
            };
        }
        */

        // find recipient
        const receiver = await prisma.user.findUnique({
            where: { email: receiverEmail }
        }); 
        if(!receiver){
            return{
                success : false, 
                message : "User not found"
            }; 
        }

        // find sender and check balance
        const sender = await prisma.user.findUnique({
            where: {id : senderId}
        }); 
        if (!sender) return { success: false, message: "Sender not found" };
        if(sender.balance < amount){
            return{
                success : false, 
                message : "Insufficient balance"
            }; 
        }

        // Prevent self-transfer
        if (senderId === receiver.id) {
            return {
                success: false,
                message: "Cannot transfer to self"
            }
        }

        // Perform transfer
        await prisma.$transaction([
            prisma.user.update({
                where: { id: senderId},
                data: {balance: {decrement: amount}}, 
            }),
            prisma.user.update({
                where: { id: receiver.id},
                data: {balance: {increment: amount}}, 
            }),
            prisma.transaction.create({
                data: {
                    amount, 
                    senderId,
                    receiverId: receiver.id,
                },
            }),
        ]); 

        return { success : true, message : "Transfer successful" };
    }
     
        // Display transaction history
        async getHistory(userId: number) {
            return await prisma.transaction.findMany({
                where:{
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                },
                include: {
                    sender: {
                        select: { email: true }
                    },
                    receiver: {
                        select: { email: true }
                    }
                }, 
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
}

export const transactionService = new TransactionService();