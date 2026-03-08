import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Snowflake, IndianRupee, Check, MapPin, Clock, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [form, setForm] = useState({
    from_location: "",
    to_location: "",
    travel_date: null,
    return_date: null,
    travelers: "2",
    trip_type: "outstation",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`${API}/vehicles/${id}`);
        setVehicle(res.data);
      } catch (err) {
        toast.error("Vehicle not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

  const handleGetQuote = async () => {
    if (!form.from_location || !form.to_location || !form.travel_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    setQuoteLoading(true);
    try {
      const payload = {
        vehicle_id: id,
        from_location: form.from_location,
        to_location: form.to_location,
        travel_date: form.travel_date.toISOString(),
        return_date: form.return_date ? form.return_date.toISOString() : null,
        travelers: parseInt(form.travelers) || 2,
        trip_type: form.trip_type,
      };
      const res = await axios.post(`${API}/getQuotation`, payload);
      toast.success("Quotation generated!");
      navigate(`/quote/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to get quotation");
    } finally {
      setQuoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[16/10] rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-60 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  const { pricing } = vehicle;

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-[#F8FAFC]" data-testid="vehicle-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Back Button */}
        <Link
          to="/#vehicles"
          data-testid="back-to-vehicles"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Vehicle Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full aspect-[16/10] object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {vehicle.features?.map((f, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="rounded-full border-gray-200 text-[#64748B] bg-white"
                >
                  {f}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Details + Quick Quote */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-[#1E3A8A] text-white rounded-full text-xs">{vehicle.category?.toUpperCase()}</Badge>
              {vehicle.ac && <Badge className="bg-[#3B82F6] text-white rounded-full text-xs">AC</Badge>}
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] mb-3">{vehicle.name}</h1>
            <p className="text-base text-[#64748B] leading-relaxed mb-6">{vehicle.description}</p>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-sm font-medium text-[#0F172A]">{vehicle.seats} Seats</span>
              </div>
              {vehicle.ac && (
                <div className="flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm font-medium text-[#0F172A]">Air Conditioned</span>
                </div>
              )}
            </div>

            {/* Pricing Table */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Pricing Details</h3>
              <div className="space-y-3">
                {[
                  { label: "8hrs / 80km Package", value: `₹${pricing.local_8hrs_80km.toLocaleString("en-IN")}` },
                  { label: "Extra KM Charge", value: `₹${pricing.extra_km}/km` },
                  { label: "Extra Hour Charge", value: `₹${pricing.extra_hr}/hr` },
                  { label: "Outstation Rate", value: `₹${pricing.outstation_km}/km` },
                  { label: "Minimum KM (Outstation)", value: `${pricing.min_km} km` },
                  { label: "Driver Bata / Day", value: `₹${pricing.driver_bata}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-[#64748B]">{row.label}</span>
                    <span className="text-sm font-semibold text-[#0F172A]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Quote Form */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100" data-testid="quick-quote-form">
              <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">Get Quick Quote</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {["outstation", "local"].map((type) => (
                  <button
                    key={type}
                    data-testid={`detail-trip-type-${type}`}
                    onClick={() => setForm({ ...form, trip_type: type })}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      form.trip_type === type
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-100 text-[#64748B]"
                    }`}
                  >
                    {type === "outstation" ? "Outstation" : "Local"}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3B82F6]" />
                    <input
                      data-testid="detail-from-input"
                      type="text"
                      placeholder="From"
                      value={form.from_location}
                      onChange={(e) => setForm({ ...form, from_location: e.target.value })}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#F1F5F9] text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none ring-1 ring-gray-200 focus:ring-[#1E3A8A]/30"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F59E0B]" />
                    <input
                      data-testid="detail-to-input"
                      type="text"
                      placeholder="To"
                      value={form.to_location}
                      onChange={(e) => setForm({ ...form, to_location: e.target.value })}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#F1F5F9] text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none ring-1 ring-gray-200 focus:ring-[#1E3A8A]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        data-testid="detail-travel-date-btn"
                        className="w-full h-10 px-3 rounded-lg bg-[#F1F5F9] ring-1 ring-gray-200 text-xs text-left flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span className={form.travel_date ? "text-[#0F172A]" : "text-[#94A3B8]"}>
                          {form.travel_date ? format(form.travel_date, "MMM dd") : "Travel date"}
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

                  {form.trip_type === "outstation" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          data-testid="detail-return-date-btn"
                          className="w-full h-10 px-3 rounded-lg bg-[#F1F5F9] ring-1 ring-gray-200 text-xs text-left flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span className={form.return_date ? "text-[#0F172A]" : "text-[#94A3B8]"}>
                            {form.return_date ? format(form.return_date, "MMM dd") : "Return date"}
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
                    <input
                      data-testid="detail-travelers-input"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="Travelers"
                      value={form.travelers}
                      onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-[#F1F5F9] text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none ring-1 ring-gray-200 focus:ring-[#1E3A8A]/30"
                    />
                  )}
                </div>

                <button
                  data-testid="detail-get-quote-btn"
                  onClick={handleGetQuote}
                  disabled={quoteLoading}
                  className="w-full h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F59E0B]/20 disabled:opacity-70"
                >
                  {quoteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Quotation"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
