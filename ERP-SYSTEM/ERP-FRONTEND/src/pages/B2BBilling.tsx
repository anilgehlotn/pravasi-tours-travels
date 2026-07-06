import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Building2, Plus, Filter, Download, Trash2, X,
  ChevronRight, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, IndianRupee,
} from "lucide-react";
import { getBusinessInfo } from "../utils/businessInfo";

// ─── Config ───────────────────────────────────────────────────────────────────
const API   = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "https://pravasi-tours-travels-4.onrender.com" : "http://localhost:8000");
const tok   = () => localStorage.getItem("admin_token") ?? "";
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

// ─── Types ────────────────────────────────────────────────────────────────────
interface B2BCompany {
  id: string;
  business_name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gstin?: string;
}

interface B2BBill {
  id: string;
  bill_no: string;
  bill_type: "local" | "outstation";
  date: string;
  vehicle_number?: string;
  vehicle_type?: string;
  company_id: string;
  b2b_companies?: { business_name: string; address?: string; phone?: string; gstin?: string };
  // local
  trip_sheet_number?: string;
  base_slab_amount?: number;
  extra_km?: number;
  per_km_cost?: number;
  extra_km_cost?: number;
  extra_hrs?: number;
  extra_hrs_cost?: number;
  total_extra_cost?: number;
  toll?: number;
  total_amount?: number;
  // outstation
  total_running_km?: number;
  per_km_cost_out?: number;
  total_cost?: number;
  bata?: number;
  toll_charges?: number;
  grand_total?: number;
}

// ─── Number → Words (INR) ────────────────────────────────────────────────────
const _o = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const _t = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
const _bH = (n: number) => n < 20 ? _o[n] : _t[Math.floor(n/10)] + (n%10 ? " "+_o[n%10] : "");
const _bT = (n: number) => n < 100 ? _bH(n) : _o[Math.floor(n/100)] + " Hundred" + (n%100 ? " "+_bH(n%100) : "");
function numberToWords(amount: number): string {
  const n = Math.floor(amount);
  if (n === 0) return "Zero Rupees Only";
  let r = "";
  const cr=Math.floor(n/10000000), lk=Math.floor((n%10000000)/100000);
  const th=Math.floor((n%100000)/1000), rs=n%1000;
  if(cr) r+=_bT(cr)+" Crore "; if(lk) r+=_bT(lk)+" Lakh ";
  if(th) r+=_bT(th)+" Thousand "; if(rs) r+=_bT(rs);
  return "Rupees "+r.trim()+" Only";
}

