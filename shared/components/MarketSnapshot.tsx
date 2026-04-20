import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../theme/colors";
import { trestleApi } from "../../api/trestle";
import { Listing, formatPrice } from "../types/listing";

// ─── helpers ────────────────────────────────────────────────────────────────

function daysOnMarket(listDate: string): number {
  const listed = new Date(listDate).getTime();
  const now    = Date.now();
  return Math.max(0, Math.floor((now - listed) / (1000 * 60 * 60 * 24)));
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid    = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ─── pulse animation ─────────────────────────────────────────────────────────

function PulseDot() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.8, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,   duration: 900, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseWrapper}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
      <View style={styles.pulseDot} />
    </View>
  );
}

// ─── main widget ─────────────────────────────────────────────────────────────

interface Stat {
  label:    string;
  value:    string;
  icon:     React.ComponentProps<typeof Ionicons>["name"];
  positive?: boolean; // green tint for good market signal
}

export default function MarketSnapshot() {
  const [stats,   setStats]   = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const listings: Listing[] = await trestleApi.getForSale({ top: 50 });
        if (listings.length === 0) throw new Error("empty");

        const prices = listings.map((l) => l.listPrice);
        const doms   = listings
          .filter((l) => l.listDate)
          .map((l)    => daysOnMarket(l.listDate!));

        const medianPrice = median(prices);
        const avgDOM      = doms.length
          ? Math.round(doms.reduce((s, d) => s + d, 0) / doms.length)
          : 0;

        // Count listings active within last 7 days
        const newThisWeek = listings.filter(
          (l) => l.listDate && daysOnMarket(l.listDate) <= 7
        ).length;

        setStats([
          {
            label: "Active Listings",
            value: listings.length.toString(),
            icon:  "home-outline",
          },
          {
            label:    "Median Price",
            value:    formatPrice(medianPrice),
            icon:     "pricetag-outline",
          },
          {
            label:    "Avg Days on Market",
            value:    `${avgDOM}d`,
            icon:     "time-outline",
            positive: avgDOM <= 30,
          },
          {
            label:    "New This Week",
            value:    newThisWeek.toString(),
            icon:     "flash-outline",
            positive: newThisWeek > 0,
          },
        ]);

        const now = new Date();
        setUpdated(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (error) return null; // silently hide on error rather than break layout

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.liveRow}>
          <PulseDot />
          <Text style={styles.liveLabel}>LIVE</Text>
          <Text style={styles.cardTitle}>Dayton Market Snapshot</Text>
        </View>
        {updated ? (
          <Text style={styles.updated}>Updated {updated}</Text>
        ) : null}
      </View>

      {/* Stats grid */}
      {loading ? (
        <View style={styles.loadingRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonStat} />
          ))}
        </View>
      ) : (
        <View style={styles.statsGrid}>
          {stats.map(({ label, value, icon, positive }) => (
            <View key={label} style={styles.statCell}>
              <View style={[styles.iconWrap, positive && styles.iconWrapPositive]}>
                <Ionicons
                  name={icon}
                  size={16}
                  color={positive ? "#22C55E" : Colors.gold}
                />
              </View>
              <Text style={[styles.statValue, positive && styles.statValuePositive]}>
                {value}
              </Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        style={styles.cta}
        onPress={() => router.push("/(tabs)/explore" as any)}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>Browse All Listings</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseWrapper: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  liveLabel: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  updated: {
    color: "#555",
    fontSize: 10,
  },

  // Loading skeletons
  loadingRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  skeletonStat: {
    flex: 1,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  statCell: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapPositive: {
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  statValue: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "800",
  },
  statValuePositive: {
    color: "#22C55E",
  },
  statLabel: {
    color: "#666",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
  },

  // CTA strip
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.gold,
    paddingVertical: 11,
  },
  ctaText: {
    color: Colors.black,
    fontWeight: "700",
    fontSize: 13,
  },
});
