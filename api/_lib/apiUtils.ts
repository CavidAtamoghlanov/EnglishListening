export type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export function allowMethods(req: ApiRequest, res: ApiResponse, methods: string[]): boolean {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(204).end();
    return false;
  }

  if (!methods.includes(req.method ?? "")) {
    setCors(res);
    res.status(405).json({ error: `Method ${req.method ?? "UNKNOWN"} is not allowed.` });
    return false;
  }
  return true;
}

export function setCors(res: ApiResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");
}

export function readBody<T>(req: ApiRequest): T {
  if (typeof req.body === "string") {
    return JSON.parse(req.body) as T;
  }
  return (req.body ?? {}) as T;
}

export function handleApiError(res: ApiResponse, error: unknown, status = 400): void {
  const message = error instanceof Error ? error.message : "Request failed.";
  res.status(status).json({ error: message });
}

export function readAdminToken(req: ApiRequest): string | null {
  const header = req.headers["x-admin-token"];
  const value = Array.isArray(header) ? header[0] : header;
  return value ?? null;
}

export function isAdminTokenValid(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN ?? process.env.ADMIN_PIN;
  return Boolean(expected && token && token === expected);
}
