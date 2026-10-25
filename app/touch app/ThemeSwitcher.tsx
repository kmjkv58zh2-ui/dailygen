"use client";

import { useEffect, useState } from "react";

interface ThemeOption {
  label: string;
  bg: string;
  text: string;
  accent: string;
}

const themes: Record<string, ThemeOption> = {
  default: { label: "Default", bg: "#060913", text: "#f8fafc", accent: "#f6d89b" },
  pink: { label: "Baby Pink", bg: "#fdf2f8", text: "#831843", accent: "#f472b6" },
  blue: { label: "Baby Blue", bg: "#f0f9ff", text: "#0c4a6e", accent: "#38bdf8" },
  black: { label: "Black", bg: "#000000", text: "#ffffff", accent: "#e2e8f0" },
  white: { label: "White", bg: "#ffffff", text: "#0f172a", accent: "#2563eb" },
};

const fonts: Record<string, { label: string; family: string }> = {
  sans: { label: "Clean (Inter)", family: "'Inter', sans-serif" },
  serif: { label: "Classy (Playfair)", family: "'Playfair Display', serif" },
  mono: { label: "Code (JetBrains)", family: "'JetBrains Mono', monospace" },
  handwriting: { label: "Casual (Caveat)", family: "'Caveat', cursive" },
};

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");
  const [currentFont, setCurrentFont] = useState("serif");

  const applyStyles = (themeKey: string, fontKey: string) => {
    const selectedTheme = themes[themeKey] || themes.default;
    const selectedFont = fonts[fontKey] || fonts.serif;

    let styleEl = document.getElementById("dailygen-custom-styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dailygen-custom-styles";
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      body, main, div#__next, [class*="min-h-screen"] {
        background-color: ${selectedTheme.bg} !important;
        color: ${selectedTheme.text} !important;
        font-family: ${selectedFont.family} !important;
      }
      h1, h2, h3, h4, h5, h6, p, span, div, a, button {
        font-family: ${selectedFont.family} !important;
      }
      button:not(#theme-toggle-btn), a[class*="bg-"] {
        background-color: ${selectedTheme.accent} !important;
        color: ${themeKey === "pink" || themeKey === "blue" ? "#ffffff" : "#0f172a"} !important;
      }
    `;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("dailygen-theme") || "default";
    const savedFont = localStorage.getItem("dailygen-font") || "serif";
    setCurrentTheme(savedTheme);
    setCurrentFont(savedFont);
    applyStyles(savedTheme, savedFont);
  }, []);

  const handleThemeChange = (key: string) => {
    setCurrentTheme(key);
    localStorage.setItem("dailygen-theme", key);
    applyStyles(key, currentFont);
  };

  const handleFontChange = (key: string) => {
    setCurrentFont(key);
    localStorage.setItem("dailygen-font", key);
    applyStyles(currentTheme, key);
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999 }}>
      {open && (
        <div
          style={{
            backgroundColor: "#111827",
            color: "#f9fafb",
            padding: "16px",
            borderRadius: "14px",
            marginBottom: "12px",
            width: "230px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            border: "1px solid #374151",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "8px", textTransform: "uppercase" }}>
              Theme Color
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {Object.entries(themes).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  style={{
                    backgroundColor: item.bg,
                    color: item.text,
                    border: currentTheme === key ? "2px solid #38bdf8" : "1px solid #4b5563",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px", textTransform: "uppercase" }}>
              Font Family
            </div>
            <select
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "6px",
                backgroundColor: "#1f2937",
                color: "#f9fafb",
                border: "1px solid #4b5563",
                fontSize: "12px",
                outline: "none",
              }}
            >
              {Object.entries(fonts).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        id="theme-toggle-btn"
        onClick={() => setOpen(!open)}
        style={{
          backgroundColor: "#f6d89b",
          color: "#0f172a",
          border: "none",
          padding: "10px 18px",
          borderRadius: "9999px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          fontSize: "13px",
        }}
      >
        🎨 Style
      </button>
    </div>
  );
}