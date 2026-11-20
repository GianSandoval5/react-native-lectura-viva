export interface Session {
  id: string;
  pages: number;
  minutes: number;
  at: string;
  note: string;
}
export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  sessions: Session[];
}
export interface BookRepository {
  list(): Promise<Book[]>;
  save(book: Book): Promise<void>;
  remove(id: string): Promise<void>;
}
export const readPages = (book: Book) =>
  book.sessions.reduce((total, session) => total + session.pages, 0);
export const readMinutes = (book: Book) =>
  book.sessions.reduce((total, session) => total + session.minutes, 0);
export const progress = (book: Book) =>
  Math.floor((readPages(book) / book.pages) * 100);
export function positiveInt(value: string, label: string): number {
  const n = Number(value);
  if (
    !/^\d+$/.test(value.trim()) ||
    !Number.isSafeInteger(n) ||
    n <= 0 ||
    n > 100000
  )
    throw new Error(label + " debe ser un entero positivo (máximo 100000).");
  return n;
}
export function createBook(
  id: string,
  title: string,
  author: string,
  pages: string,
): Book {
  if (!id.trim() || !title.trim() || !author.trim())
    throw new Error("Completa título y autor.");
  return {
    id,
    title: title.trim(),
    author: author.trim(),
    pages: positiveInt(pages, "Páginas"),
    sessions: [],
  };
}
export function addSession(
  book: Book,
  id: string,
  pages: string,
  minutes: string,
  note: string,
  at: string,
): Book {
  const count = positiveInt(pages, "Páginas");
  if (readPages(book) + count > book.pages)
    throw new Error("La sesión supera las páginas restantes.");
  if (
    !id.trim() ||
    book.sessions.some((s) => s.id === id) ||
    !Number.isFinite(Date.parse(at))
  )
    throw new Error("Sesión inválida.");
  return {
    ...book,
    sessions: [
      ...book.sessions,
      {
        id,
        pages: count,
        minutes: positiveInt(minutes, "Minutos"),
        note: note.trim(),
        at,
      },
    ],
  };
}
export function reviseBook(
  book: Book,
  title: string,
  author: string,
  pages: string,
): Book {
  const updated = createBook(book.id, title, author, pages);
  if (updated.pages < readPages(book))
    throw new Error("El total no puede ser menor al progreso registrado.");
  return { ...updated, sessions: book.sessions };
}
