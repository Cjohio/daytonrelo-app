// ─────────────────────────────────────────────────────────────────────────────
//  app/wpafb.tsx — Wright-Patterson AFB Base Guide
// ─────────────────────────────────────────────────────────────────────────────

import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";

// ─── Data ─────────────────────────────────────────────────────────────────────

const OVERVIEW = [
  { icon: "map-outline",           label: "Total Area",        value: "8,145 acres" },
  { icon: "people-outline",        label: "Total Personnel",   value: "27,000+" },
  { icon: "business-outline",      label: "Host Wing",         value: "88th Air Base Wing" },
  { icon: "star-outline",          label: "Major Command",     value: "Air Force Materiel Command" },
  { icon: "location-outline",      label: "Location",          value: "Fairborn & Beavercreek, OH" },
  { icon: "briefcase-outline",     label: "Ohio's Largest",    value: "Single-site employer" },
];

const GATES = [
  {
    number:   "Gate 12A",
    name:     "Main Gate",
    address:  "Colonel Glenn Hwy, Beavercreek",
    hours:    "24 / 7",
    note:     "Primary entry — most visitor & contractor traffic",
    access:   ["CAC", "Visitor Pass", "DBIDS"],
  },
  {
    number:   "Gate 1A",
    name:     "Harshman Road Gate",
    address:  "Harshman Rd, Fairborn",
    hours:    "Mon–Fri, 0500–2200",
    note:     "Convenient for those commuting from Fairborn or Huber Heights",
    access:   ["CAC", "DBIDS"],
  },
  {
    number:   "Gate 19A",
    name:     "Dobbins Road Gate",
    address:  "Dobbins Rd, Fairborn",
    hours:    "Mon–Fri, 0600–1800",
    note:     "Area B access — residential & recreational areas",
    access:   ["CAC", "DBIDS"],
  },
  {
    number:   "Gate 22A",
    name:     "Skeel Avenue Gate",
    address:  "Skeel Ave, Fairborn",
    hours:    "Mon–Fri, 0600–1800",
    note:     "Research laboratory and Area A south access",
    access:   ["CAC", "DBIDS"],
  },
  {
    number:   "Gate 26A",
    name:     "Spinning Road Gate",
    address:  "Spinning Rd, Beavercreek",
    hours:    "Mon–Fri, 0600–1800",
    note:     "Area A north — often used by AFRL and tech research staff",
    access:   ["CAC", "DBIDS"],
  },
];

const BASE_AREAS = [
  {
    name:  "Area A",
    icon:  "business-outline",
    color: Colors.gold,
    desc:  "Main administrative and research hub. Home to AFMC HQ, AFRL, NASIC, the 88 ABW, and most office and laboratory buildings.",
  },
  {
    name:  "Area B",
    icon:  "home-outline",
    color: "#60A5FA",
    desc:  "Residential and recreational area with base housing, child development centers, Outdoor Recreation, the golf course, and most family amenities.",
  },
  {
    name:  "Area C",
    icon:  "airplane-outline",
    color: "#34D399",
    desc:  "Huffman Prairie Flying Field — the historic site where the Wright Brothers perfected powered flight. Includes the Wright Brothers Memorial.",
  },
];

