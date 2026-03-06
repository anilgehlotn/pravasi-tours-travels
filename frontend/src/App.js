import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomePage from "@/pages/HomePage";
import VehicleDetailPage from "@/pages/VehicleDetailPage";
import QuoteResultPage from "@/pages/QuoteResultPage";

function App() {
  return (
    <div className="App min-h-screen bg-[#F8FAFC]">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/quote/:quoteId" element={<QuoteResultPage />} />
        </Routes>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
