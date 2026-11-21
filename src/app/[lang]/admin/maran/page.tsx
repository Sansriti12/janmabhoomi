"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BookMarked,
  Plus,
  Trash2,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";

export interface AdminMaranNotice {
  id: string;
  name: { en: string; gu: string };
  surname: { en: string; gu: string };
  gaam: { en: string; gu: string };
  city: { en: string; gu: string };
  age: number;
  date: string;
  dateLabel: { en: string; gu: string };
  noticeType: { en: string; gu: string };
  venue: { en: string; gu: string };
  time: { en: string; gu: string };
}

const STORAGE_KEY = "janmabhoomi_maran_notices_v1";

const DEFAULT_NOTICES: AdminMaranNotice[] = [
  {
    id: "maran-01",
    name: { en: "Shri Kantilal Harjivan Parekh", gu: "શ્રી કાંતિલાલ હરજીવન પારેખ" },
    surname: { en: "Parekh", gu: "પારેખ" },
    gaam: { en: "Bhavnagar (Sihor)", gu: "ભાવનગર (સિહોર)" },
    city: { en: "Ghatkopar, Mumbai", gu: "ઘાટકોપર, મુંબઈ" },
    age: 82,
    date: "2026-11-21",
    dateLabel: { en: "21 Nov 2026", gu: "૨૧ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Besanu", gu: "બેસણું" },
    venue: {
      en: "Zaverben Popatlal Hall, Ghatkopar (East)",
      gu: "ઝવેરબેન પોપટલાલ હોલ, ઘાટકોપર (પૂર્વ)",
    },
    time: { en: "4:00 PM – 6:00 PM", gu: "સાંજે ૪:૦૦ થી ૬:૦૦" },
  },
  {
    id: "maran-02",
    name: { en: "Smt. Nirmalaben Mansukhlal Shah", gu: "શ્રીમતી નિર્મળાબેન મનસુખલાલ શાહ" },
    surname: { en: "Shah", gu: "શાહ" },
    gaam: { en: "Morbi", gu: "મોરબી" },
    city: { en: "Borivali, Mumbai", gu: "બોરીવલી, મુંબઈ" },
    age: 78,
    date: "2026-11-21",
    dateLabel: { en: "21 Nov 2026", gu: "૨૧ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Prarthana Sabha", gu: "પ્રાર્થના સભા" },
    venue: {
      en: "Saurashtra Patel Samaj Hall, Borivali (West)",
      gu: "સૌરાષ્ટ્ર પટેલ સમાજ હોલ, બોરીવલી (પશ્ચિમ)",
    },
    time: { en: "5:00 PM – 6:30 PM", gu: "સાંજે ૫:૦૦ થી ૬:૩૦" },
  },
  {
    id: "maran-03",
    name: { en: "Shri Devjibhai Karshanbhai Patel", gu: "શ્રી દેવજીભાઈ કરશનભાઈ પટેલ" },
    surname: { en: "Patel", gu: "પટેલ" },
    gaam: { en: "Rajkot (Gondal)", gu: "રાજકોટ (ગોંડલ)" },
    city: { en: "Mulund, Mumbai", gu: "મુલુંડ, મુંબઈ" },
    age: 86,
    date: "2026-11-20",
    dateLabel: { en: "20 Nov 2026", gu: "૨૦ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Besanu", gu: "બેસણું" },
    venue: {
      en: "Kalidas Natyagruh Annex, Mulund (West)",
      gu: "કાલિદાસ નાટ્યગૃહ એનેક્સ, મુલુંડ (પશ્ચિમ)",
    },
    time: { en: "4:30 PM – 6:00 PM", gu: "સાંજે ૪:૩૦ થી ૬:૦૦" },
  },
];

