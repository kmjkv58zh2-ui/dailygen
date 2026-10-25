import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dailygen — Personal Command Centre",
  description: "The personal command centre for disciplined achievers. Designed and Built by Rishanth Velvijayan.",
  authors: [{ name: "Rishanth Velvijayan" }],
  creator: "Rishanth Velvijayan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@400;500;700&family=GFS+Didot&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* FLOATING THEME & FONT SWITCHER */}
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999999 }}>
          <details style={{ position: "relative" }}>
            <summary
              style={{
                backgroundColor: "#f6d89b",
                color: "#0f172a",
                padding: "10px 18px",
                borderRadius: "9999px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.4)",
                fontSize: "13px",
                listStyle: "none",
                userSelect: "none",
              }}
            >
              🎨 Style
            </summary>
            <div
              style={{
                position: "absolute",
                bottom: "45px",
                right: "0",
                backgroundColor: "#111827",
                color: "#f9fafb",
                padding: "16px",
                borderRadius: "14px",
                width: "250px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                border: "1px solid #374151",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "8px" }}>
                  THEME COLOR
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { id: "default", label: "Default", bg: "#060913", text: "#fff" },
                    { id: "pink", label: "Baby Pink", bg: "#fdf2f8", text: "#831843" },
                    { id: "blue", label: "Baby Blue", bg: "#f0f9ff", text: "#0c4a6e" },
                    { id: "black", label: "Black", bg: "#000000", text: "#fff" },
                    { id: "white", label: "White", bg: "#ffffff", text: "#000" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      data-theme-btn={t.id}
                      style={{
                        backgroundColor: t.bg,
                        color: t.text,
                        border: "1px solid #4b5563",
                        padding: "5px 9px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginBottom: "6px" }}>
                  FONT FAMILY
                </div>
                <select
                  id="font-selector"
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
                  <option value="cinzel_dec">Cinzel Decorative (Greek/Roman Flare)</option>
                  <option value="gfs_didot">GFS Didot (Classical Hellenic)</option>
                  <option value="cinzel">Cinzel (Roman Lapidary)</option>
                  <option value="serif">Playfair Display (Classy)</option>
                  <option value="sans">Inter (Clean)</option>
                  <option value="mono">JetBrains Mono (Code)</option>
                  <option value="handwriting">Caveat (Handwritten)</option>
                  <option value="jakarta">Plus Jakarta Sans (Modern)</option>
                  <option value="outfit">Outfit (Geometric Minimal)</option>
                  <option value="space">Space Mono (Brutalist)</option>
                  <option value="cormorant">Cormorant Garamond (Vintage)</option>
                  <option value="dmsans">DM Sans (Smooth Product)</option>
                </select>
              </div>
            </div>
          </details>
        </div>

        {children}

        <Script id="theme-injector" strategy="lazyOnload">
          {`
            (function() {
              var themeStyles = {
                default: "",
                pink: \`
                  html, body, main, [class*="min-h-screen"] {
                    background: #fdf2f8 !important;
                    background-color: #fdf2f8 !important;
                    color: #581c87 !important;
                  }
                  aside, nav, [class*="w-64"] {
                    background-color: #fce7f3 !important;
                    border-color: #fbcfe8 !important;
                  }
                  aside h1, aside h2, aside span, aside p {
                    color: #831843 !important;
                  }
                  aside button, aside a {
                    background-color: transparent !important;
                    color: #831843 !important;
                    border: 1px solid transparent !important;
                  }
                  aside button:hover, aside a:hover {
                    background-color: #f472b6 !important;
                    color: #ffffff !important;
                    border-color: #ec4899 !important;
                  }
                  header, [class*="border-b"] {
                    background-color: #fdf2f8 !important;
                    border-color: #fbcfe8 !important;
                  }
                  h1, h2, h3, h4, [class*="text-white"], [class*="text-slate-100"] {
                    color: #4a044e !important;
                  }
                  p, span, [class*="text-slate-400"] {
                    color: #701a75 !important;
                  }
                  [class*="text-amber-"], [class*="text-yellow-"] {
                    color: #9d174d !important;
                  }
                  [class*="bg-slate-900"], [class*="bg-slate-950"], [class*="border-slate-800"] {
                    background-color: #ffffff !important;
                    border-color: #fbcfe8 !important;
                    box-shadow: 0 4px 14px rgba(236, 72, 153, 0.08) !important;
                  }
                  main button[type="submit"] {
                    background-color: #db2777 !important;
                    color: #ffffff !important;
                  }
                \`,
                blue: \`
                  html, body, main, [class*="min-h-screen"] {
                    background: #f0f9ff !important;
                    background-color: #f0f9ff !important;
                    color: #0f172a !important;
                  }
                  aside, nav, [class*="w-64"] {
                    background-color: #e0f2fe !important;
                    border-color: #bae6fd !important;
                  }
                  aside h1, aside h2, aside span, aside p {
                    color: #0c4a6e !important;
                  }
                  header, [class*="border-b"] {
                    background-color: #f0f9ff !important;
                    border-color: #bae6fd !important;
                  }
                  h1, h2, h3, h4, [class*="text-white"], [class*="text-slate-100"] {
                    color: #082f49 !important;
                  }
                  p, span, [class*="text-slate-400"] {
                    color: #334155 !important;
                  }
                  [class*="bg-slate-900"], [class*="bg-slate-950"], [class*="border-slate-800"] {
                    background-color: #ffffff !important;
                    border-color: #bae6fd !important;
                    box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08) !important;
                  }
                  main button[type="submit"] {
                    background-color: #0284c7 !important;
                    color: #ffffff !important;
                  }
                \`,
                black: \`
                  html, body, main, [class*="min-h-screen"], aside, nav, header {
                    background: #000000 !important;
                    background-color: #000000 !important;
                    color: #f4f4f5 !important;
                    border-color: #27272a !important;
                  }
                  [class*="bg-slate-900"], [class*="bg-slate-950"], [class*="border-slate-800"] {
                    background-color: #09090b !important;
                    border-color: #27272a !important;
                  }
                \`,
                white: \`
                  html, body, main, [class*="min-h-screen"] {
                    background: #f8fafc !important;
                    background-color: #f8fafc !important;
                    color: #0f172a !important;
                  }
                  aside, nav, [class*="w-64"] {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                  }
                  aside h1, aside span, aside p {
                    color: #0f172a !important;
                  }
                  header, [class*="border-b"] {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                  }
                  h1, h2, h3, h4, [class*="text-white"], [class*="text-slate-100"] {
                    color: #020617 !important;
                  }
                  p, span, [class*="text-slate-400"] {
                    color: #475569 !important;
                  }
                  [class*="bg-slate-900"], [class*="bg-slate-950"], [class*="border-slate-800"] {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05) !important;
                  }
                \`
              };

              var fontMap = {
                cinzel_dec: "'Cinzel Decorative', 'Cinzel', serif",
                gfs_didot: "'GFS Didot', serif",
                cinzel: "'Cinzel', serif",
                serif: "'Playfair Display', Georgia, serif",
                sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                mono: "'JetBrains Mono', monospace",
                handwriting: "'Caveat', cursive",
                jakarta: "'Plus Jakarta Sans', sans-serif",
                outfit: "'Outfit', sans-serif",
                space: "'Space Mono', monospace",
                cormorant: "'Cormorant Garamond', Georgia, serif",
                dmsans: "'DM Sans', sans-serif"
              };

              function applyTheme(tKey) {
                var tag = document.getElementById('dailygen-theme-css');
                if (!tag) {
                  tag = document.createElement('style');
                  tag.id = 'dailygen-theme-css';
                  document.head.appendChild(tag);
                }
                tag.innerHTML = themeStyles[tKey] || "";
              }

              function applyFont(fKey) {
                var font = fontMap[fKey] || fontMap.serif;
                var tag = document.getElementById('dailygen-font-css');
                if (!tag) {
                  tag = document.createElement('style');
                  tag.id = 'dailygen-font-css';
                  document.head.appendChild(tag);
                }
                tag.innerHTML = 'body, main, aside, header, h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, select { font-family: ' + font + ' !important; }';
              }

              var savedT = localStorage.getItem('dg-t') || 'default';
              var savedF = localStorage.getItem('dg-f') || 'serif';
              applyTheme(savedT);
              applyFont(savedF);

              document.addEventListener('click', function(e) {
                var btn = e.target.closest('[data-theme-btn]');
                if (btn) {
                  var id = btn.getAttribute('data-theme-btn');
                  localStorage.setItem('dg-t', id);
                  applyTheme(id);
                }
              });

              var fontSel = document.getElementById('font-selector');
              if (fontSel) {
                fontSel.value = savedF;
                fontSel.addEventListener('change', function(e) {
                  var val = e.target.value;
                  localStorage.setItem('dg-f', val);
                  applyFont(val);
                });
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}