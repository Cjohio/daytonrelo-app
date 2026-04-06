/**
 * Skeleton loading components — lightweight animated placeholder shapes.
 * Uses React Native's built-in Animated API (no extra dependencies).
 */
import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

// ─── Base animated skeleton box ───────────────────────────────────────────────
export function SkeletonBox({
  width = "100%" as number | `${number}%` | "auto",
  height = 16,
  borderRadius = 8,
  style,
}: {
  width?: number | `${number}%` | "auto";
  height?: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: "#E0E0E0", opacity },
        style,
      ]}
    />
  );
}

// ─── Listing card skeleton ─────────────────────────────────────────────────────
export function ListingCardSkeleton() {
  return (
    <View style={sk.card}>
      {/* Photo placeholder */}
      <SkeletonBox height={180} borderRadius={12} />
      <View style={sk.body}>
        {/* Price row */}
        <View style={sk.row}>
          <SkeletonBox width={100} height={22} />
          <SkeletonBox width={60} height={18} />
        </View>
        {/* Address */}
        <SkeletonBox width="80%" height={14} style={{ marginTop: 8 }} />
        <SkeletonBox width="55%" height={14} style={{ marginTop: 6 }} />
        {/* Stats row */}
        <View style={[sk.row, { marginTop: 12 }]}>
          <SkeletonBox width={48} height={14} />
          <SkeletonBox width={48} height={14} />
          <SkeletonBox width={48} height={14} />
        </View>
      </View>
    </View>
  );
}

// ─── Community post row skeleton ───────────────────────────────────────────────
export function PostRowSkeleton() {
  return (
    <View style={sk.postCard}>
      <View style={sk.postHeader}>
        {/* Avatar circle */}
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width="40%" height={13} />
          <SkeletonBox width="25%" height={11} />
        </View>
      </View>
      <SkeletonBox width="70%" height={16} style={{ marginTop: 10 }} />
      <SkeletonBox width="100%" height={12} style={{ marginTop: 8 }} />
      <SkeletonBox width="85%" height={12} style={{ marginTop: 5 }} />
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: {
    padding: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
