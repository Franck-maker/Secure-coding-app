
import { prisma } from "@/src/lib/prisma";

export class UserService {
  async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
    })
  }

  /**
   * Update a user's profile information (email).
   * @param requesterUserId Id of the user making the request
   * @param targetUserId Id of the user whose profile is being updated (optional, defaults to requesterUserId)
   * @param email New email address
   * @returns Result of the update operation or an error message
   */
  async updateProfile(requesterUserId: number, targetUserId: number = requesterUserId, email?: string) {
    try {
      // Check that requester user exists and get their info (for authorization check)
      const requesterUser = await prisma.user.findUniqueOrThrow({ where: { id: requesterUserId } });
      // Check that if requester is trying to update another user's profile, return an error (authorization check)
      if (requesterUser.id !== targetUserId && requesterUser.isAdmin !== true) {
        return {
          success: false,
          message: `User ${requesterUserId} is not authorized to update user ${targetUserId}'s profile`,
          status: 403
        }
      }
    } catch (error) {
      console.error(`Database error while fetching requester user ${requesterUserId}:`, error);
      return {
        success: false,
        message: `Cannot find user ${requesterUserId}`,
        status: 404
      }
    }

    try {
      // Check that target user exists and get their info (for authorization check)
      const _targetUser = await prisma.user.findUniqueOrThrow({ where: { id: targetUserId } });
    } catch (error) {
      console.error(`Database error while fetching target user ${targetUserId}:`, error);
      return {
        success: false,
        message: `Cannot find user ${targetUserId}`,
        status: 404
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { email },
    });
    
    return {
      success: true,
      user: updatedUser,
      status: 200
    };
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        balance: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
  }
}

// Export a singleton instance of the service
export const userService = new UserService();