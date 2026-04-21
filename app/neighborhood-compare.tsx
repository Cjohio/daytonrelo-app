import { useState } from "react";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";

interface Neighborhood {
  name:       string;
  medPrice:   number;
  medRent:    number;
  schools:    string;
  schoolGpa:  number;
  wpafbMins:  number;
  downtown:   number;
  colIndex:   number; // vs Dayton avg of 100
  walkable:   boolean;
  va:         boolean; // Good for VA loan buyers
  note:       string;
}

const NEIGHBORHOODS: Neighborhood[] = [
  { name: "Beavercreek",  medPrice: 265000, medRent: 1700, schools: "A",  schoolGpa: 4.0, wpafbMins: 10, downtown: 20, colIndex: 115, walkable: false, va: true,  note: "Top-rated schools, upscale retail, strong military community. Most popular with officers and mid-career buyers." },
  { name: "Kettering",    medPrice: 259000, medRent: 1400, schools: "A-", schoolGpa: 3.7, wpafbMins: 28, downtown: 15, colIndex: 108, walkable: false, va: true,  note: "Beautiful older homes, excellent schools, well-established community. Great for families willing to commute." },
  { name: "Oakwood",      medPrice: 340000, medRent: 1600, schools: "A+", schoolGpa: 4.3, wpafbMins: 35, downtown: 12, colIndex: 128, walkable: true,  va: true,  note: "Most prestigious suburb. Small-town feel, walkable village center, Ohio's best schools. Premium price reflects this." },
  { name: "Centerville",  medPrice: 285000, medRent: 1650, schools: "A",  schoolGpa: 4.0, wpafbMins: 32, downtown: 22, colIndex: 118, walkable: false, va: true,  note: "Newer construction, great schools, family-friendly. Growing area with strong resale values." },
  { name: "Springboro",   medPrice: 315000, medRent: 1700, schools: "A+", schoolGpa: 4.3, wpafbMins: 40, downtown: 28, colIndex: 122, walkable: false, va: true,  note: "Elite schools, newer builds, suburban quiet. Longer commute to WPAFB but ideal for families prioritizing education." },
  { name: "Fairborn",     medPrice: 180000, medRent: 1300, schools: "B-", schoolGpa: 2.7, wpafbMins: 3,  downtown: 25, colIndex: 88,  walkable: false, va: true,  note: "Best value near WPAFB. 3 minutes to main gate — unbeatable for active duty. Improving rapidly." },
  { name: "Huber Heights", medPrice: 210000, medRent: 1400, schools: "B-", schoolGpa: 2.7, wpafbMins: 13, downtown: 18, colIndex: 92,  walkable: false, va: true,  note: "Good value, solid community. Growing commercial base. Good mid-point between price and commute." },
  { name: "Miamisburg",   medPrice: 220000, medRent: 1350, schools: "B+", schoolGpa: 3.3, wpafbMins: 35, downtown: 18, colIndex: 96,  walkable: false, va: true,  note: "Charming historic downtown, good schools, strong value. Great for corporate relocators." },
  { name: "Riverside",    medPrice: 175000, medRent: 1250, schools: "B",  schoolGpa: 3.0, wpafbMins: 5,  downtown: 15, colIndex: 85,  walkable: false, va: true,  note: "Most affordable WPAFB-adjacent neighborhood. Improving area with great commute." },
  { name: "Xenia",        medPrice: 168000, medRent: 1100, schools: "B-", schoolGpa: 2.7, wpafbMins: 20, downtown: 30, colIndex: 82,  walkable: true,  va: true,  note: "Most affordable option. Small-town feel, walkable downtown. 20 min to WPAFB, 30 to downtown." },
  { name: "Trotwood",     medPrice: 115000, medRent: 950,  schools: "C",  schoolGpa: 2.0, wpafbMins: 25, downtown: 12, colIndex: 72,  walkable: false, va: true,  note: "Lowest prices in metro. Investment opportunity market. Not recommended for relocation buyers without local knowledge." },
];

