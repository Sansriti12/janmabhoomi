"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SubscriberProfile {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string | null;
  status: "ACTIVE" | "BLOCKED" | "UNVERIFIED";
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string;
}

export interface ActiveSubscription {
  id: string;
  planId: string;
  planNameEn: string;
  planNameGu: string;
  publicationNameEn: string;
  publicationNameGu: string;
  publicationCode: string;
  startsAt: string;
  expiresAt: string;
  daysRemaining: number;
  autoRenew: boolean;
}

export interface SubscriberAuthContextType {
  subscriber: SubscriberProfile | null;
  activeSubscriptions: ActiveSubscription[];
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (token: string, subscriber: SubscriberProfile, subscriptions?: ActiveSubscription[]) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasSubscriptionFor: (publicationCodeOrId?: string) => boolean;
}

const SubscriberAuthContext = createContext<SubscriberAuthContextType | undefined>(undefined);

const TOKEN_KEY = "janmabhoomi_subscriber_token";

export function SubscriberAuthProvider({ children }: { children: ReactNode }) {
  const [subscriber, setSubscriber] = useState<SubscriberProfile | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Load token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        setToken(savedToken);
        try {
          document.cookie = `janmabhoomi_subscriber_token=${encodeURIComponent(savedToken)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch {}
        if (savedToken.startsWith("guest-token-") || savedToken.startsWith("google-token-")) {
          const savedSub = localStorage.getItem("janmabhoomi_guest_sub");
          if (savedSub) {
            try {
              setSubscriber(JSON.parse(savedSub));
              setActiveSubscriptions([
                {
                  id: "sub-guest-all-access",
                  planId: "plan-all-access",
                  planNameEn: "Guest Reader All-Access Pass",
                  planNameGu: "મહેમાન વાચક ઓલ-એક્સેસ પાસ",
                  publicationNameEn: "Janmabhoomi Daily",
                  publicationNameGu: "જન્મભૂમિ દૈનિક",
                  publicationCode: "JB",
                  startsAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
                  daysRemaining: 30,
                  autoRenew: false,
                },
              ]);
            } catch {}
          }
          setIsLoading(false);
        } else {
          fetchProfile(savedToken);
        }
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  async function fetchProfile(authToken: string) {
    if (authToken.startsWith("guest-token-") || authToken.startsWith("google-token-")) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:4000/api/v1/subscriber/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubscriber(data.subscriber);
          setActiveSubscriptions(data.activeSubscriptions || []);
        }
      } else {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("janmabhoomi_guest_sub");
        setToken(null);
        setSubscriber(null);
        setActiveSubscriptions([]);
      }
    } catch {
      // Offline fallback: keep token for offline resilience
    } finally {
      setIsLoading(false);
    }
  }

  function login(newToken: string, newSubscriber: SubscriberProfile, subscriptions?: ActiveSubscription[]) {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      document.cookie = `janmabhoomi_subscriber_token=${encodeURIComponent(newToken)}; path=/; max-age=2592000; SameSite=Lax`;
      if (newSubscriber) {
        localStorage.setItem("janmabhoomi_guest_sub", JSON.stringify(newSubscriber));
      }
    } catch {}
    setToken(newToken);
    setSubscriber(newSubscriber);
    if (subscriptions) {
      setActiveSubscriptions(subscriptions);
    }
    setIsAuthModalOpen(false);
    if (!newToken.startsWith("guest-token-") && !newToken.startsWith("google-token-")) {
      fetchProfile(newToken);
    }
  }

  async function logout() {
    if (token && !token.startsWith("guest-token-") && !token.startsWith("google-token-")) {
      try {
        await fetch("http://127.0.0.1:4000/api/v1/subscriber/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("janmabhoomi_guest_sub");
      document.cookie = "janmabhoomi_subscriber_token=; path=/; max-age=0; SameSite=Lax";
    } catch {}
    setToken(null);
    setSubscriber(null);
    setActiveSubscriptions([]);
  }

  async function refreshProfile() {
    if (token) {
      await fetchProfile(token);
    }
  }

  function openAuthModal(tab: "login" | "register" = "login") {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  function hasSubscriptionFor(_publicationCodeOrId?: string): boolean {
    return activeSubscriptions.length > 0;
  }

  return (
    <SubscriberAuthContext.Provider
      value={{
        subscriber,
        activeSubscriptions,
        token,
        isLoading,
        isAuthenticated: !!subscriber,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        refreshProfile,
        hasSubscriptionFor,
      }}
    >
      {children}
    </SubscriberAuthContext.Provider>
  );
}

export function useSubscriberAuth() {
  const context = useContext(SubscriberAuthContext);
  if (!context) {
    throw new Error("useSubscriberAuth must be used within a SubscriberAuthProvider");
  }
  return context;
}
