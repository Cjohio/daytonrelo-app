// ─────────────────────────────────────────────
//  Trestle (CoreLogic) RESO Web API Client
//  Docs: https://trestle.us/documentation
//
//  Authentication: OAuth 2.0 client_credentials — performed server-side by
//  the `trestle-token` Supabase Edge Function so the client secret never
//  ships in the mobile bundle.
//
//  Client-side envs:
//    EXPO_PUBLIC_TRESTLE_BASE_URL   (e.g. https://api-prod.corelogic.com/trestle)
//    EXPO_PUBLIC_SUPABASE_URL       (used to derive the Edge Function URL)
//    EXPO_PUBLIC_SUPABASE_ANON_KEY  (sent as apikey header on the token request)
// ─────────────────────────────────────────────

import { API_CONFIG } from "./config";
import {
  Listing,
  ListingAddress,
  ListingAgent,
  ListingOffice,
  ListingProperty,
  ListingSchool,
  ListingStatus,
  ListingType,
} from "../shared/types/listing";

const { baseURL, defaultCities } = API_CONFIG.trestle;

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const TOKEN_PROXY_URL   = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/trestle-token`
  : "";

// ── Token cache ───────────────────────────────

interface TokenCache {
  token:     string;
  expiresAt: number; // epoch ms
}

let _tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Reuse cached token if it has > 60 s remaining
  if (_tokenCache && _tokenCache.expiresAt - now > 60_000) {
    return _tokenCache.token;
  }

  if (!TOKEN_PROXY_URL) {
    throw new Error("Trestle token proxy misconfigured: EXPO_PUBLIC_SUPABASE_URL is empty.");
  }

  const res = await fetch(TOKEN_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Supabase Edge Functions require either an apikey or an Authorization
      // header even when verify_jwt is false. Passing the anon key is fine
      // here — it's already public and ships in the app bundle.
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Trestle] Token proxy failed:", res.status, text);
    throw new Error(`Trestle token proxy error ${res.status}: ${text}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  _tokenCache = {
    token:     json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return _tokenCache.token;
}

function authHeaders(): HeadersInit {
  // Token is fetched async — callers must await getAccessToken() first
  // and pass it in. We keep this sync helper for use inside the api object.
  throw new Error("Use buildHeaders() which awaits getAccessToken()");
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept:        "application/json",
  };
}

