export interface BusinessInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  gstin: string;
  website: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: "Pravasi Tours & Travels",
  phone: "+91 98800 12345",
  address: "#42, MG Road, Bangalore, Karnataka 560001",
  email: "bookings@pravasi.in",
  gstin: "29ABCDE1234F1Z5",
  website: "www.pravasi.in",
  bank_name: "State Bank of India",
  account_number: "XXXXXXXXXX",
  ifsc_code: "SBIN0000000",
  account_holder_name: "Pravasi Tours & Travels",
};

export const getBusinessInfo = (): BusinessInfo => {
  const info = localStorage.getItem("businessInfo");
  if (info) {
    try {
      const parsed = JSON.parse(info);
      // Merge with defaults to handle old saved data missing new fields
      return { ...DEFAULT_BUSINESS_INFO, ...parsed };
    } catch {
      return DEFAULT_BUSINESS_INFO;
    }
  }
  return DEFAULT_BUSINESS_INFO;
};
