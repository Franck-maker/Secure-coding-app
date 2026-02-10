import { prisma } from "@/src/lib/prisma";
import { SECRET } from '@/src/lib/constants';

/**
 * Seed the database with 2 users and 1 transaction.
 * Users: [{ email: "test@ema.il", "password": "12345", balance: 1000 }, { email: "admin@ema.il", "password": "12345", balance: 0 }]
 * Transaction: { amount: 100, senderId: <first user ID>, receiverId: <second user ID> }
 * 
 * Set admin@ema.il as admin.
 */

async function main() {
  // Create users
  const users = await prisma.user.createManyAndReturn({
    data: [{
      email: 'test@ema.il',
      password: encrypt("12345"),
      balance: 1000,
    },
    {
      email: 'admin@ema.il',
      password: encrypt("12345"),
      balance: 0,
      isAdmin: true,
    }],
  });

  // Create transaction
  await prisma.transaction.create({
    data: {
      amount: 100,
      senderId: users[0].id,
      receiverId: users[1].id,
    },
  });

  console.log('Database seeded successfully');
}

const encrypt = (password: string) => {
  // FIXME: Insecure "encryption"
  // return jwt.sign({ password }, SECRET, { expiresIn: '1h' });
  return password;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
