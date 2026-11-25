
"use client";

import Link from "next/link";
import { useEffect } from "react";

const benefits = [
  {
    title: "Discover new places",
    description:
      "Find interesting destinations and experiences worth exploring.",
  },
  {
    title: "Find your kind of adventure",
    description:
      "Choose from exciting adventures, peaceful escapes, and memorable activities.",
  },
  {
    title: "Save your favourites",
    description:
      "Keep the tours you love in one place and come back whenever you're ready.",
  },
  {
    title: "Book with ease",
    description:
      "Check tour availability and manage your bookings in one place.",
  },
];

export default function HomePage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="overflow-hidden bg-white text-[#171717]">
      {/* Hero */}
      <section className="px-6 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#267448]">
            Discover experiences with Traverse
          </p>

          <h1 className="reveal font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Your next journey
            <br />
            begins with{" "}
            <span className="text-[#267448]">Traverse.</span>
          </h1>

          <p className="reveal mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
            Discover extraordinary destinations, explore exciting
            experiences, and find new reasons to travel. Your next
            memorable journey starts here.
          </p>

          <div className="reveal mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tours"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#267448]"
            >
              Explore tours
            </Link>

            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8d8d8] px-7 py-3 text-sm font-semibold text-[#171717] transition duration-300 hover:border-[#267448] hover:text-[#267448]"
            >
              Create an account
            </Link>
          </div>

          <p className="reveal mt-4 text-sm text-[#777777]">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#267448] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="reveal mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#267448]">
            Explore something different
          </p>

          <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            More than just a destination.
          </h2>

          <p className="reveal mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
            Every journey has a story waiting to unfold. Discover
            hidden places, experience something new, and create
            memories that stay with you long after the journey ends.
          </p>
        </div>
      </section>

      {/* Featured tours introduction */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="reveal mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#267448]">
            Find your next experience
          </p>

          <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Where will your next journey take you?
          </h2>

          <p className="reveal mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
            From exciting adventures to relaxing escapes, explore
            experiences that match your interests and make every
            trip worth remembering.
          </p>

          <Link
            href="/tours"
            className="reveal mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#267448]"
          >
            View all tours
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="reveal mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#267448]">
              Your journey, made easier
            </p>

            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Everything you need to get started.
            </h2>
          </div>

          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <div
                key={item.title}
                className="reveal border-t border-[#e5e5e5] pt-4"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#686868]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traveler account */}
      <section className="px-6 py-12">
        <div className="reveal mx-auto max-w-3xl border-y border-[#e5e5e5] py-9 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#267448]">
            For travellers
          </p>

          <h2 className="font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Your next adventure starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#626262] sm:text-base">
            Create your traveler account to save your favourite
            tours, explore experiences, and manage your bookings
            whenever you need.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#267448]"
            >
              Join as a traveller
            </Link>

            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8d8d8] px-6 py-3 text-sm font-semibold text-[#171717] transition duration-300 hover:border-[#267448] hover:text-[#267448]"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Tour operators */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="reveal mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#267448]">
            For tour operators
          </p>

          <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Share your experiences with the world.
          </h2>

          <p className="reveal mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
            Bring your tours to Traverse, connect with travellers,
            and give more people the opportunity to discover what
            you offer.
          </p>

          <Link
            href="/operator-register"
            className="reveal mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#267448]"
          >
            Become a partner
          </Link>

          <p className="reveal mt-4 text-sm text-[#777777]">
            Already a partner?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#267448] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Ready to explore somewhere new?
          </h2>

          <p className="reveal mx-auto mt-4 max-w-xl text-sm leading-7 text-[#626262] sm:text-base">
            Find your next experience and make your next journey
            one to remember.
          </p>

          <Link
            href="/tours"
            className="reveal mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#267448]"
          >
            Start exploring
          </Link>
        </div>
      </section>
    </main>
  );
}
