import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomePage from "@/pages/HomePage";

// Lazy load pages not required on initial load
const VehicleDetailPage = lazy(() => import("@/pages/VehicleDetailPage"));
const QuoteResultPage = lazy(() => import("@/pages/QuoteResultPage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const CityDetailPage = lazy(() => import("@/pages/CityDetailPage"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin" />
        <p className="text-[#64748B] font-medium">Loading...</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App min-h-screen bg-[#F8FAFC]">
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/vehicles/:id" 
            element={
              <Suspense fallback={<PageLoader />}>
                <VehicleDetailPage />
              </Suspense>
            } 
          />
          <Route
            path="/quote/:quoteId"
            element={
              <Suspense fallback={<PageLoader />}>
                <QuoteResultPage />
              </Suspense>
            }
          />
          <Route
            path="/explore"
            element={
              <Suspense fallback={<PageLoader />}>
                <ExplorePage />
              </Suspense>
            }
          />
          <Route
            path="/explore/:citySlug"
            element={
              <Suspense fallback={<PageLoader />}>
                <CityDetailPage />
              </Suspense>
            }
          />
        </Routes>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
