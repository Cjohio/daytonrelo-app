import { useState } from "react";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
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

// ─── CompareStat — 3-column version ──────────────────────────────────────────
function CompareStat({ label, a, b, c, format, higherBetter = true }: {
  label: string;
  a: number;
  b: number;
  c: number;
  format: (n: number) => string;
  higherBetter?: boolean;
}) {
  function isWinner(val: number) {
    const others = [a, b, c].filter(v => v !== val);
    return higherBetter
      ? others.every(o => val >= o)
      : others.every(o => val <= o);
  }
  const aw = isWinner(a);
  const bw = isWinner(b);
  const cw = isWinner(c);
  return (
    <View style={ct.row}>
      <Text style={ct.rowLabel}>{label}</Text>
      <Text style={[ct.val, aw && ct.valWin]}>{format(a)}</Text>
      <Text style={[ct.val, bw && ct.valWin]}>{format(b)}</Text>
      <Text style={[ct.val, cw && ct.valWin]}>{format(c)}</Text>
    </View>
  );
}

export default function NeighborhoodCompareScreen() {
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);
  const [selC, setSelC] = useState<string | null>(null);
  const [picking, setPicking] = useState<"A" | "B" | "C" | null>("A");

  const nbA = NEIGHBORHOODS.find(n => n.name === selA);
  const nbB = NEIGHBORHOODS.find(n => n.name === selB);
  const nbC = NEIGHBORHOODS.find(n => n.name === selC);

  function pick(name: string) {
    if (picking === "A") { setSelA(name); setPicking("B"); }
    else if (picking === "B") { setSelB(name); setPicking("C"); }
    else if (picking === "C") { setSelC(name); setPicking(null); }
  }

  function reset() { setSelA(null); setSelB(null); setSelC(null); setPicking("A"); }

  const SLOT_COLORS = { A: "#1A3A5C", B: Colors.black, C: "#2D5A1B" };

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* 3-slot selection bar */}
        <View style={s.selectionBar}>
          {(["A", "B", "C"] as const).map(slot => {
            const sel = slot === "A" ? selA : slot === "B" ? selB : selC;
            const setter = slot === "A" ? setSelA : slot === "B" ? setSelB : setSelC;
            const isActive = picking === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[s.selSlot, isActive && s.selSlotActive, sel && s.selSlotFilled,
                        sel && { borderColor: SLOT_COLORS[slot] }]}
                onPress={() => { setter(null); setPicking(slot); }}
                activeOpacity={0.8}
              >
                <View style={[s.slotBadge, { backgroundColor: SLOT_COLORS[slot] }]}>
                  <Text style={s.slotBadgeText}>{slot}</Text>
                </View>
                {sel
                  ? <Text style={s.selSlotName} numberOfLines={1}>{sel}</Text>
                  : <Text style={s.selSlotPlaceholder}>Pick Area</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {picking && (
          <Text style={s.pickInstruction}>
            Tap a neighborhood to fill <Text style={{ color: Colors.gold }}>Slot {picking}</Text>
          </Text>
        )}

        {/* Neighborhood picker */}
        <View style={s.pickerGrid}>
          {NEIGHBORHOODS.map(nb => {
            const slotKey = nb.name === selA ? "A" : nb.name === selB ? "B" : nb.name === selC ? "C" : null;
            return (
              <TouchableOpacity
                key={nb.name}
                style={[s.pickerChip,
                  slotKey === "A" && { backgroundColor: SLOT_COLORS.A, borderColor: SLOT_COLORS.A },
                  slotKey === "B" && { backgroundColor: SLOT_COLORS.B, borderColor: SLOT_COLORS.B },
                  slotKey === "C" && { backgroundColor: SLOT_COLORS.C, borderColor: SLOT_COLORS.C },
                ]}
                onPress={() => pick(nb.name)}
                disabled={!picking && !slotKey}
                activeOpacity={0.7}
              >
                <Text style={[s.pickerChipText, slotKey && s.pickerChipTextActive]}>
                  {slotKey ? `${slotKey} · ` : ""}{nb.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comparison table — show when all 3 selected */}
        {nbA && nbB && nbC && (
          <>
            <View style={ct.table}>
              {/* Header */}
              <View style={ct.header}>
                <Text style={ct.labelCol} />
                <Text style={[ct.headerSlot, { color: "#6BB4FF" }]}>{nbA.name}</Text>
                <Text style={[ct.headerSlot, { color: Colors.gold }]}>{nbB.name}</Text>
                <Text style={[ct.headerSlot, { color: "#7ECC6C" }]}>{nbC.name}</Text>
              </View>

              <CompareStat label="Median Price"     a={nbA.medPrice} b={nbB.medPrice} c={nbC.medPrice}
                format={n => "$" + (n / 1000).toFixed(0) + "K"} higherBetter={false} />
              <CompareStat label="Avg Rent / mo"    a={nbA.medRent}  b={nbB.medRent}  c={nbC.medRent}
                format={n => "$" + n.toLocaleString()} higherBetter={false} />
              <CompareStat label="School Rating"    a={nbA.schoolGpa} b={nbB.schoolGpa} c={nbC.schoolGpa}
                format={gpaLabel} />
              <CompareStat label="↔ WPAFB"          a={nbA.wpafbMins} b={nbB.wpafbMins} c={nbC.wpafbMins}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="↔ Downtown"       a={nbA.downtown}  b={nbB.downtown}  c={nbC.downtown}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="Cost of Living"   a={nbA.colIndex}  b={nbB.colIndex}  c={nbC.colIndex}
                format={n => n.toString()} higherBetter={false} />

              {/* Notes row */}
              <View style={ct.notesRow}>
                <Text style={[ct.noteText, { color: "#6BB4FF" }]}>{nbA.note}</Text>
                <Text style={[ct.noteText, { color: Colors.gold }]}>{nbB.note}</Text>
                <Text style={[ct.noteText, { color: "#7ECC6C" }]}>{nbC.note}</Text>
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

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

  header:     { flexDirection: "row", backgroundColor: "#111", paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
  labelCol:   { width: 90, fontSize: 10 },
  headerSlot: { flex: 1, textAlign: "center", fontWeight: "800", fontSize: 12 },

  row:      { flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  rowLabel: { width: 90, color: "#666", fontSize: 11, fontWeight: "600" },
  val:      { flex: 1, textAlign: "center", color: "#AAA", fontSize: 13, fontWeight: "700" },
  valWin:   { color: Colors.gold },

  notesRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16, opacity: 0.8 },
});
