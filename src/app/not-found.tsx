
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7] px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-green-800">
          TRAVERSE
        </p>

        <h1 className="mt-6 text-8xl font-bold tracking-tight text-gray-900 sm:text-9xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-semibold text-gray-900">
          Page not found
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
          It may have been moved or no longer exists.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="w-full rounded-xl bg-green-800 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900 sm:w-auto"
          >
            Back to home
          </Link>

          <Link
            href="/tours"
            className="w-full rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-green-700 hover:text-green-800 sm:w-auto"
          >
            Explore tours
          </Link>
        </div>
      </div>
    </main>
  );
}
