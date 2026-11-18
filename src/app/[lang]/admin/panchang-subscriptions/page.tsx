"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Search,
  Eye,
  Edit,
  Download,
  X,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

interface PanchangSubscriber {
  id: string;
  jpsNo: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  pincode: string;
  copies?: number;
  deliveryAddress?: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
}

const SAMPLE_PANCHANG_SUBSCRIBERS: PanchangSubscriber[] = [
  { id: "1", jpsNo: "JPS-692765", fullName: "Sudhirkumar Lalitkumar Mehta", email: "sudhirmehta@gmail.com", mobile: "9224181600", city: "Mumbai", pincode: "400007", copies: 2, status: "ACTIVE", deliveryAddress: "Flat 402, Shanti Sadan, Malabar Hill, Mumbai" },
  { id: "2", jpsNo: "JPS-748304", fullName: "Ravi Jitendra Kumar Gandhi", email: "ravipan72@gmail.com", mobile: "09558148127", city: "LUNAWADA", pincode: "389230", copies: 1, status: "ACTIVE", deliveryAddress: "Gandhi Chowk, Main Bazaar, Lunawada, Mahisagar" },
  { id: "3", jpsNo: "JPS-713496", fullName: "Vishal Gandhi", email: "vishalastrologer@gmail.com", mobile: "9872299199", city: "Dist. LUDHIANA", pincode: "141101", copies: 3, status: "ACTIVE", deliveryAddress: "Astrology Centre, Mall Road, Ludhiana" },
  { id: "4", jpsNo: "JPS-215955", fullName: "Ambadas Eknath Gangurde", email: "Ambadasgangurde81@gmail.com", mobile: "9423080952", city: "Pimpalgaon Basvant", pincode: "422209", copies: 1, status: "ACTIVE", deliveryAddress: "Station Road, Pimpalgaon Basvant, Nashik" },
  { id: "5", jpsNo: "JPS-366428", fullName: "Mehul Rajanikant Damania", email: "mehul.damania@hotmail.com", mobile: "09819699427", city: "Mumbai", pincode: "400053", copies: 2, status: "ACTIVE", deliveryAddress: "B-12, Lokhandwala Complex, Andheri West, Mumbai" },
  { id: "6", jpsNo: "JPS-450480", fullName: "Jenal Bharat Busa", email: "jenalbusa@gmail.com", mobile: "9769990026", city: "Mumbai", pincode: "400093", copies: 1, status: "ACTIVE", deliveryAddress: "Poonam Nagar, Mahakali Caves Road, Andheri East" },
  { id: "7", jpsNo: "JPS-995054", fullName: "Utkarsh Mukesh Sanghvi", email: "utkarsh.sanghvi@in.ey.com", mobile: "9820511499", city: "Mumbai", pincode: "400075", copies: 2, status: "ACTIVE", deliveryAddress: "Pant Nagar, Ghatkopar East, Mumbai" },
  { id: "8", jpsNo: "JPS-276052", fullName: "Geetanshu Mukesh Kanakiya", email: "GEETANSHUK9999@GMAIL.COM", mobile: "09420032903", city: "AHMEDNAGAR", pincode: "414001", copies: 1, status: "ACTIVE", deliveryAddress: "Kapada Bazaar, Ahmednagar, Maharashtra" },
  { id: "9", jpsNo: "JPS-626820", fullName: "Omkar S Joshi", email: "ojoshi826@gmail.com", mobile: "7090262657", city: "Bengaluru", pincode: "562123", copies: 1, status: "ACTIVE", deliveryAddress: "5th Block, Jayanagar, Bengaluru, Karnataka" },
  { id: "10", jpsNo: "JPS-263435", fullName: "Rajesh S Shah", email: "rajeshshah91@gmail.com", mobile: "9432141945", city: "Kolkata", pincode: "700020", copies: 2, status: "ACTIVE", deliveryAddress: "Brabourne Road, Burrabazar, Kolkata" },
  { id: "11", jpsNo: "JPS-881204", fullName: "Nilesh Jayantilal Vora", email: "nilesh.vora@rediffmail.com", mobile: "9825012345", city: "Rajkot", pincode: "360001", copies: 1, status: "ACTIVE", deliveryAddress: "Dharmendrasinhji Road, Rajkot" },
  { id: "12", jpsNo: "JPS-542199", fullName: "Kiritbhai Govindlal Patel", email: "kirit.patel@gujaratgas.com", mobile: "9898054321", city: "Ahmedabad", pincode: "380009", copies: 2, status: "ACTIVE", deliveryAddress: "Navrangpura, Ahmedabad" },
];

