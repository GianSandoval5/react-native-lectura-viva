import {
  decodeBook,
  MobileLabBookRepository,
} from "../../src/features/library/data/bookRepository";
import { createBook } from "../../src/features/library/domain/book";
import { HttpClient } from "../../src/shared/httpClient";
const book = createBook("a/b", "Libro", "Autora", "100");
test("DTO accepts valid documents and rejects malformed data", () => {
  expect(decodeBook(book)).toEqual(book);
  expect(() => decodeBook({ ...book, pages: "100" })).toThrow();
  expect(() => decodeBook({ ...book, sessions: null })).toThrow();
});
test("repository uses JSON API and encodes identifiers", async () => {
  const request = jest.fn().mockResolvedValue([book]);
  const repo = new MobileLabBookRepository({ request });
  expect(await repo.list()).toEqual([book]);
  await repo.save(book);
  await repo.remove(book.id);
  expect(request).toHaveBeenCalledWith("/api/books/a%2Fb", "PUT", book);
  expect(request).toHaveBeenCalledWith("/api/books/a%2Fb", "DELETE");
});
test("HTTP errors surface", async () => {
  const fetcher = jest.fn().mockResolvedValue({ ok: false, status: 404 });
  const client = new HttpClient("http://localhost:4566", fetcher);
  await expect(client.request("/api/books")).rejects.toThrow("404");
});
test("invalid JSON and network errors are surfaced", async () => {
  const fetcher = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.reject(new Error("bad")),
  });
  await expect(
    new HttpClient("http://localhost:4566", fetcher).request("/api/books"),
  ).rejects.toThrow("JSON");
  fetcher.mockRejectedValue(new Error("offline"));
  await expect(
    new HttpClient("http://localhost:4566", fetcher).request("/api/books"),
  ).rejects.toThrow("conectar");
});
