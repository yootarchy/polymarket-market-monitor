import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a large number with K/M/B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays < 0) {
    return "Ended";
  }
  if (diffInDays === 0) {
    return "Today";
  }
  if (diffInDays === 1) {
    return "Tomorrow";
  }
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}w`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Parse outcome prices from string array to number array
 */
export function parseOutcomePrices(prices: string | string[]): number[] {
  try {
    const pricesArray = typeof prices === "string" ? JSON.parse(prices) : prices;
    return pricesArray.map((p: string) => parseFloat(p));
  } catch {
    return [0, 0];
  }
}
