import { getRequest } from "@tanstack/react-start/server";

interface CloudflareRequest extends Request {
  runtime?: {
    cloudflare?: {
      env?: Record<string, unknown>;
    };
  };
}

export function getServerEnv(name: string): string | undefined {
  const runtimeEnv = (getRequest() as CloudflareRequest).runtime?.cloudflare?.env;
  const runtimeValue = runtimeEnv?.[name];
  return typeof runtimeValue === "string" ? runtimeValue : process.env[name];
}
