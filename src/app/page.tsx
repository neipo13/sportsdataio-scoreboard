"use client";

import { AppProvider } from "../hooks/useAppState";
import { Scoreboard } from "../components/Scoreboard";

export default function Home() {
  return (
    <AppProvider>
      <Scoreboard />
    </AppProvider>
  );
}
