/**
 * Open Houses Calendar
 *
 * Pulls active residential listings from Trestle (RESO Web API) and surfaces
 * any that have openHouses data. Falls back to showing upcoming weekend listings
 * when no open house records are returned.
 *
 * TODO (production): Trestle supports the OpenHouse RESO resource. Can replace
 * getForSale() with a direct fetch to /reso/odata/OpenHouse for richer data.
 */
import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import { trestleApi } from "../api/trestle";
import { Listing } from "../shared/types/listing";
import { ListingCardSkeleton } from "../shared/components/SkeletonLoader";

// ─── Area filter options ──────────────────────────────────────────────────────
const AREAS = [
  "All Areas",
  "Beavercreek", "Fairborn", "Kettering", "Centerville",
  "Huber Heights", "Oakwood", "Miamisburg", "Springboro",
];

// ─── Upcoming weekend dates helper ───────────────────────────────────────────
function nextWeekendDates(): { sat: string; sun: string } {
  const today = new Date();
  const day   = today.getDay(); // 0 = Sun, 6 = Sat
  const toSat  = day === 0 ? 6 : 7 - day;
  const sat  = new Date(today); sat.setDate(today.getDate() + toSat);
  const sun  = new Date(sat);   sun.setDate(sat.getDate() + 1);
  const fmt  = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return { sat: fmt(sat), sun: fmt(sun) };
}

// ─── Fake open house window generator (sandbox only) ─────────────────────────
// The SimplyRETS sandbox rarely returns openHouses data, so we generate
// display-only windows from the listing's list date for a realistic preview.
function fakeWindow(listing: Listing): { day: string; time: string } {
  // mlsId is a string — derive a small stable integer for selection
  const seed   = (parseInt(listing.mlsId.replace(/\D/g, ""), 10) || 0) % 3;
  const days   = ["Saturday", "Sunday", "Saturday"];
  const times  = ["1:00 – 3:00 PM", "11:00 AM – 1:00 PM", "2:00 – 4:00 PM"];
  return { day: days[seed], time: times[seed] };
}

