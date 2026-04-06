import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../shared/theme/colors";
import { setPersona, loadPersonaAsync, clearPersona, type Persona } from "../../shared/persona";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import MortgageRates from "../../shared/components/MortgageRates";
import { useAnalytics } from "../../shared/analytics";

// ─── About Me — update these when ready ──────────────────────────────────────
const ABOUT = {
  photo: require("../../assets/images/chris.jpg") as number,
  name:   "Chris Jurgens",
  phone:  "(937) 241-3484",
  title:  "Licensed Ohio Realtor · Relocation Specialist",
  bio:    "As a veteran myself, I know firsthand what it means to PCS and start fresh somewhere new. I help military families, veterans, and corporate relocators find their perfect home in Dayton. With deep roots in the community and expertise in VA loans and PCS moves, I make your transition as smooth as possible. I'd love to help you get settled.",
};

// ─── Path cards ───────────────────────────────────────────────────────────────
const PATHS = [
  {
    id:          "military" as Persona,
    icon:        "shield-checkmark-outline",
    label:       "Military Relocation",
    sub:         "PCS to WPAFB · VA loans · BAH calculator · Base proximity neighborhoods",
    accent:      "#4A90D9",   // steel blue accent for military
    route:       "/military-hub",
  },
  {
    id:          "relocation" as Persona,
    icon:        "briefcase-outline",
    label:       "Job Relocation",
    sub:         "Corporate move · Cost of living · Rent vs. Buy · Employer proximity",
    accent:      Colors.gold,
    route:       "/relocation",
  },
  {
    id:          "discover" as Persona,
    icon:        "compass-outline",
    label:       "Dayton Resident",
    sub:         "Events · Parks · Restaurants · Things to do · Neighborhoods · Local guides",
    accent:      "#5CB85C",   // green for discovery
    route:       "/discover",
  },
] as const;

