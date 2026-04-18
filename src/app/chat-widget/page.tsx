"use client";

import { useEffect, useRef, useState } from "react";

const CLIENTS = [
  {
    slug: "beta",
    label: "Capture requests",
    industry: "Healthcare",
    description:
      "Handles appointments, insurance, and patient requests automatically. Reduces front desk workload instantly.",
    widgetKey: "pub_beta_test_456",
    color: "#dc2626",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
    suggestions: [
      "Do you take Blue Cross Blue Shield?",
      "What can you treat there?",
      "How long is the wait right now?",
      "How much is a visit if I don't have insurance?",
    ],
  },
  {
    slug: "alpha",
    label: "Convert shoppers",
    industry: "E-commerce",
    description:
      "Answers questions and turns visitors into buyers. Captures more sales automatically.",
    widgetKey: "pub_alpha_test_123",
    color: "#6d28d9",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    suggestions: [
      "Where is my order?",
      "Can I cancel or change my order?",
      "How long does shipping take?",
      "What is your return policy?",
      "Why was my payment declined?",
      "Do you ship internationally?",
    ],
  },
  {
    slug: "gamma",
    label: "Book more jobs",
    industry: "Local Services",
    badge: "leads captured",
    highlightedSuggestion: "Can you come today?",
    description:
      "Handles quotes and converts chats into booked jobs. Captures leads without forms or calls.",
    widgetKey: "pub_gamma_test_789",
    color: "#0f766e",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <path d="M5.2 8.5 2 6" />
        <path d="M18.8 8.5 22 6" />
        <circle cx="12" cy="5" r="3" />
        <path d="M9.5 3 7 1" />
        <path d="M14.5 3 17 1" />
      </svg>
    ),
    suggestions: [
      "Can you come today?",
      "Can someone come out?",
      "How much would this cost?",
      "I need help with my issue",
    ],
  },
] as const;

type ClientSlug = (typeof CLIENTS)[number]["slug"];

const CONSENT_KEY = "crawbat_demo_consent";
const WIDGET_SRC = "https://widget.crawbat.com/chat-widget.js?v=1.0.4";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.crawbat.com/chat";
const CONFIG_URL = process.env.NEXT_PUBLIC_CONFIG_URL ?? "https://api.crawbat.com/widget-config";

const SM_BREAKPOINT = 640;

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

  if (sessionStorage.getItem(CONSENT_KEY)) {
    script.dataset.skipConsent = "true";
  }

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

function sendToWidget(text: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widget = (window as any).CrawbatWidget;
  if (!widget) return;

  // Use public API to insert text without sending (prefer setInput over sendMessage)
  if (widget.setInput) {
    if (widget.open) widget.open();
    widget.setInput(text);
    return;
  }

  if (widget.open) widget.open();

  // Fallback: find the chat input (not form fields).
  // The chat textarea has a placeholder like "Type a message..." / "Describe your issue..."
  // Form inputs (Name, Email, Phone) are regular <input> elements inside the handoff form.
  // Target only the main chat textarea at the bottom of the widget.
  setTimeout(() => {
    const root = document.querySelector("[data-chat-widget-root]") || document.body;
    const allTextareas = root.querySelectorAll<HTMLTextAreaElement>("textarea");
    // Pick the last textarea — the chat input is always at the bottom,
    // while form textareas (if any) appear higher up.
    const input = allTextareas[allTextareas.length - 1];
    if (!input) return;

    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (setter) setter.call(input, text);
    else input.value = text;

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }, 300);
}

