import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

const STORAGE_KEY        = "pcs_timeline_checked";
const ORDERS_DATE_KEY    = "pcs_orders_report_date";

// ─── Parse MM/DD/YYYY or YYYY-MM-DD → Date | null ─────────────────────────────
function parseDate(str: string): Date | null {
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const d = new Date(+mdy[3], +mdy[1] - 1, +mdy[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(d: Date) {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Days offset from reporting date for each phase window
const PHASE_OFFSETS: Record<string, { start: number; end: number }> = {
  "6mo":     { start: -210, end: -180 },
  "3mo":     { start: -120, end:  -90 },
  "60d":     { start:  -75, end:  -55 },
  "30d":     { start:  -35, end:  -25 },
  "arrival": { start:    0, end:   14 },
};

function getPhaseWindow(reportDate: Date, phaseId: string): string | null {
  const offsets = PHASE_OFFSETS[phaseId];
  if (!offsets) return null;
  const start = new Date(reportDate.getTime() + offsets.start * 86400000);
  const end   = new Date(reportDate.getTime() + offsets.end   * 86400000);
  if (phaseId === "arrival") return `Starting ${fmtDate(start)}`;
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

// ─── Timeline phases ───────────────────────────────────────────────────────────
const PHASES = [
  {
    id: "6mo",
    label: "6 Months Out",
    color: "#4A90D9",
    icon: "calendar-outline" as const,
    items: [
      { id: "1",  text: "Receive PCS orders and verify reporting date" },
      { id: "2",  text: "Submit VA loan pre-approval application" },
      { id: "3",  text: "Request Certificate of Eligibility (COE) from VA.gov" },
      { id: "4",  text: "Research Dayton neighborhoods and WPAFB proximity" },
      { id: "5",  text: "Calculate BAH for your pay grade and dependency status" },
      { id: "6",  text: "Contact Chris Jurgens — start your home search early" },
      { id: "7",  text: "Contact WPAFB Housing Office about on-base availability" },
    ],
  },
  {
    id: "3mo",
    label: "3 Months Out",
    color: "#F5A623",
    icon: "time-outline" as const,
    items: [
      { id: "8",  text: "Lock in VA lender and get pre-approval letter" },
      { id: "9",  text: "Schedule house-hunting trip to Dayton (military travel orders)" },
      { id: "10", text: "Research schools for your children's grade levels" },
      { id: "11", text: "Arrange for professional military movers (contact TMO/PPM)" },
      { id: "12", text: "Begin decluttering — less weight = lower cost on DITY moves" },
      { id: "13", text: "Notify current landlord or start home sale process" },
      { id: "14", text: "Update beneficiaries and address on military records" },
    ],
  },
  {
    id: "60d",
    label: "60 Days Out",
    color: "#E8A317",
    icon: "home-outline" as const,
    items: [
      { id: "15", text: "Make an offer on your home (or finalize rental agreement)" },
      { id: "16", text: "Schedule home inspection" },
      { id: "17", text: "Request school records for transfer" },
      { id: "18", text: "Begin SCRA protections — notify current lenders of PCS orders" },
      { id: "19", text: "Arrange pet quarantine / vet records if applicable" },
      { id: "20", text: "Update Tricare enrollment for new region" },
    ],
  },
  {
    id: "30d",
    label: "30 Days Out",
    color: "#D0021B",
    icon: "alert-circle-outline" as const,
    items: [
      { id: "21", text: "Confirm moving company schedule and inventory list" },
      { id: "22", text: "Pack non-essential items and label boxes by room" },
      { id: "23", text: "Arrange utility shutoff at current home" },
      { id: "24", text: "Close on home purchase or receive keys" },
      { id: "25", text: "Set up utilities at new Dayton home (gas, electric, internet)" },
      { id: "26", text: "Schedule Ohio driver's license (within 30 days of arrival)" },
    ],
  },
  {
    id: "arrival",
    label: "Arrival Week",
    color: "#7ED321",
    icon: "checkmark-circle-outline" as const,
    items: [
      { id: "27", text: "Report to WPAFB and complete in-processing checklist" },
      { id: "28", text: "Receive household goods delivery and do damage inspection" },
      { id: "29", text: "Register vehicle in Ohio (within 30 days)" },
      { id: "30", text: "Enroll children in school" },
      { id: "31", text: "Set up new bank account if needed (Wright-Patt Credit Union recommended)" },
      { id: "32", text: "Locate nearest commissary, BX/PX, and gym on base" },
      { id: "33", text: "Introduce yourself to neighbors — Dayton is a welcoming community" },
    ],
  },
  {
    id: "first30",
    label: "First 30 Days",
    color: "#417505",
    icon: "ribbon-outline" as const,
    items: [
      { id: "34", text: "File Ohio state income tax registration if needed" },
      { id: "35", text: "Get Ohio driver's license (BMV — bring PCS orders)" },
      { id: "36", text: "Apply for Ohio homestead exemption if you own your home" },
      { id: "37", text: "Find a local mechanic and healthcare providers" },
      { id: "38", text: "Join WPAFB spouse/family support groups" },
      { id: "39", text: "Explore your neighborhood — check the Things To Do guide" },
    ],
  },
];

export default function PCSTimelineScreen() {
  const [checked,     setChecked]     = useState<Set<string>>(new Set());
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set(["6mo"]));
  const [ordersInput, setOrdersInput] = useState("");
  const [reportDate,  setReportDate]  = useState<Date | null>(null);

  // Load saved progress + orders date on mount
  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEY, ORDERS_DATE_KEY]).then(pairs => {
      const [checkRaw, dateRaw] = pairs.map(p => p[1]);
      if (checkRaw) { try { setChecked(new Set(JSON.parse(checkRaw))); } catch {} }
      if (dateRaw)  { setOrdersInput(dateRaw); setReportDate(parseDate(dateRaw)); }
    });
  }, []);

  function handleDateChange(text: string) {
    setOrdersInput(text);
    const parsed = parseDate(text);
    setReportDate(parsed);
    if (parsed) AsyncStorage.setItem(ORDERS_DATE_KEY, text).catch(() => {});
  }

  function toggleItem(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function togglePhase(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalItems = PHASES.reduce((acc, p) => acc + p.items.length, 0);
  const doneCount  = checked.size;
  const pct        = Math.round((doneCount / totalItems) * 100);

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={s.progressCard}>
          <View style={s.progressHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.gold} />
            <Text style={s.progressTitle}>PCS Progress</Text>
            <Text style={s.progressPct}>{pct}%</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.progressSub}>{doneCount} of {totalItems} tasks complete</Text>
        </View>

        {/* Orders / Reporting Date Input */}
        <View style={s.dateCard}>
          <View style={s.dateCardHeader}>
            <Ionicons name="calendar" size={16} color={Colors.gold} />
            <Text style={s.dateCardTitle}>Enter Your Report Date</Text>
          </View>
          <Text style={s.dateCardSub}>
            We'll calculate actual calendar dates for each phase.
          </Text>
          <TextInput
            style={s.dateInput}
            placeholder="MM/DD/YYYY  (e.g. 09/15/2025)"
            placeholderTextColor={Colors.grayLight}
            value={ordersInput}
            onChangeText={handleDateChange}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          {reportDate && (
            <View style={s.dateConfirm}>
              <Ionicons name="checkmark-circle" size={14} color="#2ECC71" />
              <Text style={s.dateConfirmText}>
                Reporting: {fmtDate(reportDate)} · dates shown below
              </Text>
            </View>
          )}
        </View>

        <Text style={s.intro}>
          Tap each phase to expand it. Check off tasks as you complete them.
          Your progress is saved automatically.
        </Text>

        {PHASES.map(phase => {
          const phaseChecked = phase.items.filter(i => checked.has(i.id)).length;
          const isOpen = expanded.has(phase.id);
          return (
            <View key={phase.id} style={s.phase}>
              <TouchableOpacity
                style={s.phaseHeader}
                onPress={() => togglePhase(phase.id)}
                activeOpacity={0.8}
              >
                <View style={[s.phaseDot, { backgroundColor: phase.color }]}>
                  <Ionicons name={phase.icon} size={16} color="#fff" />
                </View>
                <View style={s.phaseHeaderText}>
                  <Text style={s.phaseLabel}>{phase.label}</Text>
                  {reportDate && (
                    <Text style={[s.phaseDateHint, { color: phase.color }]}>
                      {getPhaseWindow(reportDate, phase.id)}
                    </Text>
                  )}
                  <Text style={s.phaseSub}>{phaseChecked}/{phase.items.length} done</Text>
                </View>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.gray}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={s.phaseBody}>
                  {phase.items.map(item => {
                    const done = checked.has(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={s.item}
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[s.checkbox, done && s.checkboxDone]}>
                          {done && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text style={[s.itemText, done && s.itemTextDone]}>
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* CTA */}
        <TouchableOpacity
          style={s.cta}
          onPress={() => router.push("/(tabs)/contact" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={18} color={Colors.black} />
          <Text style={s.ctaText}>Questions? Contact Chris</Text>
        </TouchableOpacity>

        <View style={s.resources}>
          <Text style={s.resourcesTitle}>Official Resources</Text>
          {[
            { label: "WPAFB Housing Office", url: "https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/" },
            { label: "DFAS BAH Calculator",  url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm" },
            { label: "Military OneSource",   url: "https://www.militaryonesource.mil" },
            { label: "VA COE Application",   url: "https://www.va.gov/housing-assistance/home-loans/apply-for-coe-form-26-1880/" },
          ].map(r => (
            <TouchableOpacity
              key={r.label}
              style={s.resourceRow}
              onPress={() => { const { Linking } = require("react-native"); Linking.openURL(r.url); }}
            >
              <Text style={s.resourceLabel}>{r.label}</Text>
              <Ionicons name="open-outline" size={14} color={Colors.gold} />
            </TouchableOpacity>
          ))}
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

  progressCard: {
    backgroundColor: Colors.black, borderRadius: 14, padding: 16, marginBottom: 16,
  },
  progressHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  progressTitle:  { color: Colors.white, fontWeight: "700", fontSize: 15, flex: 1 },
  progressPct:    { color: Colors.gold, fontWeight: "800", fontSize: 18 },
  progressBg:     { height: 6, backgroundColor: "#333", borderRadius: 3, overflow: "hidden" },
  progressFill:   { height: 6, backgroundColor: Colors.gold, borderRadius: 3 },
  progressSub:    { color: Colors.gray, fontSize: 12, marginTop: 6 },

  intro: { color: Colors.gray, fontSize: 13, marginBottom: 16, lineHeight: 18 },

  phase:       { marginBottom: 10, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  phaseHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white, padding: 14,
  },
  phaseDot:       { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  phaseHeaderText:{ flex: 1 },
  phaseLabel:     { fontWeight: "700", fontSize: 15, color: Colors.black },
  phaseSub:       { color: Colors.gray, fontSize: 12, marginTop: 1 },
  phaseDateHint:  { fontSize: 11, fontWeight: "600", marginTop: 1 },

  // Orders date card
  dateCard:         { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#F5E088",
                      borderRadius: 14, padding: 16, marginBottom: 16 },
  dateCardHeader:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  dateCardTitle:    { fontSize: 14, fontWeight: "700", color: Colors.black },
  dateCardSub:      { fontSize: 12, color: Colors.gray, marginBottom: 10, lineHeight: 18 },
  dateInput:        { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
                      paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
                      color: Colors.black, backgroundColor: Colors.white },
  dateConfirm:      { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  dateConfirmText:  { fontSize: 12, color: Colors.gray, flex: 1 },
  phaseBody:      { backgroundColor: "#FAFAFA", paddingHorizontal: 14, paddingBottom: 10 },

  item: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginTop: 1, flexShrink: 0,
  },
  checkboxDone: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  itemText:     { flex: 1, fontSize: 14, color: Colors.black, lineHeight: 20 },
  itemTextDone: { color: Colors.gray, textDecorationLine: "line-through" },

  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 12, padding: 15, marginTop: 20,
  },
  ctaText: { fontWeight: "700", fontSize: 15, color: Colors.black },

  resources:      { marginTop: 20 },
  resourcesTitle: { fontWeight: "700", fontSize: 13, color: Colors.gray, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  resourceRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resourceLabel: { color: Colors.black, fontSize: 14 },
});
