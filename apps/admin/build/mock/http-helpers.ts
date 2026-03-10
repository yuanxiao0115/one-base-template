import type { IncomingMessage, ServerResponse } from "node:http";
import type { JsonObject } from "./types";

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) {
    return {};
  }
  const out: Record<string, string> = {};
  const parts = header.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) {
      continue;
    }
    out[k] = decodeURIComponent(rest.join("=") || "");
  }
  return out;
}

export async function readJsonBody(req: IncomingMessage): Promise<JsonObject> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString("utf-8");
    });
    req.on("end", () => {
      if (!raw) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object") {
          return resolve(parsed as JsonObject);
        }
        return resolve({});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export function ok(res: ServerResponse, data: unknown = null, message = "ok") {
  return json(res, 200, { code: 200, data, message });
}

export function fail(res: ServerResponse, status: number, message: string, code: number = status) {
  return json(res, status, { code, data: null, message });
}

export function setCookie(res: ServerResponse, cookie: string) {
  const prev = res.getHeader("Set-Cookie");
  if (!prev) {
    res.setHeader("Set-Cookie", cookie);
    return;
  }
  if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", [...prev, cookie]);
    return;
  }
  res.setHeader("Set-Cookie", [String(prev), cookie]);
}