export default function PanchangSubscriptionsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [subscribers, setSubscribers] = useState<PanchangSubscriber[]>(SAMPLE_PANCHANG_SUBSCRIBERS);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSub, setSelectedSub] = useState<PanchangSubscriber | null>(null);

  const filtered = subscribers.filter(
    (s) =>
      s.jpsNo.toLowerCase().includes(search.toLowerCase()) ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.pincode.includes(search)
  );

  const totalEntries = 229; // Matches legacy total from screenshot
  const displayedEntries = filtered.slice(0, entriesPerPage);

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["JPS No,Full Name,Email,Mobile,City,Pincode,Copies,Status"]
        .concat(
          subscribers.map(
            (s) =>
              `"${s.jpsNo}","${s.fullName}","${s.email}","${s.mobile}","${s.city}","${s.pincode}",${s.copies || 1},"${s.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `panchang-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "પંચાંગ સબ્સ્ક્રિપ્શન (Manage Panchang Subscriptions)" : "Manage Panchang Subscriptions"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "જન્મભૂમિ પંચાંગ અલ્માનેક અને દૈનિક પંચાંગ સબ્સ્ક્રાઇબર ડિરેક્ટરી"
              : "Subscribers, delivery orders, and print dispatch for Janmabhoomi Panchang Almanac."}
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{isGu ? "CSV નિકાસ" : "Export CSV"}</span>
        </button>
      </div>

      {/* Control bar: Show entries & Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Search:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900 w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Table matching Screenshot media_1794810030687_c3995dec.jpg */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">{isGu ? "જેપીએસ નંબર" : "JPS No."}</th>
                <th className="py-2.5 px-4">{isGu ? "પૂરું નામ" : "Full Name"}</th>
                <th className="py-2.5 px-3">{isGu ? "ઇમેઇલ" : "Email"}</th>
                <th className="py-2.5 px-3">{isGu ? "મોબાઇલ" : "Mobile"}</th>
                <th className="py-2.5 px-3">{isGu ? "શહેર" : "City"}</th>
                <th className="py-2.5 px-3">{isGu ? "પિનકોડ" : "Pincode"}</th>
                <th className="py-2.5 px-3 text-right">{isGu ? "ક્રિયાઓ" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedEntries.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#016BB7]">
                    {sub.jpsNo}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{sub.fullName}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{sub.email}</td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{sub.mobile}</td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{sub.city}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{sub.pincode}</td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        title={isGu ? "વિગતો જુઓ" : "View Details"}
                        className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedSub(sub)}
                        title={isGu ? "સંપાદિત કરો" : "Edit Subscriber"}
                        className="p-1 text-slate-600 hover:text-[#016BB7] hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing 1 to {displayedEntries.length} of {totalEntries} entries
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#016BB7] text-white font-semibold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">2</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">3</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">4</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">5</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50">23</button>
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Subscriber Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl relative border border-slate-200">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 mb-3 font-serif">
              {isGu ? "પંચાંગ સબ્સ્ક્રાઇબર વિગતો" : "Panchang Subscriber Details"}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider">JPS Number</span>
                  <span className="font-mono font-bold text-[#016BB7] text-sm">{selectedSub.jpsNo}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedSub.status}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-900 text-sm">{selectedSub.fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Email</span>
                  <span className="text-slate-700">{selectedSub.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mobile</span>
                  <span className="text-slate-700">{selectedSub.mobile}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">City</span>
                  <span className="text-slate-700">{selectedSub.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Pincode</span>
                  <span className="font-mono text-slate-700">{selectedSub.pincode}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Dispatch Address</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-0.5">
                  {selectedSub.deliveryAddress || "N/A"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-[#016BB7] text-white hover:bg-[#015896] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}