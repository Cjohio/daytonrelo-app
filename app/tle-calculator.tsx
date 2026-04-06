/**
 * TLE — Temporary Lodging Expense Calculator
 *
 * TLE reimburses military members for temporary lodging costs
 * when PCS-ing CONUS. Max 10 days (member + dependents combined).
 *
 * Reimbursement = Lodging (up to local max) + M&IE at 75%
 * Dayton / WPAFB per diem area (2025):
 *   Lodging:  $114/night (Oct–Mar) / $134/night (Apr–Sep peak)
 *   M&IE:     $74/day (Meals & Incidental Expenses)
 *
 * Source: GSA per diem rates for Dayton, OH (ZIP 45431)
 */
import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── 2025 GSA per diem — Dayton/WPAFB area ──────────────────────────────────
const PER_DIEM = {
  lodging: {
    peak:    134,  // Apr–Sep
    offPeak: 114,  // Oct–Mar
  },
  mie: 74,         // M&IE per day (meals & incidentals)
};

// ─── TLE rates by family size from Joint Travel Regulations ──────────────────
// TLE is based on the per diem rate × applicable percentage
// Member only: lodging 100% + M&IE 75% of applicable rate
// With dependents: lodging 100% + M&IE 75% for first person, 25% for each dependent
const MIE_RATES: { label: string; memberMIE: number; depMIEEach: number }[] = [
  { label: "Member only (no dependents)", memberMIE: 1.00, depMIEEach: 0 },
  { label: "Member + 1 dependent",        memberMIE: 1.00, depMIEEach: 0.25 },
  { label: "Member + 2 dependents",       memberMIE: 1.00, depMIEEach: 0.25 },
  { label: "Member + 3 dependents",       memberMIE: 1.00, depMIEEach: 0.25 },
  { label: "Member + 4+ dependents",      memberMIE: 1.00, depMIEEach: 0.25 },
];