// ── RESO field names → app Listing type ──────
//
//  RESO standard field names are used by Trestle.
//  Full reference: https://ddwiki.reso.org/display/DDW17/RESO+Data+Dictionary+1.7
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProperty(r: any): Listing {
  const address: ListingAddress = {
    streetNumber: r.StreetNumber   ?? "",
    streetName:   r.StreetName     ?? "",
    unit:         r.UnitNumber     ?? undefined,
    city:         r.City           ?? "",
    state:        r.StateOrProvince ?? "",
    postalCode:   r.PostalCode     ?? "",
    country:      r.Country        ?? "US",
    full:         [
      r.StreetNumber,
      r.StreetName,
      r.UnitNumber ? `#${r.UnitNumber}` : null,
      r.City,
      r.StateOrProvince,
      r.PostalCode,
    ]
      .filter(Boolean)
      .join(" "),
  };

  const property: ListingProperty = {
    type:         mapPropertyType(r.PropertyType),
    subType:      r.PropertySubType ?? "",
    style:        r.ArchitecturalStyle?.[0] ?? undefined,
    bedrooms:     r.BedroomsTotal   ?? 0,
    bathsFull:    r.BathroomsFull   ?? 0,
    bathsHalf:    r.BathroomsHalf   ?? 0,
    area:         r.LivingArea      ?? 0,
    lotSize:      r.LotSizeAcres    ? r.LotSizeAcres * 43_560 : undefined,
    yearBuilt:    r.YearBuilt       ?? undefined,
    garageSpaces: r.GarageSpaces    ?? undefined,
  };

  const listAgent: ListingAgent = {
    id:        r.ListAgentMlsId    ?? r.ListAgentKey ?? "",
    firstName: r.ListAgentFirstName ?? "",
    lastName:  r.ListAgentLastName  ?? "",
    contact: {
      email:  r.ListAgentEmail       ?? undefined,
      office: r.ListAgentDirectPhone ?? undefined,
      cell:   r.ListAgentMobilePhone ?? undefined,
    },
  };

  const listOffice: ListingOffice = {
    id:   r.ListOfficeMlsId ?? r.ListOfficeKey ?? undefined,
    name: r.ListOfficeName  ?? undefined,
  };

  const schools: ListingSchool = {
    district:   r.SchoolDistrict     ?? undefined,
    elementary: r.ElementarySchool   ?? undefined,
    middle:     r.MiddleOrJuniorSchool ?? undefined,
    high:       r.HighSchool         ?? undefined,
  };

  const photos: string[] = Array.isArray(r.Media)
    ? ([...r.Media] as any[])
        .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
        .filter((m: any) => m.MediaURL)
        .map((m: any) => m.MediaURL as string)
    : r.PhotosCount > 0 && r.ListingId
    ? [] // photos not expanded — leave empty; caller can expand separately
    : [];

  const status = mapStatus(r.StandardStatus);
  const type   = mapType(r.PropertyType);

  return {
    listingId:             r.ListingId  ?? r.ListingKey ?? "",
    mlsId:                 r.ListingKey ?? r.ListingId  ?? "", // ListingKey is the OData primary key
    listPrice:             r.ListPrice  ?? 0,
    listDate:              r.OnMarketDate ?? r.ListingContractDate ?? "",
    modificationTimestamp: r.ModificationTimestamp ?? "",
    address,
    property,
    photos,
    remarks:          r.PublicRemarks ?? "",
    listAgent,
    listOffice,
    schools,
    status,
    type,
    virtualTourUrl:   r.VirtualTourURLUnbranded ?? r.VirtualTourURLBranded ?? undefined,
    openHouses:       undefined, // fetched separately from OpenHouse resource if needed
  };
}

function mapStatus(s: string | undefined): ListingStatus {
  switch (s) {
    case "Active":        return "Active";
    case "Pending":       return "Pending";
    case "Closed":        return "Closed";
    case "ActiveUnderContract": return "Pending";
    default:              return "Active";
  }
}

function mapType(t: string | undefined): ListingType {
  switch (t) {
    case "Residential":       return "residential";
    case "ResidentialLease": return "rental";
    case "Land":              return "land";
    case "Commercial Sale":
    case "Commercial Lease":  return "commercial";
    default:                  return "residential";
  }
}

function mapPropertyType(t: string | undefined): string {
  return t ?? "Residential";
}

// ── OData $filter builder ─────────────────────

export interface TrestleQuery {
  status?:      "Active" | "Pending" | "Closed";
  type?:        ListingType;
  minPrice?:    number;
  maxPrice?:    number;
  minBeds?:     number;
  maxBeds?:     number;
  cities?:      string[];
  postalCodes?: string[];
  keyword?:     string;
  top?:         number;   // $top  (page size, default 20)
  skip?:        number;   // $skip (offset)
  orderBy?:
    | "ListPrice asc" | "ListPrice desc"
    | "OnMarketDate desc" | "OnMarketDate asc"
    | "ModificationTimestamp desc" | "ModificationTimestamp asc";
  expand?:      string;   // e.g. "Media"
}

