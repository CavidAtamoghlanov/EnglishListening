import crypto from "node:crypto";

type TokenPayload = {
  userId: string;
  issuedAt: string;
};

function secret(): string {
  const value = process.env.AUTH_TOKEN_SECRET;
  if (value) {
    return value;
  }

  if (process.env.VERCEL) {
    throw new Error("AUTH_TOKEN_SECRET is not configured.");
  }

  console.warn("AUTH_TOKEN_SECRET is missing. Using development-only token secret.");
  return "development-only-auth-token-secret";
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export const tokenService = {
  createToken(userId: string): string {
    const payload = encode({ userId, issuedAt: new Date().toISOString() } satisfies TokenPayload);
    return `${payload}.${sign(payload)}`;
  },

  verifyToken(token: string): TokenPayload | null {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) {
      return null;
    }

    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    try {
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    } catch {
      return null;
    }
  },

  readBearerToken(authorization: string | string[] | undefined): string | null {
    const value = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!value?.startsWith("Bearer ")) {
      return null;
    }
    return value.slice("Bearer ".length).trim();
  },
};
