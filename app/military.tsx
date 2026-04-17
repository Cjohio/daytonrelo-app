import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

const VA_BENEFITS = [
  {
    title:    "$0 Down Payment",
    body:     "VA-backed loans require no down payment for eligible veterans and active-duty service members.",
    icon:     "cash-outline",
  },
  {
    title:    "No PMI",
    body:     "Unlike conventional loans, VA loans have no private mortgage insurance requirement.",
    icon:     "shield-outline",
  },
  {
    title:    "Competitive Rates",
    body:     "VA loan interest rates are typically lower than conventional rates for qualified borrowers.",
    icon:     "trending-down-outline",
  },
  {
    title:    "Reusable Benefit",
    body:     "Your VA home loan benefit can be used multiple times throughout your military career.",
    icon:     "refresh-outline",
  },
];

const WPAFB_RESOURCES = [
  { label: "WPAFB Housing Office",         url: "https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/" },
  { label: "Military OneSource (Housing)", url: "https://www.militaryonesource.mil" },
  { label: "VA Home Loan Certificate",     url: "https://www.va.gov/housing-assistance/home-loans/apply-for-coe-form-26-1880/" },
  { label: "DFAS BAH Rates",               url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm" },
];

const DAYTON_NEIGHBORHOODS = [
  { name: "Beavercreek",   distance: "5 min to gate",  vibe: "Suburban, top-rated schools" },
  { name: "Fairborn",      distance: "Adjacent to AFB", vibe: "Affordable, community feel" },
  { name: "Xenia",         distance: "15 min",          vibe: "Rural charm, larger lots" },
  { name: "Centerville",   distance: "25 min",          vibe: "Upscale, great amenities" },
  { name: "Huber Heights", distance: "20 min",          vibe: "Family-friendly, new builds" },
];

export default function MilitaryScreen() {
  return (
    <>
    <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Ionicons name="shield-checkmark" size={44} color={Colors.gold} />
        <Text style={styles.heroTitle}>Military & VA Relocation</Text>
        <Text style={styles.heroBody}>
          Serving the men and women of Wright-Patterson AFB with specialized
          VA loan expertise and PCS-ready home search tools.
        </Text>
        <TouchableOpacity
          style={styles.heroCTA}
          onPress={() => router.push("/bah-calculator")}
          activeOpacity={0.85}
        >
          <Ionicons name="calculator-outline" size={16} color={Colors.black} />
          <Text style={styles.heroCTAText}>Calculate Your BAH</Text>
        </TouchableOpacity>
      </View>

      {/* VA Benefits */}
      <Section title="VA Loan Benefits">
        {VA_BENEFITS.map(({ title, body, icon }) => (
          <View key={title} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name={icon as any} size={20} color={Colors.gold} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>{title}</Text>
              <Text style={styles.benefitBody}>{body}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* Neighborhoods near WPAFB */}
      <Section title="Neighborhoods Near WPAFB">
        {DAYTON_NEIGHBORHOODS.map(({ name, distance, vibe }) => (
          <View key={name} style={styles.neighborhoodRow}>
            <View style={styles.neighborhoodLeft}>
              <Text style={styles.neighborhoodName}>{name}</Text>
              <Text style={styles.neighborhoodVibe}>{vibe}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* External Resources */}
      <Section title="Official Resources">
        {WPAFB_RESOURCES.map(({ label, url }) => (
          <TouchableOpacity
            key={label}
            style={styles.linkRow}
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.75}
          >
            <Ionicons name="globe-outline" size={17} color={Colors.gold} />
            <Text style={styles.linkText}>{label}</Text>
            <Ionicons name="open-outline" size={15} color={Colors.grayLight} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))}
      </Section>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to Start Your PCS Search?</Text>
        <Text style={styles.ctaBody}>
          Work with a VA-certified Dayton agent who understands military timelines.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/(tabs)/contact")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Contact an Agent</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
    <AppTabBar />
    <ChatFAB />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 24 },
  hero: {
    backgroundColor: Colors.black, alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 32,
    borderBottomWidth: 3, borderBottomColor: Colors.gold,
  },
  heroTitle: {
    color: Colors.white, fontSize: 22, fontWeight: "800",
    marginTop: 12, marginBottom: 8, textAlign: "center",
  },
  heroBody: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 21,
    textAlign: "center", marginBottom: 20,
  },
  heroCTA: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 12,
    paddingHorizontal: 22, borderRadius: 10,
  },
  heroCTAText: { color: Colors.black, fontWeight: "700", fontSize: 14 },
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: {
    color: Colors.black, fontSize: 17, fontWeight: "800",
    marginBottom: 16, letterSpacing: 0.3,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    paddingLeft: 10,
  },
  benefitRow: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  benefitIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.black, alignItems: "center", justifyContent: "center",
  },
  benefitText: { flex: 1 },
  benefitTitle: { color: Colors.black, fontWeight: "700", fontSize: 15, marginBottom: 3 },
  benefitBody:  { color: Colors.gray, fontSize: 13, lineHeight: 19 },
  neighborhoodRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  neighborhoodLeft: { flex: 1 },
  neighborhoodName: { color: Colors.black, fontWeight: "700", fontSize: 15 },
  neighborhoodVibe: { color: Colors.gray, fontSize: 12, marginTop: 2 },
  distanceBadge: {
    backgroundColor: Colors.black, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8,
  },
  distanceText: { color: Colors.gold, fontSize: 11, fontWeight: "700" },
  linkRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  linkText: { color: Colors.black, fontSize: 14, flex: 1 },
  cta: {
    margin: 20, backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaTitle: { color: Colors.white, fontWeight: "800", fontSize: 17, textAlign: "center", marginBottom: 8 },
  ctaBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 18 },
  ctaBtn: {
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 28, borderRadius: 10,
  },
  ctaBtnText: { color: Colors.black, fontWeight: "700", fontSize: 14 },
});
