export class IntegrationApiError extends Error {
  constructor(
    message: string,
    public readonly response?: Response,
  ) {
    super(message);

    this.name = "IntegrationApiError";
  }
}
