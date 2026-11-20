import assert from "node:assert/strict";
import { HttpClient } from "../src/shared/httpClient";
import { MobileLabBookRepository } from "../src/features/library/data/bookRepository";
import {
  addSession,
  createBook,
  progress,
} from "../src/features/library/domain/book";
async function main() {
  const [base, phase] = process.argv.slice(2);
  const repo = new MobileLabBookRepository(new HttpClient(base));
  const id = "integration-book";
  if (phase === "write") {
    assert.ok((await repo.list()).some((b) => b.id === "demo-book"));
    const book = createBook(id, "Libro de integración", "Autor", "100");
    await repo.save(book);
    assert.deepEqual(
      (await repo.list()).find((b) => b.id === id),
      book,
    );
    const updated = addSession(
      book,
      "s",
      "20",
      "15",
      "nota",
      "2026-11-20T10:00:00Z",
    );
    await repo.save(updated);
    assert.deepEqual(
      (await repo.list()).find((b) => b.id === id),
      updated,
    );
    await repo.save({ ...book, id: "delete-me" });
    await repo.remove("delete-me");
    assert.ok(!(await repo.list()).some((b) => b.id === "delete-me"));
    await assert.rejects(() => repo.remove("missing"), /404/);
  } else if (phase === "restart") {
    const book = (await repo.list()).find((b) => b.id === id);
    assert.ok(book);
    assert.equal(progress(book), 20);
    assert.equal(book.sessions[0].note, "nota");
    await repo.remove(id);
    assert.ok(!(await repo.list()).some((b) => b.id === id));
  } else throw new Error("Invalid phase");
  console.log("MobileLab phase " + phase + " passed");
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
