import {
  addSession,
  createBook,
  progress,
  readMinutes,
  reviseBook,
} from "../../src/features/library/domain/book";
const book = createBook("a", " Libro ", " Autora ", "100");
test("trim and validate book fields", () => {
  expect(book.title).toBe("Libro");
  expect(() => createBook("a", "", "x", "1")).toThrow();
  expect(() => createBook("a", "a", "x", "0")).toThrow();
});
test("reading session calculates progress and minutes", () => {
  const result = addSession(
    book,
    "s",
    "25",
    "10",
    "nota",
    "2026-11-20T10:00:00Z",
  );
  expect(progress(result)).toBe(25);
  expect(readMinutes(result)).toBe(10);
  expect(book.sessions).toHaveLength(0);
});
test("invalid entries are rejected", () => {
  expect(() =>
    addSession(book, "s", "101", "1", "", "2026-11-20T10:00:00Z"),
  ).toThrow();
  expect(() =>
    addSession(book, "s", "1", "0", "", "2026-11-20T10:00:00Z"),
  ).toThrow();
  expect(() => addSession(book, "s", "1", "1", "", "invalid")).toThrow();
});
test("completed book and editing preserve history", () => {
  const result = addSession(book, "s", "100", "10", "", "2026-11-20T10:00:00Z");
  expect(progress(result)).toBe(100);
  expect(() => reviseBook(result, "x", "y", "99")).toThrow();
  expect(reviseBook(result, "x", "y", "101").sessions).toEqual(result.sessions);
});
