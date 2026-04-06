import { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../shared/theme/colors";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Checklist data ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id:    "general",
    title: "General Move-In",
    icon:  "home-outline" as const,
    color: Colors.gold,
    categories: [
      {
        title: "Week 1 — Admin",
        items: [
          { id: "g1",  text: "Forward mail from old address at USPS.com" },
          { id: "g2",  text: "Update address with your bank" },
          { id: "g3",  text: "Notify employer / HR of new address" },
          { id: "g4",  text: "Update address on credit cards & subscriptions" },
          { id: "g5",  text: "Update voter registration (Ohio)" },
        ],
      },
      {
        title: "Week 1 — Utilities",
        items: [
          { id: "g6",  text: "Set up electric (AES Ohio or DP&L)" },
          { id: "g7",  text: "Set up gas (Vectren / CenterPoint Energy)" },
          { id: "g8",  text: "Set up internet (Spectrum, AT&T, or WOW!)" },
          { id: "g9",  text: "Set up renter's or homeowner's insurance" },
        ],
      },
      {
        title: "Week 2 — Ohio DMV",
        items: [
          { id: "g10", text: "Get Ohio driver's license (required within 30 days)" },
          { id: "g11", text: "Register vehicle in Ohio (required within 30 days)" },
          { id: "g12", text: "Get Ohio auto insurance card" },
        ],
      },
      {
        title: "Week 2 — Healthcare",
        items: [
          { id: "g13", text: "Find a primary care physician in Dayton" },
          { id: "g14", text: "Request medical records from prior provider" },
          { id: "g15", text: "Find a dentist" },
          { id: "g16", text: "Locate nearest urgent care & emergency room" },
          { id: "g17", text: "Transfer prescriptions to a local pharmacy" },
        ],
      },
      {
        title: "Week 2–3 — Kids & Schools",
        items: [
          { id: "g18", text: "Enroll children in school district" },
          { id: "g19", text: "Request transfer of school records" },
          { id: "g20", text: "Research after-school programs & extracurriculars" },
        ],
      },
      {
        title: "Week 3–4 — Community",
        items: [
          { id: "g21", text: "Find your nearest grocery store & pharmacy" },
          { id: "g22", text: "Explore your neighborhood — get the lay of the land" },
          { id: "g23", text: "Visit the National Air Force Museum (it's free!)" },
          { id: "g24", text: "Find a local gym, park, or trail near you" },
          { id: "g25", text: "Join a local Facebook group or Nextdoor" },
        ],
      },
    ],
  },
  {
    id:    "military",
    title: "Military / WPAFB",
    icon:  "shield-checkmark-outline" as const,
    color: "#4A90D9",
    categories: [
      {
        title: "In-Processing",
        items: [
          { id: "m1", text: "Report to gaining unit and begin in-processing" },
          { id: "m2", text: "Confirm PCS orders are finalized" },
          { id: "m3", text: "Connect with your unit sponsor" },
          { id: "m4", text: "Complete newcomer / OPSEC briefings" },
        ],
      },
      {
        title: "Base Access",
        items: [
          { id: "m5", text: "Obtain WPAFB base pass and vehicle decal" },
          { id: "m6", text: "Register vehicle with base security" },
          { id: "m7", text: "Update military ID card if needed" },
        ],
      },
      {
        title: "DEERS & Benefits",
        items: [
          { id: "m8",  text: "Verify DEERS enrollment for you and family" },
          { id: "m9",  text: "Enroll in TRICARE at new location" },
          { id: "m10", text: "Locate WPAFB Military Treatment Facility (MTF)" },
          { id: "m11", text: "Confirm BAH rate with Finance office" },
        ],
      },
      {
        title: "Housing Allowance",
        items: [
          { id: "m12", text: "Submit signed lease or closing docs to Finance" },
          { id: "m13", text: "Confirm BAH payments are active in myPay" },
          { id: "m14", text: "Review any OHA / BAH differences with housing office" },
        ],
      },
      {
        title: "Family Support",
        items: [
          { id: "m15", text: "Contact Airman & Family Readiness Center (A&FRC)" },
          { id: "m16", text: "Explore on-base childcare options (CDC)" },
          { id: "m17", text: "Connect with spouse employment support at A&FRC" },
          { id: "m18", text: "Join WPAFB spouse / community Facebook groups" },
        ],
      },
    ],
  },
];

