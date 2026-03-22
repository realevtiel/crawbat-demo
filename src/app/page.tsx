"use client";

import { useEffect, useRef, useState } from "react";

const CLIENTS = [
  {
    slug: "alpha",
    label: "Alpha Store",
    description: "E-commerce website",
    widgetKey: "pub_alpha_test_123",
    color: "#0a0a0a",
  },
  {
    slug: "beta",
    label: "Beta Clinic",
    description: "Urgent care clinics",
    widgetKey: "pub_beta_test_456",
    color: "#E55451",
  },
  {
    slug: "gamma",
    label: "Gamma Services",
    description: "Pest control service",
    widgetKey: "pub_gamma_test_789",
    color: "#A39193",
  },
] as const;

type ClientSlug = (typeof CLIENTS)[number]["slug"];

const WIDGET_SRC = "https://widget.crawbat.com/chat-widget.js";
const API_URL = "https://api.crawbat.com/chat";
const CONFIG_URL = "https://api.crawbat.com/widget-config";

function destroyWidget() {
  // Remove the script tag
  const script = document.getElementById("crawbat-chat-widget");
  if (script) script.remove();

  // Remove all elements the widget may have injected into <body>
  // Widget typically creates containers, overlays, iframes, shadow hosts, etc.
  document.querySelectorAll(
    "[id*='crawbat'], [class*='crawbat'], [data-crawbat]"
  ).forEach((el) => el.remove());

  // Also remove any style tags the widget injected
  document.querySelectorAll("style").forEach((style) => {
    if (style.textContent?.includes("crawbat")) {
      style.remove();
    }
  });

  // Clean up any global state the widget may have set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  delete w.CrawbatWidget;
  delete w.crawbatWidget;
  delete w.__crawbat;
}

function injectWidget(slug: string, widgetKey: string) {
  const script = document.createElement("script");
  script.id = "crawbat-chat-widget";
  script.src = WIDGET_SRC;
  script.async = true;
  script.dataset.clientId = slug;
  script.dataset.widgetKey = widgetKey;
  script.dataset.apiUrl = API_URL;
  script.dataset.widgetConfigUrl = CONFIG_URL;
  script.dataset.position = "center";
  script.dataset.showBadge = "true";
  script.dataset.requestTimeout = "12000";
  document.body.appendChild(script);
}

export default function Home() {
  const [active, setActive] = useState<ClientSlug>("alpha");
  const prevSlug = useRef<string | null>(null);

  const activeClient = CLIENTS.find((c) => c.slug === active)!;

  useEffect(() => {
    // On first mount or when client changes, tear down old widget and load new
    if (prevSlug.current !== activeClient.slug) {
      destroyWidget();

      // Small delay to let DOM settle after cleanup before injecting fresh widget
      const timer = setTimeout(() => {
        injectWidget(activeClient.slug, activeClient.widgetKey);
      }, 100);

      prevSlug.current = activeClient.slug;
      return () => clearTimeout(timer);
    }
  }, [activeClient]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            crawbat
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            widget demo
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-8 px-6 py-10">
        {/* Intro */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Chat Widget Demo
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Switch between demo clients to see the widget adapt in real time.
          </p>
        </div>

        {/* Radio selector */}
        <fieldset className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <legend className="sr-only">Select demo client</legend>
          {CLIENTS.map((client) => {
            const isActive = active === client.slug;
            return (
              <label
                key={client.slug}
                className={`relative flex cursor-pointer items-center gap-3 rounded-xl border px-5 py-3 transition-all select-none ${
                  isActive
                    ? "border-zinc-900 bg-white shadow-sm dark:border-zinc-100 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white/60 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name="demo-client"
                  value={client.slug}
                  checked={isActive}
                  onChange={() => setActive(client.slug)}
                  className="sr-only"
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: client.color,
                    boxShadow: isActive
                      ? `0 0 0 2px white, 0 0 0 4px ${client.color}`
                      : `0 0 0 2px white, 0 0 0 4px #d4d4d8`,
                  }}
                />
                <div className="flex flex-col leading-tight">
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {client.label}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {client.description}
                  </span>
                </div>
              </label>
            );
          })}
        </fieldset>
      </main>
    </div>
  );
}
