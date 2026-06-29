import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Car,
  FileText,
  TrendingUp,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/billing", label: "Billing & Quotation", icon: FileText },
  { to: "/revenue", label: "Revenue & Profit", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-10">
        {/* Brand */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div className="leading-tight">
            <span className="font-bold text-gray-900 text-sm block">
              Pravasi Tours
            </span>
            <span className="text-xs text-gray-400">& Travels</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / Admin */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[220px] flex-1 bg-[#F3F4F6] min-h-screen p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
