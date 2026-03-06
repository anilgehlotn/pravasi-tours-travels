import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Users, Car, IndianRupee, ArrowRight,
  Phone, MessageCircle, CheckCircle, Loader2, Route, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QuoteResultPage() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchQuote = async () => {
      try {
        const res = await axios.get(`${API}/quotations/${quoteId}`);
        setQuote(res.data);
        if (res.data.status === "booked") setBooked(true);
      } catch (err) {
        toast.error("Quotation not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [quoteId, navigate]);

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    try {
      await axios.post(`${API}/bookings?quote_id=${quoteId}`);
      toast.success("Booking confirmed successfully!");
      setBooked(true);
    } catch (err) {
      toast.error("Failed to confirm booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!quote) return;
    const msg = encodeURIComponent(
      `Hi! I'd like to book:\n\nVehicle: ${quote.vehicle_name}\nFrom: ${quote.from_location}\nTo: ${quote.to_location}\nDistance: ${quote.distance_km} km\nTotal Price: ₹${quote.total_price?.toLocaleString("en-IN")}\n\nQuote ID: ${quoteId}`
    );
    window.open(`https://wa.me/919845592920?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-60 rounded-2xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="pt-28 pb-20 bg-[#F8FAFC]" data-testid="quote-result-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Back */}
        <Link
          to="/"
          data-testid="back-to-home"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {booked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
            data-testid="booking-confirmed-banner"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              Booking confirmed! Our team will contact you shortly with further details.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Vehicle Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex gap-5">
                <img
                  src={quote.vehicle_image}
                  alt={quote.vehicle_name}
                  className="w-32 h-24 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h2 className="font-playfair text-xl font-bold text-[#0F172A] mb-1">{quote.vehicle_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{quote.vehicle_seats} Seats</span>
                    <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{quote.trip_type === "outstation" ? "Outstation" : "Local"}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trip Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">Trip Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div className="w-0.5 h-8 bg-gray-200 my-1" />
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">From</p>
                      <p className="text-sm font-semibold text-[#0F172A]" data-testid="quote-from">{quote.from_location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">To</p>
                      <p className="text-sm font-semibold text-[#0F172A]" data-testid="quote-to">{quote.to_location}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Distance</p>
                    <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-1" data-testid="quote-distance">
                      <Route className="w-3.5 h-3.5 text-[#3B82F6]" />
                      {quote.distance_km} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Total Distance</p>
                    <p className="text-sm font-semibold text-[#0F172A]" data-testid="quote-total-distance">{quote.total_distance_km} km</p>
                  </div>
                  {quote.duration_text && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Duration</p>
                      <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {quote.duration_text}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Days</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{quote.days} day(s)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Price Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">Price Breakdown</h3>
              <div className="space-y-3">
                {quote.trip_type === "outstation" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Rate per km</span>
                      <span className="font-medium text-[#0F172A]">₹{quote.breakdown?.rate_per_km}/km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Total Distance (Round Trip)</span>
                      <span className="font-medium text-[#0F172A]">{quote.total_distance_km} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Minimum KM</span>
                      <span className="font-medium text-[#0F172A]">{quote.breakdown?.min_km} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Vehicle Cost</span>
                      <span className="font-medium text-[#0F172A]">₹{quote.vehicle_cost?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Driver Bata ({quote.days} day x ₹{quote.breakdown?.bata_per_day})</span>
                      <span className="font-medium text-[#0F172A]">₹{quote.driver_cost?.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Base Package (8hrs/80km)</span>
                      <span className="font-medium text-[#0F172A]">₹{quote.breakdown?.base_price_8hrs_80km?.toLocaleString("en-IN")}</span>
                    </div>
                    {quote.breakdown?.extra_km > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Extra KM ({quote.breakdown?.extra_km} km x ₹{quote.breakdown?.extra_km_rate})</span>
                        <span className="font-medium text-[#0F172A]">₹{quote.breakdown?.extra_km_cost?.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Driver Bata</span>
                      <span className="font-medium text-[#0F172A]">₹{quote.breakdown?.driver_bata?.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}

                {/* Divider */}
                <div className="ticket-divider my-4" />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-[#0F172A]">Total Estimated Price</span>
                  <span className="text-2xl font-bold text-[#1E3A8A] flex items-center" data-testid="quote-total-price">
                    <IndianRupee className="w-5 h-5" />
                    {quote.total_price?.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">* State taxes and toll charges extra, if applicable</p>
              </div>
            </motion.div>
          </div>

          {/* Right - Sticky Actions */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-4">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#1E3A8A] rounded-2xl p-6 text-white"
              >
                <p className="text-xs tracking-wider uppercase text-white/50 mb-2">Your Quote</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    {quote.total_price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-white/50">estimated</span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Vehicle</span>
                    <span className="text-white font-medium">{quote.vehicle_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance</span>
                    <span className="text-white font-medium">{quote.distance_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="text-white font-medium capitalize">{quote.trip_type}</span>
                  </div>
                </div>

                {!booked ? (
                  <button
                    data-testid="confirm-booking-btn"
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F59E0B]/30 disabled:opacity-70"
                  >
                    {bookingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3.5 bg-green-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Booking Confirmed
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <button
                  data-testid="whatsapp-inquiry-btn"
                  onClick={handleWhatsApp}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Inquiry
                </button>

                <a
                  href="tel:+919845592920"
                  data-testid="request-callback-btn"
                  className="w-full py-3.5 bg-white border border-gray-200 text-[#0F172A] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Request Callback
                </a>

                <Link
                  to="/"
                  data-testid="new-quote-btn"
                  className="w-full py-3.5 bg-white border border-gray-200 text-[#64748B] rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  Get New Quote
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
