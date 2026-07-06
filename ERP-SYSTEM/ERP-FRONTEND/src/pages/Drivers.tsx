import { useEffect, useState } from "react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  license_no: string;
  status: string;
  created_at?: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "https://pravasi-tours-travels-4.onrender.com" : "http://localhost:8000");

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-600",
  on_trip: "bg-orange-100 text-orange-600",
  off_duty: "bg-gray-100 text-gray-500",
};

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/drivers`);
        if (!res.ok) throw new Error(`Failed to fetch drivers (${res.status})`);
        const data: Driver[] = await res.json();
        setDrivers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your fleet drivers</p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Loading drivers...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">
              {error}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Name</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Phone</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">License No.</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs">
                          {driver.name.charAt(0)}
                        </div>
                        <span className="text-gray-800 font-medium">{driver.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{driver.phone}</td>
                    <td className="px-4 py-4 text-gray-600 font-mono text-xs">{driver.license_no}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusColors[driver.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {driver.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Empty state */}
          {!loading && !error && drivers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-1">
              <span className="text-3xl">👤</span>
              <p className="mt-2">No drivers found</p>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && drivers.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
};

export default Drivers;
