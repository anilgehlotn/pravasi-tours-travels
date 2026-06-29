export interface BusinessInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  gstin: string;
}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: "Pravasi Tours & Travels",
  phone: "+91 98800 12345",
  address: "#42, MG Road, Bangalore, Karnataka 560001",
  email: "bookings@pravasi.in",
  gstin: "29ABCDE1234F1Z5",
};

export const getBusinessInfo = (): BusinessInfo => {
  const info = localStorage.getItem("businessInfo");
  if (info) {
    try {
      return JSON.parse(info);
    } catch {
      return DEFAULT_BUSINESS_INFO;
    }
  }
  return DEFAULT_BUSINESS_INFO;
};
