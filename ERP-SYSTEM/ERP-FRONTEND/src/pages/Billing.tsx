import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { FileText, MessageSquare, ChevronDown, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { getBusinessInfo } from "../utils/businessInfo";

// --- Types ---
interface Booking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  whatsapp_number?: string;
  trip_type: string;
  from_city: string;
  to_city?: string;
  travel_date: string;
  return_date?: string;
  vehicle_id?: string;
  vehicle_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  base_fare?: number;
  toll?: number;
  parking?: number;
  gst_amount?: number;
  total_amount?: number;
  driver_batta?: number;
  advance_amount?: number;
  permit_charges?: number;
  driver_name?: string;
  extra_hours?: number;
  extra_hours_rate?: number;
  extra_kms?: number;
  extra_kms_rate?: number;
  basic_slab?: string;
  slab_rate?: number;
  estimated_km?: number;
  toll_breakdown?: { plaza_name: string; amount: number; toll_id?: string; timestamp?: string }[];
  status: string;
  payment_status?: "pending" | "partial" | "paid" | string;
  created_at?: string;
}

const API = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "https://pravasi-tours-travels-4.onrender.com" : "http://localhost:8000");
const token = () => localStorage.getItem("admin_token") ?? "";

// ─── Number to Words (INR) ───────────────────────────────────────────────────
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
}

function belowThousand(n: number): string {
  if (n < 100) return belowHundred(n);
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + belowHundred(n % 100) : "");
}

function numberToWords(amount: number): string {
  const n = Math.floor(amount);
  if (n === 0) return "Zero Rupees Only";

  let result = "";
  let crore = Math.floor(n / 10000000);
  let lakh = Math.floor((n % 10000000) / 100000);
  let thousand = Math.floor((n % 100000) / 1000);
  let rest = n % 1000;

  if (crore) result += belowThousand(crore) + " Crore ";
  if (lakh) result += belowThousand(lakh) + " Lakh ";
  if (thousand) result += belowThousand(thousand) + " Thousand ";
  if (rest) result += belowThousand(rest);

  return "Rupees " + result.trim() + " Only";
}