export default function ChatWidgetPage() {
  const [active, setActive] = useState<ClientSlug>("beta");
  const [isDesktop, setIsDesktop] = useState(true);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeClient = CLIENTS.find((c) => c.slug === active)!;

  // Mobile nudge: show after 7s, hide forever (per session) once widget is opened
  useEffect(() => {
    if (isDesktop) return;
    if (sessionStorage.getItem("crawbat_nudge_dismissed")) return;

    const nudge = nudgeRef.current;
    if (!nudge) return;

    const show = () => nudge.removeAttribute("hidden");
    const dismiss = () => {
      nudge.setAttribute("hidden", "");
      sessionStorage.setItem("crawbat_nudge_dismissed", "true");
    };

    nudge.setAttribute("hidden", "");
    const timer = setTimeout(show, 7000);

    window.addEventListener("crawbat:open", dismiss);

    // Dismiss on click: the nudge itself, or anything crawbat-related
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        nudge.contains(target) ||
        target.closest("[class*='crawbat'], [id*='crawbat'], [data-chat-widget-root]")
      ) {
        dismiss();
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("crawbat:open", dismiss);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDesktop]);

  // Listen for consent acceptance and persist for the session
  useEffect(() => {
    const onConsent = () => sessionStorage.setItem(CONSENT_KEY, "true");
    window.addEventListener("crawbat:consent", onConsent);
    return () => window.removeEventListener("crawbat:consent", onConsent);
  }, []);

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

      // Auto-open widget on desktop after it loads
      if (isDesktop) {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const widget = (window as any).CrawbatWidget;
          if (widget?.open) widget.open();
        }, 500);
      }
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
          <a
            href="https://crawbat.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold tracking-tight hover:text-zinc-300 transition-colors"
          >
            crawbat
          </a>
          <a
            href="https://calendly.com/alex-crawbat/ai-support-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: activeClient.color }}
          >
            Book a call
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Get 2–3x more leads{" "}
          <span className="transition-colors duration-300" style={{ color: activeClient.color }}>
            from your existing traffic
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-zinc-400 sm:text-lg">
          Answers instantly. Helps customers take action.
        </p>

        {/* Stats */}
        <div className="mt-8 flex items-start justify-center gap-10 sm:gap-16">
          {[
            { value: "Up to 70%", label: "automated at start" },
            { value: "2s", label: "response" },
            { value: "24/7", label: "always on" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="whitespace-nowrap text-2xl font-bold text-zinc-100 sm:text-3xl">{value}</span>
              <span className="mt-1 whitespace-nowrap text-[11px] text-zinc-500 sm:text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-6">
        {/* Compact tab selector */}
        <div className="flex justify-center gap-3 sm:gap-5" role="radiogroup">
          {CLIENTS.map((client) => {
            const isActive = active === client.slug;
            return (
              <button
                key={client.slug}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActive(client.slug)}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm"
                style={
                  isActive
                    ? {
                        borderColor: `${client.color}66`,
                        backgroundColor: `${client.color}15`,
                        color: client.color,
                        boxShadow: `0 0 12px ${client.color}22`,
                      }
                    : {
                        borderColor: "#3f3f46",
                        backgroundColor: "transparent",
                        color: "#a1a1aa",
                      }
                }
              >
                <span>{client.icon(isActive ? client.color : "#71717a")}</span>
                {client.industry}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Suggestions ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-6 pb-8 sm:pb-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-2">
            {Array.from({ length: Math.ceil(activeClient.suggestions.length / 2) }, (_, i) => i * 2).map((offset) => (
              <div key={offset} className="flex justify-center gap-2">
                {activeClient.suggestions.slice(offset, offset + 2).map((text) => {
                  const isHighlighted =
                    "highlightedSuggestion" in activeClient &&
                    activeClient.highlightedSuggestion === text;
                  return (
                    <button
                      key={`${activeClient.slug}-${text}`}
                      type="button"
                      onClick={() => sendToWidget(text)}
                      className={`rounded-full border px-4 py-2 text-left text-xs leading-relaxed transition-all sm:text-sm ${
                        isHighlighted
                          ? "border-zinc-800 bg-amber-950/20 text-zinc-300 hover:border-amber-500/40 hover:bg-amber-900/30 hover:text-white"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                      }`}
                      style={
                        isHighlighted
                          ? { borderColor: "rgba(245,158,11,0.18)" }
                          : { borderColor: `${activeClient.color}22` }
                      }
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Widget Stage (desktop only) ── */}
      <section className="mx-auto hidden w-full max-w-5xl px-6 pb-20 sm:block">
        <div
          className="relative mx-auto rounded-3xl border border-dashed p-6 transition-all duration-300"
          style={{
            borderColor: `${activeClient.color}33`,
            background: `radial-gradient(ellipse at center bottom, ${activeClient.color}0a 0%, transparent 60%)`,
            maxWidth: "420px",
            height: "730px",
          }}
        >
          <div className="flex justify-center" ref={containerRef} />
          <p className="pointer-events-none absolute bottom-5 left-0 right-0 -z-0 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
            ↑ Click to chat
          </p>
        </div>
      </section>

      {/* ── 3 Value Blocks ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 sm:pb-20">
        <div className="flex flex-col gap-4 sm:gap-5">

          {/* Block 1: Leads — full width */}
          <div
            className="relative overflow-hidden rounded-3xl border p-10 transition-all duration-300 sm:p-12"
            style={{
              borderColor: `${activeClient.color}44`,
              background: `linear-gradient(140deg, ${activeClient.color}32 0%, ${activeClient.color}0e 35%, rgb(9,9,11) 65%)`,
              boxShadow: `0 0 80px ${activeClient.color}18, inset 0 1px 0 ${activeClient.color}30`,
            }}
          >
            <div
              className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full blur-3xl transition-colors duration-300"
              style={{ backgroundColor: activeClient.color, opacity: 0.22 }}
            />
            <div className="relative flex flex-col gap-10 sm:flex-row sm:items-center sm:gap-24">
              <div className="sm:flex-1">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                  Turns conversations into{" "}
                  <span className="transition-colors duration-300" style={{ color: activeClient.color }}>
                    leads
                  </span>
                </h2>
                <p className="mt-4 text-base text-zinc-300">No forms. No missed opportunities.</p>
              </div>
              <div className="flex flex-col gap-5 sm:flex-1">
                {[
                  { bold: "Understands", rest: " what they need" },
                  { bold: "Collects", rest: " contact automatically" },
                  { bold: "Sends", rest: " ready-to-close leads" },
                ].map(({ bold, rest }) => (
                  <div key={bold} className="flex items-center gap-3">
                    <div
                      className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: activeClient.color, opacity: 0.7 }}
                    />
                    <p className="text-base sm:text-lg">
                      <span className="font-bold text-zinc-100 transition-colors duration-300" style={{ color: activeClient.color }}>{bold}</span>
                      <span className="text-zinc-300">{rest}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocks 2+3 — side by side */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">

            {/* Block 2: Accuracy — stronger */}
            <div
              className="relative overflow-hidden rounded-3xl border p-10 transition-all duration-300 sm:p-12"
              style={{
                borderColor: `${activeClient.color}55`,
                background: `linear-gradient(220deg, ${activeClient.color}32 0%, ${activeClient.color}0e 35%, rgb(9,9,11) 65%)`,
                boxShadow: `0 0 80px ${activeClient.color}20, inset 0 1px 0 ${activeClient.color}35`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full blur-3xl transition-colors duration-300"
                style={{ backgroundColor: activeClient.color, opacity: 0.28 }}
              />
              <div className="relative">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                  Answers only from{" "}
                  <span className="transition-colors duration-300" style={{ color: activeClient.color }}>
                    your data
                  </span>
                </h2>
                <div className="mt-8 flex flex-col gap-6">
                  {[
                    { title: "No guessing", desc: "Never makes things up" },
                    { title: "Always accurate", desc: "Strictly from your business data" },
                    { title: "No hallucinations", desc: "Won't answer what it doesn't know" },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: activeClient.color, opacity: 0.7 }}
                      />
                      <div>
                        <p className="text-base font-bold text-zinc-100 sm:text-lg">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 sm:text-sm">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Block 3: Smarter */}
            <div
              className="relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 sm:p-10"
              style={{
                borderColor: `${activeClient.color}38`,
                background: `linear-gradient(140deg, ${activeClient.color}22 0%, ${activeClient.color}08 35%, rgb(9,9,11) 65%)`,
                boxShadow: `0 0 50px ${activeClient.color}0e, inset 0 1px 0 ${activeClient.color}22`,
              }}
            >
              <div
                className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full blur-3xl transition-colors duration-300"
                style={{ backgroundColor: activeClient.color, opacity: 0.16 }}
              />
              <div className="relative">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                  Gets smarter{" "}
                  <span className="transition-colors duration-300" style={{ color: activeClient.color }}>
                    every month
                  </span>
                </h2>
                <div className="mt-8 flex flex-col gap-6">
                  {[
                    { title: "Finds missing answers", desc: "Spots gaps from real conversations" },
                    { title: "Improves responses", desc: "Refined based on what actually works" },
                    { title: "Learns from real questions", desc: "Gets better as customers use it" },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: activeClient.color, opacity: 0.5 }}
                      />
                      <div>
                        <p className="text-base font-bold text-zinc-100 sm:text-lg">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 sm:text-sm">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            See how this would work for you
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm text-zinc-500">
            Most businesses automate 30–70% in the first month.
          </p>
          <a
            href="https://calendly.com/alex-crawbat/ai-support-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: activeClient.color,
              boxShadow: `0 0 24px ${activeClient.color}44`,
            }}
          >
            Book a call
          </a>
          <div className="mt-8 flex flex-col gap-1.5 text-sm text-zinc-500">
            <p>Setup starts at <span className="font-semibold text-zinc-300">$3,000</span></p>
            <p>From <span className="font-semibold text-zinc-300">$799/month</span></p>
            <p>30-day optimization included</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-zinc-600 sm:py-6">
          <span>&copy; {new Date().getFullYear()} Crawbat</span>
        </div>
      </footer>

      {/* Mobile nudge pointing at widget button */}
      <div
        ref={nudgeRef}
        hidden
        className="fixed bottom-[88px] right-11 z-40 sm:hidden"
      >
        <p
          className="crawbat-nudge text-xs font-medium text-zinc-400"
          style={{
            textShadow: `0 0 12px ${activeClient.color}55, 0 0 24px ${activeClient.color}33`,
          }}
        >
          Try the chat <span style={{ color: activeClient.color }}>↓</span>
        </p>
      </div>

      <style jsx>{`
        .crawbat-nudge {
          animation: nudge-float 2.5s ease-in-out infinite;
        }
        @keyframes nudge-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
      `}</style>

      {/* Extra bottom space on mobile so fixed widget button doesn't cover footer */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}
