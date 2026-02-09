
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

export class UserService {
  async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async updateProfile(userId: number, email?: string, settings?: Prisma.JsonObject) {
    try {

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
    } catch (error) {
      console.error(`Database error while fetching user ${userId}:`, error);
      return {
        success: false,
        message: `Cannot find user ${userId}`,
        status: 404
      }
    }


    return await prisma.user.update({
      where: { id: userId },
      data: { email, settings },
    })
  }
}

// Export a singleton instance of the service
export const userService = new UserService();