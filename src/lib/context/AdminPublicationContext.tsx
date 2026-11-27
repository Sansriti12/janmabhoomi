"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AdminPublicationId = "all" | "pub-janmabhoomi" | "pub-pravasi" | "pub-purti";

interface AdminPublicationContextType {
  selectedPublication: string;
  setSelectedPublication: (pubId: string) => void;
  isPravasi: boolean;
  isJanmabhoomi: boolean;
}

const AdminPublicationContext = createContext<AdminPublicationContextType | undefined>(undefined);

const ADMIN_PUB_STORAGE_KEY = "janmabhoomi_admin_selected_pub";

export function AdminPublicationProvider({ children }: { children: React.ReactNode }) {
  const [selectedPublication, setSelectedPublicationState] = useState<string>("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PUB_STORAGE_KEY);
      if (saved) {
        setSelectedPublicationState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setSelectedPublication = (pubId: string) => {
    setSelectedPublicationState(pubId);
    try {
      localStorage.setItem(ADMIN_PUB_STORAGE_KEY, pubId);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <AdminPublicationContext.Provider
      value={{
        selectedPublication,
        setSelectedPublication,
        isPravasi: selectedPublication === "pub-pravasi",
        isJanmabhoomi: selectedPublication === "pub-janmabhoomi",
      }}
    >
      {children}
    </AdminPublicationContext.Provider>
  );
}

export function useAdminPublication() {
  const context = useContext(AdminPublicationContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      selectedPublication: "all",
      setSelectedPublication: () => {},
      isPravasi: false,
      isJanmabhoomi: false,
    };
  }
  return context;
}