export default function AdminMaranPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [notices, setNotices] = useState<AdminMaranNotice[]>(DEFAULT_NOTICES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [form, setForm] = useState({
    nameEn: "",
    nameGu: "",
    surnameEn: "",
    surnameGu: "",
    gaamEn: "",
    gaamGu: "",
    cityEn: "Mumbai",
    cityGu: "મુંબઈ",
    age: "75",
    date: "2026-11-21",
    noticeTypeEn: "Besanu",
    noticeTypeGu: "બેસણું",
    venueEn: "",
    venueGu: "",
    timeEn: "4:00 PM – 6:00 PM",
    timeGu: "સાંજે ૪:૦૦ થી ૬:૦૦",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotices(parsed);
        }
      }
    } catch {}
  }, []);

  const persist = (next: AdminMaranNotice[]) => {
    setNotices(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn.trim() && !form.nameGu.trim()) return;

    const dateObj = new Date(form.date);
    const dateEn = isNaN(dateObj.getTime())
      ? form.date
      : dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const dateGu = isNaN(dateObj.getTime())
      ? form.date
      : dateObj.toLocaleDateString("gu-IN", { day: "numeric", month: "long", year: "numeric" });

    const newItem: AdminMaranNotice = {
      id: `maran-${Date.now()}`,
      name: { en: form.nameEn || form.nameGu, gu: form.nameGu || form.nameEn },
      surname: { en: form.surnameEn || form.surnameGu, gu: form.surnameGu || form.surnameEn },
      gaam: { en: form.gaamEn || form.gaamGu, gu: form.gaamGu || form.gaamEn },
      city: { en: form.cityEn, gu: form.cityGu },
      age: parseInt(form.age, 10) || 75,
      date: form.date,
      dateLabel: { en: dateEn, gu: dateGu },
      noticeType: { en: form.noticeTypeEn, gu: form.noticeTypeGu },
      venue: { en: form.venueEn || form.venueGu, gu: form.venueGu || form.venueEn },
      time: { en: form.timeEn, gu: form.timeGu },
    };

    persist([newItem, ...notices]);
    setModalOpen(false);
    setForm((prev) => ({
      ...prev,
      nameEn: "",
      nameGu: "",
      surnameEn: "",
      surnameGu: "",
      gaamEn: "",
      gaamGu: "",
      venueEn: "",
      venueGu: "",
    }));
  };

  const handleDelete = (id: string) => {
    persist(notices.filter((n) => n.id !== id));
  };

  const filtered = notices.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.name.en.toLowerCase().includes(q) ||
      n.name.gu.toLowerCase().includes(q) ||
      n.surname.en.toLowerCase().includes(q) ||
      n.gaam.en.toLowerCase().includes(q) ||
      n.gaam.gu.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookMarked className="h-6 w-6 text-[#016BB7]" />
            <span>{isGu ? "મરણ નોંધ અને બેસણું સંચાલન" : "Maran & Besanu Directory Manager"}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isGu
              ? "હોમપેજ પર દેખાતી મરણ નોંધ, બેસણું અને શ્રદ્ધાંજલિ નોંધ અહીંથી ઉમેરો અને અપડેટ કરો."
              : "Manage community obituary, besanu, and prayer meeting notices synced directly to the homepage directory."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#015a99] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{isGu ? "નવી મરણ નોંધ ઉમેરો" : "Add Obituary Notice"}</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{isGu ? "મરણ નોંધ ડિરેક્ટરી સફળતાપૂર્વક અપડેટ થઈ!" : "Maran directory updated and synced to public homepage!"}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isGu ? "નામ, અટક અથવા વતન દ્વારા શોધો..." : "Search by name, surname, or native village (Gaam)..."}
          className="flex-1 text-sm text-slate-800 focus:outline-none"
        />
        <span className="text-xs font-semibold text-slate-500">
          {filtered.length} {isGu ? "નોંધો" : "notices"}
        </span>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <th className="py-3 px-4">{isGu ? "નામ અને ઉંમર" : "Name & Age"}</th>
              <th className="py-3 px-4">{isGu ? "અટક / વતન" : "Surname / Gaam"}</th>
              <th className="py-3 px-4">{isGu ? "પ્રકાર અને તારીખ" : "Type & Date"}</th>
              <th className="py-3 px-4">{isGu ? "સ્થળ અને સમય" : "Venue & Time"}</th>
              <th className="py-3 px-4 text-right">{isGu ? "ક્રિયા" : "Action"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{n.name.en}</p>
                  <p className="text-xs text-slate-500 font-gujarati">{n.name.gu} • Age {n.age}</p>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-800">{n.surname.en} ({n.surname.gu})</p>
                  <p className="text-xs text-[#016BB7] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {n.gaam.en} • {n.city.en}
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block rounded bg-slate-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                    {n.noticeType.en}
                  </span>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {n.dateLabel.en}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                  <p className="font-semibold text-slate-800">{n.venue.en}</p>
                  <p className="text-slate-500 mt-0.5">{n.time.en}</p>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Notice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {isGu ? "નવી મરણ નોંધ / બેસણું ઉમેરો" : "Add New Maran / Besanu Notice"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name (English)</label>
                <input
                  required
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="Shri Rameshbhai Patel"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name (Gujarati)</label>
                <input
                  value={form.nameGu}
                  onChange={(e) => setForm({ ...form, nameGu: e.target.value })}
                  placeholder="શ્રી રમેશભાઈ પટેલ"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-gujarati"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Surname (English)</label>
                <input
                  required
                  value={form.surnameEn}
                  onChange={(e) => setForm({ ...form, surnameEn: e.target.value })}
                  placeholder="Patel"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Surname (Gujarati)</label>
                <input
                  value={form.surnameGu}
                  onChange={(e) => setForm({ ...form, surnameGu: e.target.value })}
                  placeholder="પટેલ"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-gujarati"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Native Village / Gaam (EN)</label>
                <input
                  required
                  value={form.gaamEn}
                  onChange={(e) => setForm({ ...form, gaamEn: e.target.value })}
                  placeholder="Bhavnagar (Sihor)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">મૂળ વતન / ગામ (GU)</label>
                <input
                  value={form.gaamGu}
                  onChange={(e) => setForm({ ...form, gaamGu: e.target.value })}
                  placeholder="ભાવનગર (સિહોર)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-gujarati"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Venue (English)</label>
                <input
                  required
                  value={form.venueEn}
                  onChange={(e) => setForm({ ...form, venueEn: e.target.value })}
                  placeholder="Community Hall, Ghatkopar (East), Mumbai"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#016BB7] text-white text-xs font-bold hover:bg-[#015a99] cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
