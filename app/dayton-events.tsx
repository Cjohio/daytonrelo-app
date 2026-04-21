import { useState, useMemo, useEffect } from "react";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, SectionList, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import { EVENTS, DaytonEvent } from "../shared/components/DaytonEvents";
import { supabase } from "../lib/supabase";
import SaveButton from "../shared/components/SaveButton";

function mapRow(row: any): DaytonEvent {
  return {
    id: row.id, title: row.title, date: row.date,
    month: row.month, day: row.day, venue: row.venue,
    category: row.category, isFree: row.is_free,
    price: row.price ?? undefined, desc: row.description, url: row.url,
  };
}

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORIES: { key: DaytonEvent["category"] | "all"; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "music",    label: "🎵 Music" },
  { key: "festival", label: "🎉 Festival" },
  { key: "sports",   label: "🏟️ Sports" },
  { key: "arts",     label: "🎨 Arts" },
  { key: "family",   label: "👨‍👩‍👧 Family" },
  { key: "food",     label: "🍺 Food & Drink" },
];

const CAT_COLORS: Record<DaytonEvent["category"], string> = {
  music:    "#8B5CF6",
  festival: "#F59E0B",
  sports:   "#10B981",
  arts:     "#EC4899",
  family:   "#3B82F6",
  food:     "#EF4444",
};

// Sort key by month order
const MONTH_ORDER: Record<string, number> = {
  JAN:1, FEB:2, MAR:3, APR:4, MAY:5, JUN:6,
  JUL:7, AUG:8, SEP:9, OCT:10, NOV:11, DEC:12, MON:13,
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DaytonEventsScreen() {
  const [allEvents,      setAllEvents]      = useState<DaytonEvent[]>(EVENTS);
  const [loading,        setLoading]        = useState(true);
  const [activeCategory, setActiveCategory] = useState<DaytonEvent["category"] | "all">("all");
  const [freeOnly,       setFreeOnly]       = useState(false);

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .gte("end_date", todayIso)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setAllEvents(data.map(mapRow));
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const source = allEvents;
    return source.filter((e) => {
      if (activeCategory !== "all" && e.category !== activeCategory) return false;
      if (freeOnly && !e.isFree) return false;
      return true;
    });
  }, [allEvents, activeCategory, freeOnly]);

  // Group by month
  const sections = useMemo(() => {
    const groups: Record<string, DaytonEvent[]> = {};
    filtered.forEach((e) => {
      const key = e.month;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99))
      .map(([month, data]) => ({
        title: MONTH_NAMES[month] ?? month,
        data,
      }));
  }, [filtered]);

  const freeCount  = allEvents.filter((e) => e.isFree).length;
  const monthCount = new Set(allEvents.map((e) => e.month)).size;

  return (
    <View style={s.container}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      {/* ── Hero stats bar ──────────────────────────────────────────────── */}
      <View style={s.statsBar}>
        <View style={s.stat}>
          <Text style={s.statNum}>{loading ? "…" : allEvents.length}</Text>
          <Text style={s.statLabel}>Events</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.stat}>
          <Text style={s.statNum}>{freeCount}</Text>
          <Text style={s.statLabel}>Free</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.stat}>
          <Text style={s.statNum}>{monthCount}</Text>
          <Text style={s.statLabel}>Months</Text>
        </View>
        <TouchableOpacity
          style={[s.freeToggle, freeOnly && s.freeToggleActive]}
          onPress={() => setFreeOnly((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name={freeOnly ? "checkmark-circle" : "checkmark-circle-outline"} size={14} color={freeOnly ? "#065F46" : Colors.gray} />
          <Text style={[s.freeToggleText, freeOnly && s.freeToggleTextActive]}>Free only</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category filter ─────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterStrip}
        style={s.filterScroll}
      >
        {CATEGORIES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.filterChip, activeCategory === key && s.filterChipActive]}
            onPress={() => setActiveCategory(key)}
            activeOpacity={0.8}
          >
            <Text style={[s.filterChipText, activeCategory === key && s.filterChipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Event list ──────────────────────────────────────────────────── */}
      {sections.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={40} color={Colors.border} />
          <Text style={s.emptyText}>No events match your filters</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          renderSectionHeader={({ section: { title } }) => (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => <EventRow event={item} />}
          stickySectionHeadersEnabled={true}
        />
      )}
    </View>
  );
}

