import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { track } from "../shared/analytics";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import GoldButton from "../shared/components/GoldButton";

// ── 2025 Dayton/WPAFB BAH rates (O-1 area, ZIP 45431) ───────────
// Source: DFAS. Update annually at https://www.defensetravel.dod.mil
const BAH_RATES: Record<string, { withDep: number; withoutDep: number }> = {
  "E-1":  { withDep: 1_323, withoutDep:   987 },
  "E-2":  { withDep: 1_323, withoutDep:   987 },
  "E-3":  { withDep: 1_323, withoutDep:   987 },
  "E-4":  { withDep: 1_421, withoutDep: 1_047 },
  "E-5":  { withDep: 1_548, withoutDep: 1_167 },
  "E-6":  { withDep: 1_638, withoutDep: 1_281 },
  "E-7":  { withDep: 1_761, withoutDep: 1_392 },
  "E-8":  { withDep: 1_872, withoutDep: 1_506 },
  "E-9":  { withDep: 2_016, withoutDep: 1_653 },
  "W-1":  { withDep: 1_755, withoutDep: 1_374 },
  "W-2":  { withDep: 1_893, withoutDep: 1_512 },
  "W-3":  { withDep: 2_043, withoutDep: 1_656 },
  "W-4":  { withDep: 2_175, withoutDep: 1_782 },
  "W-5":  { withDep: 2_310, withoutDep: 1_899 },
  "O-1E": { withDep: 1_875, withoutDep: 1_440 },
  "O-2E": { withDep: 2_001, withoutDep: 1_566 },
  "O-3E": { withDep: 2_205, withoutDep: 1_776 },
  "O-1":  { withDep: 1_875, withoutDep: 1_440 },
  "O-2":  { withDep: 2_001, withoutDep: 1_566 },
  "O-3":  { withDep: 2_205, withoutDep: 1_776 },
  "O-4":  { withDep: 2_394, withoutDep: 1_986 },
  "O-5":  { withDep: 2_574, withoutDep: 2_157 },
  "O-6":  { withDep: 2_832, withoutDep: 2_376 },
  "O-7":  { withDep: 3_048, withoutDep: 2_577 },
};

const GRADES = Object.keys(BAH_RATES);

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Rough mortgage qualifier: BAH covers ~28% of gross (lender rule of thumb)
const estimateMaxHome = (bah: number) => Math.round((bah * 12) / 0.28 / 1000) * 1000;

