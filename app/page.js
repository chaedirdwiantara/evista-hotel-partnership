import Link from "next/link";

/**
 * Root Landing Page
 * 
 * Displays list of available hotel partners for demo purposes.
 * In production, this could be a general Evista homepage.
 */
export default function Home() {
  const hotels = [
    { slug: "grand-plaza-jakarta", name: "The Grand Plaza Jakarta" },
    { slug: "royal-beach-bali", name: "Royal Beach Resort Bali" },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Evista × Hotel Partners
        </h1>
        <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
          Select a hotel to view their exclusive landing page with luxury electric vehicle services.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <Link
              key={hotel.slug}
              href={`/hotels/${hotel.slug}`}
              className="group card-luxury p-8 bg-white hover:scale-105 transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                {hotel.name}
              </h2>
              <p className="text-neutral-600 mt-2 text-sm">
                View landing page →
              </p>
            </Link>
          ))}
        </div>

        <p className="text-neutral-500 text-sm mt-12">
          Demo: Each hotel has its own exclusive branded experience
        </p>
      </div>
    </main>
  );
}
