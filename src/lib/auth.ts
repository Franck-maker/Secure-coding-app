import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET } from "@/src/lib/constants";
import { DecodedToken } from "../services/authService";

export type AuthedRouteHandler = (
  request: Request,
  context: { decoded: DecodedToken, params?: unknown }
) => Promise<Response> | Response;

/**
 * Higher-order function that wraps API route handlers with JWT authentication middleware.
 * Enforces authentication for restricted endpoints by validating JWT tokens from the Authorization header.
 * 
 * @param handler - The API route handler to protect with authentication
 * @returns An authenticated route handler that validates JWT tokens before executing the wrapped handler
 * 
 * @example
 * ```typescript
 * export const POST = withAuth(async (request, context) => {
 *   const { decoded } = context;
 *   return NextResponse.json({ userId: decoded.id });
 * });
 * ```
 * 
 * @throws Returns 401 Unauthorized if:
 *   - No token is provided in the Authorization header
 *   - Token verification fails
 *   - Token structure is invalid
 *   - Token has expired
 * 
 * @throws Returns 403 Forbidden if:
 *   - Sec-Fetch-Site header indicates a cross-origin request (not same-origin or same-site)
 * 
 * @security Validates JWT tokens using HS256 algorithm with SECRET key
 * @security Implements CSRF protection via Sec-Fetch-Site header validation
 * @security Checks token expiration time
 */
export const withAuth = (handler: AuthedRouteHandler) => {
  return async (request: Request, context?: { params?: unknown }) => {
    // --- AUTHENTICATION CHECK (Vulnerable Implementation) ---
    // On récupère le token du Header 'Authorization'
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "No session (cookie) found" }, { status: 401 });
    }

    // Prevent CSRF attacks
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (!(secFetchSite === "same-origin" || secFetchSite === "same-site")) {
      return NextResponse.json({ message: "Cross-origin request suspected, Sec-Fetch-Site header is not same-origin or same-site." }, { status: 403 })
    }

    // Token verification
    try {
      const decoded = jwt.verify(token, SECRET);
      
      // Validate decoded token structure
      if (!isDecodedToken(decoded)) {
        return NextResponse.json({ message: "Invalid token structure" }, { status: 401 });
      }

      // Check token expiration
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ message: "Token has expired" }, { status: 401 });
      }
      
      return handler(request, { decoded, params: context?.params });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
      }
      throw error; // Re-raise if it's not a JWT error
    }
  };
};

export const isDecodedToken = (obj: any): obj is DecodedToken => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.email === "string" &&
    typeof obj.isAdmin === "boolean" &&
    typeof obj.iat === "number" &&
    typeof obj.exp === "number"
  )
}
