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
      "Do I need an appointment or can I walk in?",
      "Do you take Blue Cross Blue Shield?",
      "How much is a visit if I don’t have insurance?",
      "What can you treat there?",
      "How long is the wait right now?",
      "Where are you located?",
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
    highlightedSuggestion: "How do I schedule a visit?",
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
      "How do I schedule a visit?",
      "Can you come today?",
      "Can someone come out?",
      "Do you service my area?",
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

const FEATURES = [
  {
    title: "Reduce support load",
    text: (
      <>Handle up to <strong className="text-zinc-300">50% of customer questions</strong> automatically and <strong className="text-zinc-300">free up your team</strong>.</>
    ),
  },
  {
    title: "Fully Managed",
    text: (
      <>We don’t just set it up. We <strong className="text-zinc-300">improve your system</strong> from real conversations.</>
    ),
  },
  {
    title: "Support that gets smarter",
    text: (
      <>See what customers actually ask, find gaps, and <strong className="text-zinc-300">continuously improve</strong> your support.</>
    ),
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
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: `${activeClient.color}22`,
              color: activeClient.color,
            }}
          >
            chat widget
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
          AI Support System
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Turn support{" "}
          <span
            className="transition-colors duration-300"
            style={{ color: activeClient.color }}
          >
            into revenue.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Answer customers{" "}
          <span style={{ color: activeClient.color }}>instantly</span> using
          your business data, improve{" "}
          <span style={{ color: activeClient.color }}>support quality</span>,
          and capture{" "}
          <span style={{ color: activeClient.color }}>more opportunities</span>{" "}
          without hiring more agents.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          See how <em>business</em> answers customer questions instantly
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
                  <span className="transition-colors duration-300">
                    {client.icon(isActive ? client.color : "#71717a")}
                  </span>
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

                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm font-semibold transition-colors sm:text-base ${
                      isActive
                        ? "text-white"
                        : "text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    {client.label}
                  </h3>
                  {"badge" in client && client.badge && (
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-md border border-amber-500/10 bg-amber-950/20 px-1.5 py-px text-[10px] font-medium text-zinc-400 sm:text-[11px]"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" style={{ boxShadow: "0 0 4px rgba(245,158,11,0.45)" }} />
                      {client.badge}
                    </span>
                  )}
                </div>

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

      {/* ── Suggestions ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-8 sm:pb-12">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 flex items-center justify-center gap-2 text-center text-xs font-medium text-zinc-500">
            <span>The same questions your team answers every day</span>
            <span
              className="transition-colors duration-300"
              style={{ color: `${activeClient.color}88` }}
            >
              ↓
            </span>
          </p>
          <div className="flex flex-col items-center gap-2">
            {[0, 2, 4].map((offset) => (
              <div key={offset} className="flex justify-center gap-2">
                {activeClient.suggestions.slice(offset, offset + 2).map((text) => {
                  const isHighlighted = "highlightedSuggestion" in activeClient && activeClient.highlightedSuggestion === text;
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
                      style={isHighlighted ? {
                        borderColor: "rgba(245,158,11,0.18)",
                      } : {
                        borderColor: `${activeClient.color}22`,
                      }}
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

      {/* ── Nudge ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-8 sm:pb-12">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-zinc-300 sm:text-base">
            Ask anything, not just preset questions.
          </p>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Handles real conversations from start to finish.
          </p>
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

      {/* ── Leads Block ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 sm:pb-20">
        <div
          className="relative overflow-hidden rounded-3xl border p-8 sm:p-10"
          style={{
            borderColor: "rgba(245,158,11,0.28)",
            background: "linear-gradient(135deg, rgba(120,53,15,0.18) 0%, rgba(24,24,27,0.75) 55%)",
            boxShadow: "0 0 40px rgba(245,158,11,0.07), inset 0 1px 0 rgba(245,158,11,0.12)",
          }}
        >
          {/* Glow top-left */}
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: "rgba(245,158,11,0.25)" }}
          />

          <div className="relative grid gap-8 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10">
            {/* Left: text */}
            <div className="flex flex-col justify-center">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
                Lead capture
              </p>
              <h2 className="text-xl font-bold leading-snug tracking-tight text-zinc-100 sm:text-2xl">
                Turn conversations{" "}
                <span className="text-amber-400">into real customers</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                When customers ask about your services, Crawbat guides them, collects details, and turns them into ready-to-handle leads.
              </p>
            </div>

            {/* Right: bullets */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {[
                "Captures what the customer needs",
                "Collects name, phone, and urgency",
                "Sends you a ready-to-handle lead instantly",
                "No forms, no friction",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      borderColor: "rgba(245,158,11,0.3)",
                      backgroundColor: "rgba(120,53,15,0.2)",
                      boxShadow: "0 0 6px rgba(245,158,11,0.1)",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Crawbat ── */}
      <section className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-14 sm:pt-16 sm:pb-20">
          <h2 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
            Why most AI support{" "}
            <span
              className="transition-colors duration-300"
              style={{ color: activeClient.color }}
            >
              fails
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-zinc-500">
            Bad answers cost you customers.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                ),
                title: "Gives wrong answers",
                text: "Not your data → customers get incorrect information.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M3.586 16.726A2 2 0 0 0 5.035 20h13.93a2 2 0 0 0 1.449-3.274L13.449 4.446a2 2 0 0 0-2.898 0z" />
                  </svg>
                ),
                title: "Makes things up",
                text: "Fake promises, wrong policies, information that doesn’t exist.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="17" y1="11" x2="22" y2="11" />
                  </svg>
                ),
                title: "Breaks trust",
                text: "One wrong answer can lose a customer instantly.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <div className="mb-3 text-zinc-500">{item.icon}</div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-auto my-10 flex items-center gap-4 sm:my-14">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              <span className="text-zinc-100">Crawbat</span>{" "}
              <span
                className="transition-colors duration-300"
                style={{ color: activeClient.color }}
              >
                is different
              </span>
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-4">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
                title: "Your data only",
                text: "Answers strictly from your business information.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ),
                title: "No hallucinations",
                text: "Never invents information or makes things up.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Smart escalation",
                text: "Passes to your team when a human is needed.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 20h.01" />
                    <path d="M7 20v-4" />
                    <path d="M12 20v-8" />
                    <path d="M17 20V8" />
                    <path d="M22 4v16" />
                  </svg>
                ),
                title: "Smarter system",
                text: "We improve your system based on real conversations.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border p-5 transition-colors duration-300"
                style={{
                  borderColor: `${activeClient.color}22`,
                  background: `linear-gradient(135deg, ${activeClient.color}08, transparent)`,
                }}
              >
                <div
                  className="mb-3 transition-colors duration-300"
                  style={{ color: activeClient.color }}
                >
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/40">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12 sm:pt-12 sm:pb-16">
          <h2 className="text-center text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl">
            Automation is easy.{" "}
            <span
              className="transition-colors duration-300"
              style={{ color: activeClient.color }}
            >
              Getting more customers is what matters.
            </span>
          </h2>
          <div className="mx-auto my-6 h-px w-24 bg-zinc-800 sm:my-8" />
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
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
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            See how this would work for you
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
            We&apos;ll show exactly what your customers ask, what can be
            automated, and what stays with your team.
          </p>
          <p className="mx-auto mt-3 max-w-md space-y-2 text-xs leading-relaxed text-zinc-300 sm:text-sm">
            Most businesses automate 30–70% of support in the first month.
          </p>
          <a
            href="https://calendly.com/alex-crawbat/ai-support-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full px-7 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: activeClient.color,
              boxShadow: `0 0 20px ${activeClient.color}33`,
            }}
          >
            Book a call
          </a>
          <div className="mx-auto mt-8 max-w-md space-y-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
            <p>
              Setup starts at <strong className="text-zinc-300">$3,000</strong>{" "}
              and scales based on your needs.
            </p>
            <p>
              Ongoing support starts at{" "}
              <strong className="text-zinc-300">$799/month</strong>.
            </p>
            <p>
              Includes a{" "}
              <strong className="text-zinc-300">
                30-day optimization period
              </strong>
            </p>
          </div>
          <p className="mt-6 text-xs tracking-wide text-zinc-600">
            Most clients use the demo call to understand fit, scope, and
            expected ROI.
          </p>
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
