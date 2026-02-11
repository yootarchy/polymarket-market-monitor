"use client";

import { Market } from "@/lib/api";
import { formatCompactNumber, formatDate, parseOutcomePrices } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign } from "lucide-react";
import Image from "next/image";

/**
 * Market Card Component
 * 
 * Displays a single market with:
 * - Market question/title
 * - Current odds (YES/NO probability)
 * - Trading volume
 * - End date
 * - Category badge
 * - Visual odds indicator
 * 
 * Clicking the card opens the market on Polymarket.com
 */
interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  // Parse outcome prices (0-1 scale representing probability)
  const prices = parseOutcomePrices(market.outcomePrices);
  const yesPrice = prices[0] || 0;
  const noPrice = prices[1] || 0;
  
  // Convert to percentage (0.65 -> 65%)
  const yesPercentage = Math.round(yesPrice * 100);
  const noPercentage = Math.round(noPrice * 100);
  
  // Determine if market is trending toward YES or NO
  const isYesFavored = yesPrice > 0.5;
  
  // Polymarket URL format
  const marketUrl = `https://polymarket.com/event/${market.slug}`;
  
  return (
    <a
      href={marketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            {/* Category Badge */}
            <Badge variant="secondary" className="shrink-0">
              {market.category}
            </Badge>
            
            {/* Market Status */}
            {market.closed ? (
              <Badge variant="destructive">Closed</Badge>
            ) : (
              <Badge variant="success">Active</Badge>
            )}
          </div>
          
          {/* Market Icon + Question */}
          <div className="flex gap-3 items-start">
            {market.icon ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={market.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
              </div>
            ) : null}

            <CardTitle className="text-lg line-clamp-3 leading-tight">
              {market.question}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Current Odds Display */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Current Odds
              </span>
              <TrendingUp
                className={`h-4 w-4 ${
                  isYesFavored
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
            </div>
            
            {/* Odds Bar Visualization */}
            <div className="space-y-2">
              {/* YES Odds */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">YES</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {yesPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${yesPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* NO Odds */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">NO</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {noPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                    style={{ width: `${noPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Market Metadata */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {/* Trading Volume */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Volume: {formatCompactNumber(market.volumeNum)}</span>
            </div>
            
            {/* End Date */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ends: {formatDate(market.endDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
