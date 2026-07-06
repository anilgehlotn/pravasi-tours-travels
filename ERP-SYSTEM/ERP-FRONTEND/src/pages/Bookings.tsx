import { useEffect, useState, useCallback } from "react";

// --- Types ---
interface Vehicle {
  id: string;
  name: string;
  seats: number;
  rate_per_km: number;
  rate_local_8hr: number;
}
interface Booking {
  id: string;
  booking_ref?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  whatsapp_number?: string;
  trip_type: string;
  from_city: string;
  to_city?: string;
  travel_date: string;
  return_date?: string;
  vehicle_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  estimated_km?: number;
  base_fare?: number;
  toll?: number;
  parking?: number;
  driver_batta?: number;
  advance_amount?: number;
  permit_charges?: number;
  gst_amount?: number;
  total_amount?: number;
  status: string;
  created_at?: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TRIP_TYPES = [
  { value: "outstation_round", label: "Outstation Round Trip" },
  { value: "outstation_oneway", label: "Outstation One Way" },
  { value: "local_8hr", label: "Local 8hr" },
  { value: "local_12hr", label: "Local 12hr" },
];

const tripLabel = (v: string) => TRIP_TYPES.find((t) => t.value === v)?.label ?? v;

// Derive vehicle type label from name / seats
function deriveVehicleType(name: string, seats: number): string {
  const n = name.toLowerCase();
  if (n.includes("sleeper")) return "Sleeper Coach";
  if (n.includes("volvo")) return "Volvo Coach";
  if (n.includes("urbania")) return "Luxury Van";
  if (seats >= 40) return "Large Bus";
  if (seats >= 25) return "Bus";
  if (seats >= 17) return "Mini Bus";
  if (seats >= 12) return "Tempo Traveller";
  if (seats >= 9) return "Luxury Van";
  if (n.includes("innova") || n.includes("fortuner")) return "SUV";
  return "Sedan";
}

// helpers
const fmt = (n?: number | null) => "₹" + (n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const token = () => localStorage.getItem("admin_token") ?? "";

// --- Component ---
const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const emptyForm = {
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_whatsapp: "",
    trip_type: "outstation_round",
    from_city: "",
    to_city: "",
    travel_date: "",
    return_date: "",
    vehicle_id: "",
    vehicle_name: "",
    vehicle_type: "",
    vehicle_number: "",
    estimated_km: 0,
    rate_per_km: 0,
    toll: 0,
    parking: 0,
    driver_batta: 0,
    advance_amount: 0,
    permit_charges: 0,
    apply_gst: false,
    base_fare: 0,
    gst: 0,
    total: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [manualBase, setManualBase] = useState(false);
  const [manualTotal, setManualTotal] = useState(false);

  // Fetch data
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/bookings`);
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setBookings(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetch(`${API}/api/vehicles`).then((r) => r.json()).then(setVehicles).catch(() => {});
  }, [fetchBookings]);

  // Auto-calc base fare and total
  useEffect(() => {
    if (showModal) {
      const baseFare = manualBase ? form.base_fare : form.estimated_km * form.rate_per_km;
      const gst = form.apply_gst ? Math.round(baseFare * 0.05) : 0;
      const extras = form.toll + form.parking + form.driver_batta + form.permit_charges;
      const total = manualTotal ? form.total : baseFare + extras + gst;

      setForm((p) => ({
        ...p,
        base_fare: Math.round(baseFare),
        gst,
        total: Math.round(total),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.estimated_km,
    form.rate_per_km,
    form.toll,
    form.parking,
    form.driver_batta,
    form.permit_charges,
    form.apply_gst,
    manualBase,
    manualTotal,
    showModal,
  ]);

  const set = (key: string, val: string | number | boolean) => setForm((p) => ({ ...p, [key]: val }));

  const selectVehicle = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    if (v) {
      setForm((p) => ({
        ...p,
        vehicle_id: v.id,
        vehicle_name: v.name,
        vehicle_type: deriveVehicleType(v.name, v.seats),
        rate_per_km: v.rate_per_km,
      }));
      setManualBase(false);
      setManualTotal(false);
    }
  };

  const openModal = () => {
    setForm(emptyForm);
    setManualBase(false);
    setManualTotal(false);
    setShowModal(true);
  };

  const saveBooking = async () => {
    if (!form.customer_name || !form.customer_phone || !form.from_city) return;
    setSaving(true);
    try {
      const body = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address || null,
        whatsapp_number: form.customer_whatsapp || null,
        trip_type: form.trip_type,
        from_city: form.from_city,
        to_city: form.to_city || null,
        travel_date: form.travel_date,
        return_date: form.return_date || null,
        vehicle_id: form.vehicle_id || null,
        vehicle_name: form.vehicle_name || null,
        vehicle_type: form.vehicle_type || null,
        vehicle_number: form.vehicle_number || null,
        estimated_km: form.estimated_km,
        toll: form.toll,
        parking: form.parking,
        driver_batta: form.driver_batta || null,
        advance_amount: form.advance_amount || null,
        permit_charges: form.permit_charges || null,
        base_fare: form.base_fare,
        gst_amount: form.gst,
        total_amount: form.total,
        status: "ongoing",
      };
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save booking");
      setShowModal(false);
      fetchBookings();
    } catch {
      alert("Failed to save booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered list
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_phone.includes(q) ||
      (b.from_city ?? "").toLowerCase().includes(q) ||
      (b.to_city ?? "").toLowerCase().includes(q) ||
      (b.vehicle_name ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ---------- RENDER ----------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage all customer trip bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm w-56 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={openModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> New Booking
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading bookings...</div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-1">
              <span className="text-3xl">📋</span>
              <p className="mt-2">No bookings found</p>
            </div>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Ref", "Customer", "Phone", "Trip", "Vehicle", "Route", "Date", "KM", "Base Fare", "Extras", "Total", "Status"].map(
                    (h) => (
                      <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 first:pl-6">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {(filtered ?? []).map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 pl-6 text-indigo-600 font-mono text-xs font-semibold">{b.booking_ref ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{b.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{b.customer_phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{tripLabel(b.trip_type ?? "")}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{b.vehicle_name ?? "—"}</div>
                      {b.vehicle_number && <div className="text-[10px] text-gray-400 font-mono">{b.vehicle_number}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.from_city ?? "—"}{b.to_city ? ` → ${b.to_city}` : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{b.travel_date ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{b.estimated_km ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(b.base_fare)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      T:{fmt(b.toll)} P:{fmt(b.parking)} B:{fmt(b.driver_batta)} G:{fmt(b.gst_amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">{fmt(b.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          b.status === "ongoing"
                            ? "bg-blue-100 text-blue-600"
                            : b.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-500"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {b.status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ========== MODAL ========== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">New Booking</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Customer Details */}
              <Section title="Customer Details">
                <Row>
                  <Input label="Customer Name *" value={form.customer_name} onChange={(v) => set("customer_name", v)} />
                  <Input label="Phone *" value={form.customer_phone} onChange={(v) => set("customer_phone", v)} />
                </Row>
                <Row>
                  <Input label="WhatsApp Number" value={form.customer_whatsapp} onChange={(v) => set("customer_whatsapp", v)} />
                  <Input label="Customer Address" value={form.customer_address} onChange={(v) => set("customer_address", v)} />
                </Row>
              </Section>

              {/* Trip Details */}
              <Section title="Trip Details">
                <Row>
                  <Select label="Trip Type" value={form.trip_type} onChange={(v) => set("trip_type", v)} options={TRIP_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
                </Row>
                <Row>
                  <Input label="From City *" value={form.from_city} onChange={(v) => set("from_city", v)} />
                  <Input label="To City" value={form.to_city} onChange={(v) => set("to_city", v)} />
                </Row>
                <Row>
                  <Input label="Travel Date" type="date" value={form.travel_date} onChange={(v) => set("travel_date", v)} />
                  <Input label="Return Date" type="date" value={form.return_date} onChange={(v) => set("return_date", v)} />
                </Row>
              </Section>

              {/* Vehicle */}
              <Section title="Vehicle">
                <Row>
                  <Select
                    label="Select Vehicle"
                    value={form.vehicle_id}
                    onChange={selectVehicle}
                    options={vehicles.map((v) => ({ value: v.id, label: `${v.name} — ₹${v.rate_per_km}/km` }))}
                    placeholder="Choose a vehicle"
                  />
                  <Input label="Vehicle Number (Reg. Plate)" value={form.vehicle_number} onChange={(v) => set("vehicle_number", v)} />
                </Row>
                {form.vehicle_type && (
                  <p className="text-xs text-gray-400">Vehicle type: <span className="font-medium text-gray-600">{form.vehicle_type}</span></p>
                )}
              </Section>

              {/* Pricing */}
              <Section title="Pricing">
                <Row>
                  <NumInput label="Estimated KM" value={form.estimated_km} onChange={(v) => { set("estimated_km", v); setManualBase(false); setManualTotal(false); }} />
                  <NumInput label="Per KM Rate (₹)" value={form.rate_per_km} onChange={(v) => { set("rate_per_km", v); setManualBase(false); setManualTotal(false); }} />
                </Row>
                <Row>
                  <NumInput label="Toll (₹)" value={form.toll} onChange={(v) => { set("toll", v); setManualTotal(false); }} />
                  <NumInput label="Parking (₹)" value={form.parking} onChange={(v) => { set("parking", v); setManualTotal(false); }} />
                </Row>
                <Row>
                  <NumInput label="Driver Batta (₹)" value={form.driver_batta} onChange={(v) => { set("driver_batta", v); setManualTotal(false); }} />
                  <NumInput label="Inter-State Permit (₹)" value={form.permit_charges} onChange={(v) => { set("permit_charges", v); setManualTotal(false); }} />
                </Row>
                <Row>
                  <NumInput label="Advance Payment (₹)" value={form.advance_amount} onChange={(v) => set("advance_amount", v)} />
                </Row>
                <div className="flex items-center gap-2 mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.apply_gst}
                      onChange={(e) => { set("apply_gst", e.target.checked); setManualTotal(false); }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                  <span className="text-sm text-gray-600">Apply GST 5%</span>
                </div>
              </Section>

              {/* Fare Breakdown */}
              <Section title="Fare Breakdown">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <FareRow
                    label="Base Fare"
                    value={form.base_fare}
                    manual={manualBase}
                    onChange={(v) => { setManualBase(true); set("base_fare", v); setManualTotal(false); }}
                    onReset={() => setManualBase(false)}
                  />
                  <FareRow label="Toll" value={form.toll} onChange={(v) => { set("toll", v); setManualTotal(false); }} />
                  <FareRow label="Parking" value={form.parking} onChange={(v) => { set("parking", v); setManualTotal(false); }} />
                  <FareRow label="Driver Batta" value={form.driver_batta} onChange={(v) => { set("driver_batta", v); setManualTotal(false); }} />
                  <FareRow label="Inter-State Permit" value={form.permit_charges} onChange={(v) => { set("permit_charges", v); setManualTotal(false); }} />
                  <FareRow label="GST (5%)" value={form.gst} onChange={(v) => set("gst", v)} />
                  <div className="border-t border-gray-200 pt-3">
                    <FareRow
                      label="Total"
                      value={form.total}
                      manual={manualTotal}
                      onChange={(v) => { setManualTotal(true); set("total", v); }}
                      onReset={() => setManualTotal(false)}
                      bold
                    />
                  </div>
                  {form.advance_amount > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <FareRow label="Advance Paid" value={form.advance_amount} onChange={(v) => set("advance_amount", v)} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-indigo-700">Balance Due</span>
                        <span className="text-sm font-bold text-indigo-700">₹{(form.total - form.advance_amount).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBooking}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- sub-components ----

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FareRow({
  label,
  value,
  manual,
  onChange,
  onReset,
  bold,
}: {
  label: string;
  value: number;
  manual?: boolean;
  onChange: (v: number) => void;
  onReset?: () => void;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-600"}`}>{label}</span>
        {manual && onReset && (
          <button onClick={onReset} className="text-[10px] text-indigo-500 hover:text-indigo-700 underline">
            Reset to calculated
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-400">₹</span>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-28 text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            bold ? "font-bold text-gray-900" : "text-gray-700"
          }`}
        />
      </div>
    </div>
  );
}

export default Bookings;
