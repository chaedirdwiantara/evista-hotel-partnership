"use client";

/**
 * Fix Price Routes Component
 * Displays curated fixed-price routes with location images
 */
export default function FixPriceRoutes({ routes, accentColor, primaryColor }) {
  if (!routes || routes.length === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn"
            style={{ color: primaryColor }}
          >
            Fixed Price Routes
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-6"
            style={{ backgroundColor: accentColor }}
          ></div>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Pre-configured airport transfers with guaranteed pricing. No surge, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route, index) => (
            <div
              key={route.id}
              className="group relative bg-gradient-to-br from-white to-neutral-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-neutral-200"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.2}s backwards`
              }}
            >
              {/* Route Image */}
              <div className="relative h-56 bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
                {/* Placeholder - will be replaced with actual destination image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <div className="text-6xl mb-2">✈️</div>
                    <p className="text-xs px-4">{route.destination.name}</p>
                  </div>
                </div>
                
                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Route Badge */}
                <div className="absolute top-4 left-4">
                  <span 
                    className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    FIXED PRICE
                  </span>
                </div>

                {/* Distance Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                    {route.distance} km
                  </span>
                </div>
              </div>

              {/* Route Info */}
              <div className="p-6">
                <h3 
                  className="text-xl font-bold mb-4 group-hover:text-amber-600 transition-colors duration-300"
                  style={{ color: primaryColor }}
                >
                  {route.name}
                </h3>

                {/* Locations */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: accentColor }}>
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">{route.pickup.name}</p>
                      <p className="text-xs text-neutral-500">{route.pickup.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-2">
                    <div className="h-8 w-0.5 bg-neutral-300"></div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">{route.destination.name}</p>
                      <p className="text-xs text-neutral-500">{route.destination.address}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-neutral-800">{route.estimatedDuration} min</p>
                  </div>
                  <div className="h-8 w-px bg-neutral-200"></div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 mb-1">Round Trip</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {route.roundTripAvailable ? "Available" : "One Way"}
                    </p>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Starting from</p>
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>
                      {formatPrice(route.basePrice)}
                    </p>
                  </div>
                  <button 
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
                style={{ 
                  background: `radial-gradient(circle at center, ${accentColor}15, transparent)` 
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Info Notice */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500">
            💡 All prices include toll fees and parking. Airport pickup service available 24/7.
          </p>
        </div>
      </div>
    </section>
  );
}
