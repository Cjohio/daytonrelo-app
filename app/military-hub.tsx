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

// ─── Placeholder listings (replaced by live SimplyRETS data in production) ────
const SAMPLE_LISTINGS = [
  {
    id: "1", price: "$249,900", address: "4312 Bellaire Ave", city: "Beavercreek, OH",
    beds: 4, baths: 2, sqft: "1,820", status: "Active",
    photo: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
  {
    id: "2", price: "$189,500", address: "817 Kauffman Ave", city: "Fairborn, OH",
    beds: 3, baths: 2, sqft: "1,460", status: "Active",
    photo: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
  {
    id: "3", price: "$319,000", address: "2205 Shakertown Rd", city: "Beavercreek, OH",
    beds: 4, baths: 3, sqft: "2,150", status: "Active",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "4", price: "$172,000", address: "1124 Cincinnati Ave", city: "Xenia, OH",
    beds: 3, baths: 1, sqft: "1,210", status: "Active",
    photo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  },
];

// ─── WPAFB-proximity neighborhoods (sorted by drive time) ────────────────────
const NEAR_BASE = [
  { name: "Riverside",    drive: "5 min",  schools: "B",  rent: "$1,250",  price: "$175K" },
  { name: "Fairborn",     drive: "3 min",  schools: "B-", rent: "$1,300",  price: "$180K" },
  { name: "Beavercreek",  drive: "10 min", schools: "A",  rent: "$1,700",  price: "$265K" },
  { name: "Huber Heights",drive: "13 min", schools: "B-", rent: "$1,400",  price: "$210K" },
  { name: "Xenia",        drive: "20 min", schools: "B-", rent: "$1,350",  price: "$175K" },
  { name: "Kettering",    drive: "22 min", schools: "A-", rent: "$1,400",  price: "$259K" },
];

// ─── VA loan benefits ─────────────────────────────────────────────────────────
const VA_BENEFITS = [
  { icon: "cash-outline",         title: "$0 Down Payment",      body: "No down payment required for eligible veterans and active-duty members." },
  { icon: "shield-outline",       title: "No PMI",               body: "VA loans carry no private mortgage insurance, saving hundreds per month." },
  { icon: "trending-down-outline",title: "Competitive Rates",    body: "VA loan rates are typically below conventional rates for qualified borrowers." },
  { icon: "refresh-outline",      title: "Reusable Benefit",     body: "Your VA loan benefit can be used multiple times throughout your career." },
];

// ─── Quick action links ───────────────────────────────────────────────────────
const QUICK_LINKS = [
  { icon: "checkbox-outline",        label: "PCS Timeline Tracker",        route: "/pcs-timeline" },
  { icon: "shield-outline",          label: "On-Base vs Off-Base Guide",   route: "/on-base-vs-off" },
  { icon: "airplane-outline",        label: "WPAFB Base Guide",            route: "/wpafb" },
  { icon: "calculator-outline",      label: "BAH Calculator",              route: "/bah-calculator" },
  { icon: "receipt-outline",         label: "Closing Cost Calculator",     route: "/closing-costs" },
  { icon: "git-compare-outline",     label: "Compare Neighborhoods",       route: "/neighborhood-compare" },
  { icon: "home-outline",            label: "Mortgage Calculator",         route: "/mortgage-calculator" },
  { icon: "school-outline",          label: "School Guide",                route: "/schools" },
  { icon: "location-outline",        label: "Explore Neighborhoods",       route: "/neighborhoods" },
  { icon: "swap-horizontal-outline", label: "Cost of Living vs. Your Base",route: "/cost-of-living" },
  { icon: "apps-outline",            label: "All Tools",                   route: "/(tabs)/tools" },
  { icon: "person-outline",          label: "Contact Chris",               route: "/(tabs)/contact" },
];

// ─── Official resources ───────────────────────────────────────────────────────
const RESOURCES = [
  { label: "WPAFB Housing Office",         url: "https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/" },
  { label: "DFAS BAH Rates",               url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm" },
  { label: "Military OneSource",           url: "https://www.militaryonesource.mil" },
  { label: "VA Home Loan Certificate",     url: "https://www.va.gov/housing-assistance/home-loans/apply-for-coe-form-26-1880/" },
  { label: "National Museum of the USAF",  url: "https://www.nationalmuseum.af.mil" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MilitaryHub() {
  function switchPath() {
    clearPersona();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <BrandHeader
          left={<SwitchBtn onPress={switchPath} />}
          right={<HeaderActions />}
        />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.gold} />
            <Text style={s.heroBadgeText}>MILITARY RELOCATION</Text>
          </View>
          <Text style={s.heroTitle}>PCS to Wright-Patterson?{"\n"}Let's Find Your Home.</Text>
          <Text style={s.heroBody}>
            VA loans, PCS timelines, and WPAFB-area expertise.
            Chris has helped dozens of military families land in the right neighborhood — fast.
          </Text>
          <View style={s.heroCTARow}>
            <TouchableOpacity
              style={s.heroCTA}
              onPress={() => router.push("/(tabs)/explore" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={16} color={Colors.black} />
              <Text style={s.heroCTAText}>Browse Homes Near WPAFB</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.heroCTASecondary}
              onPress={() => router.push("/(tabs)/contact" as any)}
              activeOpacity={0.85}
            >
              <Text style={s.heroCTASecondaryText}>Talk to Chris</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Live Market Snapshot ───────────────────────────────────────── */}
        <MarketSnapshot />

        {/* ── Mortgage Rates ─────────────────────────────────────────────── */}
        <MortgageRates />

        {/* ── Quick links grid ───────────────────────────────────────────── */}
        <Section title="Quick Actions">
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
            <Text style={s.featuredTitle}>Homes Near WPAFB</Text>
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

        {/* ── Neighborhoods by WPAFB proximity ──────────────────────────── */}
        <Section title="Neighborhoods by WPAFB Drive Time">
          {NEAR_BASE.map(({ name, drive, schools, rent, price }) => (
            <View key={name} style={s.neighRow}>
              <TouchableOpacity
                style={s.neighMain}
                onPress={() => router.push(`/neighborhood/${name.toLowerCase().replace(/ /g, "-")}` as any)}
                activeOpacity={0.8}
              >
                <View style={s.neighLeft}>
                  <Text style={s.neighName}>{name}</Text>
                  <Text style={s.neighMeta}>Schools: {schools}  ·  Avg 3BR: {rent}</Text>
                </View>
                <View style={s.neighRight}>
                  <View style={s.driveBadge}>
                    <Ionicons name="time-outline" size={12} color={Colors.gold} />
                    <Text style={s.driveText}>{drive}</Text>
                  </View>
                  <Text style={s.neighPrice}>{price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.browseHomesBtn}
                onPress={() => router.push({
                  pathname: "/(tabs)/explore" as any,
                  params: { area: name },
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="home-outline" size={12} color={Colors.black} />
                <Text style={s.browseHomesBtnText}>Browse Homes</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={s.viewAllBtn}
            onPress={() => router.push("/neighborhoods" as any)}
          >
            <Text style={s.viewAllText}>Explore All 17 Neighborhoods</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.gold} />
          </TouchableOpacity>
        </Section>

        {/* ── VA Benefits ────────────────────────────────────────────────── */}
        <Section title="Your VA Loan Benefits">
          {VA_BENEFITS.map(({ icon, title, body }) => (
            <View key={title} style={s.benefitRow}>
              <View style={s.benefitIcon}>
                <Ionicons name={icon as any} size={19} color={Colors.gold} />
              </View>
              <View style={s.benefitText}>
                <Text style={s.benefitTitle}>{title}</Text>
                <Text style={s.benefitBody}>{body}</Text>
              </View>
            </View>
          ))}

          {/* Lender CTA */}
          <TouchableOpacity
            style={s.lenderCTA}
            onPress={() => router.push("/va-lender" as any)}
            activeOpacity={0.85}
          >
            <View style={s.lenderCTALeft}>
              <Ionicons name="business-outline" size={22} color={Colors.gold} />
              <View>
                <Text style={s.lenderCTATitle}>Meet Our Preferred VA Lender</Text>
                <Text style={s.lenderCTASub}>Specializing in VA loans for WPAFB families</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={Colors.gold} />
          </TouchableOpacity>
        </Section>

        {/* ── Official resources ─────────────────────────────────────────── */}
        <Section title="Official Resources">
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
          <Text style={s.ctaTitle}>Ready to Start Your PCS Search?</Text>
          <Text style={s.ctaBody}>
            Chris specializes in VA loans and military relocations to WPAFB.
            Know your options before orders drop.
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

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    paddingHorizontal: 22, paddingVertical: 32,
    borderBottomWidth: 3, borderBottomColor: Colors.gold,
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: Colors.gold, fontSize: 12, fontWeight: "800",
    letterSpacing: 2, textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.white, fontSize: 24, fontWeight: "800",
    textAlign: "center", marginBottom: 12, lineHeight: 32,
  },
  heroBody: {
    color: Colors.grayLight, fontSize: 14, lineHeight: 21,
    textAlign: "center", marginBottom: 24,
  },
  heroCTARow: {
    flexDirection: "row", gap: 10, alignItems: "center",
  },
  heroCTA: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.gold, paddingVertical: 13,
    paddingHorizontal: 20, borderRadius: 10,
  },
  heroCTAText: { color: Colors.black, fontWeight: "800", fontSize: 13 },
  heroCTASecondary: {
    paddingVertical: 13, paddingHorizontal: 18, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  heroCTASecondaryText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    marginBottom: 16, borderLeftWidth: 3,
    borderLeftColor: Colors.gold, paddingLeft: 10,
  },

  linkGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkTile: {
    width: "47%", backgroundColor: Colors.black,
    borderRadius: 12, padding: 16, gap: 8,
    borderWidth: 1, borderColor: "#222",
  },
  linkTileLabel: { color: Colors.white, fontSize: 13, fontWeight: "600", lineHeight: 18 },

  neighRow: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  neighMain: {
    flexDirection: "row", alignItems: "center",
  },
  neighLeft: { flex: 1 },
  neighName: { color: Colors.black, fontWeight: "700", fontSize: 15 },
  neighMeta: { color: Colors.gray, fontSize: 12, marginTop: 2 },
  neighRight: { alignItems: "flex-end", marginRight: 8, gap: 4 },
  browseHomesBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.gold, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: "flex-start", marginTop: 8,
  },
  browseHomesBtnText: { color: Colors.black, fontSize: 11, fontWeight: "700" },
  driveBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.black, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
  },
  driveText: { color: Colors.gold, fontSize: 11, fontWeight: "700" },
  neighPrice: { color: Colors.gray, fontSize: 11 },

  viewAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, marginTop: 4,
  },
  viewAllText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },

  benefitRow: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.black, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  benefitText: { flex: 1 },
  benefitTitle: { color: Colors.black, fontWeight: "700", fontSize: 15, marginBottom: 3 },
  benefitBody:  { color: Colors.gray, fontSize: 13, lineHeight: 19 },

  lenderCTA: {
    marginTop: 20, backgroundColor: Colors.black,
    borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: Colors.goldDark,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  lenderCTALeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  lenderCTATitle: { color: Colors.white, fontWeight: "700", fontSize: 15, marginBottom: 3 },
  lenderCTASub:   { color: Colors.grayLight, fontSize: 12 },

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
