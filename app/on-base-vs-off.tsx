import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

const ON_BASE_NEIGHBORHOODS = [
  { name: "Kittyhawk",    desc: "Family-focused with a strong community feel. Mix of duplexes and single-family homes.", waitlist: "4–8 months", rent: "BAH covers 100%", petFriendly: true },
  { name: "Phoenix",      desc: "Newer construction, close to the commissary and rec center. Popular for junior officers.", waitlist: "3–6 months", rent: "BAH covers 100%", petFriendly: true },
  { name: "The Prairies", desc: "Senior NCO/officer housing with larger homes. Quieter setting near golf course.", waitlist: "6–12 months", rent: "BAH covers 100%", petFriendly: true },
];

const OFF_BASE = [
  { name: "Fairborn",      drive: "3 min",  schools: "B-", medRent: "$1,300", medPrice: "$180K", note: "Most popular with E4–E6. Close to main gate, affordable, walkable to some amenities." },
  { name: "Riverside",     drive: "5 min",  schools: "B",  medRent: "$1,250", medPrice: "$175K", note: "Budget-friendly. Direct access to WPAFB South Gate." },
  { name: "Beavercreek",   drive: "10 min", schools: "A",  medRent: "$1,700", medPrice: "$265K", note: "Top-rated schools, upscale retail, newer construction. Popular with officers and families." },
  { name: "Huber Heights",  drive: "13 min", schools: "B-", medRent: "$1,400", medPrice: "$210K", note: "Good value, solid schools, established neighborhoods." },
  { name: "Kettering",     drive: "22 min", schools: "A-", medRent: "$1,400", medPrice: "$259K", note: "Great schools, beautiful older homes. Worth the commute for families prioritizing education." },
];

const ON_PROS = [
  "No rent/mortgage payment — covered by BAH",
  "Walk to base facilities (commissary, BX, gym, chapel)",
  "Military community — built-in support network",
  "Maintenance handled by housing office",
  "No utilities to manage in most cases",
  "Quick commute — minutes to duty station",
];
const ON_CONS = [
  "Waitlists of 3–12 months — can't always time it with PCS",
  "Less space than off-base equivalents",
  "Must follow base housing rules (pets, modifications, etc.)",
  "You never build home equity",
  "Less access to civilian community and amenities",
];
const OFF_PROS = [
  "Build equity if you buy — VA loan requires $0 down",
  "More space for the same or less than BAH",
  "More neighborhood variety and civilian amenities",
  "Freedom to modify, decorate, and make it yours",
  "Can rent it out after PCS — Dayton has a strong rental market",
  "Access to Dayton's excellent school districts",
];
const OFF_CONS = [
  "Responsible for utilities, maintenance, and repairs",
  "Commute adds 5–25 minutes depending on neighborhood",
  "Need to manage move-in, lease, or mortgage closing timing",
];