const AMENITIES: { category: string; icon: React.ComponentProps<typeof Ionicons>["name"]; items: string[] }[] = [
  {
    category: "Shopping & Dining",
    icon:     "storefront-outline",
    items: [
      "Base Exchange (BX) — clothing, electronics, home goods",
      "Commissary — full-service grocery store",
      "Express convenience stores",
      "Multiple on-base dining facilities (DFAC)",
      "Food court vendors",
    ],
  },
  {
    category: "Health & Medical",
    icon:     "medkit-outline",
    items: [
      "Wright-Patterson Medical Center (full hospital)",
      "Dental clinic",
      "Mental health services (BHOP)",
      "Physical therapy",
      "Pharmacy",
      "Optometry clinic",
    ],
  },
  {
    category: "Fitness & Recreation",
    icon:     "barbell-outline",
    items: [
      "Main fitness center — weights, cardio, group classes",
      "Area B fitness center",
      "Indoor & outdoor swimming pools",
      "Prairie Trace Golf Course (18-hole)",
      "Tennis & racquetball courts",
      "Softball / baseball fields",
      "Basketball courts & running tracks",
      "Wright-Patterson Riding Club (equestrian)",
    ],
  },
  {
    category: "Entertainment & Leisure",
    icon:     "game-controller-outline",
    items: [
      "Aero Theater (movie theater)",
      "Wright Field Bowling Center",
      "Outdoor Recreation Center — kayaks, camping gear, ski rentals",
      "Dog park (Area B)",
      "Community Center & event spaces",
      "Auto Hobby Shop — bays, lifts & tools for DIY car work",
    ],
  },
  {
    category: "Family & Youth",
    icon:     "people-outline",
    items: [
      "Child Development Centers (CDCs) — infant to pre-K",
      "School-Age Program",
      "Youth Center (teens)",
      "Airman & Family Readiness Center (AFRC)",
      "Chapel with family programs",
      "Summer sports & youth leagues",
    ],
  },
  {
    category: "Education & Career",
    icon:     "school-outline",
    items: [
      "Air Force Institute of Technology (AFIT) — graduate school on-base",
      "Education Center — tuition assistance, college credits",
      "Library (Wright-Patterson AFB Library)",
      "Legal assistance & JAG office",
      "Finance office",
      "Housing referral office",
    ],
  },
];

const MAJOR_UNITS = [
  { abbr: "AFMC",  name: "Air Force Materiel Command",             icon: "star-outline",         role: "Headquarters — manages Air Force acquisition, sustainment & research" },
  { abbr: "88 ABW",name: "88th Air Base Wing",                     icon: "shield-outline",       role: "Host wing — provides all installation support to WPAFB tenants" },
  { abbr: "AFRL",  name: "Air Force Research Laboratory",          icon: "flask-outline",        role: "Premier Air Force science & technology research organization" },
  { abbr: "NASIC", name: "National Air & Space Intelligence Center",icon: "eye-outline",         role: "Intelligence analysis on foreign air, space, and cyber threats" },
  { abbr: "AFIT",  name: "Air Force Institute of Technology",      icon: "school-outline",       role: "Graduate engineering & management school for military officers" },
  { abbr: "DFAS",  name: "Defense Finance & Accounting Service",   icon: "cash-outline",         role: "Financial services hub — one of the largest DFAS sites" },
  { abbr: "445 AW",name: "445th Airlift Wing",                     icon: "airplane-outline",     role: "Air Force Reserve C-17 airlift wing based at WPAFB" },
  { abbr: "711 HPW",name: "711th Human Performance Wing",          icon: "body-outline",         role: "Human systems science — aircrew performance & biosciences" },
];

const LINKS = [
  { label: "WPAFB Official Website",     url: "https://www.wpafb.af.mil" },
  { label: "National Museum of the USAF",url: "https://www.nationalmuseum.af.mil" },
  { label: "WPAFB Housing Office",       url: "https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/" },
  { label: "Airman & Family Readiness",  url: "https://www.wpafb.af.mil/afrc" },
  { label: "DFAS Military Pay",          url: "https://www.dfas.mil" },
  { label: "AFIT Graduate Programs",     url: "https://www.afit.edu" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={sh.row}>
      <View style={sh.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.gold} />
      </View>
      <Text style={sh.title}>{title}</Text>
    </View>
  );
}

