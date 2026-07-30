import { useState } from "react";
import { Star, FileText, MessageCircle } from "lucide-react";
import { fleet } from "@/data/fleet";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import PdfBrochureModal from "@/components/PdfBrochureModal";

export default function FleetSection() {
  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <section id="fleet" className="py-16 bg-[#F8FAFC]" data-testid="fleet-section">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
          Our Fleet
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] mb-8">
          Browse detailed brochures for our premium fleet
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fleet.map((car) => (
            <div
              key={car.id}
              data-testid={`fleet-card-${car.id}`}
              className="rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col"
            >
              <img
                src={car.image}
                alt={car.name}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="font-playfair text-lg font-semibold text-[#0F172A]">{car.name}</h3>

                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  <span>
                    {car.rating} ({car.reviews} reviews)
                  </span>
                </div>

                <div className="mt-auto">
                  <div>
                    <p className="text-xs text-slate-500">Price per day</p>
                    <p className="text-lg font-semibold text-[#1E3A8A]">
                      ₹{car.pricePerDay.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      data-testid={`view-brochure-${car.id}`}
                      onClick={() => setSelectedCar(car)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 text-[#1E3A8A] bg-white hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 transition-colors"
                      aria-label={`View ${car.name} brochure`}
                    >
                      <FileText className="w-4 h-4" />
                      Brochure
                    </button>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi Pravasi Tours & Travels, I'd like to book the ${car.name} (₹${car.pricePerDay.toLocaleString("en-IN")}/day). Please share availability and next steps.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`book-now-${car.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 transition-colors"
                      aria-label={`Book ${car.name} on WhatsApp`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PdfBrochureModal
        open={!!selectedCar}
        onOpenChange={(v) => !v && setSelectedCar(null)}
        pdfUrl={selectedCar?.brochureUrl}
        title={selectedCar?.name}
      />
    </section>
  );
}
