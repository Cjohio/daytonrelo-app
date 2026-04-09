import React, { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import colCitiesData from "../content/col-cities.json";

// ─── Dayton Baseline ──────────────────────────────────────────────────────────
const DAYTON = {
  medianHome:    265000,
  avgRent:       1450,
  groceryIndex:  93,
  gasPrice:      3.15,
  stateTax:      3.75,
  colIndex:      82,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type City = {
  id: string;
  name: string;
  base?: string;
  type: "military" | "metro";
  medianHome: number;
  avgRent: number;
  groceryIndex: number;
  gasPrice: number;
  stateTax: number;
  colIndex: number;
};

const ALL_CITIES = colCitiesData as City[];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  }
  return `$${Math.round(Math.abs(n)).toLocaleString()}`;
}

function diff(origin: number, dayton: number) {
  return origin - dayton;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CostOfLiving() {
  const router = useRouter();
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all" | "military" | "metro">("all");
  const [selected, setSelected] = useState<City | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_CITIES.filter(c => {
      const matchType = filter === "all" || c.type === filter;
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.base ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [search, filter]);

  // Monthly savings calculation
  const savings = useMemo(() => {
    if (!selected) return null;
    const rentSavings     = selected.avgRent - DAYTON.avgRent;
    const grocerySavings  = ((selected.groceryIndex - DAYTON.groceryIndex) / 100) * 500;
    const gasSavings      = (selected.gasPrice - DAYTON.gasPrice) * 60;
    const totalMonthly    = rentSavings + grocerySavings + gasSavings;
    const homeDiff        = selected.medianHome - DAYTON.medianHome;
    return { rentSavings, grocerySavings, gasSavings, totalMonthly, homeDiff };
  }, [selected]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>COST OF LIVING</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.intro}>
          Select where you're coming from and see how Dayton compares — instantly.
        </Text>

        {/* ── City Picker ── */}
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search city or base name…"
            placeholderTextColor={Colors.grayLight}
            value={search}
            onChangeText={t => { setSearch(t); setSelected(null); }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={s.chips}>
          {(["all", "military", "metro"] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[s.chip, filter === f && s.chipOn]}
              onPress={() => { setFilter(f); setSelected(null); }}
            >
              <Text style={[s.chipTxt, filter === f && s.chipTxtOn]}>
                {f === "all" ? "All Cities" : f === "military" ? "🎖 Military Bases" : "🏙 Major Cities"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* City list */}
        {!selected && (
          <View style={s.cityList}>
            {filtered.length === 0 ? (
              <Text style={s.noResults}>No cities match "{search}"</Text>
            ) : (
              filtered.map(city => (
                <TouchableOpacity
                  key={city.id}
                  style={s.cityRow}
                  onPress={() => setSelected(city)}
                  activeOpacity={0.75}
                >
                  <View style={s.cityRowLeft}>
                    <Text style={s.cityRowName}>{city.name}</Text>
                    {city.base && (
                      <Text style={s.cityRowBase}>{city.base}</Text>
                    )}
                  </View>
                  <View style={s.cityRowRight}>
                    <Text style={s.cityRowIndex}>COL {city.colIndex}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ── Comparison Results ── */}
        {selected && savings && (
          <>
            {/* "Change city" header */}
            <TouchableOpacity style={s.changeCity} onPress={() => setSelected(null)}>
              <Ionicons name="swap-horizontal-outline" size={16} color={Colors.gold} />
              <Text style={s.changeCityTxt}>Comparing: {selected.name}</Text>
              <Text style={s.changeCityLink}>Change</Text>
            </TouchableOpacity>

            {/* Column headers */}
            <View style={s.colHeaders}>
              <View style={{ flex: 1 }} />
              <Text style={[s.colHeader, { flex: 1.4 }]}>{selected.name.split(",")[0].split("/")[0].trim()}</Text>
              <Text style={[s.colHeader, { flex: 1, color: Colors.gold }]}>DAYTON</Text>
            </View>

            {/* Comparison rows */}
            <CompRow
              label="Median Home"
              icon="home-outline"
              originVal={fmt(selected.medianHome, true)}
              daytonVal={fmt(DAYTON.medianHome, true)}
              delta={diff(selected.medianHome, DAYTON.medianHome)}
              format="currency"
              biggerIsBad
            />
            <CompRow
              label="Avg Rent (3BR house)"
              icon="key-outline"
              originVal={fmt(selected.avgRent)}
              daytonVal={fmt(DAYTON.avgRent)}
              delta={diff(selected.avgRent, DAYTON.avgRent)}
              format="currency"
              biggerIsBad
            />
            <CompRow
              label="Grocery Index"
              icon="cart-outline"
              originVal={`${selected.groceryIndex}`}
              daytonVal={`${DAYTON.groceryIndex}`}
              delta={diff(selected.groceryIndex, DAYTON.groceryIndex)}
              format="index"
              biggerIsBad
            />
            <CompRow
              label="Gas (avg/gal)"
              icon="car-outline"
              originVal={`$${selected.gasPrice.toFixed(2)}`}
              daytonVal={`$${DAYTON.gasPrice.toFixed(2)}`}
              delta={diff(selected.gasPrice, DAYTON.gasPrice)}
              format="gas"
              biggerIsBad
            />
            <CompRow
              label="State Income Tax"
              icon="receipt-outline"
              originVal={selected.stateTax === 0 ? "None" : `${selected.stateTax}%`}
              daytonVal={`${DAYTON.stateTax}%`}
              delta={diff(selected.stateTax, DAYTON.stateTax)}
              format="tax"
              biggerIsBad
            />
            <CompRow
              label="Cost of Living Index"
              icon="stats-chart-outline"
              originVal={`${selected.colIndex}`}
              daytonVal={`${DAYTON.colIndex}`}
              delta={diff(selected.colIndex, DAYTON.colIndex)}
              format="index"
              biggerIsBad
              note="US avg = 100"
            />

            {/* Monthly savings summary */}
            <View style={s.savingsCard}>
              <Text style={s.savingsTitle}>EST. MONTHLY SAVINGS IN DAYTON</Text>

              <SavingsLine
                label="Rent difference"
                amount={savings.rentSavings}
              />
              <SavingsLine
                label="Groceries (~$500/mo budget)"
                amount={savings.grocerySavings}
              />
              <SavingsLine
                label="Gas (~60 gal/mo)"
                amount={savings.gasSavings}
              />

              <View style={s.savingsDivider} />

              <View style={s.savingsTotal}>
                <Text style={s.savingsTotalLabel}>
                  {savings.totalMonthly >= 0 ? "Monthly savings" : "Monthly premium"}
                </Text>
                <Text style={[
                  s.savingsTotalAmount,
                  { color: savings.totalMonthly >= 0 ? Colors.success : Colors.error }
                ]}>
                  {savings.totalMonthly >= 0 ? "+" : "-"}{fmt(Math.abs(savings.totalMonthly))} / mo
                </Text>
              </View>

              {savings.totalMonthly >= 0 && (
                <Text style={s.savingsAnnual}>
                  That's {fmt(savings.totalMonthly * 12, true)} saved per year
                </Text>
              )}
            </View>

            {/* Home equity callout */}
            {savings.homeDiff !== 0 && (
              <View style={[s.equityCard, savings.homeDiff > 0 ? s.equityGreen : s.equityAmber]}>
                <Ionicons
                  name={savings.homeDiff > 0 ? "trending-down-outline" : "trending-up-outline"}
                  size={22} color={Colors.black}
                />
                <Text style={s.equityText}>
                  {savings.homeDiff > 0
                    ? `Homes in Dayton cost ${fmt(savings.homeDiff, true)} less — that's equity you keep.`
                    : `Dayton homes cost ${fmt(Math.abs(savings.homeDiff), true)} more — but still well below the national median.`}
                </Text>
              </View>
            )}

            <Text style={s.disclaimer}>
              📋 Methodology: Rent figures reflect average 3-bedroom single-family home rents sourced from Zillow, Redfin, RentCafe, and Zumper (2025). All cities use the same criteria for an apples-to-apples comparison. Other estimates based on 2025 median data. Individual costs vary. Grocery savings assume $500/mo budget. Gas assumes 60 gallons/month. Cost of Living Index: 100 = US national average.
            </Text>
          </>
        )}

        {/* CTA */}
        <TouchableOpacity style={s.cta} onPress={() => router.push("/contact")}>
          <Text style={s.ctaText}>Talk to Chris About Your Move</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.black} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Comparison Row ───────────────────────────────────────────────────────────
function CompRow({
  label, icon, originVal, daytonVal, delta, format, biggerIsBad, note,
}: {
  label: string; icon: any; originVal: string; daytonVal: string;
  delta: number; format: string; biggerIsBad?: boolean; note?: string;
}) {
  const daytonWins = biggerIsBad ? delta > 0 : delta < 0;
  const tied = Math.abs(delta) < 0.01;

  return (
    <View style={s.compRow}>
      <View style={s.compRowLeft}>
        <Ionicons name={icon} size={15} color={Colors.gold} />
        <View>
          <Text style={s.compLabel}>{label}</Text>
          {note && <Text style={s.compNote}>{note}</Text>}
        </View>
      </View>
      <Text style={s.compOrigin}>{originVal}</Text>
      <View style={s.compDaytonCell}>
        <Text style={[s.compDayton, daytonWins && !tied && s.compWinner]}>{daytonVal}</Text>
        {!tied && (
          <Ionicons
            name={daytonWins ? "checkmark-circle" : "remove-circle-outline"}
            size={14}
            color={daytonWins ? Colors.success : Colors.grayLight}
          />
        )}
      </View>
    </View>
  );
}

// ─── Savings Line ─────────────────────────────────────────────────────────────
function SavingsLine({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={s.savingsLine}>
      <Text style={s.savingsLineLabel}>{label}</Text>
      <Text style={[s.savingsLineAmount, { color: amount >= 0 ? Colors.success : Colors.error }]}>
        {amount >= 0 ? "+" : ""}{fmt(amount)}/mo
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1, backgroundColor: Colors.white },
  content:{ padding: 20, paddingTop: 16 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.black,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  backBtn:    { padding: 4 },
  headerTitle:{ color: Colors.gold, fontSize: 16, fontWeight: "900", letterSpacing: 2, flex: 1, textAlign: "center" },

  intro: { color: Colors.gray, fontSize: 14, lineHeight: 21, marginBottom: 20 },

  // Search
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    backgroundColor: Colors.offWhite, marginBottom: 12,
  },
  searchIcon:  {},
  searchInput: { flex: 1, color: Colors.black, fontSize: 15 },

  // Chips
  chips: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip:  {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  chipOn:    { backgroundColor: Colors.black, borderColor: Colors.gold },
  chipTxt:   { color: Colors.gray, fontSize: 12, fontWeight: "600" },
  chipTxtOn: { color: Colors.gold },

  // City list
  cityList:   {},
  noResults:  { color: Colors.gray, fontSize: 14, textAlign: "center", marginTop: 20 },
  cityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityRowLeft:  { flex: 1 },
  cityRowName:  { color: Colors.black, fontSize: 14, fontWeight: "600" },
  cityRowBase:  { color: Colors.gray, fontSize: 12, marginTop: 1 },
  cityRowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  cityRowIndex: { color: Colors.grayLight, fontSize: 12 },

  // Change city bar
  changeCity: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.offWhite, borderRadius: 10,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  changeCityTxt:  { color: Colors.black, fontSize: 13, fontWeight: "600", flex: 1 },
  changeCityLink: { color: Colors.gold, fontSize: 13, fontWeight: "700" },

  // Column headers
  colHeaders:  { flexDirection: "row", marginBottom: 4 },
  colHeader:   { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: Colors.gray, textAlign: "center" },

  // Comparison rows
  compRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 8,
  },
  compRowLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  compLabel:   { color: Colors.black, fontSize: 12, fontWeight: "600", flexShrink: 1 },
  compNote:    { color: Colors.grayLight, fontSize: 10 },
  compOrigin:  { flex: 1.4, textAlign: "center", color: Colors.gray, fontSize: 14, fontWeight: "600" },
  compDaytonCell: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  compDayton:  { color: Colors.black, fontSize: 14, fontWeight: "700" },
  compWinner:  { color: Colors.success },

  // Savings card
  savingsCard: {
    backgroundColor: Colors.black, borderRadius: 14,
    padding: 16, marginTop: 20, marginBottom: 12,
  },
  savingsTitle: { color: Colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 14 },
  savingsLine:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  savingsLineLabel:  { color: Colors.grayLight, fontSize: 13 },
  savingsLineAmount: { fontSize: 13, fontWeight: "700" },
  savingsDivider: { height: 1, backgroundColor: Colors.goldDark, marginVertical: 12 },
  savingsTotal:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  savingsTotalLabel:  { color: Colors.white, fontWeight: "700", fontSize: 15 },
  savingsTotalAmount: { fontWeight: "900", fontSize: 20 },
  savingsAnnual:  { color: Colors.grayLight, fontSize: 12, marginTop: 6, textAlign: "right" },

  // Equity card
  equityCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  equityGreen: { backgroundColor: "#E8F5E9" },
  equityAmber: { backgroundColor: "#FFF8E1" },
  equityText:  { color: Colors.black, fontSize: 14, fontWeight: "600", flex: 1, lineHeight: 20 },

  disclaimer: { color: "#888888", fontSize: 12, lineHeight: 18, marginBottom: 20 },

  // CTA
  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.gold, paddingVertical: 16, borderRadius: 12,
    marginTop: 8,
  },
  ctaText: { color: Colors.black, fontSize: 16, fontWeight: "800" },
});
