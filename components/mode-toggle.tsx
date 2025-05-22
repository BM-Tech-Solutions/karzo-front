"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: 4 }}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
