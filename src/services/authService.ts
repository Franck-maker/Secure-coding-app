import { prisma } from "@/src/lib/prisma";

export class AuthService {
  /**
   * Registers a new user.
   * VULNERABILITY: User Enumeration preserved here.
   */
  async register(data: any) {
    const { email, password, username } = data;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // VULNERABILITY logic is kept in the service
      return { 
        success: false, 
        message: "This email is already registered.", 
        status: 409 
      };
    }

    // 2. Create User
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Plain text as intended for the vulnerability
        username,
        balance: 100.0,
      },
    });

    return { 
      success: true, 
      message: "User created successfully", 
      user: newUser, 
      status: 201 
    };
  }

  /**
   * Logs in a user.
   * The Service doesn't care if it came from a GET or POST, it just checks credentials.
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check password (Plain text comparison)
    if (!user || user.password !== password) {
      return { 
        success: false, 
        message: "Invalid credentials", 
        status: 401 
      };
    }

    return { 
      success: true, 
      message: "Login successful", 
      user: { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin 
      },
      status: 200
    };
  }
}

// Export a singleton instance of the service
export const authService = new AuthService();