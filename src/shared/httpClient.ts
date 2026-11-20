export type Fetcher = typeof fetch;
export class DataError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "DataError";
  }
}
export interface JsonClient {
  request(path: string, method?: string, body?: unknown): Promise<unknown>;
}
export class HttpClient implements JsonClient {
  private readonly base: string;
  constructor(
    base: string,
    private readonly fetcher: Fetcher = fetch,
    private readonly timeoutMs = 8000,
  ) {
    if (!/^https?:\/\/[^\s/?#]+(?::\d+)?\/?$/.test(base))
      throw new Error(
        "URL MobileLab inválida: usa http(s)://host:puerto sin ruta.",
      );
    this.base = base.replace(/\/$/, "");
  }
  async request(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher(this.base + path, {
        method,
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok)
        throw new DataError(
          response.status === 401
            ? "Acceso rechazado por el sandbox. Revisa su configuración local."
            : `MobileLab respondió ${response.status}. Reintenta la operación.`,
          response.status,
        );
      if (response.status === 204) return undefined;
      try {
        return await response.json();
      } catch {
        throw new DataError("MobileLab devolvió JSON inválido.");
      }
    } catch (error) {
      if (error instanceof DataError) throw error;
      throw new DataError(
        controller.signal.aborted
          ? "La conexión agotó el tiempo. Reintenta."
          : "No se pudo conectar con MobileLab. Comprueba el proceso y la URL.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