const sh = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  iconWrap:{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center" },
  title:   { color: Colors.white, fontSize: 16, fontWeight: "800" },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WPAFBScreen() {
  const router = useRouter();
  return (
    <>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="airplane" size={18} color={Colors.gold} />
            <Text style={s.heroBadgeText}>WRIGHT-PATTERSON AFB</Text>
          </View>
          <Text style={s.heroTitle}>Base Overview & Guide</Text>
          <Text style={s.heroSub}>
            Everything you need to know about Ohio's largest military installation —
            amenities, gates, major units, and resources for incoming families.
          </Text>
        </View>

        {/* ── At-a-Glance stats ───────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="At a Glance" icon="information-circle-outline" />
          <View style={s.overviewGrid}>
            {OVERVIEW.map(({ icon, label, value }) => (
              <View key={label} style={s.overviewCell}>
                <Ionicons name={icon as any} size={20} color={Colors.gold} />
                <Text style={s.overviewValue}>{value}</Text>
                <Text style={s.overviewLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Base Areas ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Base Areas" icon="map-outline" />
          {BASE_AREAS.map(({ name, icon, color, desc }) => (
            <View key={name} style={s.areaCard}>
              <View style={[s.areaIcon, { backgroundColor: color + "22" }]}>
                <Ionicons name={icon as any} size={18} color={color} />
              </View>
              <View style={s.areaText}>
                <Text style={[s.areaName, { color }]}>{name}</Text>
                <Text style={s.areaDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Gates ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Base Gates" icon="enter-outline" />
          {GATES.map((gate) => (
            <View key={gate.number} style={s.gateCard}>
              <View style={s.gateTop}>
                <View style={s.gateNumberBadge}>
                  <Text style={s.gateNumber}>{gate.number}</Text>
                </View>
                <View style={s.gateMain}>
                  <Text style={s.gateName}>{gate.name}</Text>
                  <Text style={s.gateAddress}>{gate.address}</Text>
                </View>
                <View style={s.gateHoursBadge}>
                  <Text style={s.gateHours}>{gate.hours}</Text>
                </View>
              </View>
              <Text style={s.gateNote}>{gate.note}</Text>
              <View style={s.gateAccessRow}>
                {gate.access.map((a) => (
                  <View key={a} style={s.accessChip}>
                    <Text style={s.accessChipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ── Amenities ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="On-Base Amenities" icon="grid-outline" />
          {AMENITIES.map(({ category, icon, items }) => (
            <View key={category} style={s.amenityGroup}>
              <View style={s.amenityHeader}>
                <Ionicons name={icon} size={15} color={Colors.gold} />
                <Text style={s.amenityCategory}>{category}</Text>
              </View>
              {items.map((item) => (
                <View key={item} style={s.amenityRow}>
                  <View style={s.amenityDot} />
                  <Text style={s.amenityItem}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* ── Major Units ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Major Units & Commands" icon="shield-outline" />
          {MAJOR_UNITS.map(({ abbr, name, icon, role }) => (
            <View key={abbr} style={s.unitCard}>
              <View style={s.unitIconWrap}>
                <Ionicons name={icon as any} size={18} color={Colors.gold} />
              </View>
              <View style={s.unitText}>
                <View style={s.unitTitleRow}>
                  <Text style={s.unitAbbr}>{abbr}</Text>
                  <Text style={s.unitName} numberOfLines={1}>{name}</Text>
                </View>
                <Text style={s.unitRole}>{role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── National Museum callout ─────────────────────────────────────── */}
        <View style={s.museumCard}>
          <Ionicons name="star" size={20} color={Colors.gold} />
          <View style={s.museumText}>
            <Text style={s.museumTitle}>National Museum of the U.S. Air Force</Text>
            <Text style={s.museumBody}>
              Located on-base and open free to the public — the world's largest military
              aviation museum. Over 360 aerospace vehicles and missiles across 17 acres
              of indoor display space. A must-see for every family.
            </Text>
            <TouchableOpacity
              style={s.museumBtn}
              onPress={() => Linking.openURL("https://www.nationalmuseum.af.mil")}
            >
              <Text style={s.museumBtnText}>Visit Website</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Official Links ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader title="Official Resources" icon="link-outline" />
          {LINKS.map(({ label, url }) => (
            <TouchableOpacity
              key={label}
              style={s.linkRow}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.7}
            >
              <Text style={s.linkLabel}>{label}</Text>
              <Ionicons name="open-outline" size={15} color={Colors.gold} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Disclaimer ──────────────────────────────────────────────────── */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={13} color="#555" />
          <Text style={s.disclaimerText}>
            Gate hours and unit information are subject to change. Always verify
            current access policies with the WPAFB Security Forces or official
            installation website before visiting.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 24 },

  // Hero
  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1A1A1A", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 14,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  heroBadgeText: {
    color: Colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1.5,
  },
  heroTitle: {
    color: Colors.white, fontSize: 24, fontWeight: "900",
    marginBottom: 10, lineHeight: 30,
  },
  heroSub: {
    color: "#AAA", fontSize: 13, lineHeight: 20,
  },

  // Section wrapper
  section: {
    paddingHorizontal: 20, paddingTop: 24,
  },

  // At-a-Glance grid
  overviewGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  overviewCell: {
    width: "30%", flexGrow: 1,
    backgroundColor: "#111", borderRadius: 12, padding: 14,
    alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  overviewValue: {
    color: Colors.gold, fontSize: 13, fontWeight: "800", textAlign: "center",
  },
  overviewLabel: {
    color: "#777", fontSize: 10, textAlign: "center", lineHeight: 14,
  },

  // Base areas
  areaCard: {
    flexDirection: "row", gap: 14,
    backgroundColor: "#F8F8F8", borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "#E8E8E8",
  },
  areaIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  areaText: { flex: 1 },
  areaName: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  areaDesc: { color: "#555", fontSize: 13, lineHeight: 18 },

  // Gates
  gateCard: {
    backgroundColor: "#F8F8F8", borderRadius: 14,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#E8E8E8",
  },
  gateTop: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8,
  },
  gateNumberBadge: {
    backgroundColor: Colors.black, borderRadius: 7,
    paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0,
  },
  gateNumber: {
    color: Colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 0.3,
  },
  gateMain:    { flex: 1 },
  gateName:    { color: Colors.black, fontSize: 14, fontWeight: "700" },
  gateAddress: { color: "#777", fontSize: 12, marginTop: 1 },
  gateHoursBadge: {
    backgroundColor: "#E8F5E9", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0,
  },
  gateHours: { color: "#2E7D32", fontSize: 10, fontWeight: "700" },
  gateNote:  { color: "#555", fontSize: 12, lineHeight: 17, marginBottom: 8 },
  gateAccessRow: { flexDirection: "row", gap: 6 },
  accessChip: {
    backgroundColor: "#111", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  accessChipText: { color: Colors.gold, fontSize: 10, fontWeight: "700" },

  // Amenities
  amenityGroup: {
    backgroundColor: "#F8F8F8", borderRadius: 14,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#E8E8E8",
  },
  amenityHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 10,
  },
  amenityCategory: {
    color: Colors.black, fontSize: 14, fontWeight: "700",
  },
  amenityRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginBottom: 6,
  },
  amenityDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: Colors.gold, marginTop: 6, flexShrink: 0,
  },
  amenityItem: { color: "#444", fontSize: 13, lineHeight: 18, flex: 1 },

  // Units
  unitCard: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    backgroundColor: "#F8F8F8", borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "#E8E8E8",
  },
  unitIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: "#111", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  unitText: { flex: 1 },
  unitTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  unitAbbr: {
    backgroundColor: Colors.black, color: Colors.gold,
    fontSize: 10, fontWeight: "900", letterSpacing: 0.5,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  unitName: { color: Colors.black, fontSize: 13, fontWeight: "600", flex: 1 },
  unitRole: { color: "#666", fontSize: 12, lineHeight: 17 },

  // Museum callout
  museumCard: {
    flexDirection: "row", gap: 14,
    backgroundColor: "#111", borderRadius: 16,
    padding: 18, marginHorizontal: 20, marginTop: 24,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  museumText: { flex: 1 },
  museumTitle: {
    color: Colors.gold, fontSize: 15, fontWeight: "800", marginBottom: 6,
  },
  museumBody: {
    color: "#AAA", fontSize: 13, lineHeight: 19, marginBottom: 12,
  },
  museumBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start",
  },
  museumBtnText: { color: Colors.black, fontSize: 13, fontWeight: "700" },

  // Links
  linkRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  linkLabel: { color: Colors.black, fontSize: 14, fontWeight: "500", flex: 1 },

  // Disclaimer
  disclaimer: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    marginHorizontal: 20, marginTop: 24, padding: 14,
    backgroundColor: "#F8F8F8", borderRadius: 10,
  },
  disclaimerText: { color: "#666", fontSize: 11, lineHeight: 17, flex: 1 },
});
