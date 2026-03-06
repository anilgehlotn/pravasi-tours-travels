import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Business Traveler",
    text: "Excellent service! The Innova Crysta was in pristine condition and the driver was very professional. Booking was seamless with instant quotation.",
    rating: 5,
  },
  {
    name: "Priya Menon",
    role: "Family Vacation",
    text: "Booked a Tempo Traveller for our Kerala trip. The pricing was transparent with no hidden charges. The vehicle was clean and comfortable.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Corporate Event",
    text: "Used LuxTravel for our company offsite - 45 seater bus was perfect. Great coordination, on-time pickup, and very reasonable rates.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-[#F8FAFC]" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Testimonials
          </p>
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            What Our Travelers Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500"
              data-testid={`testimonial-${i}`}
            >
              <Quote className="w-8 h-8 text-[#1E3A8A]/10 mb-4" />
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">{t.name}</p>
                <p className="text-xs text-[#64748B]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
