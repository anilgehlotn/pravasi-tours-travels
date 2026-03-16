import { useLocation, useNavigate } from "react-router-dom";
import { Car, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Our Fleet", section: "vehicles" },
  { label: "Destinations", section: "destinations" },
  { label: "How It Works", section: "how-it-works" },
  { label: "Contact", section: "callback" },
];

const vehicleLinks = [
  { label: "Sedan", id: "sedan" },
  { label: "Innova", id: "innova" },
  { label: "Innova Crysta", id: "innova-crysta" },
  { label: "Tempo Traveller", id: "tempo-ac" },
  { label: "Urbania", id: "urbania" },
  { label: "Volvo Coach", id: "volvo-coach" },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        const navHeight = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const navHeight = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 500);
    }
  };

  const scrollToTop = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <footer className="bg-[#0F172A] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={scrollToTop} className="flex items-center gap-3 mb-5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-playfair text-lg sm:text-xl font-bold">Pravasi Tours & Travels</span>
            </button>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Premium vehicle booking for every journey. Travel in style and comfort across India.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-colors duration-300"
                  data-testid={`social-${i}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/80 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.section)}
                    className="text-sm text-white/50 hover:text-[#F59E0B] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicles */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/80 mb-5">Vehicles</h4>
            <ul className="space-y-3">
              {vehicleLinks.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => navigate(`/vehicles/${v.id}`)}
                    className="text-sm text-white/50 hover:text-[#F59E0B] transition-colors"
                  >
                    {v.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/80 mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+919845592920" className="flex items-start gap-3 text-sm text-white/50 hover:text-[#F59E0B] transition-colors">
                  <Phone className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                  <span>+91 98455 92920</span>
                </a>
              </li>
              <li>
                <a href="mailto:booking@pravasitours.in" className="flex items-start gap-3 text-sm text-white/50 hover:text-[#F59E0B] transition-colors">
                  <Mail className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                  <span>booking@pravasitours.in</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Pravasi Tours & Travels. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((link) => (
              <button
                key={link}
                onClick={scrollToTop}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
