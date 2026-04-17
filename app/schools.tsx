import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../shared/theme/colors";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PublicDistrict {
  id:      string;
  name:    string;
  city:    string;
  grades:  string;
  rating:  string;         // Niche letter grade
  stars:   number;         // 1-5
  note?:   string;
  url:     string;
}

interface PrivateSchool {
  id:      string;
  name:    string;
  city:    string;
  grades:  string;
  type:    "Catholic" | "Christian" | "Montessori" | "Independent" | "Jewish";
  note?:   string;
  url:     string;
}

// ─── Public Districts ──────────────────────────────────────────────────────────
const PUBLIC: PublicDistrict[] = [
  {
    id: "oakwood",
    name: "Oakwood City Schools",
    city: "Oakwood",
    grades: "PreK–12",
    rating: "A+",
    stars: 5,
    note: "Ranked top 10 in Ohio. Nationally recognized. Most prestigious suburban district.",
    url: "https://www.oakwoodschools.org",
  },
  {
    id: "centerville",
    name: "Centerville City Schools",
    city: "Centerville",
    grades: "PreK–12",
    rating: "A+",
    stars: 5,
    note: "5-star Ohio report card rating. Consistently one of the top districts in the state.",
    url: "https://www.centerville.k12.oh.us",
  },
  {
    id: "springboro",
    name: "Springboro Community City Schools",
    city: "Springboro",
    grades: "PreK–12",
    rating: "A",
    stars: 5,
    note: "High-performing district, top-rated high school, strong community involvement.",
    url: "https://www.springboro.org",
  },
  {
    id: "beavercreek",
    name: "Beavercreek City Schools",
    city: "Beavercreek",
    grades: "PreK–12",
    rating: "A",
    stars: 4,
    note: "Most popular choice for WPAFB officers. Strong academics and athletics.",
    url: "https://www.beavercreekschools.org",
  },
  {
    id: "tipp-city",
    name: "Tipp City Exempted Village Schools",
    city: "Tipp City",
    grades: "PreK–12",
    rating: "A-",
    stars: 4,
    note: "Small-town feel with excellent academics. Growing community north of Dayton.",
    url: "https://www.tippschools.com",
  },
  {
    id: "kettering",
    name: "Kettering City Schools",
    city: "Kettering",
    grades: "PreK–12",
    rating: "A-",
    stars: 4,
    note: "4.5-star Ohio rating. Strong STEM programs and close-knit community.",
    url: "https://www.ketteringschools.org",
  },
  {
    id: "bellbrook",
    name: "Bellbrook-Sugarcreek Local Schools",
    city: "Bellbrook",
    grades: "PreK–12",
    rating: "A",
    stars: 4,
    note: "Nationally ranked high school. Quiet suburban community southwest of Dayton.",
    url: "https://www.bellbrook.k12.oh.us",
  },
  {
    id: "miamisburg",
    name: "Miamisburg City Schools",
    city: "Miamisburg",
    grades: "PreK–12",
    rating: "B+",
    stars: 4,
    note: "Solid district with strong extracurriculars and a growing school community.",
    url: "https://www.miamisburgschools.org",
  },
  {
    id: "vandalia",
    name: "Vandalia-Butler City Schools",
    city: "Vandalia",
    grades: "PreK–12",
    rating: "B+",
    stars: 3,
    note: "Conveniently located near the airport and WPAFB. Solid mid-range district.",
    url: "https://www.vbcsd.com",
  },
  {
    id: "fairborn",
    name: "Fairborn City Schools",
    city: "Fairborn",
    grades: "PreK–12",
    rating: "B",
    stars: 3,
    note: "Closest district to WPAFB main gate. Practical choice for base families.",
    url: "https://www.fairborn.k12.oh.us",
  },
  {
    id: "huber-heights",
    name: "Huber Heights City Schools",
    city: "Huber Heights",
    grades: "PreK–12",
    rating: "B-",
    stars: 3,
    note: "Affordable housing area, improving district with strong community programs.",
    url: "https://www.myhhcs.org",
  },
  {
    id: "xenia",
    name: "Xenia Community City Schools",
    city: "Xenia",
    grades: "PreK–12",
    rating: "B-",
    stars: 3,
    note: "Rural/suburban mix east of Dayton. More affordable housing options.",
    url: "https://www.xeniaschools.org",
  },
  {
    id: "dayton",
    name: "Dayton Public Schools",
    city: "Dayton",
    grades: "PreK–12",
    rating: "C",
    stars: 2,
    note: "Urban district with 13,000+ students. Several specialized magnet programs available.",
    url: "https://www.dps.k12.oh.us",
  },
];