// ─── Dayton quick facts ───────────────────────────────────────────────────────
const FACTS = [
  { value: "$265K",  label: "Median Home"    },
  { value: "82",     label: "Cost of Living" },
  { value: "17",     label: "Neighborhoods"  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const { capture } = useAnalytics();

  // Returning users: skip landing and go straight to their hub
  useEffect(() => {
    loadPersonaAsync().then(saved => {
      if (saved) {
        const found = PATHS.find(p => p.id === saved);
        if (found) router.replace(found.route as any);
      }
    });
  }, []);

  function handleSelect(path: typeof PATHS[number]) {
    capture("persona_selected", { persona: path.id });
    setPersona(path.id);
    router.replace(path.route as any);
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />
      {/* Search floats in top-right corner of home screen */}
      <View style={s.searchCorner}>
        <HeaderActions />
      </View>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Image
            source={require("../../assets/images/logo-black.png")}
            style={s.logoImage}
            resizeMode="contain"
          />
          <Text style={s.tagline}>Your Move · Your Mission · Your Home</Text>
        </View>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Welcome to Dayton, Ohio</Text>
          <Text style={s.heroBody}>
            Birthplace of aviation. Home to Wright-Patterson AFB, world-class healthcare, and
            some of the most affordable quality living in America. Let us show you around.
          </Text>
        </View>

        {/* ── Quick stats ────────────────────────────────────────────────── */}
        <View style={s.statsRow}>
          {FACTS.map(({ value, label }, i) => (
            <View
              key={label}
              style={[s.statCell, i < FACTS.length - 1 && s.statDivider]}
            >
              <Text style={s.statValue}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.colNote}>Cost of Living Index: US avg = 100</Text>

        {/* ── Mortgage Rates ─────────────────────────────────────────────── */}
        <View style={{ marginTop: 20 }}>
          <MortgageRates />
        </View>

        {/* ── Path selector ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>What brings you to Dayton?</Text>
          <Text style={s.sectionSub}>
            Choose your path for a personalized experience.
          </Text>

          {PATHS.map(path => (
            <TouchableOpacity
              key={path.id}
              style={s.pathCard}
              onPress={() => handleSelect(path)}
              activeOpacity={0.82}
            >
              <View style={[s.pathIconWrap, { backgroundColor: path.accent + "22" }]}>
                <Ionicons name={path.icon as any} size={28} color={path.accent} />
              </View>
              <View style={s.pathText}>
                <Text style={s.pathLabel}>{path.label}</Text>
                <Text style={s.pathSub}>{path.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grayLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── About Me ───────────────────────────────────────────────────── */}
        <View style={s.aboutSection}>
          <Text style={s.sectionTitle}>Meet Your Agent</Text>

          <View style={s.aboutCard}>
            {/* Photo */}
            <View style={s.photoWrap}>
              {ABOUT.photo ? (
                <Image source={ABOUT.photo} style={s.photo} />
              ) : (
                <View style={s.photoPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors.gold} />
                </View>
              )}
            </View>

            {/* Name + title */}
            <Text style={s.aboutName}>{ABOUT.name}</Text>
            <TouchableOpacity
              onPress={() => {
                capture("contact_agent_tapped", { method: "phone" });
                Linking.openURL(`tel:+19372413484`);
              }}
              activeOpacity={0.7}
            >
              <Text style={s.aboutPhone}>{ABOUT.phone}</Text>
            </TouchableOpacity>
            <Text style={s.aboutTitle}>{ABOUT.title}</Text>

            {/* Gold divider */}
            <View style={s.aboutDivider} />

            {/* Bio */}
            <Text style={s.aboutBio}>{ABOUT.bio}</Text>

            {/* Contact chips */}
            <View style={s.aboutChips}>
              <TouchableOpacity
                style={s.aboutChip}
                onPress={() => {
                  capture("contact_agent_tapped", { method: "contact_form" });
                  router.push("/(tabs)/contact" as any);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={15} color={Colors.black} />
                <Text style={s.aboutChipText}>Get in Touch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.aboutChip, s.aboutChipOutline]}
                onPress={() => router.push("/(tabs)/chat" as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.gold} />
                <Text style={[s.aboutChipText, { color: Colors.gold }]}>Ask DaytonBot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.gold} />
          <Text style={s.footerText}>
            Chris Jurgens · Licensed Ohio Realtor · chris@cjohio.com
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },
  searchCorner: {
    position: "absolute", top: 52, right: 20, zIndex: 100,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  // Header
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 8 },
  logoImage: {
    width: 280, height: 100, marginBottom: 2,
  },
  tagline: {
    fontSize: 12, color: Colors.grayLight, letterSpacing: 1.5,
    marginTop: 4, textTransform: "uppercase",
  },

  // Hero
  hero: { paddingHorizontal: 28, paddingVertical: 24, alignItems: "center" },
  heroTitle: {
    color: Colors.white, fontSize: 20, fontWeight: "800",
    textAlign: "center", marginBottom: 12, lineHeight: 28,
  },
  heroBody: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 22,
    textAlign: "center",
  },

  // Stats
  statsRow: {
    flexDirection: "row", marginHorizontal: 24,
    backgroundColor: "#111111", borderRadius: 14,
    borderWidth: 1, borderColor: "#333333",
    overflow: "hidden",
  },
  statCell: {
    flex: 1, alignItems: "center", paddingVertical: 16,
  },
  statDivider: {
    borderRightWidth: 1, borderRightColor: "#333333",
  },
  statValue: { color: Colors.gold, fontSize: 20, fontWeight: "800" },
  statLabel: { color: Colors.grayLight, fontSize: 11, marginTop: 3, letterSpacing: 0.3 },
  colNote: {
    color: "#555", fontSize: 10, textAlign: "center", marginTop: 6, marginBottom: 4,
  },

  // Section
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: {
    color: Colors.white, fontSize: 19, fontWeight: "800",
    marginBottom: 6,
  },
  sectionSub: {
    color: Colors.grayLight, fontSize: 13, marginBottom: 20,
  },

  // Path cards
  pathCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: "#111111",
    borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  pathIconWrap: {
    width: 54, height: 54, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  pathText: { flex: 1 },
  pathLabel: {
    color: Colors.white, fontSize: 16, fontWeight: "800", marginBottom: 4,
  },
  pathSub: {
    color: Colors.grayLight, fontSize: 12, lineHeight: 17,
  },

  // About Me
  aboutSection: { paddingHorizontal: 20, paddingTop: 36 },
  aboutCard: {
    backgroundColor: "#111111",
    borderRadius: 18, padding: 24,
    borderWidth: 1, borderColor: "#2A2A2A",
    alignItems: "center",
  },
  photoWrap: { marginBottom: 16 },
  photo: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: Colors.gold,
  },
  photoPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "#1A1A1A",
    borderWidth: 3, borderColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  aboutName: {
    color: Colors.white, fontSize: 20, fontWeight: "800",
    textAlign: "center", marginBottom: 4,
  },
  aboutPhone: {
    color: Colors.gold, fontSize: 15, fontWeight: "700",
    textAlign: "center", marginBottom: 4, letterSpacing: 0.3,
  },
  aboutTitle: {
    color: Colors.grayLight, fontSize: 12, textAlign: "center",
    letterSpacing: 0.4,
  },
  aboutDivider: {
    width: 40, height: 2, backgroundColor: Colors.gold,
    borderRadius: 1, marginVertical: 16,
  },
  aboutBio: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 22,
    textAlign: "center", marginBottom: 20,
  },
  aboutChips: { flexDirection: "row", gap: 10 },
  aboutChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 22,
  },
  aboutChipOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  aboutChipText: {
    color: Colors.black, fontSize: 13, fontWeight: "700",
  },

  // Footer
  footer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    justifyContent: "center", marginTop: 28, paddingHorizontal: 20,
  },
  footerText: { color: "#555555", fontSize: 12 },
});
