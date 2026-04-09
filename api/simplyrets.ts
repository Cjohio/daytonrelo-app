// ─────────────────────────────────────────────
//  SimplyRETS IDX API Client
//  Docs: https://docs.simplyrets.com
//
//  The sandbox credentials (simplyrets / simplyrets)
//  return demo listings. Swap for production creds
//  in .env to get live MLS data.
// ─────────────────────────────────────────────

import { API_CONFIG } from "./config";
import { Listing, ListingType } from "../shared/types/listing";

const { baseURL, user, password, defaultCities } = API_CONFIG.simplyRETS;

// Basic auth header
const authHeader = (): string => {
  const credentials = btoa(`${user}:${password}`);
  return `Basic ${credentials}`;
};

const headers = (): HeadersInit => ({
  Authorization: authHeader(),
  "Content-Type": "application/json",
  Accept: "application/json",
});

// ── Query param types ─────────────────────────

export interface ListingsQuery {
  type?:      ListingType;
  limit?:     number;
  offset?:    number;
  minprice?:  number;
  maxprice?:  number;
  minbeds?:   number;
  maxbeds?:   number;
  cities?:    string[];
  postalCodes?: string[];
  q?:         string;    // keyword search
  status?:    "Active" | "Pending";
  sort?:      "listprice" | "-listprice" | "listdate" | "-listdate";
}

// Build URLSearchParams from query object
function buildParams(query: ListingsQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (query.type)      p.append("type",      query.type);
  if (query.limit)     p.append("limit",     String(query.limit));
  if (query.offset)    p.append("offset",    String(query.offset));
  if (query.minprice)  p.append("minprice",  String(query.minprice));
  if (query.maxprice)  p.append("maxprice",  String(query.maxprice));
  if (query.minbeds)   p.append("minbeds",   String(query.minbeds));
  if (query.maxbeds)   p.append("maxbeds",   String(query.maxbeds));
  if (query.q)         p.append("q",         query.q);
  if (query.status)    p.append("status",    query.status);
  if (query.sort)      p.append("sort",      query.sort);

  const cities = query.cities ?? defaultCities;
  if (cities.length > 0) cities.forEach((c) => p.append("cities", c));

  query.postalCodes?.forEach((z) => p.append("postalCodes", z));
  return p;
}

// ── API methods ───────────────────────────────

export const simplyRetsApi = {
  /** Fetch a list of properties */
  async getListings(query: ListingsQuery = {}): Promise<Listing[]> {
    const params = buildParams({ limit: 20, status: "Active", ...query });
    const res = await fetch(`${baseURL}/properties?${params}`, { headers: headers() });
    if (!res.ok) throw new Error(`SimplyRETS error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<Listing[]>;
  },

  /** Fetch a single listing by MLS ID */
  async getListing(mlsId: string): Promise<Listing> {
    const res = await fetch(`${baseURL}/properties/${mlsId}`, { headers: headers() });
    if (!res.ok) throw new Error(`SimplyRETS error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<Listing>;
  },

  /** Homes for sale in Dayton metro */
  async getForSale(query: Omit<ListingsQuery, "type"> = {}): Promise<Listing[]> {
    return this.getListings({ ...query, type: "residential" });
  },

  /** Rental listings — useful for PCS / short-term relocators */
  async getRentals(query: Omit<ListingsQuery, "type"> = {}): Promise<Listing[]> {
    return this.getListings({ ...query, type: "rental" });
  },

  /** Featured listings for the home screen (small set, sorted by newest) */
  async getFeatured(limit = 4): Promise<Listing[]> {
    return this.getListings({ limit, sort: "-listdate", type: "residential" });
  },

  /** Search by keyword — agent name, neighborhood, street, etc. */
  async search(keyword: string, query: Omit<ListingsQuery, "q"> = {}): Promise<Listing[]> {
    return this.getListings({ ...query, q: keyword });
  },

  /** Listings near WPAFB zip codes */
  async getNearWPAFB(query: Omit<ListingsQuery, "postalCodes"> = {}): Promise<Listing[]> {
    return this.getListings({
      ...query,
      postalCodes: ["45433", "45431", "45324", "45344"], // Fairborn / WPAFB area
      cities: ["Fairborn", "Beavercreek", "Xenia"],
    });
  },
};