function buildODataParams(query: TrestleQuery): URLSearchParams {
  const filters: string[] = [];

  // Status
  const status = query.status ?? "Active";
  filters.push(`StandardStatus eq '${status}'`);

  // Property type
  if (query.type) {
    const resoType = reverseMapType(query.type);
    filters.push(`PropertyType eq '${resoType}'`);
  }

  // Price
  if (query.minPrice) filters.push(`ListPrice ge ${query.minPrice}`);
  if (query.maxPrice) filters.push(`ListPrice le ${query.maxPrice}`);

  // Beds
  if (query.minBeds) filters.push(`BedroomsTotal ge ${query.minBeds}`);
  if (query.maxBeds) filters.push(`BedroomsTotal le ${query.maxBeds}`);

  // Cities
  const cities = query.cities ?? defaultCities;
  if (cities.length > 0) {
    const cityFilter = cities
      .map((c) => `City eq '${c}'`)
      .join(" or ");
    filters.push(`(${cityFilter})`);
  }

  // Postal codes (overrides cities if provided)
  if (query.postalCodes && query.postalCodes.length > 0) {
    // Remove city filter if we added one
    filters.splice(filters.length - 1, 1);
    const zipFilter = query.postalCodes
      .map((z) => `PostalCode eq '${z}'`)
      .join(" or ");
    filters.push(`(${zipFilter})`);
  }

  const p = new URLSearchParams();
  p.set("$filter",  filters.join(" and "));
  p.set("$top",     String(query.top ?? 20));
  if (query.skip)    p.set("$skip",    String(query.skip));
  p.set("$orderby", query.orderBy ?? "ModificationTimestamp desc");
  p.set("$expand",  query.expand  ?? "Media");
  p.set("$select", [
    "ListingId", "ListingKey", "ListPrice", "OnMarketDate",
    "ListingContractDate", "ModificationTimestamp", "StandardStatus",
    "PropertyType", "PropertySubType", "ArchitecturalStyle",
    "BedroomsTotal", "BathroomsFull", "BathroomsHalf",
    "LivingArea", "LotSizeAcres", "YearBuilt", "GarageSpaces",
    "StreetNumber", "StreetName", "UnitNumber", "City",
    "StateOrProvince", "PostalCode", "Country",
    "PublicRemarks", "PhotosCount",
    "ListAgentMlsId", "ListAgentKey", "ListAgentFirstName",
    "ListAgentLastName", "ListAgentEmail", "ListAgentDirectPhone",
    "ListAgentMobilePhone", "ListOfficeMlsId", "ListOfficeKey",
    "ListOfficeName",
    "VirtualTourURLUnbranded", "VirtualTourURLBranded",
  ].join(","));

  return p;
}

function reverseMapType(t: ListingType): string {
  switch (t) {
    case "residential": return "Residential";
    case "rental":      return "ResidentialLease";
    case "land":        return "Land";
    case "commercial":  return "Commercial Sale";
  }
}

// ── Core fetch helper ─────────────────────────

async function fetchProperties(query: TrestleQuery): Promise<Listing[]> {
  const params  = buildODataParams(query);
  const headers = await buildHeaders();
  const url     = `${baseURL}/odata/Property?${params}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trestle API error ${res.status}: ${text}`);
  }

  const json = await res.json() as { value?: any[] };
  const rows = json.value ?? [];
  return rows.map(mapProperty);
}

/**
 * Return the *true* number of properties matching `query` from Trestle —
 * NOT capped by `$top`. Uses OData `$count=true` and `$top=0` so the server
 * returns just the count without any rows. Filters mirror fetchProperties()
 * but skip $select/$expand/$orderby (irrelevant for counting).
 */
async function fetchPropertyCount(query: TrestleQuery): Promise<number> {
  // Build minimal params: filter + $count=true + $top=0
  const fullParams = buildODataParams({ ...query, top: 0 });
  const filter     = fullParams.get("$filter") ?? "";

  const params = new URLSearchParams();
  params.set("$filter", filter);
  params.set("$count",  "true");
  params.set("$top",    "0");

  const headers = await buildHeaders();
  const url     = `${baseURL}/odata/Property?${params}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trestle count error ${res.status}: ${text}`);
  }

  const json = await res.json() as { "@odata.count"?: number };
  return json["@odata.count"] ?? 0;
}

