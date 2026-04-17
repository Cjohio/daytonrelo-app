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
    id: "1", price: "$289,000", address: "1822 Far Hills Ave", city: "Oakwood, OH",
    beds: 4, baths: 2, sqft: "1,920", status: "Active",
    photo: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
  {
    id: "2", price: "$159,000", address: "618 Salem Ave", city: "Dayton, OH",
    beds: 3, baths: 1, sqft: "1,300", status: "Active",
    photo: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
  {
    id: "3", price: "$375,000", address: "4190 Lamme Rd", city: "Miamisburg, OH",
    beds: 5, baths: 3, sqft: "2,640", status: "Active",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "4", price: "$199,500", address: "905 Shroyer Rd", city: "Kettering, OH",
    beds: 3, baths: 2, sqft: "1,450", status: "Active",
    photo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  },
];

// ─── Dayton highlights ────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  {
    icon:  "airplane-outline",
    title: "Birthplace of Aviation",
    body:  "Orville and Wilbur Wright invented the airplane here. The National Museum of the U.S. Air Force — the world's largest aviation museum — is free to visit.",
  },
  {
    icon:  "beer-outline",
    title: "Top Craft Beer City",
    body:  "Dayton has more craft breweries per capita than almost anywhere in the Midwest. Fifth Street Brewpub, Warped Wing, and Toxic Brewing are local favorites.",
  },
  {
    icon:  "leaf-outline",
    title: "300+ Miles of Trails",
    body:  "The Little Miami Scenic Trail and broader trail network give you 300+ miles of connected biking and hiking through gorgeous river valleys.",
  },
  {
    icon:  "musical-notes-outline",
    title: "Incredible Live Music",
    body:  "The Schuster Center, Fraze Pavilion, Rose Music Center, and a thriving independent music scene make Dayton a serious live music destination.",
  },
  {
    icon:  "restaurant-outline",
    title: "Local Food Scene",
    body:  "From Dayton-style pizza to James Beard-nominated restaurants, Dayton's food scene punches well above its weight for a city its size.",
  },
  {
    icon:  "people-outline",
    title: "Tight-Knit Communities",
    body:  "17 distinct neighborhoods — from the artsy village of Yellow Springs to the polished suburbs of Oakwood and Centerville — each with its own character.",
  },
];

// ─── Quick local links for residents ─────────────────────────────────────────
const EXPLORE_LINKS = [
  { icon: "map-outline",             label: "Day Trips Guide",          route: "/day-trips" },
  { icon: "construct-outline",       label: "Local Services",           route: "/local-services" },
  { icon: "git-compare-outline",     label: "Compare Neighborhoods",    route: "/neighborhood-compare" },
  { icon: "calendar-outline",        label: "Events Calendar",          route: "/dayton-events" },
  { icon: "compass-outline",         label: "Things To Do",             route: "/things-to-do" },
  { icon: "leaf-outline",            label: "Parks & Recreation",       route: "/parks" },
  { icon: "restaurant-outline",      label: "Dayton Eats Guide",        route: "/(tabs)/eats" },
  { icon: "location-outline",        label: "Neighborhoods",            route: "/neighborhoods" },
  { icon: "school-outline",          label: "School Guide",             route: "/schools" },
];

// ─── Dayton fun facts ─────────────────────────────────────────────────────────
const FUN_FACTS = [
  "Dave Chappelle calls Yellow Springs home — and you'll regularly see him around town.",
  "Dayton has produced more patents per capita than almost any city in U.S. history.",
  "The Dayton Peace Accords ending the Bosnian War were negotiated right here in 1995.",
  "NCR, Mead, Standard Register, and Reynolds & Reynolds all started in Dayton.",
  "The pop-top beverage can was invented in Dayton. You're welcome.",
];

