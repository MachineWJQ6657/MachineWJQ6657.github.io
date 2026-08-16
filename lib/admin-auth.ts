import { env } from "cloudflare:workers";
import { headers } from "next/headers";

export const ADMIN_COOKIE_NAME = "portfolio_admin";

export type SiteAdminUser = {
  userId: string;
  displayName: string;
};

function getAdminPassword(): string | null {
  const runtime = env as unknown as { ADMIN_PASSWORD?: string };
  return runtime.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || null;
}

async function signSession(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("portfolio-studio-session:v1"),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    mismatch |= leftBytes[index] ^ rightBytes[index];
  }
  return mismatch === 0;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function getSiteAdminUser(): Promise<SiteAdminUser | null> {
  if (process.env.NODE_ENV === "development") {
    return { userId: "local-preview-owner", displayName: "Local preview" };
  }

  const secret = getAdminPassword();
  if (!secret) return null;
  const requestHeaders = await headers();
  const session = readCookie(requestHeaders.get("cookie"), ADMIN_COOKIE_NAME);
  if (!session || !constantTimeEqual(session, await signSession(secret))) return null;
  return { userId: "site-owner", displayName: "Site owner" };
}

export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const secret = getAdminPassword();
  if (!secret || !candidate) return false;
  const [candidateSignature, expectedSignature] = await Promise.all([
    signSession(candidate),
    signSession(secret),
  ]);
  return constantTimeEqual(candidateSignature, expectedSignature);
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getAdminPassword();
  return secret ? signSession(secret) : null;
}