// ─── Private Schools ───────────────────────────────────────────────────────────
const PRIVATE: PrivateSchool[] = [
  // Catholic
  {
    id: "cj",
    name: "Chaminade Julienne Catholic High School",
    city: "Dayton",
    grades: "9–12",
    type: "Catholic",
    note: "Ohio's 2025 CAPE Blue Ribbon School. Top-ranked private school in the region. 21 sports, AP courses.",
    url: "https://www.cjeagles.org",
  },
  {
    id: "alter",
    name: "Archbishop Alter High School",
    city: "Kettering",
    grades: "9–12",
    type: "Catholic",
    note: "Top-ranked Catholic high school. Strong academics, competitive athletics, and a storied history.",
    url: "https://www.alterhs.org",
  },
  {
    id: "carroll",
    name: "Archbishop Carroll High School",
    city: "Dayton",
    grades: "9–12",
    type: "Catholic",
    note: "Co-ed Catholic high school serving the north Dayton area. Strong faith formation and academics.",
    url: "https://www.carrollhs.org",
  },
  {
    id: "our-lady-rosary",
    name: "Our Lady of the Rosary School",
    city: "Dayton",
    grades: "K–8",
    type: "Catholic",
    note: "203 students. Strong faith-based K-8 community in the Dayton area.",
    url: "https://www.olrdayton.org",
  },
  {
    id: "st-henry",
    name: "St. Henry School",
    city: "Dayton",
    grades: "PreK–8",
    type: "Catholic",
    note: "Parish school with a strong academic and service tradition.",
    url: "https://www.stherrydayton.org",
  },
  // Montessori
  {
    id: "montessori-dayton",
    name: "Montessori School of Dayton",
    city: "Dayton",
    grades: "PreK–8",
    type: "Montessori",
    note: "Largest private Montessori school in the Dayton area. Founded 1964. Authentic AMI-aligned program.",
    url: "https://www.montessoridayton.org",
  },
  {
    id: "dayton-montessori-society",
    name: "Dayton Montessori Society",
    city: "Huber Heights",
    grades: "PreK–5",
    type: "Montessori",
    note: "Located in Huber Heights near WPAFB. Hands-on Montessori education through 5th grade.",
    url: "https://www.daytonmontessori.org",
  },
  {
    id: "montessori-childrens-center",
    name: "Montessori Children's Center",
    city: "Kettering",
    grades: "PreK–6",
    type: "Montessori",
    note: "Small, nurturing Montessori program serving the Kettering and south Dayton area.",
    url: "https://www.montessorichildrenscenter.com",
  },
  // Christian
  {
    id: "dominion",
    name: "Dominion Academy of Dayton",
    city: "Dayton",
    grades: "K–12",
    type: "Christian",
    note: "Classical Christian education from K through 12. Founded 1998. Rigorous academics grounded in faith.",
    url: "https://www.dominionacademy.org",
  },
  {
    id: "east-dayton-christian",
    name: "East Dayton Christian School",
    city: "Dayton",
    grades: "PreK–8",
    type: "Christian",
    note: "Faith-based PreK-8 school serving east Dayton families since the 1950s.",
    url: "https://www.eastdaytonchristian.org",
  },
  {
    id: "dayton-christian",
    name: "Dayton Christian Schools",
    city: "Miamisburg",
    grades: "PreK–12",
    type: "Christian",
    note: "One of the largest Christian schools in Ohio. PreK through 12 on a beautiful campus.",
    url: "https://www.daytonchristian.com",
  },
  // Jewish / Independent
  {
    id: "hillel",
    name: "Hillel Academy of Dayton",
    city: "Oakwood",
    grades: "K–6",
    type: "Jewish",
    note: "Located in Oakwood. K-6 school emphasizing Jewish values, ethics, and strong academics.",
    url: "https://www.hilleldayton.org",
  },
];