// ─── Everyday essentials ──────────────────────────────────────────────────────
const ESSENTIALS = [
  { label: "Dayton International Airport (DAY)", icon: "airplane-outline",   note: "25+ non-stop destinations, easy parking, never a nightmare" },
  { label: "Dayton Children's Hospital",          icon: "medkit-outline",     note: "Top-ranked pediatric hospital for the entire region" },
  { label: "Oregon District",                     icon: "storefront-outline", note: "Dayton's nightlife & dining hub — walkable and vibrant" },
  { label: "Five Rivers MetroParks",              icon: "leaf-outline",       note: "16,000 acres of parks within the metro, all free" },
  { label: "Dayton Art Institute",                icon: "color-palette-outline", note: "Major art collection with free community events" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DiscoverHub() {
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
            <Ionicons name="compass" size={22} color={Colors.gold} />
            <Text style={s.heroBadgeText}>DAYTON RESIDENT</Text>
          </View>
          <Text style={s.heroTitle}>Make the Most of Living Here</Text>
          <Text style={s.heroBody}>
            Events, parks, restaurants, things to do, school guides, and
            neighborhood info — everything you need to enjoy Dayton to the fullest, all in one place.
          </Text>
        </View>

        {/* ── Eats Guide Featured Card ───────────────────────────────────── */}
        <TouchableOpacity
          style={s.eatsCard}
          onPress={() => router.push("/(tabs)/eats" as any)}
          activeOpacity={0.85}
        >
          <View style={s.eatsCardLeft}>
            <View style={s.eatsIconWrap}>
              <Ionicons name="restaurant" size={26} color={Colors.black} />
            </View>
            <View style={s.eatsCardText}>
              <Text style={s.eatsCardTitle}>Dayton Eats Guide</Text>
              <Text style={s.eatsCardSub}>
                Best local restaurants, hidden gems, and neighborhood favorites — curated for you.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.black} />
        </TouchableOpacity>

        {/* ── Local Quick Links ──────────────────────────────────────────── */}
        <Section title="Explore Your City">
          <View style={s.linkGrid}>
            {EXPLORE_LINKS.map(({ icon, label, route }) => (
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

        {/* ── Upcoming Events ────────────────────────────────────────────── */}
        <DaytonEvents />

        {/* ── Live Market Snapshot ───────────────────────────────────────── */}
        <MarketSnapshot />

        {/* ── Mortgage Rates ─────────────────────────────────────────────── */}
        <MortgageRates />

        {/* ── Featured listings ──────────────────────────────────────────── */}
        <View style={s.featuredWrap}>
          <View style={s.featuredHeader}>
            <Text style={s.featuredTitle}>Homes Available Now</Text>
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
                onPress={() => router.push("/(tabs)/explore" as any)}
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

        {/* ── Highlights ─────────────────────────────────────────────────── */}
        <Section title="Why Dayton is a Great Place to Live">
          {HIGHLIGHTS.map(({ icon, title, body }) => (
            <View key={title} style={s.highlightCard}>
              <View style={s.highlightIcon}>
                <Ionicons name={icon as any} size={20} color={Colors.gold} />
              </View>
              <View style={s.highlightText}>
                <Text style={s.highlightTitle}>{title}</Text>
                <Text style={s.highlightBody}>{body}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ── Everyday essentials ────────────────────────────────────────── */}
        <Section title="Everyday Essentials">
          {ESSENTIALS.map(({ label, icon, note }) => (
            <View key={label} style={s.essentialRow}>
              <View style={s.essentialIcon}>
                <Ionicons name={icon as any} size={18} color={Colors.gold} />
              </View>
              <View style={s.essentialText}>
                <Text style={s.essentialLabel}>{label}</Text>
                <Text style={s.essentialNote}>{note}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ── Fun facts ──────────────────────────────────────────────────── */}
        <Section title="Things You Didn't Know About Dayton">
          {FUN_FACTS.map((fact, i) => (
            <View key={i} style={s.factRow}>
              <Text style={s.factBullet}>✦</Text>
              <Text style={s.factText}>{fact}</Text>
            </View>
          ))}
        </Section>

        {/* ── Neighborhoods CTA ──────────────────────────────────────────── */}
        <View style={s.neighborhoodBanner}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerTitle}>Know Your Neighbors</Text>
            <Text style={s.bannerSub}>
              17 Dayton-area communities compared — schools, drive times, home prices, and local character.
            </Text>

          </View>
          <TouchableOpacity
            style={s.bannerBtn}
            onPress={() => router.push("/neighborhoods" as any)}
          >
            <Text style={s.bannerBtnText}>Explore</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Thinking About Buying or Selling?</Text>
          <Text style={s.ctaBody}>
            Already love it here and ready to put down roots? Chris knows every
            neighborhood in the metro and is happy to help — no pressure.
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
    textAlign: "center", marginBottom: 4,
  },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    marginBottom: 16, borderLeftWidth: 3,
    borderLeftColor: Colors.gold, paddingLeft: 10,
  },

  // Eats Guide feature card
  eatsCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.gold,
    borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 20, gap: 12,
  },
  eatsCardLeft:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  eatsIconWrap:  { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.white,
                   alignItems: "center", justifyContent: "center", flexShrink: 0 },
  eatsCardText:  { flex: 1 },
  eatsCardTitle: { fontSize: 16, fontWeight: "800", color: Colors.black, marginBottom: 3 },
  eatsCardSub:   { fontSize: 12, color: Colors.black, opacity: 0.75, lineHeight: 17 },

  linkGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkTile: {
    width: "47%", backgroundColor: Colors.black,
    borderRadius: 12, padding: 16, gap: 8,
    borderWidth: 1, borderColor: "#222",
  },
  linkTileLabel: { color: Colors.white, fontSize: 13, fontWeight: "600", lineHeight: 18 },

  highlightCard: {
    flexDirection: "row", gap: 14, marginBottom: 20, alignItems: "flex-start",
  },
  highlightIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.black, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  highlightText:  { flex: 1 },
  highlightTitle: { color: Colors.black, fontWeight: "700", fontSize: 15, marginBottom: 4 },
  highlightBody:  { color: Colors.gray, fontSize: 13, lineHeight: 19 },

  essentialRow: {
    flexDirection: "row", gap: 14, marginBottom: 16, alignItems: "flex-start",
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  essentialIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  essentialText:  { flex: 1 },
  essentialLabel: { color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 3 },
  essentialNote:  { color: Colors.gray, fontSize: 13 },

  factRow: {
    flexDirection: "row", gap: 12, marginBottom: 14, alignItems: "flex-start",
  },
  factBullet: { color: Colors.gold, fontSize: 14, marginTop: 1 },
  factText:   { color: Colors.black, fontSize: 14, lineHeight: 20, flex: 1 },

  neighborhoodBanner: {
    margin: 20, backgroundColor: Colors.black,
    borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: Colors.goldDark,
    flexDirection: "row", alignItems: "center", gap: 16,
  },
  bannerLeft:  { flex: 1 },
  bannerTitle: { color: Colors.white, fontWeight: "800", fontSize: 16, marginBottom: 6 },
  bannerSub:   { color: Colors.grayLight, fontSize: 12, lineHeight: 17 },
  bannerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, paddingVertical: 10,
    paddingHorizontal: 16, borderRadius: 10,
  },
  bannerBtnText: { color: Colors.black, fontWeight: "800", fontSize: 13 },

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
