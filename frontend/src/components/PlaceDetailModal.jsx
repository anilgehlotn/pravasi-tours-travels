import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, IndianRupee, Hourglass, Calendar, Check, MessageCircle, Map } from "lucide-react";

const WHATSAPP_NUMBER = "919845592920";

export default function PlaceDetailModal({ place, city, onClose }) {
  useEffect(() => {
    if (!place) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [place, onClose]);

  const images = place ? (place.gallery && place.gallery.length > 0 ? place.gallery : [place.image]) : [];
  const mapQuery = place ? place.mapQuery || place.name : "";
  const whatsappMessage = place
    ? `Hi Pravasi Tours, I'm planning to visit ${place.name} in ${city.name} and I'd like a cab with driver. Please share your best quote. Thanks!`
    : "";
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const infoCards = place
    ? [
        { icon: Clock, label: "Timings", value: place.timings },
        { icon: IndianRupee, label: "Entry Fee", value: place.entryFee },
        { icon: Hourglass, label: "Duration", value: place.duration },
        { icon: Calendar, label: "Best Time", value: place.bestTimeToVisit },
      ]
    : [];

  return (
    <AnimatePresence>
      {place && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
          data-testid="place-modal-backdrop"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-testid="place-modal"
          >
            <button
              type="button"
              onClick={onClose}
              data-testid="place-modal-close"
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
            >
              <X className="w-5 h-5 text-[#0F172A]" />
            </button>

            {/* Section 1 — Image gallery */}
            {images.length === 1 && (
              <div className="aspect-[16/9] rounded-t-3xl overflow-hidden">
                <img
                  src={images[0]}
                  alt={place.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {images.length === 2 && (
              <div className="grid grid-cols-2 gap-2 p-2">
                {images.map((src, i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      src={src}
                      alt={place.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            )}
            {images.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 p-2">
                <div className="col-span-2 row-span-2 aspect-square overflow-hidden rounded-2xl">
                  <img
                    src={images[0]}
                    alt={place.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {images.slice(1, 3).map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                    <img
                      src={src}
                      alt={place.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Section 2 — Header */}
            <div className="p-6 sm:p-8 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="uppercase tracking-wider text-xs text-[#64748B] font-medium">
                  {city.name} &middot; {place.category}
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#1E3A8A] leading-tight"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {place.name}
              </h2>
              <p className="text-base text-[#64748B] mt-3 leading-relaxed">{place.description}</p>
            </div>

            {/* Section 3 — Info grid */}
            <div className="px-6 sm:px-8 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {infoCards.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[#F8FAFC] rounded-2xl p-4">
                  <Icon className="w-4 h-4 text-[#F59E0B] mb-2" />
                  <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-1">{label}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Section 4 — Long description */}
            <div className="px-6 sm:px-8 pb-6">
              <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">About this place</p>
              {place.longDescription ? (
                place.longDescription.split("\n\n").map((para, i) => (
                  <p key={i} className="text-[#64748B] leading-relaxed mb-4 text-base">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-[#64748B] leading-relaxed mb-4 text-base">{place.description}</p>
              )}
            </div>

            {/* Section 5 — Keywords / tags */}
            {place.keywords && place.keywords.length > 0 && (
              <div className="px-6 sm:px-8 pb-6">
                <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">Known for</p>
                <div className="flex flex-wrap gap-2">
                  {place.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A] px-4 py-1.5 text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6 — Tips */}
            {place.tips && place.tips.length > 0 && (
              <div className="px-6 sm:px-8 pb-6">
                <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">Traveller tips</p>
                <ul className="space-y-2">
                  {place.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#64748B] leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section 7 — Map embed */}
            <div className="px-6 sm:px-8 pb-8">
              <p className="uppercase text-xs tracking-widest text-[#F59E0B] font-medium mb-3">Location</p>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                width="100%"
                height="320"
                className="rounded-2xl border-0 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${place.name}`}
                data-testid="place-modal-map"
              />
            </div>

            {/* Section 8 — CTA strip */}
            <div className="px-6 sm:px-8 pb-8 pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="place-modal-whatsapp"
                className="flex-1 rounded-full bg-[#25D366] text-white px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:bg-[#25D366]/90 transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Ask about this place on WhatsApp
              </a>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="place-modal-maps-link"
                className="rounded-full bg-[#F1F5F9] text-[#0F172A] px-6 py-3 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                <Map className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
