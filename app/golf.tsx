import { useState } from "react";
import { useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

// ─── Types ────────────────────────────────────────────────────────────────────
type AccessType = "public" | "municipal" | "semi_private" | "private";
type Feature    =
  | "driving_range"
  | "restaurant"
  | "simulator"
  | "lessons"
  | "championship"
  | "walking"
  | "donald_ross"
  | "nicklaus"
  | "top_rated"
  | "beginner_friendly"
  | "banquets";

interface Course {
  name:        string;
  city:        string;
  access:      AccessType;
  holes:       number;
  par?:        number;
  yards?:      number;
  designer?:   string;
  description: string;
  features:    Feature[];
  website:     string;
  address:     string;
  tip?:        string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const ACCESS_CONFIG: Record<AccessType, { label: string; color: string }> = {
  public:       { label: "Public",       color: "#10B981" },
  municipal:    { label: "Municipal",    color: "#0EA5E9" },
  semi_private: { label: "Semi-Private", color: "#F97316" },
  private:      { label: "Private",      color: "#6B6B6B" },
};

const FEATURE_CONFIG: Record<Feature, { label: string; icon: string; color: string }> = {
  driving_range:     { label: "Driving Range",      icon: "golf-outline",          color: "#84CC16" },
  restaurant:        { label: "Restaurant",          icon: "restaurant-outline",    color: "#F59E0B" },
  simulator:         { label: "Indoor Simulator",    icon: "tv-outline",            color: "#6366F1" },
  lessons:           { label: "Lessons",             icon: "school-outline",        color: "#0EA5E9" },
  championship:      { label: "Championship",        icon: "trophy-outline",        color: "#C9A84C" },
  walking:           { label: "Walkable",            icon: "walk-outline",          color: "#84CC16" },
  donald_ross:       { label: "Donald Ross Design",  icon: "ribbon-outline",        color: "#92400E" },
  nicklaus:          { label: "Nicklaus Design",     icon: "ribbon-outline",        color: "#C9A84C" },
  top_rated:         { label: "Top Rated",           icon: "star-outline",          color: "#F59E0B" },
  beginner_friendly: { label: "Beginner Friendly",   icon: "happy-outline",         color: "#10B981" },
  banquets:          { label: "Banquets/Events",      icon: "people-outline",        color: "#A78BFA" },
};

// ─── Course data ──────────────────────────────────────────────────────────────
const COURSES: Course[] = [

  // ── Centerville ────────────────────────────────────────────────────────────
  {
    name:        "Yankee Trace Golf Club",
    city:        "Centerville",
    address:     "10000 Grouse Dr, Centerville",
    access:      "municipal",
    holes:       27,
    par:         72,
    yards:       7100,
    designer:    "Gene Bates & Matt Swanson",
    description: "Voted Best Golf Course in Dayton for 20+ consecutive years and ranked Top 50 municipal course in the U.S. Three 9-hole courses create multiple championship combinations from 7,100 yards.",
    features:    ["driving_range", "restaurant", "lessons", "championship", "top_rated", "banquets"],
    website:     "https://yankeetrace.org",
    tip:         "The Heritage/Legend combo is the premier layout. Book tee times online — weekends fill fast.",
  },

  // ── Dayton ─────────────────────────────────────────────────────────────────
  {
    name:        "Community Golf Club",
    city:        "Dayton",
    address:     "3435 Otterbein Ave, Dayton",
    access:      "municipal",
    holes:       36,
    par:         71,
    yards:       6304,
    designer:    "Alex Campbell (1919)",
    description: "Dayton's historic 36-hole municipal facility on land donated in 1918. The Hills course hosted the U.S. Amateur Public Links in 1924. Rolling terrain, elevated tees, and great value.",
    features:    ["driving_range", "lessons", "walking", "beginner_friendly"],
    website:     "https://golf-dayton.com",
    tip:         "Best value in Dayton. Two full 18-hole courses — great for beginners and regulars alike.",
  },

  // ── Miamisburg ─────────────────────────────────────────────────────────────
  {
    name:        "Pipestone Golf Club",
    city:        "Miamisburg",
    address:     "1234 Pipestone Dr, Miamisburg",
    access:      "public",
    holes:       18,
    par:         72,
    yards:       6939,
    designer:    "Arthur Hills (1992)",
    description: "Known for the best greens in the Miami Valley. Rolling fairways with 100+ feet of elevation change, undulating bentgrass greens, and a 4-star Golf Digest rating. One of the top daily-fee courses in Ohio.",
    features:    ["driving_range", "restaurant", "simulator", "lessons", "championship", "top_rated", "banquets"],
    website:     "https://pipestonegolf.com",
    tip:         "The 1818 Grill is excellent for post-round dining. Indoor simulators available in winter.",
  },
  {
    name:        "Mound Golf Course",
    city:        "Miamisburg",
    address:     "Mound Ave, Miamisburg",
    access:      "municipal",
    holes:       9,
    par:         36,
    yards:       2789,
    designer:    "Alex Campbell (1938)",
    description: "Charming 9-hole course situated atop a bluff overlooking Miamisburg and the Miami Valley, adjacent to the historic Indian Mound State Park. Lush fairways and a quaint clubhouse with outdoor patio.",
    features:    ["walking", "beginner_friendly"],
    website:     "https://cityofmiamisburg.com",
    tip:         "Perfect for a quick round or beginners. The views from the bluff are some of the best in the area.",
  },

  // ── Vandalia ───────────────────────────────────────────────────────────────
  {
    name:        "Cassel Hills Golf Course",
    city:        "Vandalia",
    address:     "2501 S Dixie Dr, Vandalia",
    access:      "municipal",
    holes:       18,
    par:         71,
    yards:       6655,
    designer:    "Scruggs & Hammonds / Craig Schreiner (1974)",
    description: "4-star Golf Digest rated municipal course with massive 6,000 sq ft average greens and links-style front nine. Solid challenge for all skill levels with certified instructors on staff.",
    features:    ["driving_range", "lessons", "championship", "top_rated", "banquets"],
    website:     "https://casselhills.com",
    tip:         "Those enormous greens can be deceptive — three-putts are common for first-timers.",
  },

  // ── Germantown ─────────────────────────────────────────────────────────────
  {
    name:        "Jamaica Run Golf Course",
    city:        "Germantown",
    address:     "6200 Jamaica Rd, Germantown",
    access:      "public",
    holes:       18,
    par:         72,
    yards:       6587,
    description: "Memorable public course with small elevated greens and a signature par-5 18th hole featuring a pond and dramatic fairway drop. One of the best values in Montgomery County.",
    features:    ["restaurant", "lessons", "banquets"],
    website:     "https://jamaicarun.com",
    tip:         "Great value — 18 holes with cart under $35. The par-5 18th is one of the most memorable finishing holes in the area.",
  },

  // ── Clayton ────────────────────────────────────────────────────────────────
  {
    name:        "Graywolf Golf Club",
    city:        "Clayton",
    address:     "1 Club Dr, Clayton",
    access:      "public",
    holes:       18,
    par:         72,
    yards:       7223,
    designer:    "Chi-Chi Rodriguez & Denis Griffiths (1999)",
    description: "A big, bold 7,223-yard daily-fee course designed by Chi-Chi Rodriguez. Bentgrass fairways and greens, new clubhouse, annual memberships available. One of the longer public tracks in the region.",
    features:    ["driving_range", "lessons", "championship"],
    website:     "https://graywolfgolfclub.com",
    tip:         "Play from the appropriate tees — 7,223 from the tips is a serious test. Great course for low handicappers.",
  },
  {
    name:        "Meadowbrook at Clayton",
    city:        "Clayton",
    address:     "Clayton, OH",
    access:      "public",
    holes:       18,
    description: "Historic, tree-lined course in Clayton with scenic settings and magnificently shaded fairways. A local favorite for golfers looking for a classic, peaceful round.",
    features:    ["walking"],
    website:     "https://meadowbrookatclayton.com",
  },

  // ── Xenia / Greene County ──────────────────────────────────────────────────
  {
    name:        "WGC Golf Course",
    city:        "Xenia",
    address:     "821 N Detroit St, Xenia",
    access:      "public",
    holes:       18,
    par:         71,
    yards:       6551,
    designer:    "Jack Kidwell & Mike Hurdzan",
    description: "Voted #1 Course in Greene County. Built in the 1920s and now fully public, with lush ryegrass fairways, five sets of tees on most holes including family tees. Fun for all skill levels.",
    features:    ["lessons", "top_rated", "beginner_friendly", "walking"],
    website:     "https://wgcgolfcourse.com",
    tip:         "Five tee options including family tees make this perfect for mixed groups and juniors.",
  },
  {
    name:        "Jasper Hills Golf Club",
    city:        "Xenia",
    address:     "1100 Knollhaven Rd, Xenia",
    access:      "public",
    holes:       18,
    par:         72,
    yards:       6646,
    description: "Reopened in 2022 after full restoration (formerly Sebastian Hills). Challenging rolling terrain, brand-new GPS carts, concrete cart paths, and a full-service restaurant and bar with outdoor seating.",
    features:    ["driving_range", "restaurant", "lessons"],
    website:     "https://golfjasperhills.com",
    tip:         "Feels brand new since the 2022 restoration. The outdoor bar patio is a great spot post-round.",
  },

  // ── Arcanum ────────────────────────────────────────────────────────────────
  {
    name:        "Beechwood Golf Course",
    city:        "Arcanum",
    address:     "Arcanum, OH (30 min NW of Dayton)",
    access:      "public",
    holes:       27,
    description: "27-hole facility in a beautiful rural setting with three distinct 9-hole courses (Woodland, Creekside, Lakeview) that can be combined into three different 18-hole rounds. Great for a day trip.",
    features:    ["driving_range", "restaurant", "lessons"],
    website:     "https://beechwoodgc.com",
    tip:         "Three very different nines — try a different combination each visit. Great escape from the suburbs.",
  },

  // ── Private (for reference) ────────────────────────────────────────────────
  {
    name:        "NCR Country Club (South Course)",
    city:        "Kettering",
    address:     "4435 Dogwood Trail, Kettering",
    access:      "private",
    holes:       18,
    par:         71,
    yards:       7055,
    designer:    "Dick Wilson (1954)",
    description: "One of Ohio's finest private clubs and #68 on Golfweek's Top 100 Classic Courses. Has hosted the 1969 PGA Championship and 1986 U.S. Women's Open. Members and guests only.",
    features:    ["driving_range", "restaurant", "lessons", "championship", "top_rated", "donald_ross"],
    website:     "https://ncrcountryclub.com",
    tip:         "Members and guests only — but worth knowing about if you're building a network in Dayton.",
  },
  {
    name:        "Country Club of the North",
    city:        "Beavercreek",
    address:     "Beavercreek, OH",
    access:      "private",
    holes:       18,
    par:         73,
    yards:       7071,
    designer:    "Jack Nicklaus Signature Design (1993)",
    description: "The only Jack Nicklaus Signature Design course in the Miami Valley, routed along the Little Miami River. A stunning private club and one of the most prestigious courses in Ohio.",
    features:    ["driving_range", "restaurant", "lessons", "championship", "nicklaus"],
    website:     "https://countryclubofthenorth.com",
    tip:         "Members and guests only — one of the best-kept secrets in Dayton golf.",
  },
  {
    name:        "Dayton Country Club",
    city:        "Dayton",
    address:     "Dayton, OH",
    access:      "private",
    holes:       18,
    par:         71,
    yards:       6302,
    designer:    "Donald Ross (1897)",
    description: "Historic Donald Ross design dating to 1897 — one of the oldest and most prestigious clubs in Dayton. Classic Ross greens, indoor teaching facility, and short game practice areas.",
    features:    ["driving_range", "lessons", "championship", "donald_ross"],
    website:     "https://daytoncountryclub.com",
    tip:         "Members and guests only. One of the most historically significant golf clubs in Ohio.",
  },
];

// Unique cities for filter
const CITIES = ["All", "Public Only", ...Array.from(new Set(COURSES.map(c => c.city))).sort()];

// ─── Components ───────────────────────────────────────────────────────────────
function AccessBadge({ type }: { type: AccessType }) {
  const cfg = ACCESS_CONFIG[type];
  return (
    <View style={[sb.accessBadge, { backgroundColor: cfg.color + "22", borderColor: cfg.color + "55" }]}>
      <Text style={[sb.accessText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function FeatureBadge({ feature }: { feature: Feature }) {
  const cfg = FEATURE_CONFIG[feature];
  return (
    <View style={[sb.badge, { backgroundColor: cfg.color + "22", borderColor: cfg.color + "55" }]}>
      <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[sb.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <View style={sb.card}>
      {/* Header */}
      <View style={sb.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={sb.titleRow}>
            <Text style={sb.courseName}>{course.name}</Text>
            <AccessBadge type={course.access} />
          </View>
          <View style={sb.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.gray} />
            <Text style={sb.locationText}>{course.address}</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={sb.statsRow}>
        <View style={sb.stat}>
          <Text style={sb.statVal}>{course.holes}</Text>
          <Text style={sb.statLabel}>Holes</Text>
        </View>
        {course.par && (
          <View style={sb.stat}>
            <Text style={sb.statVal}>{course.par}</Text>
            <Text style={sb.statLabel}>Par</Text>
          </View>
        )}
        {course.yards && (
          <View style={sb.stat}>
            <Text style={sb.statVal}>{course.yards.toLocaleString()}</Text>
            <Text style={sb.statLabel}>Yards</Text>
          </View>
        )}
        {course.designer && (
          <View style={[sb.stat, { flex: 2 }]}>
            <Text style={sb.statVal} numberOfLines={1}>{course.designer}</Text>
            <Text style={sb.statLabel}>Designer</Text>
          </View>
        )}
      </View>

      <Text style={sb.desc}>{course.description}</Text>

      {/* Feature badges */}
      <View style={sb.badgesWrap}>
        {course.features.map(f => <FeatureBadge key={f} feature={f} />)}
      </View>

      {/* Tip */}
      {course.tip && (
        <View style={sb.tipRow}>
          <Ionicons name="flash" size={13} color={Colors.gold} />
          <Text style={sb.tipText}>{course.tip}</Text>
        </View>
      )}

      {/* Website button */}
      {course.access !== "private" && (
        <TouchableOpacity
          style={sb.websiteBtn}
          onPress={() => Linking.openURL(course.website)}
        >
          <Ionicons name="globe-outline" size={14} color={Colors.black} />
          <Text style={sb.websiteBtnText}>Book a Tee Time</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GolfScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"       ? COURSES :
    filter === "Public Only" ? COURSES.filter(c => c.access === "public" || c.access === "municipal") :
    COURSES.filter(c => c.city === filter);

  const publicCount = COURSES.filter(c => c.access !== "private").length;

  return (
    <SafeAreaView style={sb.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sb.filterScroll}
        contentContainerStyle={sb.filterContent}
      >
        {CITIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[sb.chip, filter === c && sb.chipActive]}
            onPress={() => setFilter(c)}
          >
            <Text style={[sb.chipText, filter === c && sb.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={sb.scroll} showsVerticalScrollIndicator={false}>

        {/* Legend */}
        <View style={sb.legendRow}>
          {(Object.entries(ACCESS_CONFIG) as [AccessType, typeof ACCESS_CONFIG[AccessType]][]).map(([key, cfg]) => (
            <View key={key} style={sb.legendItem}>
              <View style={[sb.legendDot, { backgroundColor: cfg.color }]} />
              <Text style={sb.legendText}>{cfg.label}</Text>
            </View>
          ))}
        </View>

        <Text style={sb.metaNote}>{filtered.length} courses · {publicCount} open to the public</Text>

        {filtered.map(c => <CourseCard key={c.name} course={c} />)}

        <View style={sb.footer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray} />
          <Text style={sb.footerText}>
            Green fees and hours vary by season. Always check the course website before heading out.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sb = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },
  scroll: { padding: 16 },

  filterScroll:  { backgroundColor: Colors.black, flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    borderColor: "#333", backgroundColor: "#1A1A1A",
  },
  chipActive:     { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText:       { fontSize: 13, fontWeight: "600", color: Colors.gray },
  chipTextActive: { color: Colors.black },

  legendRow:   { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 6 },
  legendItem:  { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 11, color: Colors.gray },
  metaNote:    { fontSize: 11, color: Colors.gray, marginBottom: 14 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader:   { marginBottom: 10 },
  titleRow:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  courseName:   { fontSize: 16, fontWeight: "800", color: Colors.black, flex: 1 },
  locationRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 11, color: Colors.gray },

  accessBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, flexShrink: 0,
  },
  accessText: { fontSize: 10, fontWeight: "700" },

  statsRow: {
    flexDirection: "row", gap: 8,
    backgroundColor: Colors.offWhite,
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  stat:      { flex: 1, alignItems: "center" },
  statVal:   { fontSize: 14, fontWeight: "800", color: Colors.black, marginBottom: 2 },
  statLabel: { fontSize: 10, color: Colors.gray, fontWeight: "600" },

  desc:       { fontSize: 13, color: Colors.gray, lineHeight: 19, marginBottom: 12 },
  badgesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  badge: {
    flexDirection: "row", alignItems: "center",
    gap: 4, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  tipRow: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 6, backgroundColor: "#FFFBEB",
    borderRadius: 8, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  tipText: { flex: 1, fontSize: 12, color: "#78350F", lineHeight: 17 },

  websiteBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    backgroundColor: Colors.gold, borderRadius: 10, paddingVertical: 10,
  },
  websiteBtnText: { fontSize: 13, fontWeight: "700", color: Colors.black },

  footer: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 6, marginTop: 4, marginBottom: 8,
  },
  footerText: { flex: 1, fontSize: 11, color: Colors.gray, lineHeight: 16 },
});
