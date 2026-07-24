import { useState, useEffect, Suspense, lazy } from "react";
import axios from "axios";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import VehicleGrid from "@/components/VehicleGrid";

// Lazy load below-the-fold components
const PopularDestinations = lazy(() => import("@/components/PopularDestinations"));
const ExploreSouthIndiaTeaser = lazy(() => import("@/components/ExploreSouthIndiaTeaser"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const CallbackForm = lazy(() => import("@/components/CallbackForm"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQ = lazy(() => import("@/components/FAQ"));
const CTABanner = lazy(() => import("@/components/CTABanner"));

// Loading skeleton for lazy sections
function SectionLoader() {
  return (
    <div className="py-20 px-4 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-12 bg-gray-200 rounded-lg mb-8 w-1/3" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

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
      
      {/* Lazy load below-the-fold sections */}
      <Suspense fallback={<SectionLoader />}>
        <PopularDestinations />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ExploreSouthIndiaTeaser />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <HowItWorks />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <CallbackForm />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <FAQ />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <CTABanner />
      </Suspense>
    </main>
  );
}
