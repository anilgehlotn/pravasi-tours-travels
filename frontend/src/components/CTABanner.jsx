import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTABanner() {
  return (
    <section className="py-16 md:py-32 bg-[#F8FAFC]" data-testid="cta-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1E3A8A] p-6 sm:p-10 md:p-16 text-center"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F59E0B]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-4 font-outfit">
              Start Your Journey
            </p>
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-semibold text-white mb-4 sm:mb-5 max-w-2xl mx-auto">
              Ready to Travel in Luxury?
            </h2>
            <p className="text-sm sm:text-base text-white/60 mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Get an instant quotation and book your premium ride today. No hidden charges, no hassle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                data-testid="cta-book-now-btn"
                className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-full px-8 py-4 font-semibold text-sm shadow-xl shadow-[#F59E0B]/20 transition-all duration-300 hover:scale-105"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+919845592920"
                data-testid="cta-call-btn"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full px-8 py-4 font-semibold text-sm border border-white/20 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
