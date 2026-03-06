import { useState, useEffect } from "react";
import axios from "axios";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import VehicleGrid from "@/components/VehicleGrid";
import PopularDestinations from "@/components/PopularDestinations";
import HowItWorks from "@/components/HowItWorks";
import CallbackForm from "@/components/CallbackForm";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/CTABanner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${API}/vehicles`);
        setVehicles(res.data);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <main data-testid="home-page">
      <HeroSection vehicles={vehicles} />
      <WhyChooseUs />
      <VehicleGrid />
      <PopularDestinations />
      <HowItWorks />
      <CallbackForm />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </main>
  );
}
