"use client";

import Link from "next/link";
import { useEffect } from "react";

const benefits = [
  {
    title: "Discover places worth visiting",
    description:
      "Explore interesting destinations and find experiences that make you want to travel.",
  },
  {
    title: "Find experiences you'll love",
    description:
      "From exciting adventures to peaceful escapes, discover journeys that match your interests.",
  },
  {
    title: "Keep your favourites close",
    description:
      "Save the tours that catch your attention and return to them whenever you're ready.",
  },
  {
    title: "Make planning easier",
    description:
      "Check available tours, explore schedules, and keep your bookings organised in one place.",
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

  const primaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-md bg-[#14532d] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0f4224]";

  const secondaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8d8d8] px-7 py-3 text-sm font-semibold text-[#171717] transition duration-300 hover:border-[#14532d] hover:text-[#14532d]";

  const textLink =
    "font-semibold text-[#14532d] transition-colors duration-200 hover:text-[#0f4224] hover:underline";

  return (
    <main className="overflow-hidden bg-white text-[#171717]">

      {/* Hero Section */}
      <section className="px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-4xl">

          <h1 className="reveal font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Your next journey
            <br />
            begins with{" "}
            <span className="text-[#14532d]">Traverse.</span>
          </h1>

          <p className="reveal mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
            Discover extraordinary destinations, explore exciting
            experiences, and find new reasons to travel. Whether
            you're looking for adventure, relaxation, or something
            completely different, your next memorable journey
            starts here.
          </p>

          <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tours" className={primaryButton}>
              Explore Tours
            </Link>

            <Link href="/register" className={secondaryButton}>
              Create an Account
            </Link>
          </div>

          <p className="reveal mt-5 text-sm text-[#777777]">
            Already have an account?{" "}
            <Link href="/login" className={textLink}>
              Login
            </Link>
          </p>

        </div>
      </section>

      {/* Introduction Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          <div className="max-w-3xl">
            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              There's more to travel than just reaching a destination.
            </h2>

            <p className="reveal mt-5 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
              It's about the places you discover, the people you
              meet, and the moments that stay with you. Traverse
              brings exciting experiences closer to you, helping
              you turn your travel ideas into journeys worth
              remembering.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Tours Introduction */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          <div className="max-w-3xl">
            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Your next favourite place is waiting to be discovered.
            </h2>

            <p className="reveal mt-5 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
              From peaceful getaways to unforgettable adventures,
              explore a variety of experiences and find the one
              that makes you excited for your next journey.
            </p>

            <Link
              href="/tours"
              className="reveal mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-[#14532d] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0f4224]"
            >
              Discover All Tours
            </Link>
          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          <div className="mb-10 max-w-3xl">
            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Everything you need to make your next journey happen.
            </h2>

            <p className="reveal mt-4 text-sm leading-7 text-[#626262] sm:text-base">
              Finding your next experience should be simple.
              Discover, save, and plan your journeys with ease.
            </p>
          </div>

          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <div
                key={item.title}
                className="reveal border-t border-[#e5e5e5] pt-5"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-[#686868]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Traveler Section */}
      <section className="px-6 py-16">
        <div className="reveal mx-auto max-w-5xl border-y border-[#e5e5e5] py-12">

          <div className="max-w-3xl">
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Every great journey starts with a first step.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
              Be part of Traverse and make your travel plans
              more personal. Discover experiences, save the
              tours you love, and manage your bookings whenever
              you need. Your next adventure could be closer
              than you think.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/register" className={primaryButton}>
                Join Traverse
              </Link>

              <Link href="/login" className={secondaryButton}>
                Traveler Login
              </Link>
            </div>

            <p className="mt-5 text-sm text-[#777777]">
              New to Traverse?{" "}
              <Link href="/register" className={textLink}>
                Create your free account
              </Link>
            </p>
          </div>

        </div>
      </section>

      {/* Tour Operator Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">

          <div className="max-w-3xl">
            <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Have experiences worth sharing? Let more people discover them.
            </h2>

            <p className="reveal mt-5 max-w-2xl text-sm leading-7 text-[#626262] sm:text-base">
              Bring your tours and activities to Traverse and
              connect with travellers searching for their next
              experience. Showcase what makes your offerings
              special, reach new audiences, and grow your
              travel business with us.
            </p>

            <Link
              href="/operator-register"
              className="reveal mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-[#14532d] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0f4224]"
            >
              Become a Tour Partner
            </Link>

            <p className="reveal mt-5 text-sm text-[#777777]">
              Already working with Traverse?{" "}
              <Link href="/login" className={textLink}>
                Partner Login
              </Link>
            </p>
          </div>

        </div>
      </section>

      {/* Final Call To Action */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">

          <h2 className="reveal font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
            The world is waiting. Where will you go next?
          </h2>

          <p className="reveal mx-auto mt-5 max-w-xl text-sm leading-7 text-[#626262] sm:text-base">
            Don't let your travel dreams remain just plans.
            Discover new places, find experiences that excite
            you, and start creating memories that last a lifetime.
          </p>

          <Link
            href="/tours"
            className="reveal mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-[#14532d] px-8 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0f4224]"
          >
            Start Exploring
          </Link>

        </div>
      </section>

    </main>
  );
}