
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".about-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="overflow-hidden bg-white text-traverse-dark">

      {/* Hero */}
      <section className="relative flex min-h-[620px] items-center px-6 py-28 md:min-h-[700px] md:py-36">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-5xl">

            <p className="about-reveal mb-8 text-xs font-bold uppercase tracking-[0.25em] text-traverse-primary">
              GET TO KNOW TRAVERSE
            </p>

            <h1 className="about-reveal text-5xl font-semibold leading-[1.12] tracking-tight sm:text-6xl md:text-7xl lg:text-[88px]">
              The world is full
              <br />
              of places to
              <span className="text-traverse-primary">
                {" "}experience.
              </span>
            </h1>

            <div className="about-reveal mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-xl text-base leading-8 text-gray-600 md:text-lg">
                Traverse is a tours and activities booking platform
                that brings travelers and experience providers
                together. Discover new places, find experiences
                worth exploring, and make your next journey happen.
              </p>

              <Link
                href="/tours"
                className="w-fit border-b-2 border-traverse-primary pb-2 text-sm font-semibold transition-colors hover:text-traverse-primary"
              >
                Discover experiences
              </Link>
            </div>

          </div>
        </div>

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-green-50 blur-3xl" />
      </section>

      {/* Main Story */}
      <section className="px-6 pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl">

          <div className="about-reveal grid gap-10 border-t border-gray-200 pt-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-traverse-primary">
                OUR STORY
              </p>
              <p className="mt-5 text-sm text-gray-400">
                A simpler way to explore.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                We believe every journey should begin with an easy discovery.
              </h2>

              <div className="mt-8 max-w-2xl space-y-6 text-base leading-8 text-gray-600">
                <p>
                  Planning an experience should be exciting, not
                  complicated. Yet discovering the right tours,
                  understanding the details, and finding available
                  activities can take more effort than expected.
                </p>

                <p>
                  That's where Traverse comes in. We are building
                  a platform that brings different tours and
                  activities into one place, helping travelers
                  discover opportunities and make informed
                  booking decisions.
                </p>

                <p>
                  From outdoor adventures and nature escapes to
                  cultural activities and guided experiences,
                  we want to make exploring something new easier
                  for everyone.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visual Statement */}
      <section className="relative bg-green-950 px-6 py-24 text-white md:py-36">
        <div className="mx-auto max-w-6xl">

          <div className="about-reveal max-w-5xl">
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.22em] text-green-300">
              MORE THAN JUST A BOOKING PLATFORM
            </p>

            <h2 className="text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-7xl">
              It's about the places you discover,
              the people you meet,
              and the memories you create.
            </h2>

            <p className="mt-10 max-w-2xl text-base leading-8 text-green-100/70 md:text-lg">
              We want to make meaningful experiences easier to
              discover by connecting travelers with the people
              who make those experiences possible.
            </p>
          </div>

          <div className="about-reveal mt-20 grid gap-10 border-t border-white/20 pt-10 sm:grid-cols-2">

            <div>
              <h3 className="text-xl font-semibold">
                For travelers
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-green-100/70">
                Discover experiences, explore tour details,
                check availability, and book activities that
                match your interests.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                For experience providers
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-green-100/70">
                A platform for approved tour operators to
                showcase their experiences and connect with
                travelers looking for something new.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="px-6 py-24 md:py-36">
        <div className="mx-auto max-w-6xl">

          <div className="about-reveal max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-traverse-primary">
              THE TRAVERSE APPROACH
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Less time searching.
              <span className="text-traverse-primary">
                {" "}More time experiencing.
              </span>
            </h2>
          </div>

          <div className="about-reveal mt-16 grid gap-12 border-t border-gray-200 pt-10 md:grid-cols-3">

            <div>
              <p className="text-sm font-semibold text-traverse-primary">
                01
              </p>
              <h3 className="mt-5 text-xl font-semibold">
                Discover
              </h3>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Explore different destinations, tours, and
                activities in one convenient place.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-traverse-primary">
                02
              </p>
              <h3 className="mt-5 text-xl font-semibold">
                Explore
              </h3>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Understand the itinerary, pricing, availability,
                and important details before choosing an experience.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-traverse-primary">
                03
              </p>
              <h3 className="mt-5 text-xl font-semibold">
                Experience
              </h3>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Book your preferred experience and look forward
                to discovering something new.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Closing Story */}
      <section className="border-t border-gray-200 px-6 py-24 md:py-36">
        <div className="mx-auto max-w-6xl">

          <div className="about-reveal grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-traverse-primary">
                LOOKING AHEAD
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                We're here to make
                exploring the world
                a little easier.
              </h2>

              <p className="mt-8 max-w-2xl text-base leading-8 text-gray-600">
                Our vision is to build a trusted place where
                travelers can discover meaningful experiences
                and local tour operators can share what makes
                their destinations special.
              </p>

              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
                Every great journey starts somewhere.
                Let yours start with Traverse.
              </p>

              <Link
                href="/tours"
                className="mt-10 inline-flex border-b-2 border-traverse-primary pb-2 text-sm font-semibold transition-colors hover:text-traverse-primary"
              >
                Explore your next experience
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Animation Styles */}
      <style jsx global>{`
        .about-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 800ms ease,
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .about-reveal.about-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .about-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}
