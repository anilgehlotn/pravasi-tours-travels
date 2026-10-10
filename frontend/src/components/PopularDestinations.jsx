import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { getCityBySlug, getStateBySlug } from "@/data/destinations";

const TRENDING_SLUGS = ["coorg", "munnar", "hyderabad"];

const destinations = TRENDING_SLUGS.map((slug) => getCityBySlug(slug)).filter(Boolean);

export default function PopularDestinations() {
  return (
    <section id="destinations" className="py-16 md:py-32 bg-white" data-testid="popular-destinations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Popular Routes
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            Trending Destinations
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Explore the most popular travel routes booked by our travelers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {destinations.map((city, i) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden"
              data-testid={`destination-${city.slug}`}
            >
              <Link to={`/explore/${city.slug}`} className="block">
                <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden">
                  <img
                    src={city.heroImage}
                    alt={`${city.name}, ${getStateBySlug(city.stateSlug)?.name}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <div className="flex items-center gap-2 text-[#F59E0B] text-xs sm:text-sm font-medium mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{getStateBySlug(city.stateSlug)?.name}</span>
                  </div>
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <p className="text-white/70 text-xs sm:text-sm mb-3">{city.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs">{city.places.length} places to explore</span>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F59E0B] transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