async function fetchPropertyById(listingId: string): Promise<Listing> {
  const headers = await buildHeaders();
  const params  = new URLSearchParams({ "$expand": "Media" });
  const url     = `${baseURL}/odata/Property('${listingId}')?${params}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trestle API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return mapProperty(json);
}

// ── Public API (mirrors simplyRetsApi shape) ──

export const trestleApi = {
  /** Fetch a list of properties with optional filters */
  async getListings(query: TrestleQuery = {}): Promise<Listing[]> {
    return fetchProperties({ top: 20, ...query });
  },

  /** Fetch a single listing by MLS Listing ID */
  async getListing(listingId: string): Promise<Listing> {
    return fetchPropertyById(listingId);
  },

  /** Homes for sale in Dayton metro */
  async getForSale(query: Omit<TrestleQuery, "type"> = {}): Promise<Listing[]> {
    return fetchProperties({ top: 20, ...query, type: "residential" });
  },

  /**
   * Exact count of active for-sale properties matching `query` (no row cap).
   * Used by MarketSnapshot — separate from getForSale() so the displayed
   * count doesn't get capped to the page size.
   */
  async getForSaleCount(query: Omit<TrestleQuery, "type"> = {}): Promise<number> {
    return fetchPropertyCount({ ...query, status: "Active", type: "residential" });
  },

  /** Rental listings — useful for PCS / short-term relocators */
  async getRentals(query: Omit<TrestleQuery, "type"> = {}): Promise<Listing[]> {
    return fetchProperties({ top: 20, ...query, type: "rental" });
  },

  /** Featured listings for the home screen (newest, for-sale) */
  async getFeatured(limit = 4): Promise<Listing[]> {
    return fetchProperties({
      top:     limit,
      type:    "residential",
      orderBy: "OnMarketDate desc",
    });
  },

  /** Keyword search — searches PublicRemarks via OData contains() */
  async search(keyword: string, query: Omit<TrestleQuery, "keyword"> = {}): Promise<Listing[]> {
    // OData: $filter=contains(PublicRemarks, 'keyword')
    const params = buildODataParams({ top: 20, ...query });
    const existing = params.get("$filter") ?? "";
    params.set(
      "$filter",
      `${existing} and contains(PublicRemarks, '${keyword.replace(/'/g, "''")}')`
    );

    const headers = await buildHeaders();
    const url = `${baseURL}/odata/Property?${params}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Trestle search error ${res.status}: ${await res.text()}`);
    const json = await res.json() as { value?: any[] };
    return (json.value ?? []).map(mapProperty);
  },

  /** Listings near WPAFB — Fairborn / Beavercreek / Xenia zip codes */
  async getNearWPAFB(query: Omit<TrestleQuery, "postalCodes" | "cities"> = {}): Promise<Listing[]> {
    return fetchProperties({
      top: 20,
      ...query,
      postalCodes: ["45433", "45431", "45324", "45344"],
    });
  },

  /** All listings in a price range */
  async getByPriceRange(
    minPrice: number,
    maxPrice: number,
    query: Omit<TrestleQuery, "minPrice" | "maxPrice"> = {}
  ): Promise<Listing[]> {
    return fetchProperties({ top: 20, ...query, minPrice, maxPrice });
  },

  /** Listings with school district filter */
  async getBySchoolDistrict(
    district: string,
    query: TrestleQuery = {}
  ): Promise<Listing[]> {
    // Build base params then add school district filter
    const params = buildODataParams({ top: 20, ...query });
    const existing = params.get("$filter") ?? "";
    params.set(
      "$filter",
      `${existing} and SchoolDistrict eq '${district.replace(/'/g, "''")}'`
    );

    const headers = await buildHeaders();
    const url = `${baseURL}/odata/Property?${params}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Trestle error ${res.status}: ${await res.text()}`);
    const json = await res.json() as { value?: any[] };
    return (json.value ?? []).map(mapProperty);
  },
};