function gpaLabel(n: number) {
  if (n >= 4.3) return "A+";
  if (n >= 4.0) return "A";
  if (n >= 3.7) return "A-";
  if (n >= 3.3) return "B+";
  if (n >= 3.0) return "B";
  if (n >= 2.7) return "B-";
  return "C";
}

// ─── CompareStat — N-column version (supports 3 or 4 slots) ─────────────────
function CompareStat({ label, values, format, higherBetter = true, compact = false }: {
  label: string;
  values: number[];
  format: (n: number) => string;
  higherBetter?: boolean;
  compact?: boolean; // narrower styling when 4 columns share the row
}) {
  const best = higherBetter ? Math.max(...values) : Math.min(...values);
  return (
    <View style={ct.row}>
      <Text style={[ct.rowLabel, compact && ct.rowLabelCompact]}>{label}</Text>
      {values.map((v, i) => (
        <Text
          key={i}
          style={[ct.val, compact && ct.valCompact, v === best && ct.valWin]}
        >
          {format(v)}
        </Text>
      ))}
    </View>
  );
}

// Per-slot color palette (fill + accent text). Indexes map to slots A/B/C/D.
const SLOT_COLORS  = ["#1A3A5C", Colors.black, "#2D5A1B", "#4A1F66"] as const;
const SLOT_ACCENTS = ["#6BB4FF", Colors.gold,  "#7ECC6C", "#C9A1FF"] as const;
const SLOT_LETTERS = ["A", "B", "C", "D"] as const;

