import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Map, Sparkles, Clock, BookOpen, Bookmark, MessageCircle, Phone } from "lucide-react";
import { getCityBySlug, getStateBySlug, CATEGORIES } from "@/data/destinations";

const WHATSAPP_NUMBER = "919845592920";

const buildWhatsAppLink = (cityName) => {
  const message = `Hi Pravasi Tours, I'm planning to visit ${cityName} and I'd like a cab with driver to explore the city. Please share your best quote. Thanks!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categorySlug = (category) =>
  category === "All" ? "all" : category.toLowerCase().replace(/\s+/g, "-");

export default function CityDetailPage() {
  const { citySlug } = useParams();
  const city = getCityBySlug(citySlug);
  const [activeCategory, setActiveCategory] = useState("All");

  if (!city) return <Navigate to="/explore" replace />;

  const stateName = getStateBySlug(city.stateSlug)?.name ?? "";
  const availableCategories = CATEGORIES.filter((c) =>
    city.places.some((p) => p.category === c)
  );
  const filteredPlaces =
    activeCategory === "All" ? city.places : city.places.filter((p) => p.category === activeCategory);
  const whatsappLink = buildWhatsAppLink(city.name);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.name)}`;

  return (
    <div data-testid="city-detail-page">
      {/* Section 1 — Hero */}
      <section className="bg-[#F8FAFC] pt-24 sm:pt-28 pb-16 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <Link
            to="/explore"
            data-testid="back-to-explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#1E3A8A] transition-all group mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Explore
          </Link>

          <div className="flex items-center gap-2 text-sm mb-6">
            <div className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-gray-200 px-4 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="uppercase tracking-wider text-xs text-[#64748B] font-medium">
                {stateName} &middot; India
              </span>
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-[#1E3A8A] leading-[1.05] tracking-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {city.name}
          </h1>

          <p className="mt-4 text-base md:text-lg text-[#64748B] max-w-2xl leading-relaxed">
            {city.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-maps-btn"
              className="rounded-full bg-[#F59E0B] text-white px-6 py-3 font-semibold flex items-center gap-2 hover:bg-[#F59E0B]/90 transition-all shadow-lg shadow-[#F59E0B]/20"
            >
              <Map className="w-4 h-4" />
              Open in Google Maps
            </a>
            <div className="rounded-full bg-[#F1F5F9] text-[#0F172A] px-6 py-3 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {city.places.length} places to explore
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2 — Category filter bar */}
      <section className="py-8 bg-white border-b border-gray-100 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-[#F8FAFC] rounded-full p-2">
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              data-testid="category-filter-all"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === "All"
                  ? "bg-[#1E3A8A] text-white shadow-md"
                  : "text-[#64748B] hover:text-[#1E3A8A]"
              }`}
            >
              All
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                data-testid={`category-filter-${categorySlug(category)}`}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-[#1E3A8A] text-white shadow-md"
                    : "text-[#64748B] hover:text-[#1E3A8A]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Places grid */}
      <section className="py-16 bg-[#F8FAFC] px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10 gap-4 flex-wrap">
            <div>
              <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">
                Recommended places
              </p>
              <h2
                className="text-3xl md:text-5xl font-semibold text-[#1E3A8A]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Handpicked around {city.name}
              </h2>
            </div>
            <span className="text-sm text-[#64748B]">{filteredPlaces.length} results</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPlaces.map((place, index) => (
                <motion.div
                  key={place.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#1E3A8A]/10 transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] group"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={place.image}
                      alt={place.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-[#F59E0B] text-white text-xs font-semibold uppercase tracking-wide px-3 py-1">
                      {place.category}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3
                      className="text-xl font-bold text-[#0F172A] mb-2 leading-tight"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {place.name}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-4 line-clamp-3">
                      {place.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#64748B] mb-5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {place.duration}
                      </span>
                      <span>&middot;</span>
                      <span>Recommended</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-testid={`learn-more-${slugify(place.name)}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A] hover:text-white transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                        Learn More
                      </button>
                      <button
                        type="button"
                        aria-label="Save"
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] bg-white border border-gray-200 hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Section 4 — CTA strip */}
      <section className="py-16 bg-white px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#1E3A8A]/90 text-white p-8 md:p-12 relative overflow-hidden shadow-[0_20px_50px_rgb(30,58,138,0.15)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[#F59E0B] uppercase tracking-widest text-xs font-medium mb-3">
                  Ready to visit
                </p>
                <h2
                  className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Explore {city.name} with us
                </h2>
                <p className="text-white/80 text-base mt-4 leading-relaxed max-w-md">
                  Full-day cab with a local driver who knows every route. Visit all these places
                  at your own pace — no rushing, no maps app, just travel.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="cta-whatsapp"
                  className="rounded-full bg-[#25D366] text-white px-8 py-4 text-base font-bold flex items-center justify-center gap-3 hover:bg-[#25D366]/90 transition-all shadow-xl w-full md:w-auto md:self-start"
                >
                  <MessageCircle className="w-5 h-5" />
                  Get quote on WhatsApp
                </a>
                <a
                  href="tel:+919845592920"
                  data-testid="cta-call"
                  className="flex items-center gap-2 text-white/70 text-sm hover:text-white transition-all"
                >
                  <Phone className="w-4 h-4" />
                  or call us — +91 98455 92920
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Floating WhatsApp button (city-specific) */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-whatsapp"
        aria-label="WhatsApp us for a cab quote"
        className="fixed bottom-24 sm:bottom-40 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-2xl shadow-[#25D366]/40 flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-7 h-7" />
      </a>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
