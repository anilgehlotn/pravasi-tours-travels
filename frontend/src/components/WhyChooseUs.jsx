// import { motion } from "framer-motion";
// import { Shield, Clock, MapPin, Headphones, CreditCard, Star } from "lucide-react";

// const features = [
//   {
//     icon: Shield,
//     title: "Verified Vehicles",
//     desc: "Every vehicle is thoroughly inspected and maintained for your safety and comfort.",
//   },
//   {
//     icon: Clock,
//     title: "24/7 Availability",
//     desc: "Book anytime, travel anytime. Our fleet is ready round the clock for your journey.",
//   },
//   {
//     icon: MapPin,
//     title: "Pan India Coverage",
//     desc: "From local city rides to cross-country expeditions, we cover every corner of India.",
//   },
//   {
//     icon: Headphones,
//     title: "Dedicated Support",
//     desc: "Our customer support team is always a call away, ensuring a hassle-free experience.",
//   },
//   {
//     icon: CreditCard,
//     title: "Transparent Pricing",
//     desc: "No hidden charges. Get instant quotes with clear breakdowns before you book.",
//   },
//   {
//     icon: Star,
//     title: "Experienced Drivers",
//     desc: "Professional, licensed drivers with years of experience ensuring a safe journey.",
//   },
// ];

// const container = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.1 } },
// };

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
// };

// export default function WhyChooseUs() {
//   return (
//     <section className="py-16 md:py-32 bg-white" data-testid="why-choose-us">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-10 sm:mb-16"
//         >
//           <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
//             Why Choose Us
//           </p>
//           <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
//             Travel with Confidence
//           </h2>
//           <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
//             We combine luxury, reliability, and affordability to give you the best travel experience across India.
//           </p>
//         </motion.div>

//         <motion.div
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
//         >
//           {features.map((f, i) => (
//             <motion.div
//               key={i}
//               variants={item}
//               className="group bg-[#F8FAFC] rounded-2xl p-5 sm:p-8 hover:bg-white transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-transparent hover:border-gray-100"
//             >
//               <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] transition-colors duration-500">
//                 <f.icon className="w-6 h-6 text-[#1E3A8A] group-hover:text-white transition-colors duration-500" />
//               </div>
//               <h3 className="text-lg font-bold text-[#0F172A] mb-2 font-manrope">{f.title}</h3>
//               <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }
import { useState } from "react";

const backgroundStyle = {
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.70) 100%)",
  zIndex: 1,
};

const bgImageStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 0,
};

const contentStyle = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  maxWidth: "720px",
  padding: "0 24px",
};

const eyebrowStyle = {
  display: "inline-block",
  letterSpacing: "0.22em",
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  color: "#f49e0a",
  marginBottom: "18px",
};

const headingStyle = {
  fontSize: "clamp(52px, 8vw, 96px)",
  fontWeight: 800,
  lineHeight: 1.0,
  color: "#efefed",
  margin: "0 0 24px 0",
  letterSpacing: "-0.02em",
};

const subheadingStyle = {
  fontSize: "clamp(15px, 1.6vw, 18px)",
  lineHeight: 1.65,
  color: "rgba(239,239,237,0.82)",
  margin: "0 0 44px 0",
  maxWidth: "480px",
  marginLeft: "auto",
  marginRight: "auto",
};

const buttonRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const primaryBtnStyle = {
  background: "#f49e0a",
  color: "#1e3a8a",
  border: "none",
  borderRadius: "999px",
  padding: "15px 36px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "background 0.2s, transform 0.15s",
  letterSpacing: "0.01em",
};

const secondaryBtnStyle = {
  background: "rgba(255,255,255,0.12)",
  color: "#efefed",
  border: "1.5px solid rgba(255,255,255,0.45)",
  borderRadius: "999px",
  padding: "14px 34px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  transition: "background 0.2s, border-color 0.2s, transform 0.15s",
  letterSpacing: "0.01em",
};

export default function SouthIndiaHero() {
  const [primaryHover, setPrimaryHover] = useState(false);
  const [secondaryHover, setSecondaryHover] = useState(false);

  return (
    <section style={backgroundStyle}>
      {/* Background image */}
      <div style={bgImageStyle} />

      {/* Dark overlay */}
      <div style={overlayStyle} />

      {/* Hero content */}
      <div style={contentStyle}>
        <span style={eyebrowStyle}>A Traveller's Guide</span>

        <h1 style={headingStyle}>Explore South India</h1>

        <p style={subheadingStyle}>
          Backwaters, temples, tea hills and palm-fringed beaches — five states,
          one unforgettable journey.
        </p>

        <div style={buttonRowStyle}>
          <button
            style={{
              ...primaryBtnStyle,
              background: primaryHover ? "#d98c08" : "#f49e0a",
              transform: primaryHover ? "scale(1.04)" : "scale(1)",
            }}
            onMouseEnter={() => setPrimaryHover(true)}
            onMouseLeave={() => setPrimaryHover(false)}
            onClick={() => alert("Browse States clicked")}
          >
            Browse States
          </button>

          <button
            style={{
              ...secondaryBtnStyle,
              background: secondaryHover
                ? "rgba(255,255,255,0.22)"
                : "rgba(255,255,255,0.12)",
              borderColor: secondaryHover
                ? "rgba(255,255,255,0.75)"
                : "rgba(255,255,255,0.45)",
              transform: secondaryHover ? "scale(1.04)" : "scale(1)",
            }}
            onMouseEnter={() => setSecondaryHover(true)}
            onMouseLeave={() => setSecondaryHover(false)}
             onClick={() => window.open("https://pravasi-tours-travels-ai.lovable.app/plan", "_blank")}
          >
            Plan My Trip
          </button>
        </div>
      </div>
    </section>
  );
}