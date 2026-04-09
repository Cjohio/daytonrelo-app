import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { simplyRetsApi } from "../../api/simplyrets";
import { Listing } from "../types/listing";
import ListingCard from "./ListingCard";
import { Colors } from "../theme/colors";

interface FeaturedListingsProps {
  /** If true, fetches near-WPAFB zip codes instead of generic newest */
  nearWPAFB?: boolean;
  title?: string;
}

export default function FeaturedListings({
  nearWPAFB = false,
  title = "Featured Listings",
}: FeaturedListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = nearWPAFB
          ? await simplyRetsApi.getNearWPAFB({ limit: 4 })
          : await simplyRetsApi.getFeatured(4);
        setListings(data.slice(0, 4));
      } catch (e) {
        // API unavailable — fallback CTA will render
        console.log("[FeaturedListings] API error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [nearWPAFB]);

  return (
    <View style={s.container}>
      {/* Header row */}
      <View style={s.header}>
        <Text style={s.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={s.seeAllBtn}
          onPress={() => router.push("/(tabs)/explore" as any)}
          activeOpacity={0.8}
        >
          <Text style={s.seeAllText}>See All</Text>
          <Ionicons name="arrow-forward" size={13} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.gold} />
        </View>
      ) : listings.length > 0 ? (
        /* Horizontal card strip */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.strip}
        >
          {listings.map((listing) => (
            <ListingCard
              key={listing.mlsId}
              listing={listing}
              compact
              onPress={() =>
                router.push({
                  pathname: "/listing",
                  params: { mlsId: String(listing.mlsId) },
                } as any)
              }
            />
          ))}
          {/* Right-edge "See All" tile */}
          <TouchableOpacity
            style={s.seeAllTile}
            onPress={() => router.push("/(tabs)/explore" as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={26} color={Colors.gold} />
            <Text style={s.seeAllTileText}>See All{"\n"}Listings</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.gold} />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Fallback CTA — shown when API is unavailable */
        <TouchableOpacity
          style={s.fallback}
          onPress={() => router.push("/(tabs)/explore" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={28} color={Colors.gold} />
          <View style={s.fallbackText}>
            <Text style={s.fallbackTitle}>Browse Available Homes</Text>
            <Text style={s.fallbackSub}>Search active listings in the Dayton area</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.gold} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: 28,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "800",
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    paddingLeft: 10,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  strip: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  seeAllTile: {
    width: 120,
    backgroundColor: Colors.black,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginRight: 4,
  },
  seeAllTileText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  /* Fallback */
  fallback: {
    marginHorizontal: 20,
    backgroundColor: Colors.black,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  fallbackText: { flex: 1 },
  fallbackTitle: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 3,
  },
  fallbackSub: {
    color: Colors.grayLight,
    fontSize: 12,
    lineHeight: 17,
  },
});
