import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "919845592920";
  const message = encodeURIComponent("Hi! I'm interested in booking a vehicle through LuxTravel. Can you help me?");
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float-btn"
      className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/30 hover:scale-110 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  );
}
