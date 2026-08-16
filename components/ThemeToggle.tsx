"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function currentTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    setMode(currentTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (!document.documentElement.dataset.theme) setMode(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const toggle = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("site-theme", next);
    setMode(next);
  };

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`} title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}><span aria-hidden="true">{mode === "dark" ? "☀" : "☾"}</span><em>{mode === "dark" ? "Light" : "Dark"}</em></button>;
}
