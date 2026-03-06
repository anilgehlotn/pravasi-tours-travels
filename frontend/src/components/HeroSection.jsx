import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CalendarDays, Users, Car, ArrowRight, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HeroSection({ vehicles = [] }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from_location: "",
    to_location: "",
    travel_date: null,
    return_date: null,
    travelers: "2",
    vehicle_id: "",
    trip_type: "outstation",
  });

  const handleSubmit = async () => {
    if (!form.from_location || !form.to_location || !form.vehicle_id || !form.travel_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicle_id: form.vehicle_id,
        from_location: form.from_location,
        to_location: form.to_location,
        travel_date: form.travel_date ? form.travel_date.toISOString() : "",
        return_date: form.return_date ? form.return_date.toISOString() : null,
        travelers: parseInt(form.travelers) || 2,
        trip_type: form.trip_type,
      };

      const res = await axios.post(`${API}/getQuotation`, payload);
      toast.success("Quotation generated successfully!");
      navigate(`/quote/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to generate quotation. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section data-testid="hero-section" className="relative min-h-[95vh] flex items-end pb-24 md:pb-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1758216383800-7023ee8ed42b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBzZWRhbiUyMGNhciUyMHdoaXRlfGVufDB8fHx8MTc3MjgwMzI4Mnww&ixlib=rb-4.1.0&q=85"
          alt="Luxury vehicle"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full">
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#F59E0B] mb-4 font-outfit">
            Premium Vehicle Booking
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5 max-w-3xl">
            Travel in Style,<br />Arrive in Comfort
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-xl font-manrope leading-relaxed">
            Book premium vehicles for outstation trips, local packages, and group travel across India.
          </p>
        </motion.div>

        {/* Floating Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          data-testid="search-bar"
          className="glass rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgb(0,0,0,0.15)]"
        >
          {/* Trip Type Tabs */}
          <div className="flex gap-2 mb-6">
            {["outstation", "local"].map((type) => (
              <button
                key={type}
                data-testid={`trip-type-${type}`}
                onClick={() => setForm({ ...form, trip_type: type })}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  form.trip_type === type
                    ? "bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/20"
                    : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
                }`}
              >
                {type === "outstation" ? "Outstation Round Trip" : "Local 8hrs/80km"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* From Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6]" />
                <input
                  data-testid="from-location-input"
                  type="text"
                  placeholder="Pickup city"
                  value={form.from_location}
                  onChange={(e) => setForm({ ...form, from_location: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#1E3A8A]/30 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all"
                />
              </div>
            </div>

            {/* To Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F59E0B]" />
                <input
                  data-testid="to-location-input"
                  type="text"
                  placeholder="Drop-off city"
                  value={form.to_location}
                  onChange={(e) => setForm({ ...form, to_location: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#1E3A8A]/30 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">Travel Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    data-testid="travel-date-btn"
                    className="w-full h-12 px-4 rounded-xl bg-[#F1F5F9] ring-1 ring-gray-200 text-sm text-left flex items-center gap-2 hover:ring-[#1E3A8A]/30 transition-all"
                  >
                    <CalendarDays className="w-4 h-4 text-[#3B82F6]" />
                    <span className={form.travel_date ? "text-[#0F172A]" : "text-[#94A3B8]"}>
                      {form.travel_date ? format(form.travel_date, "MMM dd, yyyy") : "Select date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.travel_date}
                    onSelect={(date) => setForm({ ...form, travel_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date (only for outstation) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">
                {form.trip_type === "outstation" ? "Return Date" : "Travelers"}
              </label>
              {form.trip_type === "outstation" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      data-testid="return-date-btn"
                      className="w-full h-12 px-4 rounded-xl bg-[#F1F5F9] ring-1 ring-gray-200 text-sm text-left flex items-center gap-2 hover:ring-[#1E3A8A]/30 transition-all"
                    >
                      <CalendarDays className="w-4 h-4 text-[#F59E0B]" />
                      <span className={form.return_date ? "text-[#0F172A]" : "text-[#94A3B8]"}>
                        {form.return_date ? format(form.return_date, "MMM dd, yyyy") : "Select return"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.return_date}
                      onSelect={(date) => setForm({ ...form, return_date: date })}
                      disabled={(date) => date < (form.travel_date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6]" />
                  <input
                    data-testid="travelers-input-local"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Travelers"
                    value={form.travelers}
                    onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#1E3A8A]/30 text-sm text-[#0F172A] outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Travelers (for outstation) */}
            {form.trip_type === "outstation" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6]" />
                  <input
                    data-testid="travelers-input"
                    type="number"
                    min="1"
                    max="50"
                    value={form.travelers}
                    onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#1E3A8A]/30 text-sm text-[#0F172A] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Vehicle Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">Vehicle</label>
              <Select value={form.vehicle_id} onValueChange={(val) => setForm({ ...form, vehicle_id: val })}>
                <SelectTrigger data-testid="vehicle-select" className="h-12 rounded-xl bg-[#F1F5F9] border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#1E3A8A]/30 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#3B82F6]" />
                    <SelectValue placeholder="Select vehicle" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.seats} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Get Quotation Button */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-transparent select-none">Action</label>
              <button
                data-testid="get-quotation-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#F59E0B]/20 hover:shadow-xl hover:shadow-[#F59E0B]/30 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Quotation
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
