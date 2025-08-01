import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import crypto from "crypto";

// Hash password
export async function hash(password: string): Promise<string> {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateJWT(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_key",
  );

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);

  return token;
}

// Verify JWT token
export async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key",
    );

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(token: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  cookies().set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "lax",
  });
}

// Clear auth cookie
export function clearAuthCookie() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  cookies().delete("auth-token");
}

// Get authenticated user - fixed to properly await cookies
export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  return {
    id: payload.id as string,
    username: payload.username as string,
    role: payload.role as string,
  };
}
