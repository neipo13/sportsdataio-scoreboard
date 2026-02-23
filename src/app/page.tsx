"use client";

import { AppProvider } from "../hooks/useAppState";
import { Router } from "../components/Router";

export default function Home() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
