"use client";

import { useEffect, useRef, useState } from "react";

const WIDGET_SRC = "https://widget.crawbat.com/chat-widget.js?v=1.0.4";
const API_URL = "https://api.crawbat.com/chat";
const CONFIG_URL = "https://api.crawbat.com/widget-config";

interface WidgetConfig {
  slug: string;
  widgetKey: string;
  label?: string;
}

const PRESETS: WidgetConfig[] = [
  {
    slug: "testclinic",
    widgetKey: "pub_testclinic_001",
    label: "Test Clinic",
  },
];

// Track nodes added to body for cleanup
let bodyNodes: Set<Node> = new Set();
let bodyObserver: MutationObserver | null = null;

function startBodyTracking() {
  bodyNodes = new Set();
  bodyObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => bodyNodes.add(n));
    }
  });
  bodyObserver.observe(document.body, { childList: true });
}

function destroyWidget(container: HTMLElement | null) {
  if (bodyObserver) {
    bodyObserver.disconnect();
    bodyObserver = null;
  }

  bodyNodes.forEach((n) => {
    if (n.parentNode) n.parentNode.removeChild(n);
  });
  bodyNodes = new Set();

  if (container) container.innerHTML = "";

  const old = document.getElementById("crawbat-chat-widget");
  if (old) old.remove();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  delete w.CrawbatWidget;
  delete w.crawbatWidget;
  delete w.__crawbat;
}

function injectWidget(
  slug: string,
  widgetKey: string,
  mode: "center" | "left" | "right",
  container: HTMLElement | null
) {
  const script = document.createElement("script");
  script.id = "crawbat-chat-widget";
  script.src = WIDGET_SRC;
  script.async = true;
  script.dataset.clientId = slug;
  script.dataset.widgetKey = widgetKey;
  script.dataset.apiUrl = API_URL;
  script.dataset.widgetConfigUrl = CONFIG_URL;
  script.dataset.showBadge = "true";
  script.dataset.requestTimeout = "12000";
  script.dataset.skipConsent = "true";

  if (mode === "center" && container) {
    script.dataset.position = "center";
    const root = document.createElement("div");
    root.setAttribute("data-chat-widget-root", "");
    container.appendChild(root);
    container.appendChild(script);
  } else {
    script.dataset.position = mode; // "left" or "right"
    startBodyTracking();
    document.body.appendChild(script);
  }
}

export default function TestWidgetPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState(0);
  const [customSlug, setCustomSlug] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [mode, setMode] = useState<"center" | "left" | "right">("center");
  const [mounted, setMounted] = useState(false);

  const currentConfig: WidgetConfig | null = (() => {
    if (customSlug && customKey) return { slug: customSlug, widgetKey: customKey };
    return PRESETS[activePreset] ?? null;
  })();

  // Mount widget
  useEffect(() => {
    if (!mounted || !currentConfig) return;

    const container = containerRef.current;
    destroyWidget(container);

    const timer = setTimeout(() => {
      injectWidget(currentConfig.slug, currentConfig.widgetKey, mode, container);

      if (mode === "center") {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const widget = (window as any).CrawbatWidget;
          if (widget?.open) widget.open();
        }, 600);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyWidget(container);
    };
  }, [mounted, currentConfig?.slug, currentConfig?.widgetKey, mode]);

  const handleMount = () => setMounted(true);
  const handleUnmount = () => {
    setMounted(false);
    destroyWidget(containerRef.current);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Widget Test Page</h1>
          <button
            onClick={() => {
              document.cookie = "test_widget_auth=; path=/; max-age=0";
              window.location.href = "/test-widget/login";
            }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="lg:w-80 shrink-0 space-y-4">
            {/* Presets */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Presets
              </h2>
              <div className="space-y-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      setActivePreset(i);
                      setCustomSlug("");
                      setCustomKey("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      activePreset === i && !customSlug
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="font-medium">{p.label || p.slug}</div>
                    <div className="text-xs opacity-70">{p.widgetKey}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom config */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Custom Widget
              </h2>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="slug (e.g. testclinic)"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500"
                />
                <input
                  type="text"
                  placeholder="widget key (e.g. pub_xxx_001)"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Mode */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Position
              </h2>
              <div className="flex gap-2">
                {(["center", "left", "right"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 px-3 py-2 rounded text-sm transition ${
                      mode === m
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {m === "center" ? "Inline" : m === "left" ? "Left" : "Right"}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleMount}
                disabled={mounted || !currentConfig}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mount
              </button>
              <button
                onClick={handleUnmount}
                disabled={!mounted}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Unmount
              </button>
            </div>

            {/* Current info */}
            {currentConfig && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 text-xs font-mono text-zinc-500">
                <div>slug: {currentConfig.slug}</div>
                <div>key: {currentConfig.widgetKey}</div>
                <div>mode: {mode}</div>
                <div>mounted: {mounted ? "yes" : "no"}</div>
              </div>
            )}
          </div>

          {/* Widget area */}
          <div className="flex-1 min-h-0">
            {mode === "center" ? (
              <div
                ref={containerRef}
                className="w-full h-[calc(100vh-8rem)] bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
              />
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-sm">
                  Widget appears in the bottom-{mode} corner of the page
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
