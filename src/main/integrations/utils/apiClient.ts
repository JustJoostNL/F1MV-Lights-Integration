import { Agent } from "https";
import fetch from "cross-fetch";
import { IntegrationApiError } from "./error";

export interface ApiClientOptions {
  /** Base URL for all requests (e.g., "https://api.example.com") */
  baseUrl?: string;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Whether to skip SSL certificate verification (default: false) */
  skipSSLVerification?: boolean;
}

export interface RequestOptions extends Omit<
  globalThis.RequestInit,
  "headers"
> {
  /** Additional headers for this specific request */
  headers?: Record<string, string>;
  /** Override timeout for this specific request */
  timeout?: number;
  /** Path to append to base URL */
  path?: string;
  /** Query parameters to append to URL */
  queryParams?: Record<string, string | number | boolean>;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly agent: Agent | undefined;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.defaultHeaders = options.headers ?? {};
    this.timeout = options.timeout ?? 5000;
    this.agent = options.skipSSLVerification
      ? new Agent({ rejectUnauthorized: false })
      : undefined;
  }

  /**
   * Build a full URL from base URL, path, and query parameters
   */
  private buildUrl(options: RequestOptions): string {
    let url = options.path ? `${this.baseUrl}${options.path}` : this.baseUrl;

    if (options.queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.queryParams)) {
        params.append(key, String(value));
      }
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return url;
  }

  /**
   * Perform a fetch request with timeout and error handling
   */
  async request<T = unknown>(
    urlOrOptions: string | RequestOptions,
    options: RequestOptions = {},
  ): Promise<{ response: Response; data: T }> {
    const requestOptions: RequestOptions =
      typeof urlOrOptions === "string"
        ? { ...options, path: urlOrOptions }
        : urlOrOptions;

    const url = this.buildUrl(requestOptions);
    const timeout = requestOptions.timeout ?? this.timeout;
    const headers = {
      ...this.defaultHeaders,
      ...requestOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : undefined;

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
        signal: controller.signal,
        // @ts-ignore - agent is not in the RequestInit type but is supported
        agent: this.agent,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        throw new IntegrationApiError(
          `${response.statusText} (HTTP ${response.status})`,
          response,
        );
      }

      const data = await this.parseResponse<T>(response);

      return { response, data };
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      if (error instanceof IntegrationApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new IntegrationApiError(
            `Request to ${url} timed out after ${timeout}ms`,
          );
        }
        throw new IntegrationApiError(
          `Request to ${url} failed: ${error.message}`,
        );
      }

      throw new IntegrationApiError(
        `Request to ${url} failed: ${String(error)}`,
      );
    }
  }

  /**
   * Parse response body as JSON, handling errors appropriately
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      // Return empty object for non-JSON responses
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  /**
   * Perform a GET request
   */
  async get<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<{ response: Response; data: T }> {
    return this.request<T>({ ...options, path, method: "GET" });
  }

  /**
   * Perform a POST request with JSON body
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<{ response: Response; data: T }> {
    return this.request<T>({
      ...options,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Perform a PUT request with JSON body
   */
  async put<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<{ response: Response; data: T }> {
    return this.request<T>({
      ...options,
      path,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Perform a DELETE request
   */
  async delete<T = unknown>(
    path: string,
    options: Omit<RequestOptions, "method"> = {},
  ): Promise<{ response: Response; data: T }> {
    return this.request<T>({ ...options, path, method: "DELETE" });
  }

  /**
   * Create a new ApiClient with updated options (immutable)
   */
  withOptions(options: Partial<ApiClientOptions>): ApiClient {
    return new ApiClient({
      baseUrl: options.baseUrl ?? this.baseUrl,
      headers: { ...this.defaultHeaders, ...options.headers },
      timeout: options.timeout ?? this.timeout,
      skipSSLVerification:
        options.skipSSLVerification ?? this.agent !== undefined,
    });
  }

  /**
   * Create a new ApiClient with an additional header
   */
  withHeader(name: string, value: string): ApiClient {
    return this.withOptions({
      headers: { [name]: value },
    });
  }

  /**
   * Create a new ApiClient with Bearer authentication
   */
  withBearerAuth(token: string): ApiClient {
    return this.withHeader("Authorization", `Bearer ${token}`);
  }
}

/**
 * Create a pre-configured API client for common use cases
 */
export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  return new ApiClient(options);
}

/**
 * Build a base URL from host and port
 */
export function buildBaseUrl(
  host: string | undefined,
  port?: number,
  protocol: "http" | "https" = "http",
): string | undefined {
  if (!host) return undefined;

  // Handle if host already includes protocol
  let cleanHost = host;
  let finalProtocol = protocol;

  if (host.startsWith("https://")) {
    cleanHost = host.replace("https://", "");
    finalProtocol = "https";
  } else if (host.startsWith("http://")) {
    cleanHost = host.replace("http://", "");
    finalProtocol = "http";
  }

  // Remove trailing slash
  cleanHost = cleanHost.replace(/\/$/, "");

  // Build URL
  let url = `${finalProtocol}://${cleanHost}`;
  if (port) {
    url += `:${port}`;
  }

  return url;
}
