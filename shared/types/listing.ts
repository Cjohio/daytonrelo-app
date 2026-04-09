// SimplyRETS API — Listing type definitions
// Full schema: https://docs.simplyrets.com

export interface ListingAddress {
  streetNumber: string;
  streetName:   string;
  unit?:        string;
  city:         string;
  state:        string;
  postalCode:   string;
  country:      string;
  full:         string;
}

export interface ListingProperty {
  type:       string;
  subType:    string;
  style?:     string;
  bedrooms:   number;
  bathsFull:  number;
  bathsHalf:  number;
  area:       number;       // sq ft
  lotSize?:   number;
  yearBuilt?: number;
  garageSpaces?: number;
}

export interface ListingSchool {
  district?:    string;
  elementary?:  string;
  middle?:      string;
  high?:        string;
}

export interface ListingAgent {
  id:         string;
  firstName:  string;
  lastName:   string;
  contact?: {
    email?:   string;
    office?:  string;
    cell?:    string;
  };
}

export interface ListingOffice {
  id?:   string;
  name?: string;
}

export type ListingStatus = "Active" | "Pending" | "Closed" | "Leased";
export type ListingType   = "residential" | "rental" | "land" | "commercial";

export interface Listing {
  listingId:              string;
  mlsId:                  string;
  listPrice:              number;
  listDate:               string;
  modificationTimestamp:  string;
  address:                ListingAddress;
  property:               ListingProperty;
  photos:                 string[];
  remarks:                string;
  listAgent:              ListingAgent;
  listOffice?:            ListingOffice;
  schools?:               ListingSchool;
  status:                 ListingStatus;
  type:                   ListingType;
  virtualTourUrl?:        string;
  openHouses?:            { startTime: string; endTime: string }[];
}

// Helper for display formatting
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

export const formatAddress = (address: ListingAddress): string =>
  `${address.streetNumber} ${address.streetName}${address.unit ? ` #${address.unit}` : ""}, ${address.city}, ${address.state} ${address.postalCode}`;