// ─── PDF Generator ────────────────────────────────────────────────────────────
function generateB2BPDF(bill: B2BBill, company: B2BCompany) {
  const biz = getBusinessInfo();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const BLACK   = [0,0,0] as const;
  const DARK    = [26,26,26] as const;
  const CHAR    = [51,51,51] as const;
  const MGRAY   = [102,102,102] as const;
  const LGRAY   = [245,245,245] as const;
  const DGRAY   = [218,218,218] as const;
  const DBOR    = [68,68,68] as const;
  const WHITE   = [255,255,255] as const;

  const PW=210, ML=15, CW=PW-ML-ML;
  let y = 15;

  const rule = (yy: number, lw=0.3, col: readonly [number,number,number]=DBOR) => {
    doc.setDrawColor(...col); doc.setLineWidth(lw); doc.line(ML, yy, ML+CW, yy);
  };

  // Header
  doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.setTextColor(...BLACK);
  doc.text(biz.name.toUpperCase(), ML, y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...CHAR);
  doc.text(biz.address, ML, y+16);
  doc.text(`Tel: ${biz.phone}   |   Email: ${biz.email}`, ML, y+21);
  doc.text(`Website: ${biz.website}   |   GSTIN: ${biz.gstin}`, ML, y+26);
  doc.setFont("helvetica","bold"); doc.setFontSize(15); doc.setTextColor(...BLACK);
  doc.text("PROFORMA INVOICE", PW-ML, y+9, { align:"right" });
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(`Invoice No.  :  ${bill.bill_no}`, PW-ML, y+18, { align:"right" });
  doc.text(`Date         :  ${bill.date}`, PW-ML, y+24, { align:"right" });
  y += 32; rule(y, 0.6, BLACK); y += 7;

  // Bill To + Trip Info
  const halfW = CW/2 - 4;
  const btH = company.address ? 46 : 36;
  doc.setDrawColor(...DBOR); doc.setLineWidth(0.3);
  doc.rect(ML, y, halfW, btH, "S");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
  doc.text("BILL TO", ML+3, y+6);
  doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...BLACK);
  doc.text(company.business_name, ML+3, y+14);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  if (company.phone) doc.text(`Phone  :  ${company.phone}`, ML+3, y+21);
  if (company.address) {
    const addr = company.address.length > 40 ? company.address.substring(0,38)+"…" : company.address;
    doc.text(`Addr   :  ${addr}`, ML+3, y+(company.phone ? 28 : 21));
  }
  if (company.gstin) doc.text(`GSTIN  :  ${company.gstin}`, ML+3, y+37);

  const rx = ML+halfW+8, rw = CW-halfW-8;
  doc.setDrawColor(...DBOR); doc.rect(rx, y, rw, Math.max(btH,36), "S");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
  doc.text("TRIP INFO", rx+3, y+6);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  doc.text(`Type     :  ${bill.bill_type.toUpperCase()}`, rx+3, y+13);
  if (bill.vehicle_type)   doc.text(`Veh Type :  ${bill.vehicle_type}`, rx+3, y+20);
  if (bill.vehicle_number) doc.text(`Veh No   :  ${bill.vehicle_number}`, rx+3, y+27);
  if (bill.bill_type === "local" && bill.trip_sheet_number)
    doc.text(`Trip Sheet:  ${bill.trip_sheet_number}`, rx+3, y+34);
  y += Math.max(btH,36) + 7;
  rule(y, 0.3); y += 8;

  // Charges table
  const C1={x:ML,w:72}, C2={x:ML+72,w:72}, C3={x:ML+144,w:36};
  const RH = 7;
  doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...BLACK);
  doc.text("FARE DETAILS", ML, y); y += 6;
  doc.setFillColor(...DGRAY); doc.rect(ML, y, CW, RH, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...BLACK);
  doc.text("DESCRIPTION", C1.x+2, y+5);
  doc.text("DETAILS",     C2.x+2, y+5);
  doc.text("AMOUNT (Rs.)", C3.x+C3.w-2, y+5, { align:"right" });
  const hdrY = y; y += RH;

  type Row = [string, string, number];
  const rows: Row[] = [];
  if (bill.bill_type === "local") {
    if ((bill.base_slab_amount??0) > 0) rows.push(["8Hrs / 80KM Base Slab","Agreed base rate",bill.base_slab_amount!]);
    if ((bill.extra_km??0) > 0) rows.push(["Extra KM",`${bill.extra_km} km × Rs.${bill.per_km_cost??0}/km`,bill.extra_km_cost??0]);
    if ((bill.extra_hrs??0) > 0) rows.push(["Extra Hours",`${bill.extra_hrs} hrs charge`,bill.extra_hrs_cost??0]);
    if ((bill.toll??0) > 0) rows.push(["Toll Charges","Toll & road tax",bill.toll!]);
  } else {
    if ((bill.total_running_km??0) > 0) rows.push(["Distance",`${bill.total_running_km} km × Rs.${bill.per_km_cost_out??0}/km`,bill.total_cost??0]);
    if ((bill.bata??0) > 0) rows.push(["Bata (Driver Allowance)","Per-day allowance",bill.bata!]);
    if ((bill.toll_charges??0) > 0) rows.push(["Toll Charges","Toll & road tax",bill.toll_charges!]);
  }
  rows.forEach(([desc, detail, amt], i) => {
    if (i%2===1) { doc.setFillColor(...LGRAY); doc.rect(ML, y, CW, RH, "F"); }
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
    doc.text(desc, C1.x+2, y+5);
    const ds = detail.length>41 ? detail.substring(0,39)+"…" : detail;
    doc.text(ds, C2.x+2, y+5);
    doc.text(amt.toLocaleString("en-IN"), C3.x+C3.w-2, y+5, { align:"right" });
    y += RH;
  });

  // Grand total from stored DB value — never recalculated
  const grossAmt = bill.bill_type === "local" ? (bill.total_amount??0) : (bill.grand_total??0);
  doc.setFillColor(...DGRAY); doc.rect(ML, y, CW, RH+1, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("GRAND TOTAL", C1.x+2, y+5.5);
  doc.text(grossAmt.toLocaleString("en-IN"), C3.x+C3.w-2, y+5.5, { align:"right" });
  y += RH+1;
  doc.setDrawColor(...DBOR); doc.setLineWidth(0.4);
  doc.rect(ML, hdrY, CW, y-hdrY, "S");
  doc.line(C2.x, hdrY, C2.x, y); doc.line(C3.x, hdrY, C3.x, y);
  y += 10;

  // Bank + Summary
  const secTop = y, bankW = CW/2-4, BANK_H=40;
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...MGRAY);
  doc.text("BANK DETAILS", ML, y+5);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  doc.text(`Account Name  :  ${biz.account_holder_name}`, ML, y+13);
  doc.text(`Bank Name     :  ${biz.bank_name}`,            ML, y+20);
  doc.text(`Account No.   :  ${biz.account_number}`,       ML, y+27);
  doc.text(`IFSC Code     :  ${biz.ifsc_code}`,            ML, y+34);

  const totX=ML+bankW+8, totW=CW-bankW-8;
  const HDR_H=8, SR_H=8, NET_H=11, boxH=HDR_H+SR_H+NET_H;
  doc.setDrawColor(...DBOR); doc.setLineWidth(0.4);
  doc.rect(totX, y, totW, boxH, "S");
  doc.setFillColor(...DGRAY); doc.rect(totX, y, totW, HDR_H, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text("INVOICE SUMMARY", totX+3, y+5.5);
  let sy = y+HDR_H;
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  doc.text("Net Payable", totX+3, sy+5.5);
  doc.text(`Rs. ${grossAmt.toLocaleString("en-IN")}`, totX+totW-3, sy+5.5, { align:"right" });
  doc.setDrawColor(...DGRAY); doc.setLineWidth(0.3);
  doc.line(totX, sy+SR_H, totX+totW, sy+SR_H); sy += SR_H;
  doc.setFillColor(...DARK); doc.rect(totX, sy, totW, NET_H, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...WHITE);
  doc.text("NET PAYABLE", totX+3, sy+7.5);
  doc.text(`Rs. ${grossAmt.toLocaleString("en-IN")}`, totX+totW-3, sy+7.5, { align:"right" });
  y = secTop + Math.max(BANK_H, boxH) + 8;

  const words = numberToWords(grossAmt);
  doc.setFont("helvetica","italic"); doc.setFontSize(8.5); doc.setTextColor(...CHAR);
  const sw = doc.splitTextToSize(`In Words: ${words}`, CW);
  doc.text(sw, ML, y); y += (sw.length * 5) + 10;

  // T&C
  rule(y, 0.3); y += 5;
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
  doc.text("TERMS & CONDITIONS", ML, y); y += 5;
  const terms = [
    "1. Payment due within 7 working days from the invoice date.",
    "2. All disputes are subject to the jurisdiction of courts in Bangalore, Karnataka only.",
    `3. Cheques / DDs to be drawn in favour of "${biz.name}".`,
    "4. This is a system-generated proforma invoice.",
  ];
  doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...MGRAY);
  terms.forEach(t => { doc.text(t, ML, y); y += 4.5; }); y += 6;

  // Signatory
  const sigX = ML+CW-68;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
  doc.text("Signature : ________________________", sigX, y); y += 12;
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text("Authorised Signatory", sigX+34, y, { align:"center" }); y += 5;
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
  doc.text(`For ${biz.name}`, sigX+34, y, { align:"center" });

  doc.setDrawColor(...DBOR); doc.setLineWidth(0.5);
  doc.rect(8, 8, PW-16, 281, "S");

  const safeCo = company.business_name.replace(/\s+/g,"_").substring(0,20);
  doc.save(`B2B_${bill.bill_no.replace("/","_")}_${safeCo}.pdf`);
}

