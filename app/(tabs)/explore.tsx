import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  TextInput, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "../../shared/theme/colors";
import { trestleApi } from "../../api/trestle";
import { Listing } from "../../shared/types/listing";
import ListingCard from "../../shared/components/ListingCard";
import { ListingCardSkeleton } from "../../shared/components/SkeletonLoader";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";

const SEARCHES_KEY = "saved_searches_v2";
type SavedSearch = {
  id: string; label: string; area: string; mode: ListingMode;
  minPrice?: number; maxPrice?: number; minBeds?: number; minBaths?: number;
  sortBy?: SortKey; query: string;
};

type ListingMode = "sale" | "rent";
type SortKey     = "newest" | "price_asc" | "price_desc";

const FILTER_TABS: { label: string; value: ListingMode }[] = [
  { label: "For Sale", value: "sale" },
  { label: "For Rent",  value: "rent" },
];

const AREAS = [
  "All Areas",
  "Beavercreek", "Fairborn", "Kettering", "Centerville", "Huber Heights",
  "Oakwood", "Miamisburg", "Springboro", "Xenia", "Trotwood",
  "Riverside", "Englewood", "Vandalia", "Tipp City", "West Carrollton",
  "Yellow Springs", "Bellbrook",
];

const MIN_PRICE_OPTIONS = [
  { label: "No min",  value: 0       },
  { label: "$100k",   value: 100_000 },
  { label: "$150k",   value: 150_000 },
  { label: "$200k",   value: 200_000 },
  { label: "$250k",   value: 250_000 },
  { label: "$300k",   value: 300_000 },
  { label: "$400k",   value: 400_000 },
  { label: "$500k",   value: 500_000 },
];

const MAX_PRICE_OPTIONS = [
  { label: "No max",  value: 0         },
  { label: "$150k",   value: 150_000   },
  { label: "$200k",   value: 200_000   },
  { label: "$250k",   value: 250_000   },
  { label: "$300k",   value: 300_000   },
  { label: "$350k",   value: 350_000   },
  { label: "$400k",   value: 400_000   },
  { label: "$500k",   value: 500_000   },
  { label: "$600k",   value: 600_000   },
  { label: "$750k",   value: 750_000   },
  { label: "$1M+",    value: 1_000_000 },
];

