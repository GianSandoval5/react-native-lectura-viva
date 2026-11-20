import React from "react";
import { Platform } from "react-native";
import { LibraryApp } from "./src/features/library/presentation/LibraryApp";
import { HttpClient } from "./src/shared/httpClient";
import { MobileLabBookRepository } from "./src/features/library/data/bookRepository";
const repository = new MobileLabBookRepository(
  new HttpClient(
    process.env.EXPO_PUBLIC_MOBILELAB_URL ||
      (Platform.OS === "android"
        ? "http://10.0.2.2:4566"
        : "http://127.0.0.1:4566"),
  ),
);
export default function App() {
  return <LibraryApp repository={repository} />;
}
