import https from "https";
import { RequestInit } from "node-fetch";
import fetch from "cross-fetch";

export async function fetchWithoutSSLCheck(url: string, options?: RequestInit) {
  return await fetch(url, {
    ...options,
    //@ts-ignore
    agent: new https.Agent({ rejectUnauthorized: false }),
  });
}
