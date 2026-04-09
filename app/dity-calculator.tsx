/**
 * DITY / PPM Move Calculator
 * Estimates the incentive pay for a Personally Procured Move (PPM)
 * based on authorized weight, distance, and the government rate per ton-mile.
 *
 * Formula: Payment = (Weight lbs / 2000) × miles × GTC rate × 0.95
 * 2025 GTC baseline: ~$0.19–$0.23 per ton-mile (varies by season/origin)
 * We use a conservative $0.21 as the default.
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

const GTC_RATE = 0.21; // $ per ton-mile (2025 estimate — verify with finance)
const PPM_PCT  = 0.95; // Government pays 95% of GTC cost

// Authorized weight by pay grade (lbs) — JFTR Table 5-G
const WEIGHT_ALLOWANCES: { grade: string; withDep: number; withoutDep: number }[] = [
  { grade: "E-1 to E-3", withDep: 5_000, withoutDep: 1_500 },
  { grade: "E-4",        withDep: 7_000, withoutDep: 3_500 },
  { grade: "E-5",        withDep: 7_000, withoutDep: 3_500 },
  { grade: "E-6",        withDep: 8_000, withoutDep: 7_000 },
  { grade: "E-7",        withDep: 11_000, withoutDep: 9_000 },
  { grade: "E-8 / E-9",  withDep: 13_500, withoutDep: 12_000 },
  { grade: "W-1 / W-2",  withDep: 10_000, withoutDep: 8_000 },
  { grade: "W-3 / W-4 / W-5", withDep: 14_500, withoutDep: 13_000 },
  { grade: "O-1 / O-2",  withDep: 10_000, withoutDep: 8_000 },
  { grade: "O-3",        withDep: 14_500, withoutDep: 13_000 },
  { grade: "O-4 to O-6", withDep: 17_500, withoutDep: 16_000 },
  { grade: "O-7+",       withDep: 18_000, withoutDep: 18_000 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function DITYCalculatorScreen() {
  const [grade,      setGrade]      = useState<string | null>(null);
  const [hasDep,     setHasDep]     = useState<boolean | null>(null);
  const [miles,      setMiles]      = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [result,     setResult]     = useState<{
    authorized: number; payment: number; gross: number; expenses: number; net: number;
  } | null>(null);

  const selected  = WEIGHT_ALLOWANCES.find(w => w.grade === grade);
  const authWeight = selected
    ? (hasDep ? selected.withDep : selected.withoutDep)
    : 0;
  const weightToUse = customWeight ? parseInt(customWeight, 10) : authWeight;
  const milesNum    = parseInt(miles, 10);

  function calculate() {
    if (!grade || hasDep === null || !miles || isNaN(milesNum) || milesNum < 1) return;
    const tons   = weightToUse / 2000;
    const gross  = Math.round(tons * milesNum * GTC_RATE / 100) * 100 * PPM_PCT;
    // Rough expense estimate: truck + fuel + helpers ≈ $600 + $0.25/mile
    const expenses = Math.round(600 + milesNum * 0.25);
    const net      = gross - expenses;
    setResult({ authorized: authWeight, payment: gross, gross, expenses, net });
  }

  function reset() {
    setGrade(null); setHasDep(null); setMiles(""); setCustomWeight(""); setResult(null);
  }

  const canCalc = grade !== null && hasDep !== null && miles.length > 0 && !isNaN(milesNum) && milesNum > 0;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {/* Intro */}
          <View style={s.intro}>
            <Text style={s.introTitle}>DITY / PPM Calculator</Text>
            <Text style={s.introBody}>
              Estimate your incentive pay for a Personally Procured Move to Dayton.
              The government pays 95% of the Government Tender Cost (GTC).
            </Text>
            <View style={s.badge}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.gold} />
              <Text style={s.badgeText}>2025 estimates — verify with your TMO/Finance office</Text>
            </View>
          </View>

          {!result ? (
            <>
              {/* Pay grade */}
              <Text style={s.label}>Your Pay Grade</Text>
              <View style={s.gradeList}>
                {WEIGHT_ALLOWANCES.map(w => (
                  <TouchableOpacity
                    key={w.grade}
                    style={[s.gradeBtn, grade === w.grade && s.gradeBtnActive]}
                    onPress={() => setGrade(w.grade)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.gradeBtnText, grade === w.grade && s.gradeBtnTextActive]}>
                      {w.grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dependency */}
              <Text style={[s.label, { marginTop: 20 }]}>Dependency Status</Text>
              <View style={s.depRow}>
                <TouchableOpacity
                  style={[s.depBtn, hasDep === true && s.depBtnActive]}
                  onPress={() => setHasDep(true)}
                >
                  <Text style={[s.depText, hasDep === true && s.depTextActive]}>With Dependents</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.depBtn, hasDep === false && s.depBtnActive]}
                  onPress={() => setHasDep(false)}
                >
                  <Text style={[s.depText, hasDep === false && s.depTextActive]}>Without Dependents</Text>
                </TouchableOpacity>
              </View>

              {/* Authorized weight display */}
              {grade && hasDep !== null && (
                <View style={s.weightDisplay}>
                  <Ionicons name="cube-outline" size={16} color={Colors.gold} />
                  <Text style={s.weightDisplayText}>
                    Authorized weight: <Text style={s.weightDisplayVal}>{authWeight.toLocaleString()} lbs</Text>
                  </Text>
                </View>
              )}

              {/* Optional custom weight override */}
              <Text style={[s.label, { marginTop: 16 }]}>
                Actual Shipment Weight <Text style={s.labelNote}>(optional — overrides authorized)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="e.g. 6500"
                value={customWeight}
                onChangeText={setCustomWeight}
                keyboardType="number-pad"
                placeholderTextColor={Colors.grayLight}
              />

              {/* Distance */}
              <Text style={[s.label, { marginTop: 16 }]}>Distance to Dayton (miles)</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. 1200"
                value={miles}
                onChangeText={setMiles}
                keyboardType="number-pad"
                placeholderTextColor={Colors.grayLight}
              />
              <Text style={s.hint}>
                From San Antonio: ~1,250 mi · From San Diego: ~2,100 mi ·
                From Norfolk: ~600 mi · From Colorado Springs: ~1,400 mi
              </Text>

              <TouchableOpacity
                style={[s.calcBtn, !canCalc && s.calcBtnDisabled]}
                onPress={calculate}
                disabled={!canCalc}
                activeOpacity={0.8}
              >
                <Text style={s.calcBtnText}>Estimate My PPM Pay</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Result */
            <View style={s.resultCard}>
              <Text style={s.resultTitle}>Your Estimated PPM Pay</Text>

              <View style={s.resultMain}>
                <Text style={s.resultLabel}>Gross Incentive</Text>
                <Text style={s.resultValue}>{fmt(result.payment)}</Text>
                <Text style={s.resultSub}>before taxes and expenses</Text>
              </View>

              <View style={s.divider} />

              <View style={s.breakdown}>
                <Row label="Authorized Weight" value={`${result.authorized.toLocaleString()} lbs`} />
                <Row label="Weight Used"        value={`${weightToUse.toLocaleString()} lbs`} />
                <Row label="Distance"           value={`${milesNum.toLocaleString()} miles`} />
                <Row label="GTC Rate"           value="$0.21/ton-mile" />
                <Row label="PPM Percentage"     value="95%" />
              </View>

              <View style={s.divider} />

              <View style={s.netSection}>
                <Row label="Gross Pay"            value={fmt(result.gross)} highlight />
                <Row label="Est. Moving Expenses" value={`−${fmt(result.expenses)}`} dim />
                <Row label="Estimated Net Profit" value={fmt(result.net)} highlight={result.net > 0} />
              </View>

              <Text style={s.disclaimer}>
                Estimates only. Actual payment is based on certified weigh tickets submitted to TMO.
                Moving expenses vary widely. DITY pay is taxable income.
                Always coordinate with your TMO and Finance office.
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

function Row({ label, value, highlight, dim }: {
  label: string; value: string; highlight?: boolean; dim?: boolean;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, highlight && s.rowValueHL, dim && s.rowValueDim]}>{value}</Text>
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

  label:      { fontSize: 13, fontWeight: "700", color: Colors.black, marginBottom: 10, marginTop: 4, letterSpacing: 0.2 },
  labelNote:  { fontSize: 11, fontWeight: "400", color: Colors.gray },

  gradeList:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gradeBtn:   { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20,
                paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FAFAFA" },
  gradeBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  gradeBtnText:   { fontSize: 12, color: Colors.gray, fontWeight: "600" },
  gradeBtnTextActive: { color: Colors.black },

  depRow:  { flexDirection: "row", gap: 12 },
  depBtn:  { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
             paddingVertical: 12, alignItems: "center", backgroundColor: "#FAFAFA" },
  depBtnActive: { borderColor: Colors.gold, backgroundColor: "#FFF9E6" },
  depText:      { fontSize: 13, color: Colors.gray, fontWeight: "600" },
  depTextActive: { color: Colors.black },

  weightDisplay: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12,
                   backgroundColor: "#F0F8FF", borderRadius: 8, padding: 10 },
  weightDisplayText: { fontSize: 13, color: Colors.gray },
  weightDisplayVal:  { fontWeight: "700", color: Colors.black },

  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
           paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.black,
           backgroundColor: "#FAFAFA" },
  hint:  { fontSize: 11, color: Colors.grayLight, marginTop: 6, lineHeight: 17 },

  calcBtn:         { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 16,
                     alignItems: "center", marginTop: 28 },
  calcBtnDisabled: { opacity: 0.45 },
  calcBtnText:     { fontSize: 16, fontWeight: "700", color: Colors.black },

  resultCard:  { backgroundColor: Colors.black, borderRadius: 16, padding: 20, marginTop: 4 },
  resultTitle: { color: Colors.gold, fontSize: 13, fontWeight: "700", letterSpacing: 0.8,
                 textTransform: "uppercase", marginBottom: 16 },
  resultMain:  { alignItems: "center", marginBottom: 16 },
  resultLabel: { color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  resultValue: { color: Colors.white, fontSize: 44, fontWeight: "900", marginTop: 4 },
  resultSub:   { color: "#666", fontSize: 11, marginTop: 2 },
  divider:     { height: 1, backgroundColor: "#222", marginVertical: 14 },
  breakdown:   { gap: 8 },
  netSection:  { gap: 10 },

  row:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel:    { color: "#888", fontSize: 13 },
  rowValue:    { color: "#CCC", fontSize: 13, fontWeight: "600" },
  rowValueHL:  { color: Colors.gold, fontWeight: "800", fontSize: 14 },
  rowValueDim: { color: "#666" },

  disclaimer: { color: "#555", fontSize: 11, lineHeight: 17, marginTop: 16, textAlign: "center" },
  resetBtn:   { marginTop: 16, paddingVertical: 12, alignItems: "center",
                borderWidth: 1, borderColor: Colors.gold, borderRadius: 10 },
  resetBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
});
