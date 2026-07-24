import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, Car } from "lucide-react";
import logo from '../assets/logo.png';


const navLinks = [
  { label: "Vehicles", href: "/#vehicles" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Contact", href: "/#callback" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      if (location.pathname === "/") {
        // Delay scroll to allow mobile menu close animation to finish
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const navHeight = 80; // account for fixed navbar
            const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 350);
      } else {
        // Navigate to home page, then scroll after load
        window.location.href = href;
      }
    }
  };

  return (
    <motion.nav
      data-testid="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-b border-gray-100/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              setMobileOpen(false);
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 sm:gap-3 min-w-0"
            data-testid="nav-logo"
          >
            {/* <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${scrolled ? "bg-[#1E3A8A]" : "bg-white/20 backdrop-blur-sm"}`}>
              <Car className={`w-4 h-4 sm:w-5 sm:h-5 ${scrolled ? "text-white" : "text-white"}`} />
            </div> */}

            <img
  src={logo}
  alt="Pravasi Tours & Travels"
  className="h-9 sm:h-10 w-auto object-contain shrink-0"
/>

            <span className={`font-playfair text-base sm:text-xl font-bold tracking-tight truncate ${scrolled ? "text-[#0F172A]" : "text-white"}`}>
              Pravasi Tours & Travels
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.label}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-[#F59E0B] ${
                  scrolled ? "text-[#64748B]" : "text-white/80"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://pravasi-tours-travels-1xdh.vercel.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-login-btn"
              className={`hidden md:flex items-center gap-2 rounded-full px-5 lg:px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                scrolled
                  ? "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 shadow-lg shadow-[#1E3A8A]/20"
                  : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </a>
            <button
              data-testid="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors ${scrolled ? "text-[#0F172A]" : "text-white"}`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-5 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-base font-medium text-[#0F172A] hover:text-[#1E3A8A] transition-colors py-2"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="https://pravasi-tours-travels-1xdh.vercel.app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1E3A8A] text-white rounded-full px-6 py-3 text-sm font-semibold mt-4"
              >
                <LogIn className="w-4 h-4" />
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
