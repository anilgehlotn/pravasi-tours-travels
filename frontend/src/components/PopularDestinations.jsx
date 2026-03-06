import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";

const destinations = [
  {
    name: "Agra",
    subtitle: "Taj Mahal & Heritage",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHx0YWolMjBtYWhhbCUyMGFncmElMjBpbmRpYXxlbnwwfHx8fDE3NzI4MDMyODV8MA&ixlib=rb-4.1.0&q=85",
    from: "Delhi",
    distance: "230 km",
  },
  {
    name: "Kerala",
    subtitle: "Backwaters & Beaches",
    image: "https://images.unsplash.com/photo-1766051224978-a57732014f9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxrZXJhbGElMjBiYWNrd2F0ZXJzJTIwaG91c2Vib2F0fGVufDB8fHx8MTc3MjgwMzI4Nnww&ixlib=rb-4.1.0&q=85",
    from: "Bangalore",
    distance: "560 km",
  },
  {
    name: "Goa",
    subtitle: "Beaches & Nightlife",
    image: "https://images.unsplash.com/photo-1707893013488-51672ef83425?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxrZXJhbGElMjBiYWNrd2F0ZXJzJTIwaG91c2Vib2F0fGVufDB8fHx8MTc3MjgwMzI4Nnww&ixlib=rb-4.1.0&q=85",
    from: "Mumbai",
    distance: "590 km",
  },
];

export default function PopularDestinations() {
  return (
    <section id="destinations" className="py-20 md:py-32 bg-white" data-testid="popular-destinations">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Popular Routes
          </p>
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            Trending Destinations
          </h2>
          <p className="text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Explore the most popular travel routes booked by our travelers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-3xl overflow-hidden cursor-pointer"
              data-testid={`destination-${dest.name.toLowerCase()}`}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-medium mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.from}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{dest.name}</span>
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-1">{dest.name}</h3>
                <p className="text-white/70 text-sm mb-3">{dest.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">{dest.distance}</span>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F59E0B] transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
