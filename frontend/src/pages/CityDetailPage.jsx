import { useParams, Link, Navigate } from "react-router-dom";
import { getCityBySlug } from "../data/destinations";

const CityDetailPage = () => {
  const { citySlug } = useParams();
  const city = getCityBySlug(citySlug);

  if (!city) return <Navigate to="/explore" replace />;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <Link to="/explore" className="text-[#3B82F6] hover:underline text-sm mb-4 inline-block">
        ← Back to Explore
      </Link>
      <h1 className="text-3xl md:text-5xl font-bold text-[#1E3A8A] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        {city.name}
      </h1>
      <p className="text-[#64748B] mb-8">{city.tagline}</p>
      <p className="text-sm text-[#64748B] mb-8">Stub page — full UI in next prompt. {city.places.length} places loaded.</p>

      <ul className="space-y-2">
        {city.places.map((p) => (
          <li key={p.name} className="text-[#0F172A]">
            <span className="font-semibold">{p.name}</span>{" "}
            <span className="text-xs text-[#64748B]">— {p.category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CityDetailPage;
