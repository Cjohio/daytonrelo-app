import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "../../shared/theme/colors";
import { getPersona } from "../../shared/persona";
import { simplyRetsApi } from "../../api/simplyrets";
import { Listing } from "../../shared/types/listing";
import ListingCard from "../../shared/components/ListingCard";
import { ListingCardSkeleton } from "../../shared/components/SkeletonLoader";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";

const SEARCHES_KEY = "saved_searches_v1";
type SavedSearch = { id: string; label: string; area: string; mode: ListingMode; maxBudget?: number; query: string };

type ListingMode = "sale" | "rent";

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

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ area?: string; budget?: string }>();

  const [mode,         setMode]        = useState<ListingMode>("sale");
  const [area,         setArea]        = useState("All Areas");
  const [query,        setQuery]       = useState("");
  const [maxBudget,    setMaxBudget]   = useState<number | undefined>(undefined);
  const [listings,     setListings]    = useState<Listing[]>([]);
  const [loading,      setLoading]     = useState(false);
  const [searched,     setSearched]    = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveFeedback,  setSaveFeedback]  = useState(false);

  // Load saved searches on mount
  useEffect(() => {
    AsyncStorage.getItem(SEARCHES_KEY).then(raw => {
      if (raw) try { setSavedSearches(JSON.parse(raw)); } catch {}
    });
  }, []);

  function buildLabel(a: string, m: ListingMode, b?: number, q?: string) {
    return [
      m === "sale" ? "For Sale" : "For Rent",
      a !== "All Areas" ? a : null,
      b ? `≤$${(b / 1000).toFixed(0)}K` : null,
      q && q.trim() ? `"${q.trim()}"` : null,
    ].filter(Boolean).join(" · ");
  }

  function saveSearch() {
    const label = buildLabel(area, mode, maxBudget, query);
    const entry: SavedSearch = { id: Date.now().toString(), label, area, mode, maxBudget, query };
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
    setArea(s.area);
    setMode(s.mode);
    setMaxBudget(s.maxBudget);
    setQuery(s.query);
    fetchListings(s.area, s.maxBudget);
  }

  // Accept a pre-selected area from other screens (quiz, hub buttons, etc.)
  useEffect(() => {
    if (params.area) {
      const match = AREAS.find(
        a => a.toLowerCase() === (params.area as string).toLowerCase()
      );
      if (match && match !== "All Areas") {
        setArea(match);
        fetchListings(match, undefined);
      }
    }
  }, [params.area]);

  // Accept a budget cap from BAH calculator
  useEffect(() => {
    if (params.budget) {
      const budget = parseInt(params.budget as string, 10);
      if (!isNaN(budget)) {
        setMaxBudget(budget);
        fetchListings(undefined, budget);
      }
    }
  }, [params.budget]);

  const fetchListings = async (areaOverride?: string, budgetOverride?: number) => {
    const activeArea   = areaOverride   ?? area;
    const activeMaxPrice = budgetOverride ?? maxBudget;
    setLoading(true);
    setError(null);
    try {
      const cities = activeArea === "All Areas" ? [] : [activeArea];
      const results =
        mode === "sale"
          ? await simplyRetsApi.getForSale({ cities, q: query || undefined, limit: 20, maxprice: activeMaxPrice })
          : await simplyRetsApi.getRentals({ cities, q: query || undefined, limit: 20, maxprice: activeMaxPrice });
      setListings(results);
      setSearched(true);
    } catch (e: any) {
      setError("We couldn't load listings right now. Please try again in a moment, or contact Chris if the issue continues.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />
      {/* Header */}
      <BrandHeader
          left={<BackBtn onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)} />}
          right={<HeaderActions />}
        />

      {/* Sale / Rent toggle */}
      <View style={styles.toggleRow}>
        {FILTER_TABS.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.toggleBtn, mode === value && styles.toggleBtnActive]}
            onPress={() => setMode(value)}
          >
            <Text style={[styles.toggleText, mode === value && styles.toggleTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Address, neighborhood, zip…"
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
        <TouchableOpacity style={styles.searchBtn} onPress={() => fetchListings()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Budget filter banner */}
      {maxBudget && (
        <View style={styles.budgetBanner}>
          <Ionicons name="calculator-outline" size={14} color={Colors.gold} />
          <Text style={styles.budgetBannerText}>
            Filtered by BAH budget: up to ${maxBudget.toLocaleString()}
          </Text>
          <TouchableOpacity onPress={() => { setMaxBudget(undefined); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={Colors.gray} />
          </TouchableOpacity>
        </View>
      )}

      {/* Area chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {AREAS.map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.areaChip, area === a && styles.areaChipActive]}
            onPress={() => setArea(a)}
          >
            <Text style={[styles.areaChipText, area === a && styles.areaChipTextActive]}>
              {a}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Save search bar */}
      <View style={styles.saveBar}>
        <Text style={styles.saveBarLabel} numberOfLines={1}>
          {buildLabel(area, mode, maxBudget, query)}
        </Text>
        <TouchableOpacity style={styles.saveBtn} onPress={saveSearch} activeOpacity={0.8}>
          <Ionicons
            name={saveFeedback ? "bookmark" : "bookmark-outline"}
            size={15}
            color={saveFeedback ? Colors.gold : Colors.gray}
          />
          <Text style={[styles.saveBtnText, saveFeedback && { color: Colors.gold }]}>
            {saveFeedback ? "Saved!" : "Save Search"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        {loading && (
          <>
            {[1, 2, 3].map((i) => <ListingCardSkeleton key={i} />)}
          </>
        )}

        {error && !loading && (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !searched && (
          <>
            {savedSearches.length > 0 && (
              <View style={styles.savedSection}>
                <View style={styles.savedHeader}>
                  <Ionicons name="bookmark" size={14} color={Colors.gold} />
                  <Text style={styles.savedTitle}>Saved Searches</Text>
                </View>
                {savedSearches.map(s => (
                  <View key={s.id} style={styles.savedRow}>
                    <TouchableOpacity style={styles.savedRowContent} onPress={() => recallSearch(s)} activeOpacity={0.8}>
                      <Ionicons name="search-outline" size={14} color={Colors.gray} />
                      <Text style={styles.savedRowText} numberOfLines={1}>{s.label}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSavedSearch(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle-outline" size={18} color={Colors.grayLight} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.centered}>
              <Ionicons name="home-outline" size={48} color={Colors.grayLight} />
              <Text style={styles.emptyTitle}>Search Dayton MLS</Text>
              <Text style={styles.emptyBody}>
                Choose an area and hit Search to browse live IDX listings.{"\n"}
                SimplyRETS sandbox data loads by default.
              </Text>
            </View>
          </>
        )}

        {!loading && searched && listings.length === 0 && !error && (
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={40} color={Colors.grayLight} />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyBody}>Try a different area or search term.</Text>
          </View>
        )}

        {!loading && listings.map((listing) => (
          <ListingCard
            key={listing.mlsId}
            listing={listing}
            onPress={() => router.push({ pathname: "/listing" as any, params: { mlsId: listing.mlsId.toString() } })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },
  header: {
    backgroundColor:   Colors.black,
    paddingHorizontal: 20,
    paddingBottom:     16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldDark,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 4,
  },
  backLabel: {
    color: Colors.gold, fontSize: 14, fontWeight: "600",
  },
  headerCenter: {
    flex: 1, paddingHorizontal: 8,
  },
  headerTitle: {
    color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3,
  },
  headerSub: {
    color: Colors.grayLight, fontSize: 10, letterSpacing: 1, marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.border,
  },
  toggleBtnActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  toggleText:      { color: Colors.gray, fontWeight: "600", fontSize: 14 },
  toggleTextActive:{ color: Colors.gold, fontWeight: "700", fontSize: 14 },
  searchRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput:  { flex: 1, fontSize: 14, color: Colors.black },
  searchBtn: {
    backgroundColor: Colors.gold, borderRadius: 10,
    paddingHorizontal: 16, justifyContent: "center",
  },
  searchBtnText: { color: Colors.black, fontWeight: "700", fontSize: 14 },
  budgetBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1A1A1A", paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#333",
  },
  budgetBannerText: { flex: 1, color: Colors.gold, fontSize: 12, fontWeight: "600" },
  areaScroll:    { backgroundColor: Colors.white, paddingVertical: 10, maxHeight: 52 },
  areaChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  areaChipActive:     { backgroundColor: Colors.black, borderColor: Colors.black },
  areaChipText:       { color: Colors.gray, fontSize: 13, fontWeight: "500" },
  areaChipTextActive: { color: Colors.gold, fontWeight: "700" },
  saveBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  saveBarLabel: { flex: 1, fontSize: 12, color: Colors.gray, marginRight: 12 },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  saveBtnText: { fontSize: 12, fontWeight: "600", color: Colors.gray },

  savedSection: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  savedHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  savedTitle:  { fontSize: 13, fontWeight: "800", color: Colors.black },
  savedRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 8,
                 borderTopWidth: 1, borderTopColor: Colors.border },
  savedRowContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  savedRowText: { flex: 1, fontSize: 13, color: Colors.black },

  results:        { flex: 1, backgroundColor: Colors.white },
  resultsContent: { padding: 16 },
  centered: {
    alignItems: "center", paddingVertical: 60, paddingHorizontal: 24,
  },
  loadingText: { color: Colors.gray, marginTop: 12, fontSize: 14 },
  errorText:   { color: Colors.error, textAlign: "center", marginTop: 12, fontSize: 14 },
  emptyTitle:  { color: Colors.black, fontWeight: "700", fontSize: 17, marginTop: 14 },
  emptyBody:   { color: Colors.gray, fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
