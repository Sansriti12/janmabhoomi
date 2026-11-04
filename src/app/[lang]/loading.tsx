import React from "react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-[#292725]/10" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 h-96 rounded-md bg-[#292725]/10" />
        <div className="lg:col-span-3 space-y-4">
          <div className="h-44 rounded-md bg-[#292725]/10" />
          <div className="h-44 rounded-md bg-[#292725]/10" />
        </div>
        <div className="lg:col-span-3 h-96 rounded-md bg-[#292725]/10" />
      </div>
    </div>
  );
}
