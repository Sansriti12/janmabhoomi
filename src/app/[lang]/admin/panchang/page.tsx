"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Compass, MapPin, Save, CheckCircle2, RotateCcw } from "lucide-react";

type CityKey = "mumbai" | "delhi" | "ahmedabad" | "surat" | "vadodara";

interface CitySchedule {
  key: CityKey;
  en: string;
  gu: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  tithiEn: string;
  tithiGu: string;
  nakshatraEn: string;
  nakshatraGu: string;
  yogaEn: string;
  yogaGu: string;
  vikramSamvatEn: string;
  vikramSamvatGu: string;
}

const STORAGE_KEY = "janmabhoomi_city_panchang_v1";

const DEFAULT_SCHEDULES: Record<CityKey, CitySchedule> = {
  mumbai: {
    key: "mumbai",
    en: "Mumbai",
    gu: "મુંબઈ",
    sunrise: "06:48 AM",
    sunset: "06:01 PM",
    rahuKaal: "09:36 AM – 11:00 AM",
    tithiEn: "Kartik Shukla Ekadashi",
    tithiGu: "કારતક સુદ એકાદશી",
    nakshatraEn: "Uttara Bhadrapada",
    nakshatraGu: "ઉત્તરા ભાદ્રપદ",
    yogaEn: "Siddhi Yoga • Vanija",
    yogaGu: "સિદ્ધિ યોગ • વણિજ કરણ",
    vikramSamvatEn: "Vikram Samvat 2083",
    vikramSamvatGu: "વિક્રમ સંવત ૨૦૮૩",
  },
  delhi: {
    key: "delhi",
    en: "Delhi",
    gu: "દિલ્હી",
    sunrise: "06:50 AM",
    sunset: "05:25 PM",
    rahuKaal: "09:29 AM – 10:48 AM",
    tithiEn: "Kartik Shukla Ekadashi",
    tithiGu: "કારતક સુદ એકાદશી",
    nakshatraEn: "Uttara Bhadrapada",
    nakshatraGu: "ઉત્તરા ભાદ્રપદ",
    yogaEn: "Siddhi Yoga • Vanija",
    yogaGu: "સિદ્ધિ યોગ • વણિજ કરણ",
    vikramSamvatEn: "Vikram Samvat 2083",
    vikramSamvatGu: "વિક્રમ સંવત ૨૦૮૩",
  },
  ahmedabad: {
    key: "ahmedabad",
    en: "Ahmedabad",
    gu: "અમદાવાદ",
    sunrise: "06:58 AM",
    sunset: "05:56 PM",
    rahuKaal: "09:42 AM – 11:04 AM",
    tithiEn: "Kartik Shukla Ekadashi",
    tithiGu: "કારતક સુદ એકાદશી",
    nakshatraEn: "Uttara Bhadrapada",
    nakshatraGu: "ઉત્તરા ભાદ્રપદ",
    yogaEn: "Siddhi Yoga • Vishti",
    yogaGu: "સિદ્ધિ યોગ • વિષ્ટિ કરણ",
    vikramSamvatEn: "Vikram Samvat 2083",
    vikramSamvatGu: "વિક્રમ સંવત ૨૦૮૩",
  },
  surat: {
    key: "surat",
    en: "Surat",
    gu: "સુરત",
    sunrise: "06:51 AM",
    sunset: "05:59 PM",
    rahuKaal: "09:38 AM – 11:02 AM",
    tithiEn: "Kartik Shukla Ekadashi",
    tithiGu: "કારતક સુદ એકાદશી",
    nakshatraEn: "Uttara Bhadrapada",
    nakshatraGu: "ઉત્તરા ભાદ્રપદ",
    yogaEn: "Siddhi Yoga • Vanija",
    yogaGu: "સિદ્ધિ યોગ • વણિજ કરણ",
    vikramSamvatEn: "Vikram Samvat 2083",
    vikramSamvatGu: "વિક્રમ સંવત ૨૦૮૩",
  },
  vadodara: {
    key: "vadodara",
    en: "Vadodra",
    gu: "વડોદરા",
    sunrise: "06:54 AM",
    sunset: "05:56 PM",
    rahuKaal: "09:39 AM – 11:02 AM",
    tithiEn: "Kartik Shukla Ekadashi",
    tithiGu: "કારતક સુદ એકાદશી",
    nakshatraEn: "Uttara Bhadrapada",
    nakshatraGu: "ઉત્તરા ભાદ્રપદ",
    yogaEn: "Siddhi Yoga • Bava",
    yogaGu: "સિદ્ધિ યોગ • બવ કરણ",
    vikramSamvatEn: "Vikram Samvat 2083",
    vikramSamvatGu: "વિક્રમ સંવત ૨૦૮૩",
  },
};

