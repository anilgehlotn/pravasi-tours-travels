import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, MapPin } from "lucide-react";
import { STATES, CITIES, getCitiesByState, getStateBySlug } from "@/data/destinations";

const QUICK_PICKS = [
  { label: "Bangalore", slug: "bangalore" },
  { label: "Mysore", slug: "mysore" },
  { label: "Munnar", slug: "munnar" },
  { label: "Ooty", slug: "ooty" },
  { label: "Tirupati", slug: "tirupati" },
  { label: "Hyderabad", slug: "hyderabad" },
];

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeState, setActiveState] = useState("karnataka");

  const activeCities = getCitiesByState(activeState);
  const activeStateName = getStateBySlug(activeState)?.name ?? "";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = CITIES.find((c) => c.name.toLowerCase().startsWith(q));
    if (match) {
      navigate(`/explore/${match.slug}`);
    }
  };

  return (
    <div data-testid="explore-page">
      {/* Section 1 — Hero + Search */}
      <section className="bg-[#F8FAFC] pt-24 sm:pt-28 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-[#F59E0B] mb-4">
              A Traveller's Guide
            </p>
            <h1
              className="text-4xl md:text-6xl font-bold text-[#1E3A8A] leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Explore South India
            </h1>
            <p className="text-base md:text-lg text-[#64748B] max-w-2xl mx-auto mt-4">
              Backwaters, temples, tea hills and palm-fringed beaches — five states, one
              unforgettable journey. Pick a destination and let us drive you there.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 flex items-center max-w-2xl mx-auto rounded-full bg-white ring-1 ring-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-2 py-2"
          >
            <div className="pl-4 flex items-center shrink-0">
              <Search className="w-5 h-5 text-[#1E3A8A]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a destination... (e.g. Bangalore, Munnar, Ooty)"
              data-testid="explore-search-input"
              className="flex-1 min-w-0 bg-transparent outline-none border-none px-4 py-3 text-base text-[#0F172A] placeholder:text-[#64748B]"
            />
            <button
              type="submit"
              data-testid="explore-search-submit"
              className="rounded-full bg-[#1E3A8A] text-white px-6 py-3 font-semibold flex items-center gap-2 hover:bg-[#1E3A8A]/90 transition-colors shrink-0"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          <div className="mt-6 flex flex-wrap gap-2 justify-center items-center">
            <span className="text-sm text-[#64748B]">Try:</span>
            {QUICK_PICKS.map((pick) => (
              <button
                key={pick.slug}
                type="button"
                onClick={() => navigate(`/explore/${pick.slug}`)}
                data-testid={`quick-pick-${pick.slug}`}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-[#0F172A] hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all"
              >
                {pick.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Pick your region */}
      <section className="py-16 bg-white px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-[#F59E0B] mb-3">
                Explore By State
              </p>
              <h2
                className="text-3xl md:text-5xl font-semibold text-[#1E3A8A]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Pick your region
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#F1F5F9] px-4 py-2 text-sm text-[#64748B] shrink-0">
              <MapPin className="w-4 h-4" />
              South India
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {STATES.map((state) => (
              <button
                key={state.slug}
                type="button"
                onClick={() => setActiveState(state.slug)}
                data-testid={`state-chip-${state.slug}`}
                className={`rounded-full px-6 py-2.5 text-base font-medium transition-all cursor-pointer ${
                  activeState === state.slug
                    ? "bg-[#1E3A8A] text-white border-2 border-[#F59E0B] shadow-md"
                    : "bg-white text-[#1E3A8A] border border-gray-200 hover:border-[#1E3A8A]"
                }`}
              >
                {state.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Trending in <State> */}
      <section className="py-16 bg-[#F8FAFC] px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium tracking-widest uppercase text-[#F59E0B] mb-3">
            Popular Destinations
          </p>
          <div className="flex justify-between items-end mb-10 gap-4">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#1E3A8A]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Trending in <span className="text-[#F59E0B]">{activeStateName}</span>
            </h2>
            <span className="text-sm text-[#64748B] shrink-0">
              {activeCities.length} destinations
            </span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeCities.map((city, index) => (
                <motion.div
                  key={`${activeState}-${city.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="flex-none w-[300px] md:w-[360px] snap-start"
                >
                  <Link
                    to={`/explore/${city.slug}`}
                    data-testid={`city-card-${city.slug}`}
                    className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500 cursor-pointer"
                  >
                    <img
                      src={city.heroImage}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#1E3A8A]">
                      <MapPin className="w-3 h-3" />
                      INDIA
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/90 via-[#1E3A8A]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3
                        className="text-2xl md:text-3xl font-bold"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        {city.name}
                      </h3>
                      <p className="text-sm text-white/85 mt-1 line-clamp-2">{city.tagline}</p>
                      <div className="mt-4 flex items-center gap-2 text-[#F59E0B] text-sm font-medium">
                        Explore places
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
