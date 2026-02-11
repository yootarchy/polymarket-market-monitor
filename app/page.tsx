"use client";

import { MarketDashboard } from "@/components/market-dashboard";

/**
 * Home Page Component
 * 
 * Main entry point for the Polymarket Market Monitor application.
 * Renders the dashboard with live market data from the Gamma API.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Polymarket Market Monitor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time prediction market data powered by Gamma API
          </p>
        </header>

        {/* Dashboard */}
        <MarketDashboard />
      </div>
    </main>
  );
}
