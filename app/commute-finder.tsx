import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";

const EMPLOYERS = [
  { id: "wpafb",    name: "Wright-Patterson AFB",  location: "Fairborn / Riverside",  sector: "Military / Govt", icon: "shield-outline" as const },
  { id: "l3harris", name: "L3Harris Technologies",  location: "Beavercreek / Greenville", sector: "Defense / Aerospace", icon: "airplane-outline" as const },
  { id: "kettering",name: "Kettering Health",        location: "Kettering",            sector: "Healthcare",      icon: "medkit-outline" as const },
  { id: "premier",  name: "Premier Health",          location: "Downtown Dayton",      sector: "Healthcare",      icon: "heart-outline" as const },
  { id: "caresource",name:"CareSource",              location: "Downtown Dayton",      sector: "Insurance / IT",  icon: "laptop-outline" as const },
  { id: "ud",       name: "University of Dayton",   location: "South Dayton",         sector: "Education",       icon: "school-outline" as const },
  { id: "wright_state",name:"Wright State University",location:"Fairborn",             sector: "Education",       icon: "school-outline" as const },
  { id: "ncr",      name: "NCR Voyix",               location: "Downtown Dayton",      sector: "Tech / Fintech",  icon: "hardware-chip-outline" as const },
];

// Commute times in minutes from each employer to each neighborhood
const COMMUTES: Record<string, Record<string, number>> = {
  wpafb:      { Fairborn: 3, Riverside: 5, "Huber Heights": 13, Beavercreek: 10, Xenia: 20, Kettering: 28, Centerville: 32, Oakwood: 35, Miamisburg: 35, Springboro: 40, Trotwood: 25 },
  l3harris:   { Beavercreek: 5, Fairborn: 8, "Huber Heights": 18, Kettering: 20, Riverside: 15, Xenia: 18, Centerville: 22, Oakwood: 28, Miamisburg: 30, Springboro: 38, Trotwood: 30 },
  kettering:  { Kettering: 5, Oakwood: 10, Centerville: 12, Miamisburg: 18, Beavercreek: 22, "Huber Heights": 20, Riverside: 18, Fairborn: 28, Springboro: 22, Xenia: 30, Trotwood: 25 },
  premier:    { Oakwood: 8, Kettering: 10, Centerville: 18, Miamisburg: 22, "Huber Heights": 18, Riverside: 15, Beavercreek: 25, Fairborn: 30, Springboro: 25, Xenia: 30, Trotwood: 18 },
  caresource: { Oakwood: 10, Kettering: 12, Riverside: 10, "Huber Heights": 15, Centerville: 20, Miamisburg: 22, Beavercreek: 28, Fairborn: 30, Springboro: 28, Xenia: 32, Trotwood: 15 },
  ud:         { Kettering: 8, Oakwood: 12, Centerville: 18, Riverside: 15, "Huber Heights": 20, Miamisburg: 20, Beavercreek: 25, Fairborn: 30, Xenia: 30, Springboro: 25, Trotwood: 20 },
  wright_state:{ Fairborn: 5, Beavercreek: 8, "Huber Heights": 20, Riverside: 18, Xenia: 20, Kettering: 30, Centerville: 32, Oakwood: 35, Miamisburg: 38, Springboro: 42, Trotwood: 30 },
  ncr:        { Oakwood: 8, Kettering: 10, Riverside: 8, "Huber Heights": 15, Centerville: 20, Beavercreek: 28, Fairborn: 32, Miamisburg: 22, Springboro: 28, Xenia: 32, Trotwood: 15 },
};

const NEIGHBORHOODS = [
  { name: "Fairborn",       schools: "B-", medRent: "$1,300", medPrice: "$180K" },
  { name: "Riverside",      schools: "B",  medRent: "$1,250", medPrice: "$175K" },
  { name: "Beavercreek",    schools: "A",  medRent: "$1,700", medPrice: "$265K" },
  { name: "Huber Heights",  schools: "B-", medRent: "$1,400", medPrice: "$210K" },
  { name: "Kettering",      schools: "A-", medRent: "$1,400", medPrice: "$259K" },
  { name: "Oakwood",        schools: "A+", medRent: "$1,600", medPrice: "$340K" },
  { name: "Centerville",    schools: "A",  medRent: "$1,650", medPrice: "$285K" },
  { name: "Miamisburg",     schools: "B+", medRent: "$1,350", medPrice: "$220K" },
  { name: "Springboro",     schools: "A+", medRent: "$1,700", medPrice: "$315K" },
  { name: "Xenia",          schools: "B-", medRent: "$1,100", medPrice: "$168K" },
  { name: "Trotwood",       schools: "C",  medRent: "$950",   medPrice: "$115K" },
];

function commuteColor(mins: number) {
  if (mins <= 10) return "#2E7D32";
  if (mins <= 20) return "#F9A825";
  if (mins <= 30) return "#E65100";
  return "#C62828";
}

function commuteLabel(mins: number) {
  if (mins <= 10) return "Excellent";
  if (mins <= 20) return "Great";
  if (mins <= 30) return "Good";
  return "Long";
}