// ─── PDF Generator — B&W Professional Layout ─────────────────────────────────
function generateInvoice(b: Booking) {
  const biz = getBusinessInfo();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Palette: strict black & white only ───────────────────────────────────
  const BLACK    = [0, 0, 0] as const;
  const DARK     = [26, 26, 26] as const;       // #1A1A1A  body text
  const CHARCOAL = [51, 51, 51] as const;       // #333     secondary text
  const MGRAY    = [102, 102, 102] as const;    // #666     labels / footer
  const LGRAY    = [245, 245, 245] as const;    // #F5F5F5  alt row tint
  const DGRAY    = [218, 218, 218] as const;    // #DADADA  table header bg
  const DBORDER  = [68, 68, 68] as const;       // #444     borders
  const WHITE    = [255, 255, 255] as const;

  // ── Page geometry (A4 = 210 × 297 mm) ────────────────────────────────────
  const PW = 210;
  const ML = 15;               // left & right margin
  const CW = PW - ML - ML;    // content width = 180 mm

  let y = 15;                  // running Y cursor

  // ── Helpers ───────────────────────────────────────────────────────────────
  const rule = (yy: number, lw = 0.3, col: readonly [number,number,number] = DBORDER) => {
    doc.setDrawColor(...col);
    doc.setLineWidth(lw);
    doc.line(ML, yy, ML + CW, yy);
  };

  // ── 1. HEADER ─────────────────────────────────────────────────────────────
  // Company name — left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...BLACK);
  doc.text(biz.name.toUpperCase(), ML, y + 9);

  // Company details — left, beneath name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...CHARCOAL);
  doc.text(biz.address, ML, y + 16);
  doc.text(`Tel: ${biz.phone}   |   Email: ${biz.email}`, ML, y + 21);
  doc.text(`Website: ${biz.website}   |   GSTIN: ${biz.gstin}`, ML, y + 26);

  // "PROFORMA INVOICE" — right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BLACK);
  doc.text("PROFORMA INVOICE", PW - ML, y + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`Invoice No.  :  INV-${b.booking_ref}`, PW - ML, y + 18, { align: "right" });
  doc.text(`Date         :  ${b.travel_date}`,         PW - ML, y + 24, { align: "right" });

  y += 32;
  rule(y, 0.6, BLACK);
  y += 7;

  // ── 2. BILL TO  +  TRIP DETAILS ──────────────────────────────────────────
  const halfW = CW / 2 - 4;

  // Bill To box (left) — height 44 to fit address line
  const billToH = b.customer_address ? 44 : 36;
  doc.setDrawColor(...DBORDER);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, halfW, billToH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("BILL TO", ML + 3, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...BLACK);
  doc.text(b.customer_name, ML + 3, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(`Phone  :  ${b.customer_phone}`, ML + 3, y + 21);
  if (b.whatsapp_number && b.whatsapp_number !== b.customer_phone) {
    doc.text(`WA     :  ${b.whatsapp_number}`, ML + 3, y + 27);
  }
  if (b.customer_address) {
    const addrStr = b.customer_address.length > 35 ? b.customer_address.substring(0, 33) + "\u2026" : b.customer_address;
    doc.text(`Addr   :  ${addrStr}`, ML + 3, y + 35);
  }

  // Trip Details box (right) — 5 rows: type, route, vehicle name+type, vehicle no
  const tripBoxH = Math.max(billToH, 44);
  const rx = ML + halfW + 8;
  const rw = CW - halfW - 8;
  doc.setDrawColor(...DBORDER);
  doc.rect(rx, y, rw, tripBoxH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("TRIP DETAILS", rx + 3, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const route = `${b.from_city}${b.to_city ? " \u2192 " + b.to_city : ""}`;
  const routeStr = route.length > 28 ? route.substring(0, 26) + "\u2026" : route;
  doc.text(`Route    :  ${routeStr}`, rx + 3, y + 13);
  doc.text(`Type     :  ${b.trip_type.replace(/_/g, " ").toUpperCase()}`, rx + 3, y + 20);
  const vehDisplay = b.vehicle_type ? `${b.vehicle_name ?? "\u2014"} (${b.vehicle_type})` : (b.vehicle_name ?? "\u2014");
  doc.text(`Vehicle  :  ${vehDisplay}`, rx + 3, y + 27);
  if (b.vehicle_number) {
    doc.text(`Veh. No  :  ${b.vehicle_number}`, rx + 3, y + 34);
  }
  if (b.travel_date) {
    doc.text(`Date     :  ${b.travel_date}`, rx + 3, y + (b.vehicle_number ? 41 : 34));
  }

  y += tripBoxH + 7;
  rule(y, 0.3);
  y += 8;

  // ── 3. CHARGES TABLE ─────────────────────────────────────────────────────
  // 3 columns that sum EXACTLY to CW = 180 mm:
  //   Description = 72  |  Details = 72  |  Amount = 36   →  total = 180 ✓
  const C1 = { x: ML,        w: 72 };
  const C2 = { x: ML + 72,   w: 72 };
  const C3 = { x: ML + 144,  w: 36 };
  const ROW_H = 7;

  // Section label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  doc.text("FARE DETAILS", ML, y);
  y += 6;

  // Header row
  doc.setFillColor(...DGRAY);
  doc.rect(ML, y, CW, ROW_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text("DESCRIPTION",        C1.x + 2,           y + 5);
  doc.text("DETAILS",            C2.x + 2,           y + 5);
  doc.text("AMOUNT (Rs.)",       C3.x + C3.w - 2,    y + 5, { align: "right" });
  const headerY = y;
  y += ROW_H;

  // Build data rows
  type ChargeRow = [string, string, number];
  const rows: ChargeRow[] = [];

  if ((b.base_fare ?? 0) > 0) {
    const detail = b.basic_slab
      ? `${b.basic_slab}${b.slab_rate ? " @ Rs. " + b.slab_rate : ""}`
      : `${b.estimated_km ?? 0} km travelled`;
    rows.push(["Base Fare", detail, b.base_fare ?? 0]);
  }
  if ((b.extra_hours ?? 0) > 0) {
    rows.push([
      "Extra Hours",
      `${b.extra_hours} hrs \xd7 Rs. ${b.extra_hours_rate ?? 0}/hr`,
      (b.extra_hours ?? 0) * (b.extra_hours_rate ?? 0),
    ]);
  }
  if ((b.extra_kms ?? 0) > 0) {
    rows.push([
      "Extra Kilometres",
      `${b.extra_kms} km \xd7 Rs. ${b.extra_kms_rate ?? 0}/km`,
      (b.extra_kms ?? 0) * (b.extra_kms_rate ?? 0),
    ]);
  }
  if ((b.driver_batta ?? 0) > 0) {
    rows.push(["Driver Batta", "Per-day driver allowance", b.driver_batta ?? 0]);
  }
  if ((b.parking ?? 0) > 0) {
    rows.push(["Parking", "Parking charges", b.parking ?? 0]);
  }
  if ((b.permit_charges ?? 0) > 0) {
    rows.push(["Inter-State Permit", "State permit charges", b.permit_charges ?? 0]);
  }
  if ((b.toll ?? 0) > 0) {
    rows.push(["Toll Charges", "Toll & road tax", b.toll ?? 0]);
  }
  if ((b.gst_amount ?? 0) > 0) {
    rows.push(["GST", "Tax as applicable", b.gst_amount ?? 0]);
  }

  // Render data rows
  rows.forEach(([desc, detail, amt], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, y, CW, ROW_H, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(desc, C1.x + 2, y + 5);
    // Clip detail text to fit C2 width (~42 chars max at 8.5pt)
    const ds = detail.length > 41 ? detail.substring(0, 39) + "\u2026" : detail;
    doc.text(ds, C2.x + 2, y + 5);
    doc.text(amt.toLocaleString("en-IN"), C3.x + C3.w - 2, y + 5, { align: "right" });
    y += ROW_H;
  });

  // Gross Total row
  const grossAmt = rows.reduce((s, r) => s + r[2], 0);
  doc.setFillColor(...DGRAY);
  doc.rect(ML, y, CW, ROW_H + 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  doc.text("GROSS TOTAL", C1.x + 2, y + 5.5);
  doc.text(grossAmt.toLocaleString("en-IN"), C3.x + C3.w - 2, y + 5.5, { align: "right" });
  y += ROW_H + 1;

  // Draw outer border + vertical dividers over the entire table
  doc.setDrawColor(...DBORDER);
  doc.setLineWidth(0.4);
  doc.rect(ML, headerY, CW, y - headerY, "S");
  doc.line(C2.x, headerY, C2.x, y);
  doc.line(C3.x, headerY, C3.x, y);

  y += 10;

  // ── 4. BANK DETAILS (left)  +  INVOICE SUMMARY BOX (right) ───────────────
  const sectionTop = y;
  const bankW = CW / 2 - 4;
  // Bank block occupies sectionTop + 5 (label) + 4 rows × 7mm = 33mm → bottom at sectionTop+38
  const BANK_BLOCK_H = 40;

  // Bank Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MGRAY);
  doc.text("BANK DETAILS", ML, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(`Account Name  :  ${biz.account_holder_name}`, ML, y + 13);
  doc.text(`Bank Name     :  ${biz.bank_name}`, ML, y + 20);
  doc.text(`Account No.   :  ${biz.account_number}`, ML, y + 27);
  doc.text(`IFSC Code     :  ${biz.ifsc_code}`, ML, y + 34);

  // Invoice Summary box (right)
  const netPayable = b.total_amount ?? 0;
  const advance    = b.advance_amount ?? 0;
  const finalAmt   = advance > 0 ? netPayable - advance : netPayable;

  const totX    = ML + bankW + 8;
  const totW    = CW - bankW - 8;
  const HDR_H   = 8;
  const SROW_H  = 8;
  const NET_H   = 11;
  const advRows = advance > 0 ? 1 : 0;
  const boxH    = HDR_H + (1 + advRows) * SROW_H + NET_H;

  // Box border
  doc.setDrawColor(...DBORDER);
  doc.setLineWidth(0.4);
  doc.rect(totX, y, totW, boxH, "S");

  // Header strip
  doc.setFillColor(...DGRAY);
  doc.rect(totX, y, totW, HDR_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  doc.text("INVOICE SUMMARY", totX + 3, y + 5.5);

  let sy = y + HDR_H;

  // Gross Amount row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("Gross Amount", totX + 3, sy + 5.5);
  doc.text(`Rs. ${grossAmt.toLocaleString("en-IN")}`, totX + totW - 3, sy + 5.5, { align: "right" });
  doc.setDrawColor(...DGRAY);
  doc.setLineWidth(0.3);
  doc.line(totX, sy + SROW_H, totX + totW, sy + SROW_H);
  sy += SROW_H;

  // Advance row (conditional)
  if (advance > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text("Less: Advance Paid", totX + 3, sy + 5.5);
    doc.text(`Rs. ${advance.toLocaleString("en-IN")}`, totX + totW - 3, sy + 5.5, { align: "right" });
    doc.line(totX, sy + SROW_H, totX + totW, sy + SROW_H);
    sy += SROW_H;
  }

  // NET PAYABLE — black fill, white bold text
  doc.setFillColor(...DARK);
  doc.rect(totX, sy, totW, NET_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("NET PAYABLE", totX + 3, sy + 7.5);
  doc.text(`Rs. ${finalAmt.toLocaleString("en-IN")}`, totX + totW - 3, sy + 7.5, { align: "right" });

  // ── OVERLAP FIX: advance y past BOTH the bank block bottom AND the summary box bottom ──
  // Never let 'In Words' overlap the bank details text
  y = sectionTop + Math.max(BANK_BLOCK_H, boxH) + 8;

  // Amount in words (full width)
  const words = numberToWords(finalAmt);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...CHARCOAL);
  const splitWords = doc.splitTextToSize(`In Words: ${words}`, CW);
  doc.text(splitWords, ML, y);
  y += (splitWords.length * 5) + 10;

  // ── 5. TERMS & CONDITIONS ─────────────────────────────────────────────────
  rule(y, 0.3);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("TERMS & CONDITIONS", ML, y);
  y += 5;

  const terms = [
    `1. Payment due within 7 working days from the invoice date.`,
    `2. All disputes are subject to the jurisdiction of courts in Bangalore, Karnataka only.`,
    `3. Cheques / DDs to be drawn in favour of "${biz.name}".`,
    `4. GST as applicable will be charged extra on the net payable amount.`,
    `5. This is a system-generated document and does not require a physical signature.`,
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MGRAY);
  terms.forEach((t) => {
    doc.text(t, ML, y);
    y += 4.5;
  });
  y += 6;

  // ── 6. AUTHORISED SIGNATORY ───────────────────────────────────────────────
  const sigBaseX = ML + CW - 68;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("Signature : ________________________", sigBaseX, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLACK);
  doc.text("Authorised Signatory", sigBaseX + 34, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text(`For ${biz.name}`, sigBaseX + 34, y, { align: "center" });

  // ── Outer page border ─────────────────────────────────────────────────────
  doc.setDrawColor(...DBORDER);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, PW - 16, 281, "S");

  doc.save(`ProformaInvoice_${b.booking_ref}.pdf`);
}

// ─── Component ────────────────────────────────────────────────────────────────
const Billing = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/bookings`);
      if (!res.ok) throw new Error(`Failed to fetch bills (${res.status})`);
      const data = await res.json();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ payment_status: status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setActiveDropdown(null);
      fetchBookings();
    } catch {
      alert("Failed to update payment status. Make sure you are logged in.");
    }
  };

  const sendWhatsApp = (b: Booking) => {
    const text = `Hi ${b.customer_name},\n\nThanks for booking with Pravasi Tours & Travels. Here are your trip details:\n- *Booking Ref*: ${b.booking_ref}\n- *Route*: ${b.from_city}${b.to_city ? ` to ${b.to_city}` : ""}\n- *Date*: ${b.travel_date}\n- *Vehicle*: ${b.vehicle_name ?? "—"}\n- *Total Amount*: Rs. ${(b.total_amount ?? 0).toLocaleString("en-IN")}\n- *Payment Status*: ${(b.payment_status ?? "Pending").toUpperCase()}\n\nWe wish you a safe and pleasant journey!`;
    const encoded = encodeURIComponent(text);
    const cleanPhone = b.customer_phone.replace(/\s+/g, "").replace("+91", "");
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, "_blank");
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      case "partial": return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
      default: return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "partial": return <Clock className="w-3.5 h-3.5 mr-1" />;
      default: return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Billing & Quotations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage trip invoices, payments, and client quotes</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading billing records...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-1">
              <span className="text-3xl">🧾</span>
              <p className="mt-2">No billing records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                    <th className="px-6 py-4 font-medium">Bill ID</th>
                    <th className="px-4 py-4 font-medium">Customer</th>
                    <th className="px-4 py-4 font-medium">Date</th>
                    <th className="px-4 py-4 font-medium">Trip Route</th>
                    <th className="px-4 py-4 font-medium">Vehicle & Driver</th>
                    <th className="px-4 py-4 font-medium">Amount</th>
                    <th className="px-4 py-4 font-medium">Payment Status</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 font-mono text-xs">{b.booking_ref}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{b.customer_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{b.customer_phone}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-xs">{b.travel_date}</td>
                      <td className="px-4 py-4 text-gray-600">
                        {b.from_city} {b.to_city ? `→ ${b.to_city}` : ""}
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {b.trip_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-700 text-xs font-medium">{b.vehicle_name ?? "—"}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">Driver: {b.driver_name ?? "—"}</div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        ₹{(b.total_amount ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-4 overflow-visible relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === b.id ? null : b.id)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm ${getStatusBadgeClass(b.payment_status)}`}
                        >
                          {getStatusIcon(b.payment_status)}
                          <span className="capitalize">{b.payment_status || "Pending"}</span>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                        </button>
                        {activeDropdown === b.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute left-4 top-12 z-50 mt-1 w-28 bg-white border border-gray-150 rounded-lg shadow-lg py-1 text-xs"
                          >
                            {["pending", "partial", "paid"].map((status) => (
                              <button
                                key={status}
                                onClick={() => updatePaymentStatus(b.id, status)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 font-medium capitalize text-gray-600 transition-colors"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => generateInvoice(b)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                            title="Download Proforma Invoice PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendWhatsApp(b)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                            title="Send invoice via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
