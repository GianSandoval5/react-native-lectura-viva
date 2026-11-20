import { JsonClient } from "../../../shared/httpClient";
import { addSession, Book, BookRepository, createBook } from "../domain/book";
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Documento de libro inválido.");
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("Campo de texto inválido.");
  return value;
}
function number(value: unknown): string {
  if (typeof value !== "number") throw new Error("Campo numérico inválido.");
  return String(value);
}
export function decodeBook(value: unknown): Book {
  const r = record(value);
  let book = createBook(
    string(r.id),
    string(r.title),
    string(r.author),
    number(r.pages),
  );
  if (!Array.isArray(r.sessions)) throw new Error("Sesiones inválidas.");
  for (const value of r.sessions) {
    const s = record(value);
    book = addSession(
      book,
      string(s.id),
      number(s.pages),
      number(s.minutes),
      string(s.note),
      string(s.at),
    );
  }
  return book;
}
export class MobileLabBookRepository implements BookRepository {
  constructor(private readonly client: JsonClient) {}
  async list(): Promise<Book[]> {
    const data = await this.client.request("/api/books");
    if (!Array.isArray(data)) throw new Error("Colección inválida.");
    return data.map(decodeBook);
  }
  async save(book: Book): Promise<void> {
    await this.client.request(
      "/api/books/" + encodeURIComponent(book.id),
      "PUT",
      decodeBook(book),
    );
  }
  async remove(id: string): Promise<void> {
    await this.client.request("/api/books/" + encodeURIComponent(id), "DELETE");
  }
}