function generateSummaryPDF(summary: any, dateRangeStr: string) {
  const biz = summary.our_company?.name ? summary.our_company : getBusinessInfo();
  const company = summary.b2b_company;
  const grossAmt = summary.total_amount || 0;
  
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  const BLACK   = [0,0,0] as const;
  const DARK    = [26,26,26] as const;
  const CHAR    = [51,51,51] as const;
  const MGRAY   = [102,102,102] as const;
  const LGRAY   = [245,245,245] as const;
  const DGRAY   = [218,218,218] as const;
  const DBOR    = [68,68,68] as const;

  const PW=210, ML=15, CW=PW-ML-ML;
  let y = 15;

  const rule = (yy: number, lw=0.3, col: readonly [number,number,number]=DBOR) => {
    doc.setDrawColor(...col); doc.setLineWidth(lw); doc.line(ML, yy, ML+CW, yy);
  };

  // Header
  doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.setTextColor(...BLACK);
  doc.text((biz.name || "").toUpperCase(), ML, y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...CHAR);
  if (biz.gstin) doc.text(`GSTIN: ${biz.gstin}`, ML, y+16);
  
  doc.setFont("helvetica","bold"); doc.setFontSize(15); doc.setTextColor(...BLACK);
  doc.text("BILLING SUMMARY", PW-ML, y+9, { align:"right" });
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(`Date : ${new Date().toLocaleDateString("en-IN")}`, PW-ML, y+18, { align:"right" });
  
  y += 24; rule(y, 0.6, BLACK); y += 7;

  // Bill To
  doc.setDrawColor(...DBOR); doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, 30, "S");
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
  doc.text("CLIENT / BILL TO", ML+3, y+6);
  doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...BLACK);
  doc.text(company.business_name || "", ML+3, y+14);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  if (company.gstin) doc.text(`GSTIN : ${company.gstin}`, ML+3, y+21);
  doc.text(`Period : ${dateRangeStr}`, ML+3, y+27);
  y += 38;

  // Vehicle Breakdown Table
  if (summary.vehicle_breakdown && summary.vehicle_breakdown.length > 0) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...BLACK);
    doc.text("VEHICLE BREAKDOWN", ML, y); y += 6;
    
    const V_RH = 7;
    const vC1 = {x:ML, w: 45};
    const vC2 = {x:ML+45, w: 45};
    const vC3 = {x:ML+90, w: 40};
    const vC4 = {x:ML+130, w: CW-130};
    
    doc.setFillColor(...DGRAY); doc.rect(ML, y, CW, V_RH, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...BLACK);
    doc.text("VEHICLE NUMBER", vC1.x+2, y+5);
    doc.text("VEHICLE TYPE", vC2.x+2, y+5);
    doc.text("TOTAL KM", vC3.x+vC3.w-2, y+5, { align:"right" });
    doc.text("TOTAL AMOUNT (Rs.)", vC4.x+vC4.w-2, y+5, { align:"right" });
    const vHdrY = y; y += V_RH;

    summary.vehicle_breakdown.forEach((v: any, i: number) => {
      if (i%2===1) { doc.setFillColor(...LGRAY); doc.rect(ML, y, CW, V_RH, "F"); }
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
      doc.text(v.vehicle_number, vC1.x+2, y+5);
      doc.text(v.vehicle_type, vC2.x+2, y+5);
      doc.text(v.total_km.toString(), vC3.x+vC3.w-2, y+5, { align:"right" });
      doc.text(v.total_amount.toLocaleString("en-IN"), vC4.x+vC4.w-2, y+5, { align:"right" });
      y += V_RH;
    });

    doc.setDrawColor(...DBOR); doc.setLineWidth(0.4);
    doc.rect(ML, vHdrY, CW, y-vHdrY, "S");
    doc.line(vC2.x, vHdrY, vC2.x, y);
    doc.line(vC3.x, vHdrY, vC3.x, y);
    doc.line(vC4.x, vHdrY, vC4.x, y);
    y += 10;
  }

  // Grand total section
  const RH = 12;
  doc.setFillColor(...DGRAY); doc.rect(ML, y, CW, RH, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...BLACK);
  doc.text(`TOTAL AMOUNT (${summary.bill_count} Bills)`, ML+4, y+8);
  doc.text(`Rs. ${grossAmt.toLocaleString("en-IN")}`, ML+CW-4, y+8, { align:"right" });
  doc.setDrawColor(...DBOR); doc.setLineWidth(0.4);
  doc.rect(ML, y, CW, RH, "S");
  y += RH + 6;

  const words = numberToWords(grossAmt);
  doc.setFont("helvetica","italic"); doc.setFontSize(9); doc.setTextColor(...CHAR);
  const sw = doc.splitTextToSize(`In Words: ${words}`, CW);
  doc.text(sw, ML, y); y += (sw.length * 5) + 8;
  
  // Signatory
  const sigX = ML+CW-68;
  y += 20;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
  doc.text("Signature : ________________________", sigX, y); y += 12;
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text("Authorised Signatory", sigX+34, y, { align:"center" }); y += 5;
  if (biz.name) {
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...MGRAY);
    doc.text(`For ${biz.name}`, sigX+34, y, { align:"center" });
  }

  doc.setDrawColor(...DBOR); doc.setLineWidth(0.5);
  doc.rect(8, 8, PW-16, y - 8 + 10, "S");

  const safeCo = (company.business_name || "Company").replace(/\s+/g,"_").substring(0,20);
  const safeDate = dateRangeStr.replace(/\s+/g, "").replace(/–/g,"_").replace(/-/g,"_").replace(/\//g,"_");
  doc.save(`Summary_${safeCo}_${safeDate}.pdf`);
}


