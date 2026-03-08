import { motion } from "framer-motion";
import { Search, Calculator, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Select",
    desc: "Enter your travel details and choose from our premium fleet of vehicles.",
  },
  {
    icon: Calculator,
    step: "02",
    title: "Get Instant Quote",
    desc: "Our system automatically calculates distance and provides transparent pricing.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Book & Travel",
    desc: "Confirm your booking and enjoy a comfortable, hassle-free journey.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-32 bg-[#F8FAFC]" data-testid="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Simple Process
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            How It Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Booking your ride is as easy as 1-2-3. No complicated steps, just seamless travel planning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#1E3A8A]/20 to-transparent" />
              )}

              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center">
                  <s.icon className="w-10 h-10 text-[#1E3A8A]" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#F59E0B] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {s.step}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0F172A] mb-3 font-manrope">{s.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