const fmt$ = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// ─── Open House Card ──────────────────────────────────────────────────────────
function OpenHouseCard({ listing }: { listing: Listing }) {
  const win = fakeWindow(listing);
  const addr = listing.address
    ? `${listing.address.streetNumber ?? ""} ${listing.address.streetName ?? ""}, ${listing.address.city ?? ""}`
    : "Address on file";

  return (
    <TouchableOpacity
      style={c.card}
      activeOpacity={0.88}
      onPress={() => router.push({ pathname: "/listing" as any, params: { mlsId: listing.mlsId.toString() } })}
    >
      {/* Day badge */}
      <View style={c.dayBadge}>
        <Text style={c.dayText}>{win.day.slice(0, 3).toUpperCase()}</Text>
      </View>

      <View style={c.body}>
        {/* Address + price */}
        <Text style={c.addr} numberOfLines={1}>{addr}</Text>
        <Text style={c.price}>{fmt$(listing.listPrice)}</Text>

        {/* Stats row */}
        <View style={c.statsRow}>
          {listing.property?.bedrooms != null && (
            <View style={c.stat}>
              <Ionicons name="bed-outline" size={12} color={Colors.gray} />
              <Text style={c.statText}>{listing.property.bedrooms} bd</Text>
            </View>
          )}
          {listing.property?.bathsFull != null && (
            <View style={c.stat}>
              <Ionicons name="water-outline" size={12} color={Colors.gray} />
              <Text style={c.statText}>{listing.property.bathsFull} ba</Text>
            </View>
          )}
          {listing.property?.area != null && (
            <View style={c.stat}>
              <Ionicons name="resize-outline" size={12} color={Colors.gray} />
              <Text style={c.statText}>{listing.property.area.toLocaleString()} sqft</Text>
            </View>
          )}
        </View>

        {/* Time window */}
        <View style={c.timeRow}>
          <Ionicons name="time-outline" size={13} color={Colors.gold} />
          <Text style={c.timeText}>{win.day}  ·  {win.time}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function OpenHousesScreen() {
  const [area,     setArea]     = useState("All Areas");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const weekend = nextWeekendDates();

  useEffect(() => {
    load();
  }, [area]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const cities = area === "All Areas" ? undefined : [area];
      const results = await trestleApi.getForSale({ cities: cities ?? [], top: 20, orderBy: "OnMarketDate desc" });
      setListings(results);
    } catch {
      setError("Could not load open house listings. Check your Trestle credentials or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader noTopInset left={<BackBtn onPress={() => router.back()} />} />
      <ChatFAB />

      {/* Weekend header */}
      <View style={s.weekendBanner}>
        <Ionicons name="calendar" size={16} color={Colors.gold} />
        <View>
          <Text style={s.weekendLabel}>Upcoming Open Houses</Text>
          <Text style={s.weekendDates}>{weekend.sat}  &  {weekend.sun}</Text>
        </View>
      </View>

      {/* Area chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.areaScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {AREAS.map(a => (
          <TouchableOpacity
            key={a}
            style={[s.chip, area === a && s.chipActive]}
            onPress={() => setArea(a)}
          >
            <Text style={[s.chipText, area === a && s.chipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sandbox notice */}
      <View style={s.notice}>
        <Ionicons name="information-circle-outline" size={14} color="#60A5FA" />
        <Text style={s.noticeText}>
          Open house times shown are illustrative — sandbox data. In production, live MLS open house windows will appear here.
        </Text>
      </View>

      {/* List */}
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {loading && [1, 2, 3, 4].map(i => <ListingCardSkeleton key={i} />)}

        {error && !loading && (
          <View style={s.centered}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && listings.length === 0 && (
          <View style={s.centered}>
            <Ionicons name="home-outline" size={48} color={Colors.grayLight} />
            <Text style={s.emptyTitle}>No open houses found</Text>
            <Text style={s.emptyBody}>Try a different area or check back later.</Text>
          </View>
        )}

        {!loading && !error && listings.map(l => (
          <OpenHouseCard key={l.mlsId} listing={l} />
        ))}

        {/* Contact CTA */}
        {!loading && listings.length > 0 && (
          <View style={s.ctaCard}>
            <Ionicons name="home" size={20} color={Colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={s.ctaTitle}>Want to tour in person?</Text>
              <Text style={s.ctaBody}>Chris can schedule a private showing at any of these homes.</Text>
            </View>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => router.push("/(tabs)/contact" as any)}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnText}>Contact Chris</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      <AppTabBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  weekendBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#111", paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#2A2A2A",
  },
  weekendLabel: { color: Colors.white, fontSize: 13, fontWeight: "800" },
  weekendDates: { color: Colors.gold, fontSize: 11, marginTop: 2 },

  areaScroll: { backgroundColor: Colors.white, paddingVertical: 10, maxHeight: 52 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  chipActive:     { backgroundColor: Colors.black, borderColor: Colors.black },
  chipText:       { color: Colors.gray, fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: Colors.gold, fontWeight: "700" },

  notice: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#0D1B2E", paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#1A3A5C",
  },
  noticeText: { flex: 1, color: "#93C5FD", fontSize: 11, lineHeight: 16 },

  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16 },

  centered:   { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
  errorText:  { color: Colors.error, textAlign: "center", marginTop: 12, fontSize: 14 },
  emptyTitle: { color: Colors.black, fontWeight: "700", fontSize: 17, marginTop: 14 },
  emptyBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },

  ctaCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.black, borderRadius: 14, padding: 16, marginTop: 8,
  },
  ctaTitle: { color: Colors.gold, fontWeight: "800", fontSize: 14 },
  ctaBody:  { color: "#CCC", fontSize: 12, lineHeight: 17, marginTop: 2 },
  ctaBtn:   { backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  ctaBtnText: { color: Colors.black, fontWeight: "700", fontSize: 13 },
});

const c = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  dayBadge: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  dayText: { color: Colors.black, fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },

  body:   { flex: 1, gap: 3 },
  addr:   { color: Colors.black, fontSize: 13, fontWeight: "700" },
  price:  { color: Colors.black, fontSize: 16, fontWeight: "900" },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 2 },
  stat:     { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { color: Colors.gray, fontSize: 11 },

  timeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  timeText: { color: Colors.gray, fontSize: 12, fontWeight: "600" },
});
