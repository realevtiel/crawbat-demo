"use client";

import { useEffect, useRef, useState } from "react";

const CLIENTS = [
  {
    slug: "alpha",
    label: "Online Store Support",
    industry: "E-commerce",
    description:
      "Answers shipping, returns, order changes, and product questions instantly and much more!",
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
      "Can I change my shipping address after I place an order?",
      "How long does shipping take?",
      "What is your return policy?",
      "Can I cancel my order after payment?",
      "Do you refund the original shipping cost?",
    ],
  },
  {
    slug: "beta",
    label: "ClearPoint Urgent Care",
    industry: "Healthcare",
    description:
      "Helps patients with appointments, office hours, accepted insurance, and common questions.",
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
    slug: "gamma",
    label: "Service Booking Assistant",
    industry: "Pest Control",
    description:
      "Handles quotes, scheduling, service area questions, and common treatment concerns.",
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
      "Can I get a quote before booking?",
      "Do you service my area?",
      "Do I need to leave the house during treatment?",
      "How soon can you come out?",
      "What if I still see pests after treatment?",
    ],
  },
] as const;

type ClientSlug = (typeof CLIENTS)[number]["slug"];

const CONSENT_KEY = "crawbat_demo_consent";
const WIDGET_SRC = "https://widget.crawbat.com/chat-widget.js";
const API_URL = "https://api.crawbat.com/chat";
const CONFIG_URL = "https://api.crawbat.com/widget-config";

const SM_BREAKPOINT = 640;

const FEATURES = [
  {
    title: "Reduce support load",
    text: (
      <>Handle up to <strong className="text-zinc-300">50% of repetitive questions</strong> automatically and <strong className="text-zinc-300">free up your team</strong>.</>
    ),
  },
  {
    title: "Done for you, fully managed",
    text: (
      <>We <strong className="text-zinc-300">set everything up</strong>, work with your team, and keep your support system <strong className="text-zinc-300">up to date</strong>.</>
    ),
  },
  {
    title: "Support that gets smarter",
    text: (
      <>We analyze conversations, find gaps, and <strong className="text-zinc-300">continuously improve</strong> your system.</>
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

  // Use public API if available
  if (widget.sendMessage) {
    widget.sendMessage(text);
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
  const [active, setActive] = useState<ClientSlug>("alpha");
  const [isDesktop, setIsDesktop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeClient = CLIENTS.find((c) => c.slug === active)!;

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
          <a href="https://crawbat.com" target="_blank" rel="noopener noreferrer" className="text-lg font-bold tracking-tight hover:text-zinc-300 transition-colors">crawbat</a>
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
          AI Support Chat
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Instant answers.{" "}
          <span
            className="transition-colors duration-300"
            style={{ color: activeClient.color }}
          >
             Better support.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Reduce <span className="transition-colors duration-300" style={{ color: activeClient.color }}>repetitive</span> support questions, reply faster, and <span className="transition-colors duration-300" style={{ color: activeClient.color }}>help more customers</span> with an AI chat trained on{" "}
          <em>your</em> business. 
          Explore the live demos below to see how it works across different industries.
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
                  <span className="transition-colors duration-300">{client.icon(isActive ? client.color : "#71717a")}</span>
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

      {/* ── Suggestions ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-8 sm:pb-12">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 flex items-center justify-center gap-2 text-center text-xs font-medium text-zinc-500">
            <span>Start with one of these questions</span>
            <span
              className="transition-colors duration-300"
              style={{ color: `${activeClient.color}88` }}
            >
              ↓
            </span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {activeClient.suggestions.map((text, i) => (
              <button
                key={`${activeClient.slug}-${i}`}
                type="button"
                onClick={() => sendToWidget(text)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-left text-xs leading-relaxed text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white sm:text-sm"
                style={{
                  borderColor: `${activeClient.color}22`,
                }}
              >
                {text}
              </button>
            ))}
          </div>
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

      {/* ── Features ── */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/40">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12 sm:pt-12 sm:pb-16">
          <h2
            className="text-center text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl"
          >
            Automation is easy.{" "}
          <span
            className="transition-colors duration-300"
            style={{ color: activeClient.color }}
          >
             Improving support is what matters.
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
            Ready to improve your support?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
            We&apos;ll review your current setup, show what to automate, and tailor everything to your business.
          </p>
          <a
            href="https://calendly.com/alex-crawbat/30min"
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
          <p className="mt-5 text-xs tracking-wide text-zinc-600">
            Flexible setup. Built around your business.
          </p>
          <p className="mt-1 text-xs tracking-wide text-zinc-600">
            Quick 10–15 min call
          </p>
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