export default function OnBaseVsOffScreen() {
  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Intro */}
        <View style={s.intro}>
          <Text style={s.introText}>
            One of the biggest decisions for a PCS move: live on base or off?
            Here's an honest breakdown for WPAFB to help you decide.
          </Text>
        </View>

        {/* On-base neighborhoods */}
        <Text style={s.sectionTitle}>On-Base Housing — WPAFB</Text>
        <Text style={s.sectionSub}>All three neighborhoods are managed by Hunt Military Communities.</Text>
        {ON_BASE_NEIGHBORHOODS.map(n => (
          <View key={n.name} style={s.nbCard}>
            <View style={s.nbHeader}>
              <Ionicons name="shield-outline" size={18} color={Colors.gold} />
              <Text style={s.nbName}>{n.name}</Text>
              {n.petFriendly && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>Pet Friendly</Text>
                </View>
              )}
            </View>
            <Text style={s.nbDesc}>{n.desc}</Text>
            <View style={s.nbStats}>
              <View style={s.nbStat}>
                <Text style={s.nbStatLabel}>Waitlist</Text>
                <Text style={s.nbStatValue}>{n.waitlist}</Text>
              </View>
              <View style={s.nbStat}>
                <Text style={s.nbStatLabel}>Cost</Text>
                <Text style={s.nbStatValue}>{n.rent}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={s.resourceRow}
          onPress={() => Linking.openURL("https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/")}
        >
          <Text style={s.resourceLabel}>WPAFB Housing Office — Check Waitlist</Text>
          <Ionicons name="open-outline" size={14} color={Colors.gold} />
        </TouchableOpacity>

        {/* Pros / Cons */}
        <View style={s.compareRow}>
          <View style={[s.compareCol, { marginRight: 6 }]}>
            <View style={[s.compareHeader, { backgroundColor: "#1A3A5C" }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
              <Text style={s.compareHeaderText}>On-Base</Text>
            </View>
            <View style={s.compareSection}>
              <Text style={s.compareLabel}>✓ Pros</Text>
              {ON_PROS.map(p => <Text key={p} style={s.comparePro}>• {p}</Text>)}
              <Text style={[s.compareLabel, { marginTop: 10 }]}>✗ Cons</Text>
              {ON_CONS.map(c => <Text key={c} style={s.compareCon}>• {c}</Text>)}
            </View>
          </View>
          <View style={[s.compareCol, { marginLeft: 6 }]}>
            <View style={[s.compareHeader, { backgroundColor: Colors.black }]}>
              <Ionicons name="home-outline" size={16} color={Colors.gold} />
              <Text style={s.compareHeaderText}>Off-Base</Text>
            </View>
            <View style={s.compareSection}>
              <Text style={s.compareLabel}>✓ Pros</Text>
              {OFF_PROS.map(p => <Text key={p} style={s.comparePro}>• {p}</Text>)}
              <Text style={[s.compareLabel, { marginTop: 10 }]}>✗ Cons</Text>
              {OFF_CONS.map(c => <Text key={c} style={s.compareCon}>• {c}</Text>)}
            </View>
          </View>
        </View>

        {/* Off-base neighborhoods */}
        <Text style={s.sectionTitle}>Top Off-Base Neighborhoods Near WPAFB</Text>
        {OFF_BASE.map(n => (
          <TouchableOpacity
            key={n.name}
            style={s.offCard}
            onPress={() => router.push("/neighborhoods" as any)}
            activeOpacity={0.85}
          >
            <View style={s.offHeader}>
              <Text style={s.offName}>{n.name}</Text>
              <View style={s.offStats}>
                <Text style={s.offStat}>🚗 {n.drive}</Text>
                <Text style={s.offStat}>🏫 {n.schools}</Text>
              </View>
            </View>
            <Text style={s.offNote}>{n.note}</Text>
            <View style={s.offPrices}>
              <Text style={s.offPrice}>Rent: {n.medRent}/mo</Text>
              <Text style={s.offPrice}>Buy: {n.medPrice} median</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Chris CTA */}
        <View style={s.chrisCta}>
          <Text style={s.chrisCtaTitle}>Not sure which is right for you?</Text>
          <Text style={s.chrisCtaBody}>
            Chris has helped dozens of military families work through this exact decision.
            A quick call can save you months of stress.
          </Text>
          <TouchableOpacity
            style={s.chrisBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-outline" size={16} color={Colors.black} />
            <Text style={s.chrisBtnText}>Talk to Chris</Text>
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

  intro: {
    backgroundColor: "#EEF4FF", borderRadius: 12, padding: 14, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: "#4A90D9",
  },
  introText: { color: "#1A3A5C", fontSize: 14, lineHeight: 20 },

  sectionTitle: { fontWeight: "800", fontSize: 17, color: Colors.black, marginBottom: 4, marginTop: 8 },
  sectionSub:   { color: Colors.gray, fontSize: 13, marginBottom: 12 },

  nbCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  nbHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  nbName:   { fontWeight: "700", fontSize: 15, color: Colors.black, flex: 1 },
  badge:    { backgroundColor: "#E8F5E9", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:{ color: "#2E7D32", fontSize: 11, fontWeight: "600" },
  nbDesc:   { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  nbStats:  { flexDirection: "row", gap: 16 },
  nbStat:   {},
  nbStatLabel: { color: Colors.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  nbStatValue: { color: Colors.black, fontWeight: "700", fontSize: 13, marginTop: 1 },

  resourceRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border, marginBottom: 20,
  },
  resourceLabel: { color: Colors.gold, fontSize: 14, fontWeight: "600" },

  compareRow:   { flexDirection: "row", marginBottom: 20 },
  compareCol:   { flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  compareHeader:{ flexDirection: "row", alignItems: "center", gap: 6, padding: 10 },
  compareHeaderText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  compareSection: { padding: 10 },
  compareLabel:   { fontWeight: "700", fontSize: 12, color: Colors.black, marginBottom: 4 },
  comparePro:     { color: "#2E7D32", fontSize: 12, lineHeight: 17, marginBottom: 3 },
  compareCon:     { color: "#C62828", fontSize: 12, lineHeight: 17, marginBottom: 3 },

  offCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  offHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  offName:   { fontWeight: "700", fontSize: 15, color: Colors.black },
  offStats:  { flexDirection: "row", gap: 10 },
  offStat:   { fontSize: 13, color: Colors.gray },
  offNote:   { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  offPrices: { flexDirection: "row", gap: 16 },
  offPrice:  { color: Colors.black, fontSize: 13, fontWeight: "600" },

  chrisCta: {
    backgroundColor: Colors.black, borderRadius: 14, padding: 18, marginTop: 10,
  },
  chrisCtaTitle: { color: Colors.gold, fontWeight: "800", fontSize: 16, marginBottom: 6 },
  chrisCtaBody:  { color: "#CCC", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  chrisBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 10, padding: 12,
  },
  chrisBtnText: { fontWeight: "700", fontSize: 14, color: Colors.black },
});
