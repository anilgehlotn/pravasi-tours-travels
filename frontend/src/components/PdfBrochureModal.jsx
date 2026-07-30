import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function PdfBrochureModal({ open, onOpenChange, pdfUrl, title }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] sm:h-[90vh] p-0 overflow-hidden flex flex-col gap-0 rounded-none sm:rounded-2xl">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="font-playfair text-base sm:text-lg font-semibold text-[#0F172A] truncate">
            {title ? `${title} Brochure` : "Brochure"}
          </DialogTitle>
        </div>
        {pdfUrl && (
          <iframe
            src={encodeURI(pdfUrl)}
            title={`${title || "Vehicle"} brochure`}
            className="flex-1 w-full border-0"
            data-testid="brochure-pdf-frame"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
