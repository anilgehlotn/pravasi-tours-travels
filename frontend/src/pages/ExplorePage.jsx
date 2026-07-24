import { Link } from "react-router-dom";
import { STATES, CITIES } from "../data/destinations";

const ExplorePage = () => {
  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-[#1E3A8A] mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
        Explore South India
      </h1>
      <p className="text-[#64748B] mb-8">Stub page — full UI in next prompt.</p>

      <div className="space-y-8">
        {STATES.map((state) => (
          <div key={state.slug}>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">{state.name}</h2>
            <div className="flex flex-wrap gap-3">
              {CITIES.filter((c) => c.stateSlug === state.slug).map((city) => (
                <Link
                  key={city.slug}
                  to={`/explore/${city.slug}`}
                  className="px-4 py-2 rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-all"
                  data-testid={`stub-city-link-${city.slug}`}
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
