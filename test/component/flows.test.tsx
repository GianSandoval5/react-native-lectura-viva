import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LibraryApp } from "../../src/features/library/presentation/LibraryApp";
import { createBook } from "../../src/features/library/domain/book";
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));
test("add a book and register a session", async () => {
  const repo = {
    list: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn(),
  };
  const ui = render(<LibraryApp repository={repo} />);
  await waitFor(() => expect(ui.queryByLabelText("Cargando")).toBeNull());
  fireEvent.press(ui.getByText("Añadir libro"));
  fireEvent.changeText(ui.getByLabelText("Título"), "Libro");
  fireEvent.changeText(ui.getByLabelText("Autor"), "Autora");
  fireEvent.changeText(ui.getByLabelText("Total de páginas"), "100");
  fireEvent.press(ui.getByText("Guardar libro"));
  await waitFor(() => expect(ui.getByText("Nueva sesión")).toBeTruthy());
  fireEvent.press(ui.getByText("Nueva sesión"));
  fireEvent.changeText(ui.getByLabelText("Páginas leídas"), "20");
  fireEvent.changeText(ui.getByLabelText("Minutos"), "15");
  fireEvent.press(ui.getByText("Guardar sesión"));
  await waitFor(() => expect(ui.getByText("20% completado")).toBeTruthy());
  expect(repo.save).toHaveBeenCalledTimes(2);
});
test("delete confirmation", async () => {
  const repo = {
    list: jest
      .fn()
      .mockResolvedValue([createBook("a", "Libro", "Autora", "100")]),
    save: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  const ui = render(<LibraryApp repository={repo} />);
  await waitFor(() => expect(ui.getByLabelText("Abrir Libro")).toBeTruthy());
  fireEvent.press(ui.getByLabelText("Abrir Libro"));
  fireEvent.press(ui.getByText("Eliminar libro"));
  fireEvent.press(ui.getByText("Confirmar eliminación"));
  await waitFor(() => expect(repo.remove).toHaveBeenCalledWith("a"));
});
