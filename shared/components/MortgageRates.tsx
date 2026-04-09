// ─────────────────────────────────────────────────────────────────────────────
//  MortgageRates — Live rate marquee ticker
//
//  Data source: St. Louis Fed (FRED) — free API key required
//    Register: https://fred.stlouisfed.org/docs/api/api_key.html
//    Add EXPO_PUBLIC_FRED_API_KEY to .env
//
//  Updates:  Freddie Mac publishes every Thursday — rates are weekly.
//  Fallback: Shows approximate market estimates if no API key is configured.
//  Caching:  Module-level cache → one fetch per app launch per day.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
  Animated, Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_CONFIG } from "../../api/config";
import { Colors } from "../theme/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateSet {
  rate30:    number;
  rate15:    number;
  rateVA:    number;
  asOf:      string;
  isLive:    boolean;
  fetchedAt: number;
}

// ─── Module-level cache ───────────────────────────────────────────────────────

let _cache: RateSet | null = null;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// ─── FRED helpers ─────────────────────────────────────────────────────────────

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<number> {
  const url =
    `${FRED_BASE}?series_id=${seriesId}` +
    `&api_key=${apiKey}&sort_order=desc&limit=1&file_type=json`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  const json = await res.json();
  const val  = parseFloat(json?.observations?.[0]?.value ?? "");
  if (isNaN(val)) throw new Error(`FRED ${seriesId} bad value`);
  return val;
}

async function fredDateLabel(seriesId: string, apiKey: string): Promise<string> {
  const url =
    `${FRED_BASE}?series_id=${seriesId}` +
    `&api_key=${apiKey}&sort_order=desc&limit=1&file_type=json`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    const d    = json?.observations?.[0]?.date as string | undefined;
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

// ─── Fallback rates ───────────────────────────────────────────────────────────

const FALLBACK: Omit<RateSet, "fetchedAt"> = {
  rate30:  6.78,
  rate15:  6.12,
  rateVA:  6.28,
  asOf:    "Est.",
  isLive:  false,
};

// ─── Data loader ──────────────────────────────────────────────────────────────

async function loadRates(): Promise<RateSet> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) return _cache;
  const apiKey = API_CONFIG.fred.apiKey;
  if (!apiKey) {
    const result: RateSet = { ...FALLBACK, fetchedAt: Date.now() };
    _cache = result;
    return result;
  }
  try {
    const [rate30, rate15, dateLabel] = await Promise.all([
      fetchFredSeries("MORTGAGE30US", apiKey),
      fetchFredSeries("MORTGAGE15US", apiKey),
      fredDateLabel("MORTGAGE30US", apiKey),
    ]);
    const rateVA = Math.round((rate30 - 0.44) * 100) / 100;
    const result: RateSet = {
      rate30, rate15, rateVA,
      asOf:    `Wk of ${dateLabel}`,
      isLive:  true,
      fetchedAt: Date.now(),
    };
    _cache = result;
    return result;
  } catch {
    const result: RateSet = { ...FALLBACK, fetchedAt: Date.now() };
    _cache = result;
    return result;
  }
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────

function PulseDot() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.9, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,   duration: 900, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={dot.wrap}>
      <Animated.View style={[dot.ring, { transform: [{ scale }], opacity }]} />
      <View style={dot.core} />
    </View>
  );
}

const dot = StyleSheet.create({
  wrap: { width: 12, height: 12, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 9, height: 9, borderRadius: 5, backgroundColor: "#22C55E" },
  core: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
});

// ─── Marquee ticker ───────────────────────────────────────────────────────────

const SEP = "     ·     ";
const SCROLL_SPEED = 55; // px per second

function Marquee({ rates }: { rates: RateSet }) {
  const translateX    = useRef(new Animated.Value(0)).current;
  const animRef       = useRef<Animated.CompositeAnimation | null>(null);
  const [halfW, setHalfW] = useState(0);

  // Build one copy of the ticker string
  const segment =
    `  30-YR  ${rates.rate30.toFixed(2)}%` +
    `${SEP}15-YR  ${rates.rate15.toFixed(2)}%` +
    `${SEP}VA LOAN  ${rates.rateVA.toFixed(2)}%  ` +
    `${SEP}No PMI · $0 Down${SEP}`;

  // Double it for seamless looping
  const fullText = segment + segment;

  useEffect(() => {
    if (halfW === 0) return;
    animRef.current?.stop();
    translateX.setValue(0);

    animRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue:  -halfW,
        duration: (halfW / SCROLL_SPEED) * 1000,
        easing:   Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();

    return () => animRef.current?.stop();
  }, [halfW]);

  return (
    <View style={ticker.clip}>
      <Animated.Text
        style={[ticker.text, { transform: [{ translateX }] }]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setHalfW(w / 2);
        }}
        numberOfLines={1}
      >
        {fullText}
      </Animated.Text>
    </View>
  );
}

const ticker = StyleSheet.create({
  clip: {
    overflow: "hidden",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  text: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    // Keep on one line — width is naturally unconstrained inside Animated.Text
  },
});

// ─── Rate highlights (colored spans inside the ticker text via separate render) ─

