import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../shared/theme/colors";
import { clearPersona } from "../shared/persona";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import HeaderActions from "../shared/components/HeaderActions";
import BrandHeader, { SwitchBtn } from "../shared/components/BrandHeader";
import MarketSnapshot from "../shared/components/MarketSnapshot";
import MortgageRates from "../shared/components/MortgageRates";
import DaytonEvents from "../shared/components/DaytonEvents";

// ─── Placeholder listings ─────────────────────────────────────────────────────
const SAMPLE_LISTINGS = [
  {
    id: "1", price: "$265,000", address: "3844 Stonebridge Blvd", city: "Centerville, OH",
    beds: 4, baths: 2, sqft: "2,010", status: "Active",
    photo: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
  {
    id: "2", price: "$219,900", address: "512 Wilmington Pike", city: "Kettering, OH",
    beds: 3, baths: 2, sqft: "1,640", status: "Active",
    photo: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
  {
    id: "3", price: "$334,500", address: "7201 Paragon Rd", city: "Centerville, OH",
    beds: 5, baths: 3, sqft: "2,480", status: "Active",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "4", price: "$179,000", address: "204 E Dorothy Ln", city: "Kettering, OH",
    beds: 3, baths: 1, sqft: "1,180", status: "Active",
    photo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  },
];

// ─── Key employers ────────────────────────────────────────────────────────────
const EMPLOYERS = [
  {
    name:     "L3Harris Technologies",
    sector:   "Defense / Aerospace",
    location: "Beavercreek & Greenville",
    icon:     "airplane-outline",
    note:     "One of the largest defense contractors in the Dayton region",
  },
  {
    name:     "Kettering Health",
    sector:   "Healthcare",
    location: "Kettering & across Dayton",
    icon:     "medkit-outline",
    note:     "14-hospital system — a major regional healthcare employer",
  },
  {
    name:     "Premier Health",
    sector:   "Healthcare",
    location: "Dayton metro",
    icon:     "heart-outline",
    note:     "Miami Valley Hospital flagship of a large regional network",
  },
  {
    name:     "Wright-Patterson AFB (Civilian)",
    sector:   "Government / Defense",
    location: "Beavercreek / Fairborn",
    icon:     "shield-outline",
    note:     "Largest single-site employer in Ohio — thousands of civilian roles",
  },
  {
    name:     "University of Dayton",
    sector:   "Education / Research",
    location: "Dayton",
    icon:     "school-outline",
    note:     "Top research university with strong industry partnerships",
  },
  {
    name:     "CareSource",
    sector:   "Insurance / Healthcare IT",
    location: "Downtown Dayton",
    icon:     "laptop-outline",
    note:     "National Medicaid managed care organization HQ'd in Dayton",
  },
];

// ─── Quick tools ──────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { icon: "search-outline",          label: "Home Search",              route: "/(tabs)/explore" },
  { icon: "location-outline",        label: "Explore Neighborhoods",    route: "/neighborhoods" },
  { icon: "school-outline",          label: "School Guide",             route: "/schools" },
  { icon: "construct-outline",       label: "Local Services",           route: "/local-services" },
  { icon: "calculator-outline",      label: "Mortgage Calculator",      route: "/mortgage-calculator" },
  { icon: "calendar-outline",        label: "Events Calendar",          route: "/dayton-events" },
  { icon: "leaf-outline",            label: "Parks & Outdoors",         route: "/parks" },
  { icon: "briefcase-outline",       label: "Relocation Package Guide", route: "/relo-package" },
  { icon: "car-outline",             label: "Commute Finder",           route: "/commute-finder" },
  { icon: "bed-outline",             label: "Temporary Housing",        route: "/temp-housing" },
  { icon: "receipt-outline",         label: "Closing Cost Calculator",  route: "/closing-costs" },
  { icon: "git-compare-outline",     label: "Compare Neighborhoods",    route: "/neighborhood-compare" },
  { icon: "swap-horizontal-outline", label: "Cost of Living Comparison",route: "/cost-of-living" },
  { icon: "business-outline",        label: "Employer Map",             route: "/employer-map" },
  { icon: "apps-outline",            label: "All Tools",                route: "/(tabs)/tools" },
  { icon: "person-outline",          label: "Contact Chris",            route: "/(tabs)/contact" },
];

// ─── Dayton relocation stats ──────────────────────────────────────────────────
const STATS = [
  { value: "$265K",  label: "Median Home Price" },
  { value: "$1,450", label: "Avg 3BR Rent"      },
  { value: "82",     label: "COL Index (US=100)" },
  { value: "18 days",label: "Avg Days on Market" },
];

// ─── Helpful resources ────────────────────────────────────────────────────────
const RESOURCES = [
  { label: "Dayton Area Chamber of Commerce", url: "https://www.daytonchamber.org" },
  { label: "Ohio Relocation Guide",           url: "https://ohio.gov" },
  { label: "Montgomery County Schools Guide", url: "https://www.mcesc.org" },
  { label: "City of Dayton — New Residents",  url: "https://www.daytonohio.gov" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function RelocationHub() {
  function switchPath() {
    clearPersona();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <BrandHeader noTopInset
          left={<SwitchBtn onPress={switchPath} />}
          right={<HeaderActions />}
        />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="briefcase" size={22} color={Colors.gold} />
            <Text style={s.heroBadgeText}>JOB RELOCATION</Text>
          </View>
          <Text style={s.heroTitle}>Moving to Dayton for Work?</Text>
          <Text style={s.heroBody}>
            Dayton punches well above its weight — home to Fortune 500 operations,
            world-class healthcare, and defense industry careers, all at a cost of living
            that makes your paycheck go further.
          </Text>

          <TouchableOpacity
            style={s.heroCTA}
            onPress={() => router.push("/cost-of-living")}
            activeOpacity={0.85}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={Colors.black} />
            <Text style={s.heroCTAText}>Compare Cost of Living</Text>
          </TouchableOpacity>
        </View>

        {/* ── Live Market Snapshot ───────────────────────────────────────── */}
        <MarketSnapshot />

        {/* ── Key stats ──────────────────────────────────────────────────── */}
        <Section title="Dayton by the Numbers">
          <View style={s.statsGrid}>
            {STATS.map(({ value, label }) => (
              <View key={label} style={s.statCard}>
                <Text style={s.statValue}>{value}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Mortgage Rates ─────────────────────────────────────────────── */}
        <MortgageRates />

        {/* ── Quick links ─────────────────────────────────────────────────── */}
        <Section title="Relocation Tools">
          <View style={s.linkGrid}>
            {QUICK_LINKS.map(({ icon, label, route }) => (
              <TouchableOpacity
                key={label}
                style={s.linkTile}
                onPress={() => router.push(route as any)}
                activeOpacity={0.8}
              >
                <Ionicons name={icon as any} size={22} color={Colors.gold} />
                <Text style={s.linkTileLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* ── Featured listings ──────────────────────────────────────────── */}
        <View style={s.featuredWrap}>
          <View style={s.featuredHeader}>
            <Text style={s.featuredTitle}>Featured Homes for Sale</Text>
            <TouchableOpacity style={s.featuredSeeAll} onPress={() => router.push("/(tabs)/explore" as any)}>
              <Text style={s.featuredSeeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.gold} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featuredStrip}>
            {SAMPLE_LISTINGS.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={s.featuredCard}
                onPress={() => router.push({
                  pathname: "/(tabs)/explore" as any,
                  params: { area: l.city.split(",")[0] },
                })}
                activeOpacity={0.88}
              >
                <Image source={{ uri: l.photo }} style={s.featuredPhoto} resizeMode="cover" />
                <View style={s.featuredBadge}><Text style={s.featuredBadgeText}>{l.status}</Text></View>
                <View style={s.featuredInfo}>
                  <Text style={s.featuredPrice}>{l.price}</Text>
                  <Text style={s.featuredAddr} numberOfLines={1}>{l.address}</Text>
                  <Text style={s.featuredCity} numberOfLines={1}>{l.city}</Text>
                  <View style={s.featuredSpecs}>
                    <Text style={s.featuredSpec}>{l.beds} bd</Text>
                    <Text style={s.featuredSpecDot}>·</Text>
                    <Text style={s.featuredSpec}>{l.baths} ba</Text>
                    <Text style={s.featuredSpecDot}>·</Text>
                    <Text style={s.featuredSpec}>{l.sqft} sf</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.featuredMoreTile} onPress={() => router.push("/(tabs)/explore" as any)}>
              <Ionicons name="home-outline" size={24} color={Colors.gold} />
              <Text style={s.featuredMoreText}>See All{"\n"}Listings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Major employers ────────────────────────────────────────────── */}
        <Section title="Major Dayton Employers">
          {EMPLOYERS.map(({ name, sector, location, icon, note }) => (
            <View key={name} style={s.employerCard}>
              <View style={s.employerIconWrap}>
                <Ionicons name={icon as any} size={20} color={Colors.gold} />
              </View>
              <View style={s.employerText}>
                <Text style={s.employerName}>{name}</Text>
                <Text style={s.employerSector}>{sector} · {location}</Text>
                <Text style={s.employerNote}>{note}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ── Neighborhood tip ───────────────────────────────────────────── */}
        <View style={s.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.gold} />
          <View style={s.tipText}>
            <Text style={s.tipTitle}>Commute Tip</Text>
            <Text style={s.tipBody}>
              L3Harris / WPAFB employees typically favor Beavercreek, Fairborn, or Huber Heights.
              Kettering Health and Premier Health employees often prefer Kettering, Centerville, or Oakwood.
              Tap "Explore Neighborhoods" for detailed commute times.
            </Text>
          </View>
        </View>

        {/* ── Resources ──────────────────────────────────────────────────── */}
        <Section title="Helpful Resources">
          {RESOURCES.map(({ label, url }) => (
            <TouchableOpacity
              key={label}
              style={s.resourceRow}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.75}
            >
              <Ionicons name="globe-outline" size={16} color={Colors.gold} />
              <Text style={s.resourceLabel}>{label}</Text>
              <Ionicons name="open-outline" size={14} color={Colors.grayLight} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          ))}
        </Section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Let's Find Your Dayton Home</Text>
          <Text style={s.ctaBody}>
            Chris knows the commute corridors, school districts, and neighborhoods
            that fit your employer, timeline, and lifestyle.
          </Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/contact")}
            activeOpacity={0.85}
          >
            <Text style={s.ctaBtnText}>Talk to Chris</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* ── Upcoming Events ────────────────────────────────────────────── */}
        <DaytonEvents />

        <View style={{ height: 80 }} />
      </ScrollView>
      <ChatFAB extraBottom={64} />
      <AppTabBar />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 24 },

  topBar: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.black,
    borderBottomWidth: 1, borderBottomColor: "#222",
  },
  switchBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.goldDark,
    backgroundColor: "#1A1A1A",
  },
  switchText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },
  contactBtn: { padding: 2 },

  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 22, paddingVertical: 28,
    borderBottomWidth: 3, borderBottomColor: Colors.gold,
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14,
  },
  heroBadgeText: {
    color: Colors.gold, fontSize: 12, fontWeight: "800",
    letterSpacing: 2, textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.white, fontSize: 22, fontWeight: "800",
    textAlign: "center", marginBottom: 10, lineHeight: 30,
  },
  heroBody: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 21,
    textAlign: "center", marginBottom: 20,
  },
  heroCTA: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 24, borderRadius: 10,
  },
  heroCTAText: { color: Colors.black, fontWeight: "800", fontSize: 14 },

  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    marginBottom: 16, borderLeftWidth: 3,
    borderLeftColor: Colors.gold, paddingLeft: 10,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%", backgroundColor: Colors.black,
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: "#222",
  },
  statValue: { color: Colors.gold, fontSize: 20, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: Colors.grayLight, fontSize: 12 },

  linkGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkTile: {
    width: "47%", backgroundColor: Colors.black,
    borderRadius: 12, padding: 16, gap: 8,
    borderWidth: 1, borderColor: "#222",
  },
  linkTileLabel: { color: Colors.white, fontSize: 13, fontWeight: "600", lineHeight: 18 },

  employerCard: {
    flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start",
  },
  employerIconWrap: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.black, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  employerText:   { flex: 1 },
  employerName:   { color: Colors.black, fontWeight: "700", fontSize: 15, marginBottom: 2 },
  employerSector: { color: Colors.gold,  fontSize: 12, marginBottom: 4 },
  employerNote:   { color: Colors.gray,  fontSize: 13, lineHeight: 18 },

  tipCard: {
    flexDirection: "row", gap: 14, margin: 20,
    backgroundColor: "#FFFBEB", borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: "#F5E088",
    alignItems: "flex-start",
  },
  tipText:  { flex: 1 },
  tipTitle: { color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 6 },
  tipBody:  { color: Colors.black, fontSize: 13, lineHeight: 19 },

  resourceRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resourceLabel: { color: Colors.black, fontSize: 14, flex: 1 },

  cta: {
    margin: 20, backgroundColor: Colors.black,
    borderRadius: 16, padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaTitle: { color: Colors.white, fontWeight: "800", fontSize: 17, textAlign: "center", marginBottom: 8 },
  ctaBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 18 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 28, borderRadius: 10,
  },
  ctaBtnText: { color: Colors.black, fontWeight: "800", fontSize: 14 },

  // ── Featured listings ─────────────────────────────────────────────────────
  featuredWrap:   { paddingTop: 28 },
  featuredHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 14 },
  featuredTitle:  { color: Colors.black, fontSize: 16, fontWeight: "800", borderLeftWidth: 3, borderLeftColor: Colors.gold, paddingLeft: 10 },
  featuredSeeAll: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredSeeAllText: { color: Colors.gold, fontSize: 13, fontWeight: "700" },
  featuredStrip:  { paddingHorizontal: 20, paddingBottom: 4 },
  featuredCard: {
    width: 230, marginRight: 12, backgroundColor: Colors.white,
    borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  featuredPhoto:  { width: "100%", height: 140 },
  featuredBadge: {
    position: "absolute", top: 10, left: 10,
    backgroundColor: Colors.black, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  featuredBadgeText: { color: Colors.gold, fontSize: 10, fontWeight: "700" },
  featuredInfo:   { padding: 12 },
  featuredPrice:  { color: Colors.black, fontSize: 17, fontWeight: "800", marginBottom: 3 },
  featuredAddr:   { color: Colors.gray, fontSize: 12, marginBottom: 2 },
  featuredCity:   { color: Colors.grayLight, fontSize: 11, marginBottom: 8 },
  featuredSpecs:  { flexDirection: "row", alignItems: "center", gap: 6 },
  featuredSpec:   { color: Colors.gray, fontSize: 12 },
  featuredSpecDot:{ color: Colors.grayLight, fontSize: 12 },
  featuredMoreTile: {
    width: 110, backgroundColor: Colors.black, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  featuredMoreText: { color: Colors.white, fontSize: 12, fontWeight: "700", textAlign: "center", lineHeight: 17 },
});
