import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How is the price calculated?",
    a: "Our pricing is based on the distance between your pickup and drop-off locations. For outstation trips, we calculate round-trip distance and apply per-km rates. For local packages, we offer an 8hrs/80km base package with extra charges for additional kilometers.",
  },
  {
    q: "Are there any hidden charges?",
    a: "No, we believe in 100% transparent pricing. The quotation includes vehicle cost and driver bata. State taxes and toll charges, if applicable, are mentioned separately.",
  },
  {
    q: "Can I modify my booking after confirmation?",
    a: "Yes, you can modify your booking up to 24 hours before the trip. Contact our support team via phone or WhatsApp to make changes.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking, and cash payments. You can pay the full amount upfront or a partial advance to confirm your booking.",
  },
  {
    q: "Are your drivers experienced?",
    a: "All our drivers are professionally trained with valid commercial driving licenses. They have minimum 5 years of experience and undergo regular background verification.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 48 hours before the trip. Cancellations within 24-48 hours incur a 25% charge. Within 24 hours, 50% of the booking amount is charged.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 md:py-32 bg-white" data-testid="faq-section">
      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-outfit">
            FAQ
          </p>
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-[#1E3A8A] mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-gray-100 rounded-2xl px-6 overflow-hidden bg-[#F8FAFC] hover:bg-white transition-colors data-[state=open]:bg-white data-[state=open]:shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-[#0F172A] hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#64748B] leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
