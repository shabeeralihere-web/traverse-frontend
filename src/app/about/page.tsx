"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AboutPage() {
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

  const primaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-md bg-[#14532d] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0f4224]";

  return (
    <main className="overflow-hidden bg-white text-[#171717]">

      {/* Hero Section */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">

          <h1 className="reveal max-w-4xl font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Bringing people and
            <br className="hidden sm:block" /> experiences
            <span className="text-[#14532d]"> closer together.</span>
          </h1>

          <p className="reveal mt-8 max-w-2xl text-base leading-8 text-[#626262] sm:text-lg">
            Traverse is a tours and activities platform that helps
            travellers discover experiences and connect with the
            people who create them. We bring different travel
            experiences together, making it easier to find your
            next journey.
          </p>

        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">

          <div className="grid gap-10 md:grid-cols-2 md:gap-16">

            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Making travel discovery simple.
            </h2>

            <div className="reveal">
              <p className="text-base leading-8 text-[#626262]">
                Finding the right experience can take time. Traverse
                brings tours and activities into one place, so
                travellers can explore destinations, discover
                experiences, compare available options, and choose
                journeys that interest them.
              </p>

              <p className="mt-5 text-base leading-8 text-[#626262]">
                We also give tour operators a platform to showcase
                their experiences and connect with travellers who
                are looking for something new.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Our Purpose */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl border-y border-[#e5e5e5] py-16">

          <div className="max-w-3xl">

            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              More than finding a place. It's about the experience.
            </h2>

            <p className="reveal mt-6 text-base leading-8 text-[#626262]">
              We believe every journey begins with curiosity.
              It could be an adventure in a new destination, a
              peaceful escape, or an activity you've always wanted
              to try. Our purpose is to make these experiences
              easier to discover and help travellers turn their
              ideas into memorable journeys.
            </p>

          </div>

        </div>
      </section>

      {/* Closing Section */}
      <section className="px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl">

          <div className="reveal max-w-3xl">

            <h2 className="font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl">
              Your next experience is waiting to be discovered.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#626262]">
              Whether you're planning your next trip or sharing
              experiences with others, start your journey with
              Traverse.
            </p>

            <Link
              href="/tours"
              className={`${primaryButton} mt-8`}
            >
              Explore Tours
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}