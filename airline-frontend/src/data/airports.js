// Airport reference used for the search autocomplete.
// `city` is what the backend matches on (flights store plain city names),
// `iata` powers smart code search (typing "IX" surfaces Ranchi/IXR, etc.).
const AIRPORTS = [
  // Cities with seeded flights
  { city: 'Mumbai',      country: 'India',  iata: 'BOM' },
  { city: 'Delhi',       country: 'India',  iata: 'DEL' },
  { city: 'Bengaluru',   country: 'India',  iata: 'BLR' },
  { city: 'Hyderabad',   country: 'India',  iata: 'HYD' },
  { city: 'New York',    country: 'USA',    iata: 'JFK' },
  { city: 'London',      country: 'UK',     iata: 'LHR' },

  // IX* Indian airports (smart code demo)
  { city: 'Ranchi',      country: 'India',  iata: 'IXR' },
  { city: 'Bagdogra',    country: 'India',  iata: 'IXB' },
  { city: 'Chandigarh',  country: 'India',  iata: 'IXC' },
  { city: 'Mangaluru',   country: 'India',  iata: 'IXE' },
  { city: 'Jammu',       country: 'India',  iata: 'IXJ' },
  { city: 'Agartala',    country: 'India',  iata: 'IXA' },
  { city: 'Port Blair',  country: 'India',  iata: 'IXZ' },
  { city: 'Madurai',     country: 'India',  iata: 'IXM' },
  { city: 'Leh',         country: 'India',  iata: 'IXL' },
  { city: 'Aurangabad',  country: 'India',  iata: 'IXU' },
  { city: 'Silchar',     country: 'India',  iata: 'IXS' },
  { city: 'Prayagraj',   country: 'India',  iata: 'IXD' },
  { city: 'Belagavi',    country: 'India',  iata: 'IXG' },
  { city: 'Jamshedpur',  country: 'India',  iata: 'IXW' },

  // Other major Indian airports
  { city: 'Chennai',     country: 'India',  iata: 'MAA' },
  { city: 'Kolkata',     country: 'India',  iata: 'CCU' },
  { city: 'Pune',        country: 'India',  iata: 'PNQ' },
  { city: 'Goa',         country: 'India',  iata: 'GOI' },
  { city: 'Ahmedabad',   country: 'India',  iata: 'AMD' },
  { city: 'Jaipur',      country: 'India',  iata: 'JAI' },
  { city: 'Lucknow',     country: 'India',  iata: 'LKO' },
  { city: 'Kochi',       country: 'India',  iata: 'COK' },
  { city: 'Thiruvananthapuram', country: 'India', iata: 'TRV' },

  // International hubs
  { city: 'Dubai',       country: 'UAE',       iata: 'DXB' },
  { city: 'Abu Dhabi',   country: 'UAE',       iata: 'AUH' },
  { city: 'Doha',        country: 'Qatar',     iata: 'DOH' },
  { city: 'Singapore',   country: 'Singapore', iata: 'SIN' },
  { city: 'Bangkok',     country: 'Thailand',  iata: 'BKK' },
  { city: 'Hong Kong',   country: 'Hong Kong', iata: 'HKG' },
  { city: 'Tokyo',       country: 'Japan',     iata: 'HND' },
  { city: 'Sydney',      country: 'Australia', iata: 'SYD' },
  { city: 'Paris',       country: 'France',    iata: 'CDG' },
  { city: 'Frankfurt',   country: 'Germany',   iata: 'FRA' },
  { city: 'Toronto',     country: 'Canada',    iata: 'YYZ' },
  { city: 'Los Angeles', country: 'USA',       iata: 'LAX' },
  { city: 'San Francisco', country: 'USA',     iata: 'SFO' },
];

/**
 * Rank airports for a query. Matches on city prefix, IATA prefix, or city substring.
 * Example: "mum" -> Mumbai; "IX" -> Ranchi (IXR), Bagdogra (IXB), ...
 */
export function searchAirports(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const a of AIRPORTS) {
    const city = a.city.toLowerCase();
    const iata = a.iata.toLowerCase();
    let score = -1;
    if (iata === q) score = 0;                    // exact code
    else if (city.startsWith(q)) score = 1;       // city prefix
    else if (iata.startsWith(q)) score = 2;       // code prefix (IX -> IXR…)
    else if (city.includes(q)) score = 3;         // city substring
    else if (a.country.toLowerCase().startsWith(q)) score = 4;
    if (score >= 0) scored.push({ a, score });
  }
  scored.sort((x, y) => x.score - y.score || x.a.city.localeCompare(y.a.city));
  return scored.slice(0, limit).map((s) => s.a);
}

export default AIRPORTS;