// ─── Defaults ─────────────────────────────────────────────────────────────────
const emptyLocal = {
  date:"", vehicle_number:"", vehicle_type:"", trip_sheet_number:"",
  base_slab_amount:0, extra_km:0, per_km_cost:0, extra_hrs:0, extra_hrs_cost:0, toll:0,
};
const emptyOutstation = {
  date:"", vehicle_number:"", vehicle_type:"",
  total_running_km:0, per_km_cost_out:0, bata:0, toll_charges:0,
};
const VEH = ["Sedan","SUV","Innova","Innova Crysta","Tempo Traveller","Mini Bus","Bus","Other"];

// ─── Shared CSS helpers ────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
const labelCls = "text-xs font-medium text-gray-500 block mb-1";
const thCls    = "px-3 py-2.5 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap text-left";
const tdCls    = "px-3 py-3 text-xs text-gray-700 whitespace-nowrap";

// ══════════════════════════════════════════════════════════════════════════════
// Sub-component: Local Bills Table
// ══════════════════════════════════════════════════════════════════════════════
const LocalTable = ({
  bills, company, onDelete,
}: { bills: B2BBill[]; company: B2BCompany; onDelete:(id:string)=>void }) => {
  const total = bills.reduce((s,b) => s + (b.total_amount??0), 0);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">LOCAL</span>
        <span className="text-xs text-gray-400">{bills.length} bill{bills.length!==1?"s":""}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm">
        <table className="w-full text-left text-sm bg-white">
          <thead className="bg-blue-50 border-b border-blue-100 text-blue-800">
            <tr>
              <th className={thCls}>SL NO</th>
              <th className={thCls}>DATE</th>
              <th className={thCls}>VEHICLE NUMBER</th>
              <th className={thCls}>VEHICLE TYPE</th>
              <th className={thCls}>TRIP SHEET NO</th>
              <th className={`${thCls} text-right`}>8HRS/80KM RS</th>
              <th className={`${thCls} text-right`}>EXTRA KM</th>
              <th className={`${thCls} text-right`}>PER KM COST</th>
              <th className={`${thCls} text-right`}>EXTRA KM COST</th>
              <th className={`${thCls} text-right`}>EXTRA HRS</th>
              <th className={`${thCls} text-right`}>EXTRA HRS COST</th>
              <th className={`${thCls} text-right`}>TOTAL EXTRA COST</th>
              <th className={`${thCls} text-right`}>TOLL</th>
              <th className={`${thCls} text-right`}>TOTAL AMOUNT</th>
              <th className={`${thCls} text-center`}>ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map((b, idx) => (
              <tr key={b.id} className="hover:bg-blue-50/40 transition-colors">
                <td className={`${tdCls} font-semibold text-gray-500`}>{idx+1}</td>
                <td className={`${tdCls} font-mono`}>{b.date}</td>
                <td className={tdCls}>{b.vehicle_number || "—"}</td>
                <td className={tdCls}>{b.vehicle_type || "—"}</td>
                <td className={tdCls}>{b.trip_sheet_number || "—"}</td>
                <td className={`${tdCls} text-right`}>{(b.base_slab_amount??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{b.extra_km??0}</td>
                <td className={`${tdCls} text-right`}>{b.per_km_cost??0}</td>
                <td className={`${tdCls} text-right`}>{(b.extra_km_cost??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{b.extra_hrs??0}</td>
                <td className={`${tdCls} text-right`}>{(b.extra_hrs_cost??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{(b.total_extra_cost??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{(b.toll??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right font-bold text-gray-900`}>
                  ₹{(b.total_amount??0).toLocaleString("en-IN")}
                </td>
                <td className={`${tdCls} text-center`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => generateB2BPDF(b, company)}
                      title="Download Invoice PDF"
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      title="Delete"
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Summary row */}
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td colSpan={13} className="px-3 py-2.5 text-xs font-bold text-blue-700 text-right uppercase tracking-wide">
                Total ({bills.length} bill{bills.length!==1?"s":""})
              </td>
              <td className="px-3 py-2.5 text-right font-bold text-blue-800 text-sm whitespace-nowrap">
                ₹{total.toLocaleString("en-IN")}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Sub-component: Outstation Bills Table
// ══════════════════════════════════════════════════════════════════════════════
const OutstationTable = ({
  bills, company, onDelete,
}: { bills: B2BBill[]; company: B2BCompany; onDelete:(id:string)=>void }) => {
  const total = bills.reduce((s,b) => s + (b.grand_total??0), 0);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">OUTSTATION</span>
        <span className="text-xs text-gray-400">{bills.length} bill{bills.length!==1?"s":""}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
        <table className="w-full text-left text-sm bg-white">
          <thead className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <tr>
              <th className={thCls}>SL NO</th>
              <th className={thCls}>DATE</th>
              <th className={thCls}>VEHICLE TYPE</th>
              <th className={thCls}>VEHICLE NUMBER</th>
              <th className={`${thCls} text-right`}>TOTAL RUNNING KM</th>
              <th className={`${thCls} text-right`}>PER KM COST</th>
              <th className={`${thCls} text-right`}>TOTAL COST</th>
              <th className={`${thCls} text-right`}>BATA</th>
              <th className={`${thCls} text-right`}>TOLL CHARGES</th>
              <th className={`${thCls} text-right`}>GRAND TOTAL</th>
              <th className={`${thCls} text-center`}>ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map((b, idx) => (
              <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                <td className={`${tdCls} font-semibold text-gray-500`}>{idx+1}</td>
                <td className={`${tdCls} font-mono`}>{b.date}</td>
                <td className={tdCls}>{b.vehicle_type || "—"}</td>
                <td className={tdCls}>{b.vehicle_number || "—"}</td>
                <td className={`${tdCls} text-right`}>{b.total_running_km??0}</td>
                <td className={`${tdCls} text-right`}>{b.per_km_cost_out??0}</td>
                <td className={`${tdCls} text-right`}>{(b.total_cost??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{(b.bata??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right`}>{(b.toll_charges??0).toLocaleString("en-IN")}</td>
                <td className={`${tdCls} text-right font-bold text-gray-900`}>
                  ₹{(b.grand_total??0).toLocaleString("en-IN")}
                </td>
                <td className={`${tdCls} text-center`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => generateB2BPDF(b, company)}
                      title="Download Invoice PDF"
                      className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      title="Delete"
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-amber-50 border-t-2 border-amber-200">
              <td colSpan={9} className="px-3 py-2.5 text-xs font-bold text-amber-700 text-right uppercase tracking-wide">
                Total ({bills.length} bill{bills.length!==1?"s":""})
              </td>
              <td className="px-3 py-2.5 text-right font-bold text-amber-800 text-sm whitespace-nowrap">
                ₹{total.toLocaleString("en-IN")}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
const B2BBilling = () => {
  const [companies,      setCompanies]     = useState<B2BCompany[]>([]);
  const [bills,          setBills]         = useState<B2BBill[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [toast,          setToast]         = useState<{msg:string;ok:boolean}|null>(null);

  // Filters
  const [selectedCo,    setSelectedCo]    = useState<string>("all");
  const [filterType,    setFilterType]    = useState<"all"|"local"|"outstation">("all");
  const [filterMonth,   setFilterMonth]   = useState<string>("");
  const [filterFrom,    setFilterFrom]    = useState<string>("");
  const [filterTo,      setFilterTo]      = useState<string>("");

  // Modals
  const [showAddCo,     setShowAddCo]     = useState(false);
  const [showBillStep,  setShowBillStep]  = useState<"none"|"choose"|"local"|"outstation">("none");

  // Company form
  const [coForm,        setCoForm]        = useState({ business_name:"", address:"", contact_person:"", phone:"", email:"", gstin:"" });
  const [coSaving,      setCoSaving]      = useState(false);

  // Bill forms
  const [localForm,        setLocalForm]       = useState({ ...emptyLocal });
  const [outstationForm,   setOutstationForm]  = useState({ ...emptyOutstation });
  const [billSaving,       setBillSaving]      = useState(false);
  const [billCompanyId,    setBillCompanyId]   = useState<string>("");

  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg: string, ok=true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCompanies = async (): Promise<B2BCompany[]> => {
    const r = await fetch(`${API}/api/b2b/companies`);
    if (!r.ok) return [];
    const data: B2BCompany[] = await r.json();
    setCompanies(data);
    return data;
  };

  const fetchBills = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (selectedCo !== "all") p.set("company_id", selectedCo);
    if (filterType !== "all") p.set("bill_type", filterType);
    if (filterMonth)          p.set("month", filterMonth);
    else {
      if (filterFrom) p.set("from_date", filterFrom);
      if (filterTo)   p.set("to_date",   filterTo);
    }
    const r = await fetch(`${API}/api/b2b/bills?${p}`);
    if (r.ok) setBills(await r.json());
    setLoading(false);
  };

  const handleSubmitBill = async () => {
    const coId = billCompanyId || (selectedCo !== "all" ? selectedCo : "");
    if (!coId) { showToast("Select a company for this bill", false); return; }
    
    setBillSaving(true);
    const payload = showBillStep === "local" 
        ? { bill_type: "local", company_id: coId, ...localForm } 
        : { bill_type: "outstation", company_id: coId, ...outstationForm };

    const r = await fetch(`${API}/api/b2b/bills`, {
      method: "POST",
      headers: authH(),
      body: JSON.stringify(payload)
    });
    setBillSaving(false);

    if (r.ok) {
      showToast("Bill created successfully");
      const savedBill = await r.json();
      const companyInfo = companies.find(c => c.id === coId);
      if (companyInfo) generateB2BPDF(savedBill, companyInfo);
      
      setShowBillStep("none");
      setLocalForm({ ...emptyLocal });
      setOutstationForm({ ...emptyOutstation });
      fetchBills();
    } else {
      showToast("Failed to create bill", false);
    }
  };

  // ── Download Summary ──────────────────────────────────────────────────────
  const handleDownloadSummary = async () => {
    if (selectedCo === "all") return;
    try {
      showToast("Generating summary...");
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("bill_type", filterType);
      if (filterMonth) params.append("month", filterMonth);
      else if (filterFrom) {
        params.append("from_date", filterFrom);
        if (filterTo) params.append("to_date", filterTo);
      }
      const r = await fetch(`${API}/api/b2b/companies/${selectedCo}/summary?${params.toString()}`, {
        headers: authH()
      });
      if (!r.ok) throw new Error("Failed to fetch summary");
      const data = await r.json();
      
      let dr = "All Time";
      if (filterMonth) dr = filterMonth;
      else if (filterFrom && filterTo) dr = `${filterFrom} to ${filterTo}`;
      else if (filterFrom) dr = `From ${filterFrom}`;
      
      generateSummaryPDF(data, dr);
    } catch (e) {
      showToast("Failed to generate summary", false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBills(); }, [selectedCo, filterType, filterMonth, filterFrom, filterTo]);

  // ── Live calc previews ───────────────────────────────────────────────────
  const localCalc = {
    extra_km_cost: localForm.extra_km * localForm.per_km_cost,
    total_extra:   localForm.extra_km * localForm.per_km_cost + localForm.extra_hrs_cost,
    total_amount:  localForm.base_slab_amount + localForm.extra_km * localForm.per_km_cost + localForm.extra_hrs_cost + localForm.toll,
  };
  const outCalc = {
    total_cost:  outstationForm.total_running_km * outstationForm.per_km_cost_out,
    grand_total: outstationForm.total_running_km * outstationForm.per_km_cost_out + outstationForm.bata + outstationForm.toll_charges,
  };

  // ── Add Company — auto-selects the new company on save ───────────────────
  const handleAddCompany = async () => {
    if (!coForm.business_name.trim()) return;
    setCoSaving(true);
    const r = await fetch(`${API}/api/b2b/companies`, {
      method:"POST", headers: authH(),
      body: JSON.stringify(coForm),
    });
    setCoSaving(false);
    if (!r.ok) { showToast("Failed to add company", false); return; }
    const newCo: B2BCompany = await r.json();
    showToast("Company added!");
    setCoForm({ business_name:"", address:"", contact_person:"", phone:"", email:"", gstin:"" });
    setShowAddCo(false);
    await fetchCompanies();          // refresh list
    setSelectedCo(newCo.id);         // ← auto-select the new company
  };

  // ── Delete Bill ──────────────────────────────────────────────────────────
  const handleDeleteBill = async (id: string) => {
    if (!confirm("Delete this bill permanently?")) return;
    const r = await fetch(`${API}/api/b2b/bills/${id}`, { method:"DELETE", headers: authH() });
    if (r.ok) { showToast("Bill deleted"); fetchBills(); }
    else showToast("Delete failed", false);
  };



  // ── Derived data ─────────────────────────────────────────────────────────
  const selectedCompany = companies.find(c => c.id === selectedCo);
  const localBills      = bills.filter(b => b.bill_type === "local");
  const outstationBills = bills.filter(b => b.bill_type === "outstation");
  const grandSum        = bills.reduce((s,b) => s + (b.bill_type==="local" ? (b.total_amount??0) : (b.grand_total??0)), 0);

  // "All companies" view uses a plain mixed table
  const billAmount = (b: B2BBill) => b.bill_type === "local" ? (b.total_amount??0) : (b.grand_total??0);
  const coName     = (b: B2BBill) => b.b2b_companies?.business_name ?? companies.find(c=>c.id===b.company_id)?.business_name ?? "—";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-white text-sm font-medium ${toast.ok ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"}`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-5 flex items-center gap-3">
          {selectedCo !== "all" && (
            <button
              onClick={() => setSelectedCo("all")}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
              title="Back to all companies"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              {selectedCompany ? selectedCompany.business_name : "B2B Billing"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedCompany
                ? `Viewing bills for ${selectedCompany.business_name}`
                : "Generate proforma invoices for corporate & travel-partner clients"}
            </p>
          </div>
        </div>

        {/* ── Company Selector + Add ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-4 flex items-center gap-3 flex-wrap">
          <Building2 className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCo}
            onChange={e => setSelectedCo(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.business_name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddCo(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Company
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3.5 mb-4 flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Month</label>
            <input type="month" value={filterMonth}
              onChange={e => { setFilterMonth(e.target.value); setFilterFrom(""); setFilterTo(""); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">From</label>
            <input type="date" value={filterFrom}
              onChange={e => { setFilterFrom(e.target.value); setFilterMonth(""); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="text-xs font-medium text-gray-500">To</label>
            <input type="date" value={filterTo}
              onChange={e => { setFilterTo(e.target.value); setFilterMonth(""); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["all","local","outstation"] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${filterType===t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >{t}</button>
            ))}
          </div>
          {(filterMonth || filterFrom || filterTo || filterType !== "all") && (
            <button onClick={() => { setFilterMonth(""); setFilterFrom(""); setFilterTo(""); setFilterType("all"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* ══ DETAIL VIEW: specific company selected ══ */}
        {selectedCo !== "all" && selectedCompany ? (
          <div>
            {/* Company info card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base">{selectedCompany.business_name}</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-1">
                  {selectedCompany.contact_person && <span className="text-xs text-gray-500">👤 {selectedCompany.contact_person}</span>}
                  {selectedCompany.phone && <span className="text-xs text-gray-500">📞 {selectedCompany.phone}</span>}
                  {selectedCompany.email && <span className="text-xs text-gray-500">✉️ {selectedCompany.email}</span>}
                  {selectedCompany.gstin  && <span className="text-xs text-gray-500 font-mono">GST: {selectedCompany.gstin}</span>}
                  {selectedCompany.address && <span className="text-xs text-gray-400 italic">{selectedCompany.address}</span>}
                </div>
              </div>
              {/* Summary chips */}
              <div className="flex gap-3 shrink-0">
                <div className="text-center px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="text-lg font-bold text-indigo-700">{bills.length}</div>
                  <div className="text-[10px] text-indigo-500 font-medium">Bills</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-100">
                  <div className="text-lg font-bold text-green-700 flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />{grandSum.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-green-500 font-medium">Total Billed</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Loading bills…
              </div>
            ) : bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                <span className="text-4xl">🧾</span>
                <p className="font-medium mt-1">No bills yet for this company</p>
                <p className="text-xs">Use "Add New Bill" below to create one</p>
              </div>
            ) : (
              <>
                {/* Split tables */}
                {(filterType === "all" || filterType === "local") && localBills.length > 0 && (
                  <LocalTable bills={localBills} company={selectedCompany} onDelete={handleDeleteBill} />
                )}
                {(filterType === "all" || filterType === "outstation") && outstationBills.length > 0 && (
                  <OutstationTable bills={outstationBills} company={selectedCompany} onDelete={handleDeleteBill} />
                )}

                {/* Grand summary */}
                {filterType === "all" && localBills.length > 0 && outstationBills.length > 0 && (
                  <div className="flex justify-end mb-6">
                    <button 
                      onClick={handleDownloadSummary}
                      title="Download Summary Statement"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-4 shadow-md transition-colors text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium opacity-80">Grand Total ({bills.length} bills)</span>
                        <span className="text-[10px] opacity-60">Click to download statement</span>
                      </div>
                      <div className="flex items-center gap-2 border-l border-indigo-500/50 pl-4 ml-2">
                        <span className="text-xl font-bold">₹{grandSum.toLocaleString("en-IN")}</span>
                        <Download className="w-4 h-4 opacity-80 ml-1" />
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        ) : (
          /* ══ ALL COMPANIES VIEW: generic mixed table ══ */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">All Bills</h2>
              <span className="text-xs text-gray-400">{bills.length} record{bills.length!==1?"s":""}</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Loading…
              </div>
            ) : bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                <span className="text-4xl">🧾</span>
                <p className="font-medium mt-2">No bills yet</p>
                <p className="text-xs">Select a company or use "Add New Bill"</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs">
                      <th className="px-5 py-3 font-medium">Bill No.</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Vehicle No.</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-5 py-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bills.map(b => {
                      const co = companies.find(c=>c.id===b.company_id) ?? { id:b.company_id, business_name: coName(b) };
                      return (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800">
                            <button
                              onClick={() => setSelectedCo(b.company_id)}
                              className="hover:text-indigo-600 transition-colors"
                              title="View this company's bills"
                            >
                              {b.bill_no}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{b.date}</td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedCo(b.company_id)}
                              className="font-medium text-gray-800 text-xs hover:text-indigo-600 transition-colors"
                            >
                              {coName(b)}
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.bill_type==="local" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {b.bill_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 text-xs">{b.vehicle_number||"—"}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                            ₹{billAmount(b).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => generateB2BPDF(b, co)}
                                title="Download PDF"
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBill(b.id)}
                                title="Delete"
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Add New Bill Button ── */}
        <button
          onClick={() => setShowBillStep("choose")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Bill
        </button>

      </div>{/* /max-w */}

      {/* ════ Modal: Add New Company ════ */}
      {showAddCo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Add B2B Company
              </h2>
              <button onClick={() => setShowAddCo(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Business Name *</label>
                <input className={inputCls} placeholder="e.g. Sun Travels" value={coForm.business_name}
                  onChange={e => setCoForm(p=>({...p, business_name:e.target.value}))} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <textarea rows={2} className={inputCls} placeholder="Full address" value={coForm.address}
                  onChange={e => setCoForm(p=>({...p, address:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Contact Person</label>
                  <input className={inputCls} placeholder="Name" value={coForm.contact_person}
                    onChange={e => setCoForm(p=>({...p, contact_person:e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} placeholder="+91 XXXXX XXXXX" value={coForm.phone}
                    onChange={e => setCoForm(p=>({...p, phone:e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email (optional)</label>
                  <input type="email" className={inputCls} placeholder="email@example.com" value={coForm.email}
                    onChange={e => setCoForm(p=>({...p, email:e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>GSTIN (optional)</label>
                  <input className={`${inputCls} font-mono uppercase`} placeholder="29ABCDE1234F1Z5" value={coForm.gstin}
                    onChange={e => setCoForm(p=>({...p, gstin:e.target.value.toUpperCase()}))} />
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowAddCo(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAddCompany} disabled={coSaving || !coForm.business_name.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {coSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Modal: Choose Bill Type ════ */}
      {showBillStep === "choose" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Select Bill Type</h2>
              <button onClick={() => setShowBillStep("none")} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-6 space-y-3">
              <div>
                <label className={labelCls}>Select Company *</label>
                <select value={billCompanyId || (selectedCo !== "all" ? selectedCo : "")}
                  onChange={e => setBillCompanyId(e.target.value)} className={inputCls}>
                  <option value="">— Choose a company —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                </select>
              </div>
              <button onClick={() => setShowBillStep("local")}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors group">
                <div className="text-left">
                  <div className="font-semibold text-sm">Local Trip</div>
                  <div className="text-xs text-blue-600 mt-0.5">8Hrs/80KM slab · Extra KM/Hrs · Toll</div>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => setShowBillStep("outstation")}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors group">
                <div className="text-left">
                  <div className="font-semibold text-sm">Outstation Trip</div>
                  <div className="text-xs text-amber-600 mt-0.5">Total KM · Per KM cost · Bata · Toll</div>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Modal: Local Bill Form ════ */}
      {showBillStep === "local" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-blue-50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Local Trip Bill</h2>
                <p className="text-xs text-blue-600 mt-0.5">8Hrs/80KM slab-based billing</p>
              </div>
              <button onClick={() => setShowBillStep("choose")} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date *</label>
                  <input type="date" className={inputCls} value={localForm.date}
                    onChange={e => setLocalForm(p=>({...p, date:e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>Vehicle Number</label>
                  <input className={inputCls} placeholder="KA 01 AB 1234" value={localForm.vehicle_number}
                    onChange={e => setLocalForm(p=>({...p, vehicle_number:e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Vehicle Type</label>
                  <select className={inputCls} value={localForm.vehicle_type}
                    onChange={e => setLocalForm(p=>({...p, vehicle_type:e.target.value}))}>
                    <option value="">— Select —</option>
                    {VEH.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Trip Sheet Number</label>
                  <input className={inputCls} placeholder="Sheet #" value={localForm.trip_sheet_number}
                    onChange={e => setLocalForm(p=>({...p, trip_sheet_number:e.target.value}))} />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Base Slab</p>
                <div>
                  <label className={labelCls}>8Hrs / 80KM Rate (Rs.)</label>
                  <input type="number" min="0" className={inputCls} value={localForm.base_slab_amount||""} placeholder="0"
                    onChange={e => setLocalForm(p=>({...p, base_slab_amount:+e.target.value}))} />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Extra KM</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Extra KM</label>
                    <input type="number" min="0" className={inputCls} value={localForm.extra_km||""} placeholder="0"
                      onChange={e => setLocalForm(p=>({...p, extra_km:+e.target.value}))} />
                  </div>
                  <div>
                    <label className={labelCls}>Per KM Cost (Rs.)</label>
                    <input type="number" min="0" className={inputCls} value={localForm.per_km_cost||""} placeholder="0"
                      onChange={e => setLocalForm(p=>({...p, per_km_cost:+e.target.value}))} />
                  </div>
                  <div>
                    <label className={labelCls}>Extra KM Cost (auto)</label>
                    <input readOnly className={`${inputCls} bg-indigo-50 text-indigo-700 font-semibold cursor-not-allowed`}
                      value={`Rs. ${localCalc.extra_km_cost.toLocaleString("en-IN")}`} />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Extra Hours</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Extra Hours</label>
                    <input type="number" min="0" className={inputCls} value={localForm.extra_hrs||""} placeholder="0"
                      onChange={e => setLocalForm(p=>({...p, extra_hrs:+e.target.value}))} />
                  </div>
                  <div>
                    <label className={labelCls}>Extra Hours Total Cost (Rs.)</label>
                    <input type="number" min="0" className={inputCls} value={localForm.extra_hrs_cost||""} placeholder="0"
                      onChange={e => setLocalForm(p=>({...p, extra_hrs_cost:+e.target.value}))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Toll (Rs.)</label>
                  <input type="number" min="0" className={inputCls} value={localForm.toll||""} placeholder="0"
                    onChange={e => setLocalForm(p=>({...p, toll:+e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>Total Extra Cost (auto)</label>
                  <input readOnly className={`${inputCls} bg-indigo-50 text-indigo-700 font-semibold cursor-not-allowed`}
                    value={`Rs. ${localCalc.total_extra.toLocaleString("en-IN")}`} />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white rounded-xl">
                <span className="font-semibold text-sm">Total Amount</span>
                <span className="font-bold text-lg">₹{localCalc.total_amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowBillStep("choose")} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Back</button>
              <button onClick={handleSubmitBill} disabled={billSaving || !localForm.date}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {billSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Modal: Outstation Bill Form ════ */}
      {showBillStep === "outstation" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-amber-50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Outstation Trip Bill</h2>
                <p className="text-xs text-amber-600 mt-0.5">Per-KM billing with bata & toll</p>
              </div>
              <button onClick={() => setShowBillStep("choose")} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date *</label>
                  <input type="date" className={inputCls} value={outstationForm.date}
                    onChange={e => setOutstationForm(p=>({...p, date:e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>Vehicle Number</label>
                  <input className={inputCls} placeholder="KA 01 AB 1234" value={outstationForm.vehicle_number}
                    onChange={e => setOutstationForm(p=>({...p, vehicle_number:e.target.value}))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Vehicle Type</label>
                <select className={inputCls} value={outstationForm.vehicle_type}
                  onChange={e => setOutstationForm(p=>({...p, vehicle_type:e.target.value}))}>
                  <option value="">— Select —</option>
                  {VEH.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distance Charges</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Total Running KM</label>
                    <input type="number" min="0" className={inputCls} value={outstationForm.total_running_km||""} placeholder="0"
                      onChange={e => setOutstationForm(p=>({...p, total_running_km:+e.target.value}))} />
                  </div>
                  <div>
                    <label className={labelCls}>Per KM Cost (Rs.)</label>
                    <input type="number" min="0" className={inputCls} value={outstationForm.per_km_cost_out||""} placeholder="0"
                      onChange={e => setOutstationForm(p=>({...p, per_km_cost_out:+e.target.value}))} />
                  </div>
                  <div>
                    <label className={labelCls}>Total KM Cost (auto)</label>
                    <input readOnly className={`${inputCls} bg-amber-50 text-amber-700 font-semibold cursor-not-allowed`}
                      value={`Rs. ${outCalc.total_cost.toLocaleString("en-IN")}`} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bata (Driver Allowance, Rs.)</label>
                  <input type="number" min="0" className={inputCls} value={outstationForm.bata||""} placeholder="0"
                    onChange={e => setOutstationForm(p=>({...p, bata:+e.target.value}))} />
                </div>
                <div>
                  <label className={labelCls}>Toll Charges (Rs.)</label>
                  <input type="number" min="0" className={inputCls} value={outstationForm.toll_charges||""} placeholder="0"
                    onChange={e => setOutstationForm(p=>({...p, toll_charges:+e.target.value}))} />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-amber-600 text-white rounded-xl">
                <span className="font-semibold text-sm">Grand Total</span>
                <span className="font-bold text-lg">₹{outCalc.grand_total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowBillStep("choose")} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Back</button>
              <button onClick={handleSubmitBill} disabled={billSaving || !outstationForm.date}
                className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {billSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default B2BBilling;
