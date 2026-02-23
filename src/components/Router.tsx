"use client";

import { useEffect, useState } from "react";
import { Scoreboard } from "./Scoreboard";
import { EventDetailPage } from "./detail/EventDetailPage";

interface Route {
  type: "dashboard" | "event";
  eventId?: string;
  tab?: string;
}

function parseHash(hash: string): Route {
  // Remove leading #
  const path = hash.replace(/^#\/?/, "");

  // Match: event/{eventId} or event/{eventId}/{tab}
  const eventMatch = path.match(/^event\/([^/]+)(?:\/([^/]+))?$/);
  if (eventMatch) {
    return {
      type: "event",
      eventId: eventMatch[1],
      tab: eventMatch[2] || undefined,
    };
  }

  return { type: "dashboard" };
}

export function Router() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? parseHash(window.location.hash) : { type: "dashboard" },
  );

  useEffect(() => {
    function handleHashChange() {
      const newRoute = parseHash(window.location.hash);
      setRoute(newRoute);
      window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route.type === "event" && route.eventId) {
    return <EventDetailPage eventId={route.eventId} initialTab={route.tab} />;
  }

  return <Scoreboard />;
}
