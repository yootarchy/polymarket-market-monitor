import { NextResponse } from 'next/server';

/**
 * API Route: /api/markets
 * 
 * Proxies requests to Polymarket Gamma API to avoid CORS issues in the browser.
 * 
 * Why this exists:
 * - Browsers block direct requests to gamma-api.polymarket.com due to CORS
 * - Server-side requests don't have CORS restrictions
 * - This route acts as a proxy: browser → our API → Gamma API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build Gamma API URL with query parameters
    const gammaUrl = new URL('https://gamma-api.polymarket.com/markets');
    
    // Forward query parameters (limit, active, closed, etc.)
    searchParams.forEach((value, key) => {
      gammaUrl.searchParams.set(key, value);
    });

    // Fetch from Gamma API (server-side, no CORS issues)
    const response = await fetch(gammaUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable Next.js cache for real-time data
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gamma API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return data to client with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error proxying Gamma API request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets from Gamma API' },
      { status: 500 }
    );
  }
}
