import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, User, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CallbackForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please enter your name and phone number");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/callback`, form);
      toast.success("Callback request submitted! We'll contact you soon.");
      setSubmitted(true);
    } catch (err) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="callback" className="py-20 md:py-32 bg-[#1E3A8A]" data-testid="callback-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
              Get in Touch
            </p>
            <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-white mb-5">
              Request a Callback
            </h2>
            <p className="text-base md:text-lg text-white/60 leading-relaxed mb-8">
              Fill in your details and our travel experts will get back to you with the best deals and personalized itineraries.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm">+91 98455 92920</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm">booking@luxtravel.in</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 text-center">
                <CheckCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-white/60">Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-10 space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    data-testid="callback-name-input"
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#F59E0B]/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    data-testid="callback-phone-input"
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#F59E0B]/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    data-testid="callback-email-input"
                    type="email"
                    placeholder="Email (Optional)"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#F59E0B]/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
                  <textarea
                    data-testid="callback-message-input"
                    placeholder="Your Message (Optional)"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-[#F59E0B]/50 transition-colors resize-none"
                  />
                </div>
                <button
                  data-testid="callback-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#F59E0B]/20 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Callback"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
