
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[75vh] flex-col">
      <section className="flex flex-1 items-center bg-traverse-light">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="mb-7 text-sm font-semibold uppercase tracking-[0.2em] text-traverse-primary">
              Discover experiences with Traverse
            </p>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.12] tracking-tight text-traverse-dark sm:text-6xl lg:text-7xl">
              Your next
              <br />
              adventure starts
              <span className="text-traverse-primary"> here.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
              Discover unique tours and experiences. Explore
              new places, connect with local experiences, and
              make every journey memorable.
            </p>

            <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <Link
                href="/tours"
                className="inline-flex items-center justify-center rounded-lg bg-traverse-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
              >
                Explore Tours
              </Link>

              <Link
                href="/about"
                className="text-sm font-semibold text-traverse-dark transition-colors hover:text-traverse-primary"
              >
                About Traverse
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
