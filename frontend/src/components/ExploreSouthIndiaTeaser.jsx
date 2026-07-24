import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getCityBySlug } from "@/data/destinations";

const COLLAGE_SLUGS = ["coorg", "munnar", "hyderabad", "pondicherry"];

const STATS = [
  { value: "5", label: "States covered" },
  { value: "15", label: "Cities" },
  { value: "90+", label: "Places to explore" },
];

export default function ExploreSouthIndiaTeaser() {
  const collageCities = COLLAGE_SLUGS.map((slug) => getCityBySlug(slug)).filter(Boolean);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="py-20 bg-[#F8FAFC] px-6 md:px-12 lg:px-20"
      data-testid="explore-teaser"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div>
          <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">
            A traveller&apos;s guide
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-[#1E3A8A] leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Discover South India, one destination at a time
          </h2>
          <p className="text-base md:text-lg text-[#64748B] mt-5 leading-relaxed max-w-lg">
            From misty coffee hills in Coorg to the backwaters of Alleppey and the temples of
            Tirupati — pick a city, see handpicked places to visit, and let us drive you there.
          </p>

          <div className="mt-8 flex flex-wrap gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span
                  className="text-3xl font-bold text-[#1E3A8A]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#64748B] font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/explore"
              data-testid="teaser-cta-explore"
              className="rounded-full bg-[#1E3A8A] text-white px-8 py-4 font-semibold flex items-center gap-2 hover:bg-[#1E3A8A]/90 transition-all shadow-lg shadow-[#1E3A8A]/20"
            >
              Start exploring
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore/bangalore"
              data-testid="teaser-cta-bangalore"
              className="rounded-full bg-white text-[#1E3A8A] border border-gray-200 px-8 py-4 font-semibold hover:border-[#1E3A8A] transition-all"
            >
              Popular: Bangalore
            </Link>
          </div>
        </div>

        {/* Right column — 2x2 collage */}
        <div className="grid grid-cols-2 gap-4">
          {collageCities.map((city, index) => (
            <Link
              key={city.slug}
              to={`/explore/${city.slug}`}
              data-testid={`teaser-city-${city.slug}`}
              className={`group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer ${
                index === 0 || index === 3 ? "mt-8" : ""
              }`}
            >
              <img
                src={city.heroImage}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3
                  className="text-lg md:text-xl font-bold"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {city.name}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{city.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
