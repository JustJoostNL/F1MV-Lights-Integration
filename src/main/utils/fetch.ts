import { Agent } from "https";
import fetch from "cross-fetch";

export function extendFetch(
  fetchFn: typeof fetch,
  timeout?: number,
  allowUnauthorized?: boolean,
): (url: string, options: RequestInit) => Promise<Response> {
  const agent = allowUnauthorized
    ? new Agent({ rejectUnauthorized: false })
    : undefined;

  return async (url: string, options: RequestInit) => {
    return new Promise((resolve, reject) => {
      const timer = timeout
        ? setTimeout(() => {
            reject(new Error("Request timed out"));
          }, timeout)
        : undefined;

      fetchFn(url, {
        ...options,
        //@ts-ignore
        agent,
      })
        .then((res) => {
          if (timeout) clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          if (timeout) clearTimeout(timer);
          reject(err);
        });
    });
  };
}

export const fetchWithTimeout = extendFetch(fetch, 5000, false);
export const fetchWithoutSSLCheck = extendFetch(fetch, undefined, true);
export const fetchWithoutSSLCheckWithTimeout = extendFetch(fetch, 5000, true);
