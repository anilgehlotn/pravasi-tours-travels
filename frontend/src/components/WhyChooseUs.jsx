import { motion } from "framer-motion";
import { Shield, Clock, MapPin, Headphones, CreditCard, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Vehicles",
    desc: "Every vehicle is thoroughly inspected and maintained for your safety and comfort.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    desc: "Book anytime, travel anytime. Our fleet is ready round the clock for your journey.",
  },
  {
    icon: MapPin,
    title: "Pan India Coverage",
    desc: "From local city rides to cross-country expeditions, we cover every corner of India.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "Our customer support team is always a call away, ensuring a hassle-free experience.",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    desc: "No hidden charges. Get instant quotes with clear breakdowns before you book.",
  },
  {
    icon: Star,
    title: "Experienced Drivers",
    desc: "Professional, licensed drivers with years of experience ensuring a safe journey.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-32 bg-white" data-testid="why-choose-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            Why Choose Us
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            Travel with Confidence
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            We combine luxury, reliability, and affordability to give you the best travel experience across India.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group bg-[#F8FAFC] rounded-2xl p-5 sm:p-8 hover:bg-white transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-transparent hover:border-gray-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] transition-colors duration-500">
                <f.icon className="w-6 h-6 text-[#1E3A8A] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2 font-manrope">{f.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
