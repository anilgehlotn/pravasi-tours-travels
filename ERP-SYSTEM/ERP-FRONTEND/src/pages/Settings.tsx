import { useState, useEffect } from "react";
import { getBusinessInfo, type BusinessInfo } from "../utils/businessInfo";
import { Check } from "lucide-react";

const Settings = () => {
  const [form, setForm] = useState<BusinessInfo>({
    name: "",
    phone: "",
    address: "",
    email: "",
    gstin: "",
  });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setForm(getBusinessInfo());
  }, []);

  const handleChange = (key: keyof BusinessInfo, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    localStorage.setItem("businessInfo", JSON.stringify(form));
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg border border-green-500 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage business info & preferences</p>
        </div>

        {/* Business Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Business Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter business name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter physical address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">GSTIN</label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
