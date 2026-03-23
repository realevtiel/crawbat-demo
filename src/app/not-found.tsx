import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 font-sans text-zinc-100">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-zinc-400">Page not found</p>
      <Link
        href="/chat-widget"
        className="mt-8 rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
      >
        Go to Chat Widget Demo
      </Link>
    </div>
  );
}