// ─── Event row card ───────────────────────────────────────────────────────────
function EventRow({ event }: { event: DaytonEvent }) {
  const color = CAT_COLORS[event.category];
  return (
    <View style={[r.card, { borderLeftColor: color }]}>
      {/* Header */}
      <View style={r.headerRow}>
        <View style={[r.dateBadge, { backgroundColor: color }]}>
          <Text style={r.badgeMonth}>{event.month}</Text>
          <Text style={r.badgeDay}>{event.day}</Text>
        </View>
        <View style={r.headerInfo}>
          <Text style={r.title} numberOfLines={2}>{event.title}</Text>
          <View style={r.venueRow}>
            <Ionicons name="location-outline" size={11} color={Colors.grayLight} />
            <Text style={r.venue} numberOfLines={1}>{event.venue}</Text>
          </View>
        </View>
        <View style={r.badgesCol}>
          {event.isFree
            ? <View style={r.freeBadge}><Text style={r.freeText}>FREE</Text></View>
            : event.price
              ? <Text style={r.price}>{event.price}</Text>
              : null
          }
        </View>
      </View>

      {/* Date string */}
      <View style={r.dateRow}>
        <Ionicons name="calendar-outline" size={12} color={Colors.gray} />
        <Text style={r.dateStr}>{event.date}</Text>
      </View>

      {/* Description */}
      <Text style={r.desc}>{event.desc}</Text>

      {/* Footer */}
      <View style={r.footer}>
        <View style={[r.catChip, { backgroundColor: color + "22" }]}>
          <Text style={[r.catText, { color }]}>
            {CATEGORIES.find((c) => c.key === event.category)?.label ?? event.category}
          </Text>
        </View>
        <TouchableOpacity
          style={r.webBtn}
          onPress={() => Linking.openURL(event.url)}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={13} color={Colors.gold} />
          <Text style={r.webText}>Website</Text>
          <Ionicons name="open-outline" size={11} color={Colors.gold} />
        </TouchableOpacity>
        <SaveButton
          itemType="page"
          itemId={`event-${event.id}`}
          title={event.title}
          subtitle={`${event.date} · ${event.venue}`}
          route="/dayton-events"
          size={20}
          metadata={{
            event_month: event.month,
            event_day:   event.day,
            event_year:  2026,
            event_venue: event.venue,
          }}
        />
      </View>
    </View>
  );
}

// ─── Month name map ───────────────────────────────────────────────────────────
const MONTH_NAMES: Record<string, string> = {
  JAN: "January",  FEB: "February", MAR: "March",
  APR: "April",    MAY: "May",      JUN: "June",
  JUL: "July",     AUG: "August",   SEP: "September",
  OCT: "October",  NOV: "November", DEC: "December",
  MON: "Year-Round / Monthly",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  statsBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.black,
    paddingHorizontal: 20, paddingVertical: 12, gap: 0,
  },
  stat: { alignItems: "center", flex: 1 },
  statNum:  { color: Colors.gold, fontSize: 20, fontWeight: "900" },
  statLabel:{ color: Colors.grayLight, fontSize: 10, letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: "#333" },
  freeToggle: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#1A1A1A", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "#333",
  },
  freeToggleActive: { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" },
  freeToggleText: { color: Colors.gray, fontSize: 11, fontWeight: "600" },
  freeToggleTextActive: { color: "#065F46" },

  filterScroll: { flexGrow: 0, backgroundColor: Colors.offWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterStrip:  {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    flexShrink: 0, flexGrow: 0, alignSelf: "center",
  },
  filterChipActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  filterChipText: { color: Colors.gray, fontSize: 13, fontWeight: "600", flexShrink: 0 },
  filterChipTextActive: { color: Colors.gold, fontWeight: "700" },

  listContent: { padding: 16, paddingBottom: 40 },

  sectionHeader: {
    backgroundColor: Colors.offWhite, paddingVertical: 8, paddingHorizontal: 4,
    marginBottom: 8, marginTop: 8,
    borderLeftWidth: 3, borderLeftColor: Colors.gold, paddingLeft: 12,
  },
  sectionTitle: { color: Colors.black, fontSize: 14, fontWeight: "800", letterSpacing: 0.3 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.grayLight, fontSize: 15 },
});

const r = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  headerRow: { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  dateBadge: {
    width: 42, borderRadius: 8, alignItems: "center", paddingVertical: 5, flexShrink: 0,
  },
  badgeMonth: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  badgeDay:   { color: "#fff", fontSize: 16, fontWeight: "900", lineHeight: 20 },
  headerInfo: { flex: 1 },
  title: { color: Colors.black, fontSize: 14, fontWeight: "800", marginBottom: 3, lineHeight: 19 },
  venueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  venue: { color: Colors.grayLight, fontSize: 11, flex: 1 },
  badgesCol: { alignItems: "flex-end", gap: 4 },
  freeBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  freeText:  { color: "#065F46", fontSize: 10, fontWeight: "800" },
  price:     { color: Colors.gray, fontSize: 11, fontWeight: "600" },
  dateRow:   { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  dateStr:   { color: Colors.gray, fontSize: 11 },
  desc:      { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  catChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: "700" },
  webBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.offWhite, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  webText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },
});
