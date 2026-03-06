import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import VehicleCard from "@/components/VehicleCard";
import { Skeleton } from "@/components/ui/skeleton";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { key: "all", label: "All Vehicles" },
  { key: "sedan", label: "Sedans" },
  { key: "suv", label: "SUVs" },
  { key: "van", label: "Vans & Tempo" },
  { key: "bus", label: "Buses" },
  { key: "coach", label: "Coaches" },
];

export default function VehicleGrid() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${API}/vehicles`);
        setVehicles(res.data);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = filter === "all" ? vehicles : vehicles.filter((v) => v.category === filter);

  return (
    <section id="vehicles" className="py-20 md:py-32 bg-[#F8FAFC]" data-testid="vehicle-grid-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Our Fleet
          </p>
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            Choose Your Vehicle
          </h2>
          <p className="text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            From comfortable sedans to luxury coaches, we have the perfect vehicle for every journey.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12" data-testid="vehicle-filters">
          {categories.map((cat) => (
            <button
              key={cat.key}
              data-testid={`filter-${cat.key}`}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat.key
                  ? "bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/20"
                  : "bg-white text-[#64748B] hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[#64748B]">
            No vehicles found in this category.
          </div>
        )}
      </div>
    </section>
  );
}