function TickerContent({ rates }: { rates: RateSet }) {
  // Build a row of colored Text spans instead of plain string,
  // for per-rate accent colors — works with the same overflow:hidden clip
  const items = [
    { label: "30-YR FIXED",  value: `${rates.rate30.toFixed(2)}%`, color: Colors.gold   },
    { label: "15-YR FIXED",  value: `${rates.rate15.toFixed(2)}%`, color: "#60A5FA"     },
    { label: "VA LOAN",      value: `${rates.rateVA.toFixed(2)}%`, color: "#34D399"     },
    { label: "No PMI · $0 Down", value: null,                      color: "#666"        },
  ];

  // Duplicate for seamless loop
  const both = [...items, ...items];

  const translateX    = useRef(new Animated.Value(0)).current;
  const animRef       = useRef<Animated.CompositeAnimation | null>(null);
  const [halfW, setHalfW] = useState(0);

  useEffect(() => {
    if (halfW === 0) return;
    animRef.current?.stop();
    translateX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue:  -halfW,
        duration: (halfW / SCROLL_SPEED) * 1000,
        easing:   Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();
    return () => animRef.current?.stop();
  }, [halfW]);

  return (
    <View style={tc.clip}>
      <Animated.View
        style={[tc.row, { transform: [{ translateX }] }]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setHalfW(w / 2);
        }}
      >
        {both.map(({ label, value, color }, i) => (
          <View key={i} style={tc.item}>
            {i > 0 && <Text style={tc.sep}>·</Text>}
            <Text style={tc.label}>{label}</Text>
            {value && <Text style={[tc.value, { color }]}>{value}</Text>}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const tc = StyleSheet.create({
  clip: {
    overflow: "hidden",
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  sep: {
    color: "#444",
    fontSize: 13,
    marginRight: 12,
  },
  label: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
});

// ─── Historical Sparkline ─────────────────────────────────────────────────────
// Hardcoded weekly 30-yr fixed rate data — last 8 Freddie Mac readings
// (approximate 2025–2026 weekly values; update when live API is wired)
const RATE_HISTORY: number[] = [7.22, 7.09, 7.04, 6.95, 6.87, 6.94, 6.82, 6.78];
const SPARK_BAR_W = 9;
const SPARK_GAP   = 4;
const SPARK_H     = 28;  // total chart height in px
const SPARK_MIN_H = 4;   // minimum bar height so tiny bars still show

function Sparkline() {
  const minR = Math.min(...RATE_HISTORY);
  const maxR = Math.max(...RATE_HISTORY);
  const range = maxR - minR || 0.01;

  return (
    <View style={sp.wrap}>
      <View style={sp.chart}>
        {RATE_HISTORY.map((r, i) => {
          const isLast = i === RATE_HISTORY.length - 1;
          const frac   = (r - minR) / range;            // 0 = lowest, 1 = highest
          const barH   = SPARK_MIN_H + frac * (SPARK_H - SPARK_MIN_H);
          // Color: low rate = green, high rate = red/orange
          const color  = isLast
            ? Colors.gold
            : frac < 0.33
              ? "#22C55E"
              : frac < 0.66
                ? "#FACC15"
                : "#F87171";
          return (
            <View key={i} style={sp.barWrap}>
              <View style={[sp.bar, { height: barH, backgroundColor: color, opacity: isLast ? 1 : 0.7 }]} />
            </View>
          );
        })}
      </View>
      <View style={sp.labelRow}>
        <Text style={sp.labelLeft}>8 wk ago</Text>
        <Text style={sp.labelRight}>Today</Text>
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap:     { paddingHorizontal: 12, paddingBottom: 6, paddingTop: 4 },
  chart:    { flexDirection: "row", alignItems: "flex-end", height: SPARK_H, gap: SPARK_GAP },
  barWrap:  { width: SPARK_BAR_W },
  bar:      { width: SPARK_BAR_W, borderRadius: 3 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 3 },
  labelLeft:  { color: "#444", fontSize: 9 },
  labelRight: { color: "#888", fontSize: 9 },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function MortgageRates() {
  const [rates,   setRates]   = useState<RateSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates().then(setRates).finally(() => setLoading(false));
  }, []);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push("/lender" as any)}
      activeOpacity={0.88}
    >
      {/* Header row */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {rates?.isLive !== false ? (
            <>
              <PulseDot />
              <Text style={s.liveLabel}>LIVE</Text>
            </>
          ) : null}
          <Text style={s.title}>Today's Mortgage Rates</Text>
        </View>
        <View style={s.headerRight}>
          {rates && (
            <Text style={s.asOf}>{rates.asOf}</Text>
          )}
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.freddiemac.com/pmms")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="open-outline" size={12} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Historical sparkline */}
      <Sparkline />

      {/* Ticker */}
      {loading || !rates ? (
        <View style={s.skeletonRow}>
          <View style={s.skeleton} />
        </View>
      ) : (
        <TickerContent rates={rates} />
      )}

      {/* Lender nudge */}
      <View style={s.lenderFooter}>
        <Ionicons name="business-outline" size={12} color={Colors.goldDark} />
        <Text style={s.lenderFooterText}>Meet our preferred lenders</Text>
        <Ionicons name="chevron-forward" size={12} color={Colors.goldDark} style={{ marginLeft: "auto" }} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Card styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveLabel: {
    color: "#22C55E",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: {
    color: "#AAA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  asOf: {
    color: "#444",
    fontSize: 10,
  },
  skeletonRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  skeleton: {
    height: 14,
    borderRadius: 6,
    backgroundColor: "#1E1E1E",
  },
  lenderFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
  },
  lenderFooterText: {
    color: Colors.goldDark,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