// ─── Rating badge ──────────────────────────────────────────────────────────────
const RATING_COLORS: Record<string, string> = {
  "A+": "#1A7A3C", "A": "#2E9E52", "A-": "#4BAE6A",
  "B+": "#6E8C2A", "B": "#8FA832", "B-": "#A8BE3F",
  "C":  "#C8883A",
};

function RatingBadge({ rating }: { rating: string }) {
  const bg = RATING_COLORS[rating] ?? Colors.gray;
  return (
    <View style={[rb.badge, { backgroundColor: bg }]}>
      <Text style={rb.text}>{rating}</Text>
    </View>
  );
}
const rb = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, minWidth: 38, alignItems: "center" },
  text:  { color: "#fff", fontWeight: "900", fontSize: 14 },
});

// ─── Type badge ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  "Catholic":    "#1A4A8A",
  "Christian":   "#2E6E3C",
  "Montessori":  "#8A4A1A",
  "Independent": "#555",
  "Jewish":      "#8A6A1A",
};
const TYPE_ICONS: Record<string, string> = {
  "Catholic":    "⛪",
  "Christian":   "✝️",
  "Montessori":  "🌱",
  "Independent": "🎓",
  "Jewish":      "✡️",
};

function TypeBadge({ type }: { type: PrivateSchool["type"] }) {
  const bg = TYPE_COLORS[type] ?? Colors.gray;
  return (
    <View style={[tb.badge, { backgroundColor: bg + "22", borderColor: bg + "44" }]}>
      <Text style={[tb.text, { color: bg }]}>{TYPE_ICONS[type]} {type}</Text>
    </View>
  );
}
const tb = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, alignSelf: "flex-start" },
  text:  { fontWeight: "700", fontSize: 11 },
});

