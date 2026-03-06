import { Link } from "react-router-dom";
import { Car, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-playfair text-xl font-bold">LuxTravel</span>
            </div>
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
              {["About Us", "Our Fleet", "Pricing", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-sm text-white/50 hover:text-[#F59E0B] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicles */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/80 mb-5">Vehicles</h4>
            <ul className="space-y-3">
              {["Sedan", "Innova", "Innova Crysta", "Tempo Traveller", "Urbania", "Volvo Coach"].map((v) => (
                <li key={v}>
                  <Link
                    to="/#vehicles"
                    className="text-sm text-white/50 hover:text-[#F59E0B] transition-colors"
                  >
                    {v}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/80 mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <Phone className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                <span>+91 98455 92920</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <Mail className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                <span>booking@luxtravel.in</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5 text-[#F59E0B] shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            2024 LuxTravel. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((link) => (
              <Link key={link} to="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