const DEP_COUNTS = [0, 1, 2, 3, 4];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function TLECalculatorScreen() {
  const [days,       setDays]       = useState("");
  const [depCount,   setDepCount]   = useState<number | null>(null);
  const [actualLodge, setActualLodge] = useState("");
  const [season,     setSeason]     = useState<"peak" | "offPeak">("peak");
  const [result,     setResult]     = useState<{
    days: number; lodgingCap: number; actualLodging: number; mie: number; total: number; perDay: number;
  } | null>(null);

  const daysNum  = parseInt(days, 10);
  const lodgeNum = parseFloat(actualLodge) || 0;

  function calculate() {
    if (depCount === null || !days || isNaN(daysNum) || daysNum < 1) return;
    const maxDays = Math.min(daysNum, 10);
    const lodgingCap = PER_DIEM.lodging[season];
    const reimburseLodge = Math.min(lodgeNum || lodgingCap, lodgingCap);
    // M&IE: 75% for member, 25% per dependent (JTR rates)
    const memberMIE = PER_DIEM.mie * 0.75;
    const depMIE    = depCount * PER_DIEM.mie * 0.25;
    const dailyMIE  = memberMIE + depMIE;
    const dailyTotal = reimburseLodge + dailyMIE;
    const total      = Math.round(dailyTotal * maxDays);
    setResult({
      days: maxDays,
      lodgingCap,
      actualLodging: lodgeNum || lodgingCap,
      mie: Math.round(dailyMIE),
      total,
      perDay: Math.round(dailyTotal),
    });
  }

  function reset() {
    setDays(""); setDepCount(null); setActualLodge(""); setResult(null);
  }

  const canCalc = depCount !== null && days.length > 0 && !isNaN(daysNum) && daysNum > 0;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          <View style={s.intro}>
            <Text style={s.introTitle}>TLE Calculator</Text>
            <Text style={s.introBody}>
              Estimate your Temporary Lodging Expense reimbursement when PCS-ing to WPAFB.
              TLE covers up to <Text style={{ fontWeight: "700" }}>10 days</Text> for CONUS moves.
            </Text>
            <View style={s.badge}>
              <Ionicons name="calendar-outline" size={13} color={Colors.gold} />
              <Text style={s.badgeText}>
                2025 GSA per diem — Dayton area · Verify at gsa.gov/travel
              </Text>
            </View>
          </View>

          {!result ? (
            <>
              {/* Season */}
              <Text style={s.label}>Arrival Season</Text>
              <View style={s.depRow}>
                <TouchableOpacity
                  style={[s.depBtn, season === "peak" && s.depBtnActive]}
                  onPress={() => setSeason("peak")}
                >
                  <Text style={[s.depText, season === "peak" && s.depTextActive]}>
                    Peak (Apr – Sep)
                  </Text>
                  <Text style={[s.depSub, season === "peak" && s.depSubActive]}>
                    ${PER_DIEM.lodging.peak}/night max
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.depBtn, season === "offPeak" && s.depBtnActive]}
                  onPress={() => setSeason("offPeak")}
                >
                  <Text style={[s.depText, season === "offPeak" && s.depTextActive]}>
                    Off-Peak (Oct – Mar)
                  </Text>
                  <Text style={[s.depSub, season === "offPeak" && s.depSubActive]}>
                    ${PER_DIEM.lodging.offPeak}/night max
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dependents */}
              <Text style={[s.label, { marginTop: 20 }]}>Number of Dependents Traveling</Text>
              <View style={s.chipRow}>
                {DEP_COUNTS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[s.chip, depCount === n && s.chipActive]}
                    onPress={() => setDepCount(n)}
                  >
                    <Text style={[s.chipText, depCount === n && s.chipTextActive]}>
                      {n === 0 ? "None" : n === 4 ? "4+" : `${n}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Days */}
              <Text style={[s.label, { marginTop: 20 }]}>Days of TLE Needed <Text style={s.labelNote}>(max 10)</Text></Text>
              <TextInput
                style={s.input}
                placeholder="e.g. 7"
                value={days}
                onChangeText={setDays}
                keyboardType="number-pad"
                placeholderTextColor={Colors.grayLight}
              />

              {/* Actual lodging cost override */}
              <Text style={[s.label, { marginTop: 16 }]}>
                Actual Nightly Lodging Cost <Text style={s.labelNote}>(optional)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder={`Leave blank to use max: $${PER_DIEM.lodging[season]}/night`}
                value={actualLodge}
                onChangeText={setActualLodge}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.grayLight}
              />

              <TouchableOpacity
                style={[s.calcBtn, !canCalc && s.calcBtnDisabled]}
                onPress={calculate}
                disabled={!canCalc}
                activeOpacity={0.8}
              >
                <Text style={s.calcBtnText}>Calculate TLE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={s.resultCard}>
              <Text style={s.resultTitle}>Your Estimated TLE</Text>

              <View style={s.resultMain}>
                <Text style={s.resultLabel}>Total Reimbursement</Text>
                <Text style={s.resultValue}>{fmt(result.total)}</Text>
                <Text style={s.resultSub}>for {result.days} days · {fmt(result.perDay)}/day</Text>
              </View>

              <View style={s.divider} />

              <Row label="Days Claimed"          value={`${result.days} of 10 max`} />
              <Row label="Lodging Rate"          value={`${fmt(result.actualLodging)}/night (max ${fmt(result.lodgingCap)})`} />
              <Row label="M&IE Daily"            value={fmt(result.mie)} />
              <Row label="Daily Total"           value={fmt(result.perDay)} />

              <View style={s.divider} />

              <View style={s.tipBox}>
                <Ionicons name="bulb-outline" size={14} color={Colors.gold} />
                <Text style={s.tipText}>
                  TLE can be split — some days before vacating and some after arriving.
                  Keep all lodging receipts. Submit DD Form 1351-2 to finance.
                </Text>
              </View>

              <Text style={s.disclaimer}>
                Rates shown are 2025 GSA per diem for the Dayton, OH area.
                Actual entitlement may vary. Verify with your finance office.
              </Text>

              <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
                <Text style={s.resetBtnText}>Recalculate</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

  intro:      { marginBottom: 20 },
  introTitle: { fontSize: 22, fontWeight: "800", color: Colors.black, marginBottom: 8 },
  introBody:  { fontSize: 14, color: Colors.gray, lineHeight: 21, marginBottom: 10 },
  badge:      { flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: "#FFF9E6", borderWidth: 1, borderColor: "#F5E088",
                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText:  { fontSize: 11, color: Colors.gray, flex: 1 },

  label:      { fontSize: 13, fontWeight: "700", color: Colors.black, marginBottom: 10, letterSpacing: 0.2 },
  labelNote:  { fontSize: 11, fontWeight: "400", color: Colors.gray },

  depRow:  { flexDirection: "row", gap: 10 },
  depBtn:  { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
             paddingVertical: 12, paddingHorizontal: 10, alignItems: "center",
             backgroundColor: "#FAFAFA", gap: 3 },
  depBtnActive: { borderColor: Colors.gold, backgroundColor: "#FFF9E6" },
  depText:      { fontSize: 13, color: Colors.gray, fontWeight: "700", textAlign: "center" },
  depTextActive: { color: Colors.black },
  depSub:       { fontSize: 10, color: Colors.grayLight },
  depSubActive: { color: Colors.gray },

  chipRow:  { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip:     { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20,
              paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "#FAFAFA" },
  chipActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  chipText:   { fontSize: 13, color: Colors.gray, fontWeight: "600" },
  chipTextActive: { color: Colors.black },

  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
           paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.black,
           backgroundColor: "#FAFAFA" },

  calcBtn:         { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 16,
                     alignItems: "center", marginTop: 28 },
  calcBtnDisabled: { opacity: 0.45 },
  calcBtnText:     { fontSize: 16, fontWeight: "700", color: Colors.black },

  resultCard:  { backgroundColor: Colors.black, borderRadius: 16, padding: 20 },
  resultTitle: { color: Colors.gold, fontSize: 13, fontWeight: "700", letterSpacing: 0.8,
                 textTransform: "uppercase", marginBottom: 16 },
  resultMain:  { alignItems: "center", marginBottom: 16 },
  resultLabel: { color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  resultValue: { color: Colors.white, fontSize: 48, fontWeight: "900", marginTop: 4 },
  resultSub:   { color: "#666", fontSize: 12, marginTop: 3 },
  divider:     { height: 1, backgroundColor: "#222", marginVertical: 14 },

  row:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rowLabel: { color: "#888", fontSize: 13 },
  rowValue: { color: "#CCC", fontSize: 13, fontWeight: "600" },

  tipBox:  { flexDirection: "row", gap: 8, backgroundColor: "#1A1A00",
             borderRadius: 10, padding: 12, marginBottom: 12 },
  tipText: { color: "#AAA", fontSize: 12, lineHeight: 18, flex: 1 },

  disclaimer: { color: "#555", fontSize: 11, lineHeight: 17, textAlign: "center", marginBottom: 14 },
  resetBtn:   { paddingVertical: 12, alignItems: "center", borderWidth: 1,
                borderColor: Colors.gold, borderRadius: 10 },
  resetBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
});