// ─── Public district card ──────────────────────────────────────────────────────
function DistrictCard({ d }: { d: PublicDistrict }) {
  function openMap() {
    const q = encodeURIComponent(`${d.name}, ${d.city}, Ohio`);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  }

  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardName}>{d.name}</Text>
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={12} color={Colors.gray} />
            <Text style={s.cardCity}>{d.city} · {d.grades}</Text>
          </View>
        </View>
        <RatingBadge rating={d.rating} />
      </View>
      {d.note && <Text style={s.cardNote}>{d.note}</Text>}
      <View style={s.cardBtnRow}>
        <TouchableOpacity
          style={[s.linkBtn, { flex: 1 }]}
          onPress={() => Linking.openURL(d.url)}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={14} color={Colors.black} />
          <Text style={s.linkBtnText}>Website</Text>
          <Ionicons name="open-outline" size={13} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.mapBtn, { flex: 1 }]}
          onPress={openMap}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={14} color={Colors.black} />
          <Text style={s.mapBtnText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Private school card ───────────────────────────────────────────────────────
function PrivateCard({ p }: { p: PrivateSchool }) {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardName}>{p.name}</Text>
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={12} color={Colors.gray} />
            <Text style={s.cardCity}>{p.city} · Grades {p.grades}</Text>
          </View>
        </View>
      </View>
      <TypeBadge type={p.type} />
      {p.note && <Text style={[s.cardNote, { marginTop: 8 }]}>{p.note}</Text>}
      <TouchableOpacity
        style={s.linkBtn}
        onPress={() => Linking.openURL(p.url)}
        activeOpacity={0.8}
      >
        <Ionicons name="globe-outline" size={14} color={Colors.black} />
        <Text style={s.linkBtnText}>Visit School Website</Text>
        <Ionicons name="open-outline" size={13} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type Tab = "public" | "private";

export default function SchoolsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("public");

  // Group private schools by type
  const privateByType = PRIVATE.reduce<Record<string, PrivateSchool[]>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {});
  const typeOrder: PrivateSchool["type"][] = ["Catholic", "Montessori", "Christian", "Jewish", "Independent"];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>

      {/* Header */}
      <BrandHeader noTopInset left={<BackBtn onPress={() => router.back()} />} />

      {/* Tab switcher */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, tab === "public" && s.tabActive]}
          onPress={() => setTab("public")}
          activeOpacity={0.8}
        >
          <Ionicons name="business-outline" size={15} color={tab === "public" ? Colors.gold : Colors.gray} />
          <Text style={[s.tabLabel, tab === "public" && s.tabLabelActive]}>Public Districts</Text>
          <View style={[s.tabCount, tab === "public" && s.tabCountActive]}>
            <Text style={[s.tabCountText, tab === "public" && s.tabCountTextActive]}>{PUBLIC.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === "private" && s.tabActive]}
          onPress={() => setTab("private")}
          activeOpacity={0.8}
        >
          <Ionicons name="school-outline" size={15} color={tab === "private" ? Colors.gold : Colors.gray} />
          <Text style={[s.tabLabel, tab === "private" && s.tabLabelActive]}>Private Schools</Text>
          <View style={[s.tabCount, tab === "private" && s.tabCountActive]}>
            <Text style={[s.tabCountText, tab === "private" && s.tabCountTextActive]}>{PRIVATE.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === "public" && (
          <>
            <Text style={s.intro}>
              Ratings based on Ohio State Report Cards. Listed highest to lowest — tap any district to visit their official website.
            </Text>
            {PUBLIC.map(d => <DistrictCard key={d.id} d={d} />)}
          </>
        )}

        {tab === "private" && (
          <>
            <Text style={s.intro}>
              Catholic, Montessori, Christian, and independent options across the metro. Tap any school to visit their website.
            </Text>
            {typeOrder.map(type => {
              const schools = privateByType[type];
              if (!schools?.length) return null;
              return (
                <View key={type}>
                  <Text style={s.groupHeader}>{TYPE_ICONS[type]}  {type} Schools</Text>
                  {schools.map(p => <PrivateCard key={p.id} p={p} />)}
                </View>
              );
            })}
          </>
        )}

        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray} />
          <Text style={s.disclaimerText}>
            Ratings from Ohio State Report Cards and Niche.com. Grades and enrollment may change — always verify on the school's website.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  header: {
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  headerTitle: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  headerSub:   { color: Colors.grayLight, fontSize: 10, letterSpacing: 1, marginTop: 2 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 13,
    borderBottomWidth: 3, borderBottomColor: "transparent",
  },
  tabActive:     { borderBottomColor: Colors.gold },
  tabLabel:      { color: Colors.grayLight, fontSize: 13, fontWeight: "700" },
  tabLabelActive:{ color: Colors.black },
  tabCount: {
    backgroundColor: Colors.offWhite, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabCountActive:    { backgroundColor: Colors.gold + "22" },
  tabCountText:      { color: Colors.gray, fontSize: 10, fontWeight: "700" },
  tabCountTextActive:{ color: Colors.gold },

  scroll:        { flex: 1, backgroundColor: Colors.offWhite },
  scrollContent: { padding: 16 },

  intro: {
    color: Colors.gray, fontSize: 13, lineHeight: 19,
    marginBottom: 14, marginTop: 2,
    backgroundColor: Colors.white,
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
    fontStyle: "italic",
  },

  groupHeader: {
    color: Colors.black, fontSize: 14, fontWeight: "800",
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 10, marginTop: 8,
  },

  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 6 },
  cardName: { color: Colors.black, fontSize: 15, fontWeight: "800", lineHeight: 21, flex: 1 },
  metaRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  cardCity: { color: Colors.gray, fontSize: 12 },
  cardNote: { color: Colors.gray, fontSize: 13, lineHeight: 19, marginBottom: 12 },

  cardBtnRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  linkBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: Colors.gold,
    borderRadius: 10, paddingVertical: 10,
  },
  linkBtnText: { color: Colors.black, fontSize: 13, fontWeight: "700" },
  mapBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#E8F4FD",
    borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: "#B0D4F0",
  },
  mapBtnText: { color: Colors.black, fontSize: 13, fontWeight: "700" },

  disclaimer: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: Colors.white, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border, marginTop: 4,
  },
  disclaimerText: { flex: 1, color: Colors.grayLight, fontSize: 11, lineHeight: 16 },
});
