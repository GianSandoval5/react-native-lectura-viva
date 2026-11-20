import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  addSession,
  Book,
  BookRepository,
  createBook,
  progress,
  readMinutes,
  readPages,
  reviseBook,
} from "../domain/book";
type Screen = "home" | "library" | "detail" | "edit" | "session" | "stats";
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
export function LibraryApp({ repository }: { repository: BookRepository }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const current = books.find((b) => b.id === selected);
  const go = (next: Screen) => {
    setError("");
    setConfirm(false);
    setScreen(next);
  };
  async function load() {
    setBusy(true);
    setError("");
    try {
      setBooks(await repository.list());
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, [repository]);
  const open = (b: Book) => {
    setSelected(b.id);
    go("detail");
  };
  const edit = (b?: Book) => {
    setSelected(b?.id ?? null);
    setTitle(b?.title ?? "");
    setAuthor(b?.author ?? "");
    setPages(b ? String(b.pages) : "");
    go("edit");
  };
  const session = () => {
    setPages("");
    setMinutes("");
    setNote("");
    go("session");
  };
  async function save() {
    setError("");
    try {
      const result =
        screen === "session" && current
          ? addSession(
              current,
              id(),
              pages,
              minutes,
              note,
              new Date().toISOString(),
            )
          : current
            ? reviseBook(current, title, author, pages)
            : createBook(id(), title, author, pages);
      setBusy(true);
      await repository.save(result);
      setBooks((previous) => [
        ...previous.filter((b) => b.id !== result.id),
        result,
      ]);
      open(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!current) return;
    setBusy(true);
    setError("");
    try {
      await repository.remove(current.id);
      setBooks((previous) => previous.filter((b) => b.id !== current.id));
      setSelected(null);
      go("library");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const button = (label: string, action: () => void, secondary = false) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={action}
      style={[styles.button, secondary && styles.secondary]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {label}
      </Text>
    </Pressable>
  );
  const field = (
    label: string,
    value: string,
    change: (v: string) => void,
    numeric = false,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={change}
        keyboardType={numeric ? "number-pad" : "default"}
        style={styles.input}
      />
    </View>
  );
  const card = (b: Book) => (
    <Pressable
      key={b.id}
      accessibilityRole="button"
      accessibilityLabel={"Abrir " + b.title}
      onPress={() => open(b)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{b.title}</Text>
      <Text style={styles.muted}>
        {b.author} · {readPages(b)} de {b.pages} páginas
      </Text>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${progress(b)}%` as `${number}%` }]}
        />
      </View>
      <Text style={styles.label}>{progress(b)}% completado</Text>
    </Pressable>
  );
  const filtered = books.filter((b) =>
    (b.title + " " + b.author).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.body}
        >
          <Text style={styles.brand}>LECTURA VIVA</Text>
          <Text style={styles.h1}>
            {
              {
                home: "Tu próxima página",
                library: "Mi biblioteca",
                detail: current?.title ?? "Libro",
                edit: current ? "Editar libro" : "Nuevo libro",
                session: "Registrar sesión",
                stats: "Tu progreso",
              }[screen]
            }
          </Text>
          {busy && (
            <ActivityIndicator accessibilityLabel="Cargando" color="#47734E" />
          )}
          {!!error && (
            <View style={styles.card}>
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
              {button("Reintentar carga", () => void load(), true)}
            </View>
          )}
          {screen === "home" && (
            <>
              <Text style={styles.muted}>
                Pequeñas sesiones, grandes historias.
              </Text>
              <View style={styles.hero}>
                <Text style={styles.heroNumber}>
                  {books.reduce((n, b) => n + readPages(b), 0)}
                </Text>
                <Text style={styles.heroText}>
                  páginas leídas ·{" "}
                  {books.filter((b) => progress(b) === 100).length} libros
                  terminados
                </Text>
              </View>
              {button("Añadir libro", () => edit())}
              {books
                .filter((b) => progress(b) < 100)
                .slice(0, 3)
                .map(card)}
            </>
          )}
          {screen === "library" && (
            <>
              {field("Buscar título o autor", query, setQuery)}
              {button("Añadir libro", () => edit())}
              {filtered.length === 0 && (
                <Text style={styles.muted}>No hay libros para mostrar.</Text>
              )}
              {filtered.map(card)}
            </>
          )}
          {screen === "detail" && current && (
            <>
              <Text style={styles.muted}>{current.author}</Text>
              {card(current)}
              {progress(current) < 100 && button("Nueva sesión", session)}
              {button("Editar libro", () => edit(current), true)}
              <Text style={styles.cardTitle}>Historial de lectura</Text>
              {current.sessions.length === 0 && (
                <Text style={styles.muted}>Aún no registras sesiones.</Text>
              )}
              {[...current.sessions].reverse().map((s) => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {s.pages} páginas · {s.minutes} min
                  </Text>
                  <Text style={styles.muted}>
                    {new Date(s.at).toLocaleDateString()}
                  </Text>
                  <Text>{s.note}</Text>
                </View>
              ))}
              {confirm ? (
                <>
                  {button("Confirmar eliminación", () => void remove())}
                  {button("Cancelar", () => setConfirm(false), true)}
                </>
              ) : (
                button("Eliminar libro", () => setConfirm(true), true)
              )}
            </>
          )}
          {screen === "edit" && (
            <>
              {field("Título", title, setTitle)}
              {field("Autor", author, setAuthor)}
              {field("Total de páginas", pages, setPages, true)}
              {button("Guardar libro", () => void save())}
              {button(
                "Cancelar",
                () => go(current ? "detail" : "library"),
                true,
              )}
            </>
          )}
          {screen === "session" && current && (
            <>
              <Text style={styles.muted}>
                {current.pages - readPages(current)} páginas restantes
              </Text>
              {field("Páginas leídas", pages, setPages, true)}
              {field("Minutos", minutes, setMinutes, true)}
              {field("Nota opcional", note, setNote)}
              {button("Guardar sesión", () => void save())}
              {button("Cancelar", () => go("detail"), true)}
            </>
          )}
          {screen === "stats" && (
            <>
              {[
                [
                  "Libros terminados",
                  books.filter((b) => progress(b) === 100).length,
                ],
                ["Páginas leídas", books.reduce((n, b) => n + readPages(b), 0)],
                [
                  "Minutos de lectura",
                  books.reduce((n, b) => n + readMinutes(b), 0),
                ],
                ["Sesiones", books.reduce((n, b) => n + b.sessions.length, 0)],
              ].map(([label, value]) => (
                <View key={label} style={styles.card}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.metric}>{value}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
        <View style={styles.nav}>
          {(["home", "library", "stats"] as const).map((s, i) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityState={{ selected: screen === s }}
              disabled={busy}
              onPress={() => go(s)}
              style={styles.tab}
            >
              <Text style={[styles.label, screen === s && styles.active]}>
                {["Inicio", "Biblioteca", "Progreso"][i]}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F2E9" },
  body: {
    padding: 22,
    gap: 14,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  brand: {
    fontSize: 12,
    letterSpacing: 3,
    color: "#47734E",
    fontWeight: "700",
  },
  h1: { fontSize: 34, fontWeight: "800", color: "#183F35" },
  muted: { color: "#596B60", fontSize: 15 },
  hero: { padding: 22, borderRadius: 22, backgroundColor: "#183F35" },
  heroNumber: { fontSize: 52, fontWeight: "800", color: "#F7D18A" },
  heroText: { fontSize: 15, color: "#FFF" },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFF",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E4D8",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#183F35" },
  label: { color: "#385546", fontWeight: "600", fontSize: 14 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8EDE2",
    overflow: "hidden",
  },
  fill: { height: 8, backgroundColor: "#76A479", borderRadius: 4 },
  button: {
    backgroundColor: "#47734E",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
  },
  buttonText: { fontWeight: "700", color: "#FFF" },
  secondary: { backgroundColor: "#E8EDE2" },
  secondaryText: { color: "#183F35" },
  field: { gap: 6 },
  input: {
    backgroundColor: "#FFF",
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BDC9BA",
    fontSize: 16,
    color: "#183F35",
  },
  error: { color: "#A32D2D" },
  nav: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E4D8",
  },
  tab: { flex: 1, paddingVertical: 18, alignItems: "center" },
  active: { color: "#47734E", fontWeight: "800" },
  metric: { fontSize: 34, fontWeight: "800", color: "#183F35" },
});
