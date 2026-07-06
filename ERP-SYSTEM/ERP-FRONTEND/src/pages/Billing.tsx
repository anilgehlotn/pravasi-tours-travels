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
  whatsapp_number?: string;
  trip_type: string;
  from_city: string;
  to_city?: string;
  travel_date: string;
  return_date?: string;
  vehicle_id?: string;
  vehicle_name?: string;
  driver_id?: string;
  driver_name?: string;
  base_fare?: number;
  toll?: number;
  parking?: number;
  fuel?: number;
  gst_amount?: number;
  total_amount?: number;
  status: string;
  payment_status?: "pending" | "partial" | "paid" | string;
  created_at?: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8001";
const token = () => localStorage.getItem("admin_token") ?? "";

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

  useEffect(() => {
    fetchBookings();
  }, []);

  // Close dropdown on click outside
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ payment_status: status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setActiveDropdown(null);
      fetchBookings();
    } catch {
      alert("Failed to update payment status. Make sure you are logged in.");
    }
  };

  // --- PDF Generator ---
  const generateInvoice = (b: Booking) => {
    const biz = getBusinessInfo();
    const doc = new jsPDF();

    // Clean Layout Designing
    doc.setFillColor(79, 70, 229); // Indigo Header Block
    doc.rect(0, 0, 210, 40, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(biz.name.toUpperCase(), 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(biz.address, 15, 25);
    doc.text(`Phone: ${biz.phone}  |  Email: ${biz.email}`, 15, 31);

    // Invoice Meta
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INVOICE", 15, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${b.booking_ref}`, 15, 62);
    doc.text(`Date: ${b.travel_date}`, 15, 68);
    doc.text(`Status: ${(b.payment_status || "Pending").toUpperCase()}`, 15, 74);
    doc.text(`GSTIN: ${biz.gstin}`, 15, 80);

    // Customer Info
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 130, 55);
    doc.setFont("helvetica", "normal");
    doc.text(b.customer_name, 130, 62);
    doc.text(`Phone: +91 ${b.customer_phone}`, 130, 68);
    if (b.whatsapp_number) {
      doc.text(`WhatsApp: +91 ${b.whatsapp_number}`, 130, 74);
    }

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 86, 195, 86);

    // Trip Info
    doc.setFont("helvetica", "bold");
    doc.text("Trip Details:", 15, 96);
    doc.setFont("helvetica", "normal");
    doc.text(`Route: ${b.from_city} ${b.to_city ? `to ${b.to_city}` : ""}`, 15, 103);
    doc.text(`Trip Type: ${b.trip_type.replace("_", " ").toUpperCase()}`, 15, 109);
    doc.text(`Vehicle: ${b.vehicle_name ?? "—"}`, 15, 115);
    doc.text(`Driver: ${b.driver_name ?? "—"}`, 15, 121);


    // Charges Table Header
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 127, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, 132);
    doc.text("Amount (INR)", 160, 132);

    // Charges Table Rows
    doc.setFont("helvetica", "normal");
    let y = 142;
    const addRow = (label: string, val?: number) => {
      if (val !== undefined && val > 0) {
        doc.text(label, 20, y);
        doc.text(`Rs. ${val.toLocaleString("en-IN")}`, 160, y);
        doc.line(15, y + 3, 195, y + 3);
        y += 10;
      }
    };

    addRow("Base Fare", b.base_fare);
    addRow("Toll Charges", b.toll);
    addRow("Parking Charges", b.parking);
    addRow("Fuel Allowance", b.fuel);
    addRow("GST (5%)", b.gst_amount);

    // Total Amount
    doc.setFillColor(238, 242, 255);
    doc.rect(15, y + 2, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total", 20, y + 9);
    doc.text(`Rs. ${(b.total_amount ?? 0).toLocaleString("en-IN")}`, 160, y + 9);

    // Footer Info
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for traveling with Pravasi Tours & Travels!", 105, 260, { align: "center" });

    doc.save(`invoice_${b.booking_ref}.pdf`);
  };

  // --- WhatsApp Link ---
  const sendWhatsApp = (b: Booking) => {
    const text = `Hi ${b.customer_name},

Thanks for booking with Pravasi Tours & Travels. Here are your trip details:
- *Booking Ref*: ${b.booking_ref}
- *Route*: ${b.from_city} ${b.to_city ? `to ${b.to_city}` : ""}
- *Date*: ${b.travel_date}
- *Vehicle*: ${b.vehicle_name ?? "—"}
- *Total Amount*: Rs. ${(b.total_amount ?? 0).toLocaleString("en-IN")}
- *Payment Status*: ${(b.payment_status ?? "Pending").toUpperCase()}

We wish you a safe and pleasant journey!`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = b.customer_phone.replace(/\s+/g, "").replace("+91", "");
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, "_blank");
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      case "partial":
        return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
      default:
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "partial":
        return <Clock className="w-3.5 h-3.5 mr-1" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Billing & Quotations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage trip invoices, payments, and client quotes</p>
        </div>

        {/* Content Table Card */}
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
                      {/* Bill ID */}
                      <td className="px-6 py-4 font-semibold text-gray-800 font-mono text-xs">{b.booking_ref}</td>
                      
                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{b.customer_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{b.customer_phone}</div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-gray-600 font-mono text-xs">{b.travel_date}</td>

                      {/* Trip */}
                      <td className="px-4 py-4 text-gray-600">
                        {b.from_city} {b.to_city ? `→ ${b.to_city}` : ""}
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {b.trip_type.replace("_", " ")}
                        </span>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="px-4 py-4">
                        <div className="text-gray-700 text-xs font-medium">{b.vehicle_name ?? "—"}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">Driver: {b.driver_name ?? "—"}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        ₹{(b.total_amount ?? 0).toLocaleString("en-IN")}
                      </td>

                      {/* Payment Status (Dropdown Badge) */}
                      <td className="px-4 py-4 overflow-visible relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === b.id ? null : b.id)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm ${getStatusBadgeClass(
                            b.payment_status
                          )}`}
                        >
                          {getStatusIcon(b.payment_status)}
                          <span className="capitalize">{b.payment_status || "Pending"}</span>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                        </button>

                        {/* Interactive Dropdown */}
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

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => generateInvoice(b)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                            title="Download PDF Invoice"
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
