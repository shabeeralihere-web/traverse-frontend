import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold">
            TRAVERSE.
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-300">
            Discover amazing destinations, explore unique
            experiences and make every journey memorable.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-semibold">
            Explore
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300">

            <Link href="/tours" className="hover:text-white">
              All Tours
            </Link>

            <Link href="/about" className="hover:text-white">
              About Us
            </Link>

          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold">
            Account
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300">

            <Link href="/login" className="hover:text-white">
              Login
            </Link>

            <Link href="/register" className="hover:text-white">
              Register
            </Link>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-gray-400">
        © 2026 Traverse. All rights reserved.
      </div>

    </footer>
  );
}