export default function AdminPanchangPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [selectedCity, setSelectedCity] = useState<CityKey>("mumbai");
  const [schedules, setSchedules] = useState<Record<CityKey, CitySchedule>>(DEFAULT_SCHEDULES);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.mumbai) {
          setSchedules({ ...DEFAULT_SCHEDULES, ...parsed });
        }
      }
    } catch {}
  }, []);

  const current = schedules[selectedCity];

  const updateField = (field: keyof CitySchedule, value: string) => {
    setSchedules((prev) => ({
      ...prev,
      [selectedCity]: {
        ...prev[selectedCity],
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch {}
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    setSchedules(DEFAULT_SCHEDULES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-[#016BB7]" />
            <span>{isGu ? "દૈનિક પંચાંગ સંચાલન (૫ શહેરો)" : "Daily Multi-City Panchang Manager (5 Cities)"}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isGu
              ? "મુંબઈ, દિલ્હી, અમદાવાદ, સુરત અને વડોદરા માટે દૈનિક તિથિ, નક્ષત્ર, સૂર્યોદય-સૂર્યાસ્ત અને રાહુકાળ અપડેટ કરો."
              : "Update daily Tithi, Nakshatra, Solar timings, and Rahu Kaal for Mumbai, Delhi, Ahmedabad, Surat, and Vadodra."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{isGu ? "ડિફોલ્ટ રીસેટ" : "Reset Defaults"}</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{isGu ? "પંચાંગ વિગતો સફળતાપૂર્વક સેવ થઈ!" : "Daily Panchang schedule saved and synced to the public widget!"}</span>
        </div>
      )}

      {/* City Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["mumbai", "delhi", "ahmedabad", "surat", "vadodara"] as CityKey[]).map((key) => {
          const c = schedules[key];
          const active = selectedCity === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCity(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                active
                  ? "bg-[#016BB7] text-white border-[#016BB7] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-[#016BB7]"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{isGu ? c.gu : c.en}</span>
            </button>
          );
        })}
      </div>

      {/* City Editor Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tithi (English)</label>
            <input
              value={current.tithiEn}
              onChange={(e) => updateField("tithiEn", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">તિથિ (Gujarati)</label>
            <input
              value={current.tithiGu}
              onChange={(e) => updateField("tithiGu", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-gujarati"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Vikram Samvat (EN)</label>
            <input
              value={current.vikramSamvatEn}
              onChange={(e) => updateField("vikramSamvatEn", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nakshatra (English)</label>
            <input
              value={current.nakshatraEn}
              onChange={(e) => updateField("nakshatraEn", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">નક્ષત્ર (Gujarati)</label>
            <input
              value={current.nakshatraGu}
              onChange={(e) => updateField("nakshatraGu", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-gujarati"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Yoga & Karana (EN)</label>
            <input
              value={current.yogaEn}
              onChange={(e) => updateField("yogaEn", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Sunrise (IST)</label>
            <input
              value={current.sunrise}
              onChange={(e) => updateField("sunrise", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Sunset (IST)</label>
            <input
              value={current.sunset}
              onChange={(e) => updateField("sunset", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Rahu Kaal (IST)</label>
            <input
              value={current.rahuKaal}
              onChange={(e) => updateField("rahuKaal", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#015a99] px-5 py-2.5 text-sm font-bold text-white shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isGu ? "પંચાંગ સેવ કરો" : "Save City Panchang"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
