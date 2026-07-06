import { useEffect, useState } from "react";

interface Vehicle {
  id: string;
  name: string;
  seats: number;
  ac: boolean;
  rate_per_km: number;
  rate_local_8hr: number;
  status?: "On Trip" | "Available";
  driver?: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "https://pravasi-tours-travels-4.onrender.com" : "http://localhost:8000");

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("API URL:", API_BASE);

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/vehicles`);
        if (!res.ok) throw new Error(`Failed to fetch vehicles (${res.status})`);
        const data: Vehicle[] = await res.json();
        console.log("vehicles data:", data);
        setVehicles(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete fleet inventory</p>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Loading vehicles...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">
              {error}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Vehicle</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Seats</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">AC</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Per KM</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Local 8hr</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Status</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-4">Driver</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const isOnTrip = vehicle.status === "On Trip";
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">{vehicle.name}</td>
                      <td className="px-4 py-4 text-gray-600">{vehicle.seats}</td>
                      <td className="px-4 py-4 text-gray-600">{vehicle.ac ? "AC" : "Non-AC"}</td>
                      <td className="px-4 py-4 text-gray-700">₹{vehicle.rate_per_km}</td>
                      <td className="px-4 py-4 text-gray-700">
                        ₹{vehicle.rate_local_8hr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isOnTrip
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {vehicle.status ?? "Available"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{vehicle.driver ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Empty state */}
          {!loading && !error && vehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-1">
              <span className="text-3xl">🚗</span>
              <p className="mt-2">No vehicles found</p>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && vehicles.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
