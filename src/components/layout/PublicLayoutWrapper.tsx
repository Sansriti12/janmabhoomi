"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionPopup } from "@/components/layout/SubscriptionPopup";
import { SubscriberAuthModal } from "@/components/auth/SubscriberAuthModal";
import type { Locale } from "@/lib/i18n/config";

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
  lang: Locale;
  dict: any;
  searchableArticles: any[];
}

/**
 * PublicLayoutWrapper:
 * Conditionally renders the public website Header, Footer, and Subscription popups.
 * If the current route is within the Newsroom Admin Panel (/admin/*),
 * it bypasses all public chrome and renders only the admin layout.
 */
export function PublicLayoutWrapper({
  children,
  lang,
  dict,
  searchableArticles,
}: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname ? pathname.includes("/admin") : false;

  if (isAdminRoute) {
    // Pure admin environment: do NOT render public site header or footer
    return <>{children}</>;
  }

  return (
    <>
      <Header
        lang={lang}
        dict={dict}
        searchableArticles={searchableArticles}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer lang={lang} dict={dict} />
      <SubscriptionPopup lang={lang} dict={dict} />
      <SubscriberAuthModal lang={lang} />
    </>
  );
}
