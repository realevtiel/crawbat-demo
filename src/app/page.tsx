"use client";

import { useEffect, useRef, useState } from "react";

const CLIENTS = [
  {
    slug: "alpha",
    label: "Alpha Store",
    industry: "E-commerce",
    description:
      "Online retail assistant trained on product catalog, shipping policies, and return procedures.",
    widgetKey: "pub_alpha_test_123",
    color: "#6d28d9",
    icon: "🛒",
  },
  {
    slug: "beta",
    label: "Beta Clinic",
    industry: "Healthcare",
    description:
      "Patient-facing assistant for appointment scheduling, clinic hours, and insurance FAQs.",
    widgetKey: "pub_beta_test_456",
    color: "#2563eb",
    icon: "🏥",
  },
  {
    slug: "gamma",
    label: "Gamma Services",
    industry: "Pest Control",
    description:
      "Service assistant handling quotes, scheduling, and pest identification guides.",
    widgetKey: "pub_gamma_test_789",
    color: "#0f766e",
    icon: "🛡️",
  },
] as const;

type ClientSlug = (typeof CLIENTS)[number]["slug"];

const WIDGET_SRC = "https://widget.crawbat.com/chat-widget.js";
const API_URL = "https://api.crawbat.com/chat";
const CONFIG_URL = "https://api.crawbat.com/widget-config";

const SM_BREAKPOINT = 640;

const FEATURES = [
  {
    title: "Knowledge-Grounded",
    text: "Every answer comes from your approved docs — no hallucinations.",
  },
  {
    title: "Plug & Play",
    text: "One script tag. Works on any site in under 5 minutes.",
  },
  {
    title: "Multi-Tenant",
    text: "One platform, unlimited clients — each with their own data & brand.",
  },
];

// Track nodes added to body (for mobile/right mode cleanup)
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

function destroyWidget(desktopContainer: HTMLElement | null) {
  if (bodyObserver) {
    bodyObserver.disconnect();
    bodyObserver = null;
  }

  bodyNodes.forEach((n) => {
    if (n.parentNode) n.parentNode.removeChild(n);
  });
  bodyNodes = new Set();

  // Clear desktop container content but keep the element itself
  if (desktopContainer) {
    desktopContainer.innerHTML = "";
  }

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
  isDesktop: boolean,
  desktopContainer: HTMLElement | null
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

  if (isDesktop && desktopContainer) {
    script.dataset.position = "center";
    const root = document.createElement("div");
    root.setAttribute("data-chat-widget-root", "");
    desktopContainer.appendChild(root);
    desktopContainer.appendChild(script);
  } else {
    script.dataset.position = "right";
    startBodyTracking();
    document.body.appendChild(script);
  }
}

export default function Home() {
  const [active, setActive] = useState<ClientSlug>("alpha");
  const [isDesktop, setIsDesktop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeClient = CLIENTS.find((c) => c.slug === active)!;

  // Track viewport size and re-mount widget when crossing the breakpoint
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= SM_BREAKPOINT);
    check();
    const mq = window.matchMedia(`(min-width: ${SM_BREAKPOINT}px)`);
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    destroyWidget(container);

    const timer = setTimeout(() => {
      injectWidget(activeClient.slug, activeClient.widgetKey, isDesktop, container);
    }, 150);

    return () => {
      clearTimeout(timer);
      destroyWidget(container);
    };
  }, [activeClient, isDesktop]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">crawbat</span>
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
            live demo
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-8 text-center sm:pt-16 sm:pb-10">
        <p
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{
            backgroundColor: `${activeClient.color}22`,
            color: activeClient.color,
          }}
        >
          AI Chat Widget
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          One widget.{" "}
          <span
            className="transition-colors duration-300"
            style={{ color: activeClient.color }}
          >
            Any business.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Crawbat embeds an AI-powered support chat trained exclusively on{" "}
          <em>your</em> knowledge base. Switch between live demos below to see
          the same widget serve three completely different industries.
        </p>
      </section>

      {/* ── Client Selector ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-8 sm:pb-12">
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4" role="radiogroup">
          {CLIENTS.map((client) => {
            const isActive = active === client.slug;
            return (
              <button
                key={client.slug}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActive(client.slug)}
                className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                  isActive
                    ? "border-transparent shadow-lg"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${client.color}18, ${client.color}08)`,
                        boxShadow: `0 0 0 1px ${client.color}66, 0 4px 24px ${client.color}22`,
                      }
                    : undefined
                }
              >
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <span className="text-xl sm:text-2xl">{client.icon}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:px-2.5 sm:text-[11px]"
                    style={
                      isActive
                        ? {
                            backgroundColor: `${client.color}30`,
                            color: client.color,
                          }
                        : { backgroundColor: "#27272a", color: "#a1a1aa" }
                    }
                  >
                    {client.industry}
                  </span>
                </div>

                <h3
                  className={`text-sm font-semibold transition-colors sm:text-base ${
                    isActive
                      ? "text-white"
                      : "text-zinc-300 group-hover:text-white"
                  }`}
                >
                  {client.label}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:mt-1.5 sm:text-sm">
                  {client.description}
                </p>

                {isActive && (
                  <div
                    className="absolute -bottom-px left-6 right-6 h-0.5 rounded-full"
                    style={{ backgroundColor: client.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Widget Stage (desktop only) ── */}
      <section className="mx-auto hidden w-full max-w-5xl px-6 pb-16 sm:block">
        <div className="mb-6 flex flex-col items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
            Live preview
          </p>
          <div
            className="h-px w-10 transition-colors duration-300"
            style={{ backgroundColor: `${activeClient.color}55` }}
          />
        </div>

        {/*
          Fixed height stage — never collapses, so page never jumps.
          180px = widget button (~60px) + badge (~20px) + hint text + padding.
        */}
        <div
          className="relative mx-auto rounded-3xl border border-dashed p-6 pt-10 transition-all duration-300"
          style={{
            borderColor: `${activeClient.color}33`,
            background: `radial-gradient(ellipse at center bottom, ${activeClient.color}0a 0%, transparent 60%)`,
            maxWidth: "420px",
            height: "730px",
          }}
        >
          <div className="flex justify-center" ref={containerRef} />

          <p className="pointer-events-none absolute bottom-5 left-0 right-0 -z-0 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            ↑ click to chat with{" "}
            <span className="text-zinc-400">{activeClient.label}</span>
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/40">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-12 sm:grid-cols-3 sm:gap-8 sm:py-16">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:text-sm">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-zinc-600 sm:py-6">
          <span>&copy; {new Date().getFullYear()} Crawbat</span>
        </div>
      </footer>

      {/* Extra bottom space on mobile so fixed widget button doesn't cover footer */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}