export default function CommuteFinderScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [maxMins, setMaxMins]   = useState<number>(25);

  const employer    = EMPLOYERS.find(e => e.id === selected);
  const commuteData = selected ? COMMUTES[selected] : null;

  const results = commuteData
    ? NEIGHBORHOODS
        .filter(n => (commuteData[n.name] ?? 99) <= maxMins)
        .sort((a, b) => (commuteData[a.name] ?? 99) - (commuteData[b.name] ?? 99))
    : [];

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Text style={s.lead}>Pick your employer to see which Dayton neighborhoods give you the shortest commute.</Text>

        {/* Employer list */}
        <Text style={s.sectionLabel}>SELECT YOUR EMPLOYER</Text>
        {EMPLOYERS.map(emp => (
          <TouchableOpacity
            key={emp.id}
            style={[s.empCard, selected === emp.id && s.empCardActive]}
            onPress={() => setSelected(emp.id)}
            activeOpacity={0.8}
          >
            <View style={[s.empIcon, selected === emp.id && s.empIconActive]}>
              <Ionicons name={emp.icon} size={20} color={selected === emp.id ? Colors.black : Colors.gold} />
            </View>
            <View style={s.empBody}>
              <Text style={[s.empName, selected === emp.id && s.empNameActive]}>{emp.name}</Text>
              <Text style={s.empSub}>{emp.location} · {emp.sector}</Text>
            </View>
            {selected === emp.id && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
            )}
          </TouchableOpacity>
        ))}

        {/* Filter */}
        {selected && (
          <>
            <Text style={s.sectionLabel}>MAX COMMUTE TIME</Text>
            <View style={s.timeFilter}>
              {[15, 20, 25, 30, 40].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[s.timePill, maxMins === m && s.timePillActive]}
                  onPress={() => setMaxMins(m)}
                >
                  <Text style={[s.timePillText, maxMins === m && s.timePillTextActive]}>{m} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionLabel}>
              {results.length} NEIGHBORHOOD{results.length !== 1 ? "S" : ""} WITHIN {maxMins} MINUTES
            </Text>

            {results.length === 0 ? (
              <View style={s.noResults}>
                <Text style={s.noResultsText}>No neighborhoods within {maxMins} min. Try increasing the limit.</Text>
              </View>
            ) : (
              results.map(n => {
                const mins = commuteData![n.name] ?? 99;
                const col  = commuteColor(mins);
                return (
                  <TouchableOpacity
                    key={n.name}
                    style={s.resultCard}
                    onPress={() => router.push("/neighborhoods" as any)}
                    activeOpacity={0.85}
                  >
                    <View style={[s.commuteBadge, { backgroundColor: col + "20" }]}>
                      <Text style={[s.commuteMin, { color: col }]}>{mins}</Text>
                      <Text style={[s.commuteMinLabel, { color: col }]}>min</Text>
                    </View>
                    <View style={s.resultBody}>
                      <View style={s.resultHeader}>
                        <Text style={s.resultName}>{n.name}</Text>
                        <View style={[s.commuteTag, { backgroundColor: col + "15" }]}>
                          <Text style={[s.commuteTagText, { color: col }]}>{commuteLabel(mins)}</Text>
                        </View>
                      </View>
                      <View style={s.resultStats}>
                        <Text style={s.resultStat}>🏫 Schools: {n.schools}</Text>
                        <Text style={s.resultStat}>🏠 Buy: {n.medPrice}</Text>
                        <Text style={s.resultStat}>🔑 Rent: {n.medRent}/mo</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        <View style={s.cta}>
          <Text style={s.ctaTitle}>Want to see homes in these areas?</Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/explore" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="home-outline" size={16} color={Colors.black} />
            <Text style={s.ctaBtnText}>Browse Listings</Text>
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

  lead: { color: Colors.gray, fontSize: 14, lineHeight: 20, marginBottom: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.gray,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 16,
  },

  empCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  empCardActive: { borderColor: Colors.gold, backgroundColor: "#FFFBF0" },
  empIcon:       { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  empIconActive: { backgroundColor: Colors.gold },
  empBody:       { flex: 1 },
  empName:       { fontWeight: "700", fontSize: 14, color: Colors.black },
  empNameActive: { color: Colors.black },
  empSub:        { color: Colors.gray, fontSize: 12, marginTop: 1 },

  timeFilter:     { flexDirection: "row", gap: 8, marginBottom: 4 },
  timePill:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  timePillActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  timePillText:   { color: Colors.gray, fontSize: 13, fontWeight: "600" },
  timePillTextActive: { color: Colors.gold },

  noResults:     { alignItems: "center", padding: 24 },
  noResultsText: { color: Colors.gray, fontSize: 14 },

  resultCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  commuteBadge:   { width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  commuteMin:     { fontWeight: "800", fontSize: 20, lineHeight: 22 },
  commuteMinLabel:{ fontSize: 10, fontWeight: "600" },
  resultBody:     { flex: 1 },
  resultHeader:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  resultName:     { fontWeight: "700", fontSize: 15, color: Colors.black },
  commuteTag:     { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  commuteTagText: { fontSize: 11, fontWeight: "700" },
  resultStats:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  resultStat:     { color: Colors.gray, fontSize: 12 },

  cta: {
    backgroundColor: Colors.black, borderRadius: 14, padding: 16, marginTop: 20, alignItems: "center", gap: 12,
  },
  ctaTitle:   { color: Colors.white, fontWeight: "700", fontSize: 15 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
  ctaBtnText: { fontWeight: "700", fontSize: 14, color: Colors.black },
});
