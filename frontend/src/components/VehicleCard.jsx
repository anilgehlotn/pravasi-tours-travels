import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Snowflake, ArrowRight, IndianRupee } from "lucide-react";

export default function VehicleCard({ vehicle }) {
  const { id, name, seats, ac, image, pricing } = vehicle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className="vehicle-card group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#1E3A8A]/10 transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)]"
      data-testid={`vehicle-card-${id}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={image}
          alt={name}
          className="vehicle-card-image w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <div className="price-tag px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            <span className="flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {pricing?.outstation_km}/km
            </span>
          </div>
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-[#0F172A] font-manrope">{name}</h3>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>{seats} Seats</span>
          </div>
          {ac && (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Snowflake className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>AC</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <IndianRupee className="w-3 h-3 text-[#F59E0B]" />
            <span>{pricing?.local_8hrs_80km?.toLocaleString("en-IN")}</span>
            <span className="text-[#94A3B8]">/ 8hrs</span>
          </div>
        </div>

        <Link
          to={`/vehicles/${id}`}
          data-testid={`view-details-${id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A] hover:text-white transition-all duration-300 group/btn"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
