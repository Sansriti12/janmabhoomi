"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  CreditCard,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Shield,
  IndianRupee,
} from "lucide-react";

interface PaymentTransaction {
  id: string;
  razorpayPaymentId: string;
  subscriberName: string;
  subscriberEmail: string;
  publicationName: string;
  planName: string;
  amountInr: number;
  paymentMethod: string;
  transactionDate: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
}

const SAMPLE_TRANSACTIONS: PaymentTransaction[] = [
  { id: "tx-501", razorpayPaymentId: "pay_Op98X2aJkl1m", subscriberName: "Bhupendra K. Vora", subscriberEmail: "vora.bhupendra@gmail.com", publicationName: "Janmabhoomi", planName: "Annual Digital + E-Paper", amountInr: 1499, paymentMethod: "UPI (Google Pay)", transactionDate: "15-01-2026 10:14 am", status: "SUCCESS" },
  { id: "tx-502", razorpayPaymentId: "pay_Op87Y1bMnk2p", subscriberName: "Dinesh C. Shah", subscriberEmail: "dcshah.mumbai@yahoo.com", publicationName: "Janmabhoomi Pravasi", planName: "Annual Print + E-Paper", amountInr: 1800, paymentMethod: "Credit Card (HDFC)", transactionDate: "01-11-2025 04:32 pm", status: "SUCCESS" },
  { id: "tx-503", razorpayPaymentId: "pay_Op76Z3cOpq3r", subscriberName: "Kirit Govindlal Patel", subscriberEmail: "kiritpatel.ahd@gmail.com", publicationName: "Janmabhoomi", planName: "Half-Yearly E-Paper", amountInr: 799, paymentMethod: "Netbanking (SBI)", transactionDate: "01-03-2026 11:45 am", status: "SUCCESS" },
  { id: "tx-504", razorpayPaymentId: "pay_Op65W4dRs4s", subscriberName: "Rameshchandra Mehta", subscriberEmail: "rcmehta@rediffmail.com", publicationName: "Janmabhoomi", planName: "Quarterly Access", amountInr: 450, paymentMethod: "UPI (PhonePe)", transactionDate: "10-04-2026 02:20 pm", status: "SUCCESS" },
  { id: "tx-505", razorpayPaymentId: "pay_Op54V5eTu5t", subscriberName: "Kantilal G. Sanghavi", subscriberEmail: "sanghavikg@gmail.com", publicationName: "Janmabhoomi Pravasi", planName: "Annual Digital + E-Paper", amountInr: 1499, paymentMethod: "Debit Card (ICICI)", transactionDate: "15-08-2025 09:12 am", status: "SUCCESS" },
  { id: "tx-506", razorpayPaymentId: "pay_Op43U6fVw6u", subscriberName: "Hasmukhbhai Zaveri", subscriberEmail: "hzaveri.jewels@gmail.com", publicationName: "Janmabhoomi", planName: "Lifetime Patron", amountInr: 15000, paymentMethod: "NEFT / Bank Transfer", transactionDate: "01-01-2024 12:00 pm", status: "SUCCESS" },
];

export default function PaymentsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { user } = useStaffAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = SAMPLE_TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.subscriberName.toLowerCase().includes(search.toLowerCase()) ||
      tx.subscriberEmail.toLowerCase().includes(search.toLowerCase()) ||
      tx.razorpayPaymentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? tx.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = SAMPLE_TRANSACTIONS.reduce((acc, t) => acc + t.amountInr, 0);

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Payment ID,Subscriber,Email,Publication,Plan,Amount INR,Method,Date,Status"]
        .concat(
          SAMPLE_TRANSACTIONS.map(
            (t) =>
              `"${t.razorpayPaymentId}","${t.subscriberName}","${t.subscriberEmail}","${t.publicationName}","${t.planName}",${t.amountInr},"${t.paymentMethod}","${t.transactionDate}","${t.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#016BB7]">
              Admin Only
            </span>
            <span className="text-xs text-slate-500">Razorpay Reconciled</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "પેમેન્ટ અને ઇનવોઇસ (Payments & Invoices)" : "Payments & Invoices"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "વાંચકોના સબ્સ્ક્રિપ્શન પેમેન્ટ્સ, રેઝરપે ટ્રાન્ઝેક્શન્સ અને ઓર્ડર હિસાબ"
              : "Financial reconciliation, Razorpay order settlement, and subscriber payment audit."}
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{isGu ? "CSV નિકાસ" : "Export Transactions"}</span>
        </button>
      </div>

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {isGu ? "કુલ એકત્રિત ફી" : "Total Reconciled Revenue"}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">100% Settled via Razorpay</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {isGu ? "સફળ વ્યવહારો" : "Successful Transactions"}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {SAMPLE_TRANSACTIONS.length}
          </div>
          <span className="text-[10px] text-slate-500">Zero chargebacks reported</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {isGu ? "સરેરાશ ઓર્ડર મૂલ્ય" : "Average Order Value"}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ₹{Math.round(totalRevenue / SAMPLE_TRANSACTIONS.length).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-slate-500">Across Janmabhoomi & Pravasi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isGu ? "પેમેન્ટ આઈડી અથવા ગ્રાહક શોધો..." : "Search payment ID, subscriber or email..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#016BB7] bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] bg-white text-slate-900"
          >
            <option value="">{isGu ? "બધી સ્થિતિઓ (All Status)" : "All Status"}</option>
            <option value="SUCCESS">SUCCESS (સફળ)</option>
            <option value="PENDING">PENDING (બાકી)</option>
            <option value="FAILED">FAILED (નિષ્ફળ)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Subscriber</th>
                <th className="py-2.5 px-3">Publication</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#016BB7]">
                    {tx.razorpayPaymentId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{tx.subscriberName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.subscriberEmail}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{tx.publicationName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{tx.planName}</td>
                  <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                    ₹{tx.amountInr.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{tx.paymentMethod}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{tx.transactionDate}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={11} />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}