// ─── Flatten all items for total count ────────────────────────────────────────
const ALL_ITEMS = SECTIONS.flatMap(s => s.categories.flatMap(c => c.items));

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FirstThirtyDaysScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>("general");

  const total    = ALL_ITEMS.length;
  const done     = checked.size;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const section = SECTIONS.find(s => s.id === activeSection)!;

  // Count per section
  const sectionCounts = useMemo(() =>
    Object.fromEntries(
      SECTIONS.map(s => {
        const ids = s.categories.flatMap(c => c.items.map(i => i.id));
        return [s.id, ids.filter(id => checked.has(id)).length];
      })
    ), [checked]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ChatFAB />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <View style={s.progressWrap}>
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>{done} of {total} tasks complete</Text>
          <Text style={s.progressPct}>{pct}%</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` as any }]} />
        </View>
        {pct === 100 && (
          <Text style={s.completeMsg}>🎉 You're all settled in — welcome to Dayton!</Text>
        )}
      </View>

      {/* ── Section tabs ───────────────────────────────────────────────────── */}
      <View style={s.tabRow}>
        {SECTIONS.map(sec => {
          const secTotal = sec.categories.flatMap(c => c.items).length;
          const secDone  = sectionCounts[sec.id] ?? 0;
          const active   = activeSection === sec.id;
          return (
            <TouchableOpacity
              key={sec.id}
              style={[s.tab, active && { borderBottomColor: sec.color, borderBottomWidth: 2.5 }]}
              onPress={() => setActiveSection(sec.id)}
              activeOpacity={0.8}
            >
              <Ionicons name={sec.icon} size={16} color={active ? sec.color : Colors.grayLight} />
              <Text style={[s.tabLabel, active && { color: sec.color }]}>{sec.title}</Text>
              <View style={[s.tabBadge, { backgroundColor: active ? sec.color + "22" : "#F0F0F0" }]}>
                <Text style={[s.tabBadgeText, { color: active ? sec.color : Colors.gray }]}>
                  {secDone}/{secTotal}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Checklist ──────────────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {section.categories.map(cat => (
          <View key={cat.title} style={s.category}>
            <Text style={s.categoryTitle}>{cat.title}</Text>
            {cat.items.map(item => {
              const isChecked = checked.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.item, isChecked && s.itemDone]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.75}
                >
                  <View style={[s.checkbox, isChecked && { backgroundColor: section.color, borderColor: section.color }]}>
                    {isChecked && <Ionicons name="checkmark" size={13} color={Colors.black} />}
                  </View>
                  <Text style={[s.itemText, isChecked && s.itemTextDone]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Bottom tip */}
        <View style={s.tip}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.gold} />
          <Text style={s.tipText}>
            Have questions about any of these steps? Ask DaytonBot — or reach Chris directly on the Contact tab.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <AppTabBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  header: {
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  headerTitle: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  headerSub:   { color: Colors.grayLight, fontSize: 10, letterSpacing: 1, marginTop: 2 },

  progressWrap: {
    backgroundColor: "#111", paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#222",
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { color: Colors.grayLight, fontSize: 12 },
  progressPct:   { color: Colors.gold, fontSize: 12, fontWeight: "800" },
  progressTrack: {
    height: 6, backgroundColor: "#2A2A2A", borderRadius: 3, overflow: "hidden",
  },
  progressFill: {
    height: 6, backgroundColor: Colors.gold, borderRadius: 3,
  },
  completeMsg: {
    color: Colors.gold, fontSize: 13, fontWeight: "700",
    textAlign: "center", marginTop: 10,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, paddingHorizontal: 8,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  tabLabel: { color: Colors.grayLight, fontSize: 12, fontWeight: "700" },
  tabBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700" },

  scroll:        { flex: 1, backgroundColor: Colors.offWhite },
  scrollContent: { padding: 20 },

  category: { marginBottom: 28 },
  categoryTitle: {
    color: Colors.black, fontSize: 13, fontWeight: "800",
    letterSpacing: 0.4, marginBottom: 10,
    textTransform: "uppercase",
  },

  item: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  itemDone: {
    backgroundColor: "#FAFAFA", borderColor: "#E0E0E0",
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginTop: 1, flexShrink: 0,
  },
  itemText: {
    flex: 1, color: Colors.black, fontSize: 14, lineHeight: 20,
  },
  itemTextDone: {
    color: Colors.grayLight,
    textDecorationLine: "line-through",
  },

  tip: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
    marginTop: 4,
  },
  tipText: { flex: 1, color: Colors.gray, fontSize: 13, lineHeight: 19 },
});
