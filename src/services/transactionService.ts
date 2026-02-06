import {prisma} from '../lib/prisma';

export class TransactionService {
    async transfer(senderId: number, receiverEmail: string, amount: number) {
        // Basic validation but not secured
        if(amount <=0){
            return {
                success: false,
                message: "Amount must be greater than zero.",
            
            };
        }
        
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

        // find sender and checking balance

        const sender = await prisma.user.findUnique({
            where: {id : senderId}
        }); 

        if(!sender || sender.balance < amount){
            return{
                success : false, 
                message : "Insufficient balance"
            }; 
        }

        // Perform transfer
        // BUsiness logic flaw : we don't verify if sender.id === receiver.id, allowing self transfer which can be exploited for balance manipulation

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
     
        // to display the historic

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