export default function BAHCalculatorScreen() {
  const [grade,   setGrade]   = useState<string | null>(null);
  const [hasDep,  setHasDep]  = useState<boolean | null>(null);
  const [result,  setResult]  = useState<{ bah: number; maxHome: number } | null>(null);

  const calculate = () => {
    if (!grade || hasDep === null) return;
    const rates = BAH_RATES[grade];
    const bah   = hasDep ? rates.withDep : rates.withoutDep;
    setResult({ bah, maxHome: estimateMaxHome(bah) });
    track("bah_calculated", { rank: grade, hasDependents: hasDep });
  };

  const reset = () => { setGrade(null); setHasDep(null); setResult(null); };

  return (
    <>
    <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Intro */}
      <View style={styles.intro}>
        <Text style={styles.introTitle}>BAH Calculator</Text>
        <Text style={styles.introBody}>
          Estimate your Basic Allowance for Housing at Wright-Patterson AFB
          (ZIP 45431) based on your pay grade and dependency status.
        </Text>
        <View style={styles.dataBadge}>
          <Ionicons name="calendar-outline" size={13} color={Colors.gold} />
          <Text style={styles.dataBadgeText}>
            2025 DFAS rates · Verify current rates at{" "}
            <Text style={styles.dataBadgeLink}>dfas.mil</Text>
          </Text>
        </View>
      </View>

      {!result ? (
        <>
          {/* Pay grade selector */}
          <Text style={styles.label}>Select Pay Grade</Text>

          {/* Enlisted */}
          <Text style={styles.groupLabel}>Enlisted</Text>
          <GradeGrid
            grades={GRADES.filter((g) => g.startsWith("E"))}
            selected={grade}
            onSelect={setGrade}
          />

          {/* Warrant */}
          <Text style={styles.groupLabel}>Warrant Officer</Text>
          <GradeGrid
            grades={GRADES.filter((g) => g.startsWith("W"))}
            selected={grade}
            onSelect={setGrade}
          />

          {/* Officer */}
          <Text style={styles.groupLabel}>Officer</Text>
          <GradeGrid
            grades={GRADES.filter((g) => g.startsWith("O"))}
            selected={grade}
            onSelect={setGrade}
          />

          {/* Dependency */}
          <Text style={[styles.label, { marginTop: 24 }]}>Dependency Status</Text>
          <View style={styles.depRow}>
            <DepBtn label="With Dependents"    active={hasDep === true}  onPress={() => setHasDep(true)}  />
            <DepBtn label="Without Dependents" active={hasDep === false} onPress={() => setHasDep(false)} />
          </View>

          <GoldButton
            label="Calculate BAH"
            onPress={calculate}
            disabled={!grade || hasDep === null}
            style={{ marginTop: 28 }}
          />
        </>
      ) : (
        /* Result card */
        <View style={styles.resultCard}>
          <Text style={styles.resultGrade}>{grade} • {hasDep ? "With Dependents" : "Without Dependents"}</Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Monthly BAH</Text>
            <Text style={styles.resultValue}>{fmt(result.bah)}</Text>
            <Text style={styles.resultSub}>per month · tax-free</Text>
          </View>

          <View style={styles.resultDivider} />

          <View style={styles.resultRow}>
            <View style={styles.resultMetric}>
              <Text style={styles.resultMetricLabel}>Annual BAH</Text>
              <Text style={styles.resultMetricValue}>{fmt(result.bah * 12)}</Text>
            </View>
            <View style={styles.resultMetric}>
              <Text style={styles.resultMetricLabel}>Est. Max Home Price</Text>
              <Text style={styles.resultMetricValue}>{fmt(result.maxHome)}</Text>
            </View>
          </View>

          <Text style={styles.resultDisclaimer}>
            Home price estimate is illustrative only (28% DTI rule of thumb).
            Rates shown are for ZIP 45431 (WPAFB). Always verify at DFAS.
          </Text>

          <GoldButton label="Recalculate"  onPress={reset}                           style={{ marginTop: 20 }} />
          <GoldButton
            label="Search Homes in Your Budget"
            onPress={() => router.push({ pathname: "/(tabs)/explore" as any, params: { budget: String(Math.round(result.maxHome)) } })}
            variant="outline"
            style={{ marginTop: 10 }}
          />
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Share.share({
              title: "My WPAFB BAH Result",
              message: `My BAH for ${grade} ${hasDep ? "with" : "without"} dependents at WPAFB:\n\n💰 Monthly BAH: ${fmt(result.bah)}\n🏠 Est. Max Home Price: ${fmt(result.maxHome)}\n\nCalculated on Dayton Relo — contact Chris Jurgens for help buying: (937) 241-3484`,
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.shareBtnText}>📤  Share My Results</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
    <AppTabBar />
    <ChatFAB />
    </>
  );
}

function GradeGrid({ grades, selected, onSelect }: {
  grades: string[]; selected: string | null; onSelect: (g: string) => void;
}) {
  return (
    <View style={styles.gradeGrid}>
      {grades.map((g) => (
        <TouchableOpacity
          key={g}
          style={[styles.gradeBtn, selected === g && styles.gradeBtnActive]}
          onPress={() => onSelect(g)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gradeBtnText, selected === g && styles.gradeBtnTextActive]}>{g}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DepBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.depBtn, active && styles.depBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.depBtnText, active && styles.depBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20, paddingBottom: 32 },
  intro:   { marginBottom: 24 },
  introTitle: { color: Colors.black, fontSize: 20, fontWeight: "800", marginBottom: 8 },
  introBody:  { color: Colors.gray, fontSize: 14, lineHeight: 21 },
  label:      { color: Colors.black, fontWeight: "700", fontSize: 15, marginBottom: 10 },
  groupLabel: { color: Colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  gradeGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gradeBtn: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
  },
  gradeBtnActive:     { backgroundColor: Colors.black, borderColor: Colors.black },
  gradeBtnText:       { color: Colors.gray, fontWeight: "600", fontSize: 14 },
  gradeBtnTextActive: { color: Colors.gold, fontWeight: "700" },
  depRow:  { flexDirection: "row", gap: 10 },
  depBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
  },
  depBtnActive:     { backgroundColor: Colors.black, borderColor: Colors.black },
  depBtnText:       { color: Colors.gray, fontWeight: "600", fontSize: 13 },
  depBtnTextActive: { color: Colors.gold, fontWeight: "700" },
  resultCard: {
    backgroundColor: Colors.black, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  resultGrade:  { color: Colors.gold, fontSize: 13, fontWeight: "700", letterSpacing: 1, marginBottom: 20 },
  resultMain:   { alignItems: "center", marginBottom: 20 },
  resultLabel:  { color: Colors.grayLight, fontSize: 13, marginBottom: 6 },
  resultValue:  { color: Colors.gold, fontSize: 48, fontWeight: "900", letterSpacing: -1 },
  resultSub:    { color: Colors.gray, fontSize: 12, marginTop: 4 },
  resultDivider:{ height: 1, backgroundColor: "#1E1E1E", marginBottom: 20 },
  resultRow:    { flexDirection: "row", gap: 12, marginBottom: 20 },
  resultMetric: { flex: 1, backgroundColor: "#111", borderRadius: 12, padding: 16, alignItems: "center" },
  resultMetricLabel: { color: Colors.gray, fontSize: 11, marginBottom: 6 },
  resultMetricValue: { color: Colors.white, fontSize: 18, fontWeight: "800" },
  resultDisclaimer:  { color: "#555", fontSize: 11, lineHeight: 16, textAlign: "center" },
  shareBtn:          { marginTop: 10, paddingVertical: 10, alignItems: "center" },
  shareBtnText:      { color: Colors.gold, fontSize: 14, fontWeight: "600" },

  // Data freshness badge
  dataBadge:         { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10,
                       backgroundColor: "#FFF9E6", borderWidth: 1, borderColor: "#F5E088",
                       borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dataBadgeText:     { fontSize: 11, color: Colors.gray, flex: 1, lineHeight: 16 },
  dataBadgeLink:     { color: Colors.gold, fontWeight: "600" },
});