const BEDS_OPTIONS  = [0, 1, 2, 3, 4, 5];
const BATHS_OPTIONS = [0, 1, 2, 3];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Newest First",      value: "newest"     },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ area?: string; budget?: string }>();

  // ── Core filters ─────────────────────────────────────────────────────────────
  const [mode,     setMode]     = useState<ListingMode>("sale");
  const [area,     setArea]     = useState("All Areas");
  const [query,    setQuery]    = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minBeds,  setMinBeds]  = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [sortBy,   setSortBy]   = useState<SortKey>("newest");

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [listings,      setListings]      = useState<Listing[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [searched,      setSearched]      = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [filtersOpen,   setFiltersOpen]   = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveFeedback,  setSaveFeedback]  = useState(false);

  // Draft filter state (edited inside modal, applied on "Apply")
  const [draftMin,   setDraftMin]   = useState(0);
  const [draftMax,   setDraftMax]   = useState(0);
  const [draftBeds,  setDraftBeds]  = useState(0);
  const [draftBaths, setDraftBaths] = useState(0);
  const [draftSort,  setDraftSort]  = useState<SortKey>("newest");

  // Active filter count badge
  const activeFilters = [
    minPrice > 0, maxPrice > 0, minBeds > 0, minBaths > 0,
  ].filter(Boolean).length;

  // ── Persistence ───────────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(SEARCHES_KEY).then(raw => {
      if (raw) try { setSavedSearches(JSON.parse(raw)); } catch {}
    });
    fetchListings("All Areas", 0, 0, 0, 0, "newest");
  }, []);

  // Accept area from other screens
  useEffect(() => {
    if (params.area) {
      const match = AREAS.find(a => a.toLowerCase() === (params.area as string).toLowerCase());
      if (match && match !== "All Areas") { setArea(match); fetchListings(match); }
    }
  }, [params.area]);

  // Accept BAH budget from calculator
  useEffect(() => {
    if (params.budget) {
      const b = parseInt(params.budget as string, 10);
      if (!isNaN(b)) { setMaxPrice(b); fetchListings(undefined, undefined, b); }
    }
  }, [params.budget]);

  // ── Labels ────────────────────────────────────────────────────────────────────
  function buildLabel(
    a = area, m = mode,
    minP = minPrice, maxP = maxPrice,
    beds = minBeds, baths = minBaths,
    q = query
  ) {
    return [
      m === "sale" ? "For Sale" : "For Rent",
      a !== "All Areas" ? a : null,
      minP  ? `$${(minP  / 1000).toFixed(0)}k+`  : null,
      maxP  ? `≤$${(maxP / 1000).toFixed(0)}k`   : null,
      beds  ? `${beds}+ bd`  : null,
      baths ? `${baths}+ ba` : null,
      q && q.trim() ? `"${q.trim()}"` : null,
    ].filter(Boolean).join(" · ");
  }

  // ── Saved searches ────────────────────────────────────────────────────────────
  function saveSearch() {
    const label = buildLabel();
    const entry: SavedSearch = {
      id: Date.now().toString(), label, area, mode,
      minPrice, maxPrice, minBeds, minBaths, sortBy, query,
    };
    const updated = [entry, ...savedSearches.filter(s => s.label !== label)].slice(0, 5);
    setSavedSearches(updated);
    AsyncStorage.setItem(SEARCHES_KEY, JSON.stringify(updated));
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }

  function deleteSavedSearch(id: string) {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    AsyncStorage.setItem(SEARCHES_KEY, JSON.stringify(updated));
  }

  function recallSearch(s: SavedSearch) {
    setArea(s.area); setMode(s.mode); setQuery(s.query);
    setMinPrice(s.minPrice ?? 0); setMaxPrice(s.maxPrice ?? 0);
    setMinBeds(s.minBeds ?? 0); setMinBaths(s.minBaths ?? 0);
    setSortBy(s.sortBy ?? "newest");
    fetchListings(s.area, s.minPrice, s.maxPrice, s.minBeds, s.minBaths, s.sortBy, s.mode);
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchListings = async (
    areaOverride?:     string,
    minPriceOverride?: number,
    maxPriceOverride?: number,
    minBedsOverride?:  number,
    minBathsOverride?: number,
    sortOverride?:     SortKey,
    modeOverride?:     ListingMode,
  ) => {
    const activeArea     = areaOverride     ?? area;
    const activeMinPrice = minPriceOverride ?? minPrice;
    const activeMaxPrice = maxPriceOverride ?? maxPrice;
    const activeMinBeds  = minBedsOverride  ?? minBeds;
    const activeMinBaths = minBathsOverride ?? minBaths;
    const activeSort     = sortOverride     ?? sortBy;
    const activeMode     = modeOverride     ?? mode;

    const orderBy =
      activeSort === "price_asc"  ? "ListPrice asc"       :
      activeSort === "price_desc" ? "ListPrice desc"      :
      "ModificationTimestamp desc";

    setLoading(true);
    setError(null);
    try {
      const cities = activeArea === "All Areas" ? [] : [activeArea];
      let results =
        activeMode === "sale"
          ? await trestleApi.getForSale({
              cities,
              keyword:  query || undefined,
              top:      40,
              minPrice: activeMinPrice || undefined,
              maxPrice: activeMaxPrice || undefined,
              minBeds:  activeMinBeds  || undefined,
              orderBy,
            })
          : await trestleApi.getRentals({
              cities,
              keyword:  query || undefined,
              top:      40,
              minPrice: activeMinPrice || undefined,
              maxPrice: activeMaxPrice || undefined,
              minBeds:  activeMinBeds  || undefined,
              orderBy,
            });

      // Client-side bath filter (Trestle doesn't support minBaths in OData directly)
      if (activeMinBaths > 0) {
        results = results.filter(
          l => (l.property.bathsFull + l.property.bathsHalf * 0.5) >= activeMinBaths
        );
      }

      setListings(results);
      setSearched(true);
    } catch (e: any) {
      console.error("[Trestle] fetchListings error:", e?.message ?? e);
      setError("We couldn't load listings right now. Please try again.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter modal helpers ──────────────────────────────────────────────────────
  function openFilters() {
    setDraftMin(minPrice); setDraftMax(maxPrice);
    setDraftBeds(minBeds); setDraftBaths(minBaths);
    setDraftSort(sortBy);
    setFiltersOpen(true);
  }

  function applyFilters() {
    setMinPrice(draftMin); setMaxPrice(draftMax);
    setMinBeds(draftBeds); setMinBaths(draftBaths);
    setSortBy(draftSort);
    setFiltersOpen(false);
    fetchListings(undefined, draftMin, draftMax, draftBeds, draftBaths, draftSort);
  }

  function clearFilters() {
    setDraftMin(0); setDraftMax(0); setDraftBeds(0); setDraftBaths(0); setDraftSort("newest");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />

      {/* Header */}
      <BrandHeader
        noTopInset
        left={<BackBtn onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)} />}
        right={<HeaderActions />}
      />

      {/* Sale / Rent toggle */}
      <View style={st.toggleRow}>
        {FILTER_TABS.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[st.toggleBtn, mode === value && st.toggleBtnActive]}
            onPress={() => { setMode(value); fetchListings(undefined, undefined, undefined, undefined, undefined, undefined, value); }}
          >
            <Text style={[st.toggleText, mode === value && st.toggleTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar + Filters button */}
      <View style={st.searchRow}>
        <View style={st.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            style={st.searchInput}
            placeholder="Keyword, address, zip…"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => fetchListings()}
            placeholderTextColor={Colors.grayLight}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={st.searchBtn} onPress={() => fetchListings()}>
          <Text style={st.searchBtnText}>Search</Text>
        </TouchableOpacity>

        {/* Filters button */}
        <TouchableOpacity style={st.filtersBtn} onPress={openFilters} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={18} color={activeFilters > 0 ? Colors.gold : Colors.gray} />
          {activeFilters > 0 && (
            <View style={st.filterBadge}>
              <Text style={st.filterBadgeText}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Area chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={st.areaScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {AREAS.map((a) => (
          <TouchableOpacity
            key={a}
            style={[st.areaChip, area === a && st.areaChipActive]}
            onPress={() => { setArea(a); fetchListings(a); }}
          >
            <Text style={[st.areaChipText, area === a && st.areaChipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active filter summary + save */}
      <View style={st.saveBar}>
        <Text style={st.saveBarLabel} numberOfLines={1}>{buildLabel()}</Text>
        <TouchableOpacity style={st.saveBtn} onPress={saveSearch} activeOpacity={0.8}>
          <Ionicons
            name={saveFeedback ? "bookmark" : "bookmark-outline"}
            size={15}
            color={saveFeedback ? Colors.gold : Colors.gray}
          />
          <Text style={[st.saveBtnText, saveFeedback && { color: Colors.gold }]}>
            {saveFeedback ? "Saved!" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={st.results} contentContainerStyle={st.resultsContent}>
        {loading && [1, 2, 3].map(i => <ListingCardSkeleton key={i} />)}

        {error && !loading && (
          <View style={st.centered}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
            <Text style={st.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !searched && (
          <>
            {savedSearches.length > 0 && (
              <View style={st.savedSection}>
                <View style={st.savedHeader}>
                  <Ionicons name="bookmark" size={14} color={Colors.gold} />
                  <Text style={st.savedTitle}>Saved Searches</Text>
                </View>
                {savedSearches.map(s => (
                  <View key={s.id} style={st.savedRow}>
                    <TouchableOpacity style={st.savedRowContent} onPress={() => recallSearch(s)} activeOpacity={0.8}>
                      <Ionicons name="search-outline" size={14} color={Colors.gray} />
                      <Text style={st.savedRowText} numberOfLines={1}>{s.label}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSavedSearch(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle-outline" size={18} color={Colors.grayLight} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={st.centered}>
              <Ionicons name="home-outline" size={48} color={Colors.grayLight} />
              <Text style={st.emptyTitle}>Search Dayton MLS</Text>
              <Text style={st.emptyBody}>Choose an area or use filters to browse live listings.</Text>
            </View>
          </>
        )}

        {!loading && searched && listings.length === 0 && !error && (
          <View style={st.centered}>
            <Ionicons name="search-outline" size={40} color={Colors.grayLight} />
            <Text style={st.emptyTitle}>No listings found</Text>
            <Text style={st.emptyBody}>Try widening your filters or a different area.</Text>
          </View>
        )}

        {!loading && listings.map(listing => (
          <ListingCard
            key={listing.mlsId}
            listing={listing}
            onPress={() => router.push({ pathname: "/listing" as any, params: { mlsId: listing.mlsId.toString() } })}
          />
        ))}
      </ScrollView>

      {/* ── Filters bottom sheet ────────────────────────────────────────────── */}
      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <View style={st.sheetOverlay}>
          <TouchableOpacity style={st.sheetBackdrop} activeOpacity={1} onPress={() => setFiltersOpen(false)} />
          <View style={st.sheet}>

            {/* Sheet header */}
            <View style={st.sheetHeader}>
              <Text style={st.sheetTitle}>Filters</Text>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={st.clearText}>Clear all</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFiltersOpen(false)}>
                  <Ionicons name="close" size={24} color={Colors.black} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Sort */}
              <Text style={st.filterLabel}>Sort By</Text>
              <View style={st.chipRow}>
                {SORT_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.value}
                    style={[st.chip, draftSort === o.value && st.chipActive]}
                    onPress={() => setDraftSort(o.value)}
                  >
                    <Text style={[st.chipText, draftSort === o.value && st.chipTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Min Price */}
              <Text style={st.filterLabel}>Min Price</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipRow}>
                {MIN_PRICE_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.value}
                    style={[st.chip, draftMin === o.value && st.chipActive]}
                    onPress={() => setDraftMin(o.value)}
                  >
                    <Text style={[st.chipText, draftMin === o.value && st.chipTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Max Price */}
              <Text style={st.filterLabel}>Max Price</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipRow}>
                {MAX_PRICE_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.value}
                    style={[st.chip, draftMax === o.value && st.chipActive]}
                    onPress={() => setDraftMax(o.value)}
                  >
                    <Text style={[st.chipText, draftMax === o.value && st.chipTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Bedrooms */}
              <Text style={st.filterLabel}>Min Bedrooms</Text>
              <View style={st.chipRow}>
                {BEDS_OPTIONS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[st.chip, draftBeds === n && st.chipActive]}
                    onPress={() => setDraftBeds(n)}
                  >
                    <Text style={[st.chipText, draftBeds === n && st.chipTextActive]}>
                      {n === 0 ? "Any" : `${n}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bathrooms */}
              <Text style={st.filterLabel}>Min Bathrooms</Text>
              <View style={st.chipRow}>
                {BATHS_OPTIONS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[st.chip, draftBaths === n && st.chipActive]}
                    onPress={() => setDraftBaths(n)}
                  >
                    <Text style={[st.chipText, draftBaths === n && st.chipTextActive]}>
                      {n === 0 ? "Any" : `${n}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 12 }} />
            </ScrollView>

            {/* Apply */}
            <TouchableOpacity style={st.applyBtn} onPress={applyFilters} activeOpacity={0.85}>
              <Text style={st.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  toggleRow: {
    flexDirection: "row", backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  toggleBtn:       { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center", borderWidth: 1.5, borderColor: Colors.border },
  toggleBtnActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  toggleText:      { color: Colors.gray, fontWeight: "600", fontSize: 14 },
  toggleTextActive:{ color: Colors.gold, fontWeight: "700", fontSize: 14 },

  searchRow: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput:   { flex: 1, fontSize: 14, color: Colors.black },
  searchBtn: {
    backgroundColor: Colors.gold, borderRadius: 10,
    paddingHorizontal: 14, justifyContent: "center",
  },
  searchBtnText: { color: Colors.black, fontWeight: "700", fontSize: 14 },
  filtersBtn: {
    width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.offWhite, borderWidth: 1.5, borderColor: Colors.border,
  },
  filterBadge: {
    position: "absolute", top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center",
  },
  filterBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.black },

  areaScroll: { backgroundColor: Colors.white, paddingVertical: 10, maxHeight: 52 },
  areaChip:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  areaChipActive:   { backgroundColor: Colors.black, borderColor: Colors.black },
  areaChipText:     { color: Colors.gray, fontSize: 13, fontWeight: "500" },
  areaChipTextActive:{ color: Colors.gold, fontWeight: "700" },

  saveBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  saveBarLabel: { flex: 1, fontSize: 12, color: Colors.gray, marginRight: 12 },
  saveBtn:      { flexDirection: "row", alignItems: "center", gap: 5 },
  saveBtnText:  { fontSize: 12, fontWeight: "600", color: Colors.gray },

  results:        { flex: 1, backgroundColor: Colors.white },
  resultsContent: { padding: 16 },
  centered: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
  errorText:  { color: Colors.error, textAlign: "center", marginTop: 12, fontSize: 14 },
  emptyTitle: { color: Colors.black, fontWeight: "700", fontSize: 17, marginTop: 14 },
  emptyBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },

  savedSection:     { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  savedHeader:      { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  savedTitle:       { fontSize: 13, fontWeight: "800", color: Colors.black },
  savedRow:         { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  savedRowContent:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  savedRowText:     { flex: 1, fontSize: 13, color: Colors.black },

  // Filter bottom sheet
  sheetOverlay:  { flex: 1, justifyContent: "flex-end" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
    maxHeight: "85%",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: Colors.black },
  clearText:  { fontSize: 13, color: Colors.gray, fontWeight: "600" },

  filterLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.gray,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 16,
  },
  chipRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 4 },
  chip:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  chipActive:  { backgroundColor: Colors.black, borderColor: Colors.black },
  chipText:    { fontSize: 13, color: Colors.gray, fontWeight: "600" },
  chipTextActive: { color: Colors.gold, fontWeight: "700" },

  applyBtn: {
    backgroundColor: Colors.gold, borderRadius: 12,
    height: 52, alignItems: "center", justifyContent: "center", marginTop: 20,
  },
  applyBtnText: { fontSize: 16, fontWeight: "800", color: Colors.black },
});
