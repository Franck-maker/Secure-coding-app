// FIXME: Insecure secret key, exposed in code
// Throw error if not set to prevent server from starting without a secret
/* 
if (!process.env.SECRET) {
  throw new Error("SECRET environment variable is not set. Please set it to a strong, random value before starting the server.");
}
export const SECRET: string = process.env.SECRET
// */ // FIX: Remove the weak, hardcoded fallback secret.

// The secret is now loaded exclusively from environment variables.
export const SECRET: string = process.env.SECRET!;
