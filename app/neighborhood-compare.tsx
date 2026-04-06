import { useState } from "react";
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

function schoolColor(g: number) {
  if (g >= 4.0) return "#2E7D32";
  if (g >= 3.3) return "#558B2F";
  if (g >= 2.7) return "#F9A825";
  return "#C62828";
}

function CompareStat({ label, a, b, format, higherBetter = true }: {
  label: string;
  a: number;
  b: number;
  format: (n: number) => string;
  higherBetter?: boolean;
}) {
  const aWins = higherBetter ? a >= b : a <= b;
  const bWins = higherBetter ? b >= a : b <= a;
  const tie   = a === b;
  return (
    <View style={c.statRow}>
      <Text style={[c.statVal, !tie && aWins && c.statWin]}>{format(a)}</Text>
      <Text style={c.statLabel}>{label}</Text>
      <Text style={[c.statVal, !tie && bWins && c.statWin]}>{format(b)}</Text>
    </View>
  );
}

export default function NeighborhoodCompareScreen() {
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);
  const [picking, setPicking] = useState<"A" | "B" | null>("A");

  const nbA = NEIGHBORHOODS.find(n => n.name === selA);
  const nbB = NEIGHBORHOODS.find(n => n.name === selB);

  function pick(name: string) {
    if (picking === "A") { setSelA(name); setPicking("B"); }
    else if (picking === "B") { setSelB(name); setPicking(null); }
  }

  function reset() { setSelA(null); setSelB(null); setPicking("A"); }

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header / selection state */}
        <View style={s.selectionBar}>
          <TouchableOpacity
            style={[s.selSlot, picking === "A" && s.selSlotActive, selA && s.selSlotFilled]}
            onPress={() => setPicking("A")}
          >
            {selA ? <Text style={s.selSlotName}>{selA}</Text> : <Text style={s.selSlotPlaceholder}>Pick Area A</Text>}
          </TouchableOpacity>
          <View style={s.vsCircle}><Text style={s.vsText}>VS</Text></View>
          <TouchableOpacity
            style={[s.selSlot, picking === "B" && s.selSlotActive, selB && s.selSlotFilled]}
            onPress={() => setPicking("B")}
          >
            {selB ? <Text style={s.selSlotName}>{selB}</Text> : <Text style={s.selSlotPlaceholder}>Pick Area B</Text>}
          </TouchableOpacity>
        </View>

        {picking && (
          <Text style={s.pickInstruction}>
            Tap a neighborhood below to select it for <Text style={{ color: Colors.gold }}>Area {picking}</Text>
          </Text>
        )}

        {/* Neighborhood picker */}
        <View style={s.pickerGrid}>
          {NEIGHBORHOODS.map(nb => {
            const isA = selA === nb.name;
            const isB = selB === nb.name;
            return (
              <TouchableOpacity
                key={nb.name}
                style={[s.pickerChip, isA && s.pickerChipA, isB && s.pickerChipB]}
                onPress={() => pick(nb.name)}
                disabled={(!picking && !isA && !isB)}
                activeOpacity={0.7}
              >
                <Text style={[s.pickerChipText, (isA || isB) && s.pickerChipTextActive]}>
                  {isA ? "A · " : isB ? "B · " : ""}{nb.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comparison table */}
        {nbA && nbB && (
          <>
            <View style={c.table}>
              {/* Header */}
              <View style={c.tableHeader}>
                <Text style={c.tableHeaderA}>{nbA.name}</Text>
                <View style={c.tableHeaderMid} />
                <Text style={c.tableHeaderB}>{nbB.name}</Text>
              </View>

              <CompareStat label="Median Home Price" a={nbA.medPrice} b={nbB.medPrice}
                format={n => "$" + (n / 1000).toFixed(0) + "K"} higherBetter={false} />
              <CompareStat label="Avg Monthly Rent" a={nbA.medRent} b={nbB.medRent}
                format={n => "$" + n.toLocaleString()} higherBetter={false} />
              <CompareStat label="School Rating" a={nbA.schoolGpa} b={nbB.schoolGpa}
                format={n => n === 4.3 ? "A+" : n >= 4.0 ? "A" : n >= 3.7 ? "A-" : n >= 3.3 ? "B+" : n >= 3.0 ? "B" : n >= 2.7 ? "B-" : "C"} />
              <CompareStat label="Commute to WPAFB" a={nbA.wpafbMins} b={nbB.wpafbMins}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="To Downtown Dayton" a={nbA.downtown} b={nbB.downtown}
                format={n => n + " min"} higherBetter={false} />
              <CompareStat label="Cost of Living Index" a={nbA.colIndex} b={nbB.colIndex}
                format={n => n.toString()} higherBetter={false} />

              {/* Notes */}
              <View style={c.notes}>
                <View style={c.noteCol}>
                  <Text style={c.noteText}>{nbA.note}</Text>
                </View>
                <View style={c.noteDivider} />
                <View style={c.noteCol}>
                  <Text style={c.noteText}>{nbB.note}</Text>
                </View>
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

  selectionBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  selSlot:      {
    flex: 1, borderWidth: 2, borderColor: Colors.border, borderRadius: 12, borderStyle: "dashed",
    padding: 12, alignItems: "center", minHeight: 52, justifyContent: "center",
  },
  selSlotActive:{ borderColor: Colors.gold, borderStyle: "solid" },
  selSlotFilled:{ borderStyle: "solid", borderColor: Colors.black, backgroundColor: "#FFFBF0" },
  selSlotName:  { fontWeight: "700", fontSize: 14, color: Colors.black },
  selSlotPlaceholder: { color: Colors.gray, fontSize: 13 },
  vsCircle:     { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.black, alignItems: "center", justifyContent: "center" },
  vsText:       { color: Colors.gold, fontWeight: "800", fontSize: 11 },

  pickInstruction: { color: Colors.gray, fontSize: 13, marginBottom: 10, textAlign: "center" },

  pickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pickerChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  pickerChipA:    { backgroundColor: "#1A3A5C", borderColor: "#1A3A5C" },
  pickerChipB:    { backgroundColor: Colors.black, borderColor: Colors.black },
  pickerChipText: { color: Colors.black, fontSize: 13, fontWeight: "600" },
  pickerChipTextActive: { color: Colors.gold },

  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, paddingVertical: 8 },
  resetBtnText: { color: Colors.gray, fontSize: 13 },

  cta:       { backgroundColor: Colors.black, borderRadius: 14, padding: 16, gap: 8 },
  ctaTitle:  { color: Colors.gold, fontWeight: "800", fontSize: 15 },
  ctaBody:   { color: "#CCC", fontSize: 13, lineHeight: 18 },
  ctaBtn:    { backgroundColor: Colors.gold, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 4 },
  ctaBtnText:{ fontWeight: "700", fontSize: 14, color: Colors.black },
});

const c = StyleSheet.create({
  table:       { borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: "hidden", marginBottom: 14 },
  tableHeader: { flexDirection: "row", backgroundColor: Colors.black, padding: 12, alignItems: "center" },
  tableHeaderA:{ flex: 1, color: Colors.gold, fontWeight: "800", fontSize: 14, textAlign: "center" },
  tableHeaderMid: { width: 80 },
  tableHeaderB:{ flex: 1, color: Colors.white, fontWeight: "800", fontSize: 14, textAlign: "center" },
  statRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statVal:     { flex: 1, textAlign: "center", fontWeight: "700", fontSize: 14, color: Colors.black },
  statWin:     { color: Colors.gold },
  statLabel:   { width: 120, textAlign: "center", fontSize: 11, color: Colors.gray, fontWeight: "600" },
  notes:       { flexDirection: "row", padding: 12, gap: 10 },
  noteCol:     { flex: 1 },
  noteDivider: { width: 1, backgroundColor: Colors.border },
  noteText:    { color: Colors.gray, fontSize: 12, lineHeight: 17 },
});