export default function NeighborhoodCompareScreen() {
  // User can compare 3 or 4 neighborhoods at once.
  const [slotCount, setSlotCount] = useState<3 | 4>(3);
  // Always-length-4 array; only the first `slotCount` entries are active.
  const [slots,     setSlots]     = useState<(string | null)[]>([null, null, null, null]);
  const [picking,   setPicking]   = useState<number | null>(0);

  const active       = slots.slice(0, slotCount);
  const neighborhoods = active.map(n => (n ? NEIGHBORHOODS.find(x => x.name === n) : undefined));
  const allFilled    = neighborhoods.every(Boolean) as boolean;

  function pick(name: string) {
    if (picking === null) return;
    const next = [...slots];
    next[picking] = name;
    setSlots(next);

    // Advance to next empty slot within the active range; null if all full.
    let na: number | null = null;
    for (let i = picking + 1; i < slotCount; i++) {
      if (!next[i]) { na = i; break; }
    }
    if (na === null) {
      for (let i = 0; i < slotCount; i++) {
        if (!next[i]) { na = i; break; }
      }
    }
    setPicking(na);
  }

  function reset() {
    setSlots([null, null, null, null]);
    setPicking(0);
  }

  function changeSlotCount(n: 3 | 4) {
    if (n === slotCount) return;
    setSlotCount(n);
    if (n === 3 && slots[3]) {
      const next = [...slots];
      next[3] = null;
      setSlots(next);
    }
    // If user had nothing picking, leave as-is; otherwise point picking at
    // the first empty slot within new range.
    const base = n === 4 ? [...slots] : slots.map((v, i) => (i < 3 ? v : null));
    let na: number | null = null;
    for (let i = 0; i < n; i++) {
      if (!base[i]) { na = i; break; }
    }
    setPicking(na);
  }

  const isCompact = slotCount === 4;

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Slot-count toggle: 3 vs 4 neighborhoods */}
        <View style={s.modeToggle}>
          <Text style={s.modeLabel}>Compare</Text>
          <View style={s.modeSegment}>
            {([3, 4] as const).map(n => (
              <TouchableOpacity
                key={n}
                style={[s.modeBtn, slotCount === n && s.modeBtnActive]}
                onPress={() => changeSlotCount(n)}
                activeOpacity={0.8}
              >
                <Text style={[s.modeBtnText, slotCount === n && s.modeBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.modeSuffix}>neighborhoods</Text>
        </View>

        {/* Selection bar */}
        <View style={s.selectionBar}>
          {Array.from({ length: slotCount }).map((_, i) => {
            const sel      = slots[i];
            const isActive = picking === i;
            return (
              <TouchableOpacity
                key={i}
                style={[s.selSlot, isActive && s.selSlotActive, sel && s.selSlotFilled,
                        sel && { borderColor: SLOT_COLORS[i] }]}
                onPress={() => {
                  const next = [...slots]; next[i] = null; setSlots(next); setPicking(i);
                }}
                activeOpacity={0.8}
              >
                <View style={[s.slotBadge, { backgroundColor: SLOT_COLORS[i] }]}>
                  <Text style={s.slotBadgeText}>{SLOT_LETTERS[i]}</Text>
                </View>
                {sel
                  ? <Text style={s.selSlotName} numberOfLines={1}>{sel}</Text>
                  : <Text style={s.selSlotPlaceholder}>Pick Area</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {picking !== null && (
          <Text style={s.pickInstruction}>
            Tap a neighborhood to fill{" "}
            <Text style={{ color: Colors.gold }}>Slot {SLOT_LETTERS[picking]}</Text>
          </Text>
        )}

        {/* Neighborhood picker */}
        <View style={s.pickerGrid}>
          {NEIGHBORHOODS.map(nb => {
            const slotIdx = slots.findIndex(v => v === nb.name);
            const inRange = slotIdx >= 0 && slotIdx < slotCount;
            return (
              <TouchableOpacity
                key={nb.name}
                style={[s.pickerChip,
                  inRange && { backgroundColor: SLOT_COLORS[slotIdx], borderColor: SLOT_COLORS[slotIdx] },
                ]}
                onPress={() => pick(nb.name)}
                disabled={picking === null && !inRange}
                activeOpacity={0.7}
              >
                <Text style={[s.pickerChipText, inRange && s.pickerChipTextActive]}>
                  {inRange ? `${SLOT_LETTERS[slotIdx]} · ` : ""}{nb.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comparison table — shows when all active slots are filled */}
        {allFilled && (
          <>
            <View style={ct.table}>
              {/* Header */}
              <View style={ct.header}>
                <Text style={[ct.labelCol, isCompact && ct.labelColCompact]} />
                {neighborhoods.map((nb, i) => (
                  <Text
                    key={i}
                    style={[ct.headerSlot, isCompact && ct.headerSlotCompact, { color: SLOT_ACCENTS[i] }]}
                    numberOfLines={2}
                  >
                    {nb!.name}
                  </Text>
                ))}
              </View>

              <CompareStat label="Median Price"   compact={isCompact}
                values={neighborhoods.map(n => n!.medPrice)}
                format={n => "$" + (n / 1000).toFixed(0) + "K"} higherBetter={false} />
              <CompareStat label="Avg Rent / mo"  compact={isCompact}
                values={neighborhoods.map(n => n!.medRent)}
                format={n => "$" + n.toLocaleString()} higherBetter={false} />
              <CompareStat label="School Rating"  compact={isCompact}
                values={neighborhoods.map(n => n!.schoolGpa)}
                format={gpaLabel} />
              <CompareStat label="↔ WPAFB"        compact={isCompact}
                values={neighborhoods.map(n => n!.wpafbMins)}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="↔ Downtown"     compact={isCompact}
                values={neighborhoods.map(n => n!.downtown)}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="Cost of Living" compact={isCompact}
                values={neighborhoods.map(n => n!.colIndex)}
                format={n => n.toString()} higherBetter={false} />

              {/* Notes row */}
              <View style={ct.notesRow}>
                {neighborhoods.map((nb, i) => (
                  <Text
                    key={i}
                    style={[ct.noteText, isCompact && ct.noteTextCompact, { color: SLOT_ACCENTS[i] }]}
                  >
                    {nb!.note}
                  </Text>
                ))}
              </View>
            </View>

            <TouchableOpacity style={s.resetBtn} onPress={reset}>
              <Ionicons name="refresh-outline" size={14} color={Colors.gray} />
              <Text style={s.resetBtnText}>Compare Different Neighborhoods</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={s.cta}>
          <Text style={s.ctaTitle}>Want to visit these neighborhoods?</Text>
          <Text style={s.ctaBody}>Chris can schedule tours of any area and give you his honest take on each one.</Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => { const { router } = require("expo-router"); router.push("/(tabs)/contact"); }}
            activeOpacity={0.85}
          >
            <Text style={s.ctaBtnText}>Contact Chris</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // 3-vs-4 slot-count toggle
  modeToggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 12, paddingVertical: 6,
  },
  modeLabel:   { color: Colors.black, fontSize: 13, fontWeight: "700" },
  modeSegment: {
    flexDirection: "row", backgroundColor: "#F1F1F1",
    borderRadius: 8, padding: 2, gap: 2,
  },
  modeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    minWidth: 34, alignItems: "center",
  },
  modeBtnActive:     { backgroundColor: Colors.black },
  modeBtnText:       { color: Colors.gray, fontSize: 13, fontWeight: "800" },
  modeBtnTextActive: { color: Colors.white },
  modeSuffix:        { color: Colors.gray, fontSize: 13 },

  selectionBar: { flexDirection: "row", gap: 8, marginBottom: 12 },
  selSlot: {
    flex: 1, borderWidth: 2, borderColor: Colors.border, borderRadius: 12, borderStyle: "dashed",
    padding: 10, alignItems: "center", minHeight: 58, justifyContent: "center", gap: 4,
  },
  selSlotActive:      { borderColor: Colors.gold, borderStyle: "solid" },
  selSlotFilled:      { borderStyle: "solid", backgroundColor: "#0A0A0A" },
  selSlotName:        { fontWeight: "700", fontSize: 12, color: Colors.white, textAlign: "center" },
  selSlotPlaceholder: { color: Colors.gray, fontSize: 11 },

  slotBadge:     { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  slotBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "900" },

  pickInstruction: { color: Colors.gray, fontSize: 13, marginBottom: 10, textAlign: "center" },

  pickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pickerChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  pickerChipText:       { color: Colors.black, fontSize: 13, fontWeight: "600" },
  pickerChipTextActive: { color: Colors.white },

  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, paddingVertical: 8 },
  resetBtnText: { color: Colors.gray, fontSize: 13 },

  cta:       { backgroundColor: Colors.black, borderRadius: 14, padding: 16, gap: 8 },
  ctaTitle:  { color: Colors.gold, fontWeight: "800", fontSize: 15 },
  ctaBody:   { color: "#CCC", fontSize: 13, lineHeight: 18 },
  ctaBtn:    { backgroundColor: Colors.gold, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 4 },
  ctaBtnText:{ fontWeight: "700", fontSize: 14, color: Colors.black },
});

const ct = StyleSheet.create({
  table:  { borderRadius: 14, borderWidth: 1, borderColor: "#222", overflow: "hidden", marginBottom: 14, backgroundColor: "#0D0D0D" },

  header:            { flexDirection: "row", backgroundColor: "#111", paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
  labelCol:          { width: 90, fontSize: 10 },
  labelColCompact:   { width: 70 },
  headerSlot:        { flex: 1, textAlign: "center", fontWeight: "800", fontSize: 12 },
  headerSlotCompact: { fontSize: 11, paddingHorizontal: 2 },

  row:               { flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  rowLabel:          { width: 90, color: "#666", fontSize: 11, fontWeight: "600" },
  rowLabelCompact:   { width: 70, fontSize: 10 },
  val:               { flex: 1, textAlign: "center", color: "#AAA", fontSize: 13, fontWeight: "700" },
  valCompact:        { fontSize: 12, paddingHorizontal: 2 },
  valWin:            { color: Colors.gold },

  notesRow:          { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  noteText:          { flex: 1, fontSize: 11, lineHeight: 16, opacity: 0.8 },
  noteTextCompact:   { fontSize: 10, lineHeight: 14, gap: 4 },
});
