import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import HomeToolsCTA from "../shared/components/HomeToolsCTA";
import neighborhoods from "../content/neighborhoods.json";

const FILTERS = ["All", "Under $250K", "Top Schools", "Under 15 Min to Base"];

export default function NeighborhoodsScreen() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");

  const filtered = neighborhoods.filter((n) => {
    const matchSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.tagline.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Under $250K" && n.medianPrice < 250000) ||
      (filter === "Top Schools" && (n.schools.includes("A") || n.schools.includes("A+"))) ||
      (filter === "Under 15 Min to Base" && parseInt(n.driveToWPAFB) <= 15);

    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NEIGHBORHOODS</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search neighborhoods…"
          placeholderTextColor={Colors.grayLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} neighborhoods</Text>
      </View>

      {/* List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.map((hood) => (
          <TouchableOpacity
            key={hood.id}
            style={styles.card}
            onPress={() => router.push(`/neighborhood/${hood.id}`)}
            activeOpacity={0.85}
          >
            {/* Card top row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardName}>{hood.name}</Text>
              </View>
              {hood.youtubeVideoId && (
                <View style={styles.videoTag}>
                  <Ionicons name="play-circle" size={14} color={Colors.gold} />
                  <Text style={styles.videoTagText}>Tour</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
            </View>

            {/* Tagline */}
            <Text style={styles.cardTagline} numberOfLines={2}>{hood.tagline}</Text>

            {/* Stats row */}
            <View style={styles.cardStats}>
              <View style={styles.stat}>
                <Ionicons name="home-outline" size={13} color={Colors.gold} />
                <Text style={styles.statText}>${(hood.medianPrice / 1000).toFixed(0)}K</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="car-outline" size={13} color={Colors.gold} />
                <Text style={styles.statText}>{hood.driveToWPAFB} to base</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="school-outline" size={13} color={Colors.gold} />
                <Text style={styles.statText}>{hood.schools.split("—")[1]?.trim() ?? "See details"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={Colors.grayLight} />
            <Text style={styles.emptyText}>No neighborhoods match your search.</Text>
          </View>
        )}

        {/* Home browsing + mortgage calculator entry points */}
        <HomeToolsCTA
          title="Find a Home in These Neighborhoods"
          subtitle="Browse active listings or estimate your monthly payment"
        />

        <View style={{ height: 40 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.black,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  backBtn:     { padding: 4 },
  headerTitle: { color: Colors.gold, fontSize: 16, fontWeight: "900", letterSpacing: 2 },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black },

  filterScroll:  { backgroundColor: Colors.white, maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  filterChipActive:  { backgroundColor: Colors.black, borderColor: Colors.black },
  filterText:        { color: Colors.gray, fontSize: 13, fontWeight: "500" },
  filterTextActive:  { color: Colors.gold, fontWeight: "700" },

  countRow:  { backgroundColor: Colors.offWhite, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  countText: { color: Colors.gray, fontSize: 12 },

  list:        { flex: 1, backgroundColor: Colors.white },
  listContent: { padding: 16, gap: 12 },

  card: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  cardTitleBlock: { flex: 1 },
  cardName:       { fontSize: 17, fontWeight: "800", color: Colors.black, marginBottom: 3 },

  militaryTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#0A0A0A", alignSelf: "flex-start",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  militaryTagText: { color: Colors.gold, fontSize: 10, fontWeight: "700" },

  videoTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.offWhite, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: Colors.border,
  },
  videoTagText: { color: Colors.gold, fontSize: 10, fontWeight: "700" },

  cardTagline: { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 12 },

  cardStats:   { flexDirection: "row", alignItems: "center" },
  stat:        { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  statText:    { color: Colors.black, fontSize: 12, fontWeight: "600" },
  statDivider: { width: 1, height: 14, backgroundColor: Colors.border, marginHorizontal: 4 },

  empty:     { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: Colors.gray, marginTop: 12, fontSize: 14 },
});
