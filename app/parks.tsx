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
interface Park {
  name:        string;
  city:        string;
  description: string;
  amenities:   Amenity[];
  website?:    string;
  tip?:        string;
}

type Amenity =
  | "playground"
  | "tennis"
  | "pickleball"
  | "splash_pad"
  | "trails"
  | "fishing"
  | "disc_golf"
  | "dog_park"
  | "sports_fields"
  | "sledding"
  | "farm"
  | "gardens"
  | "swimming"
  | "camping"
  | "ice_skating"
  | "volleyball"
  | "boat_launch";

const AMENITY_CONFIG: Record<Amenity, { icon: string; label: string; color: string }> = {
  playground:    { icon: "happy-outline",        label: "Playground",    color: "#F59E0B" },
  tennis:        { icon: "tennisball-outline",    label: "Tennis",        color: "#10B981" },
  pickleball:    { icon: "tennisball",            label: "Pickleball",    color: "#6366F1" },
  splash_pad:    { icon: "water-outline",         label: "Splash Pad",    color: "#0EA5E9" },
  trails:        { icon: "walk-outline",          label: "Trails",        color: "#84CC16" },
  fishing:       { icon: "fish-outline",          label: "Fishing",       color: "#06B6D4" },
  disc_golf:     { icon: "disc-outline",          label: "Disc Golf",     color: "#F97316" },
  dog_park:      { icon: "paw-outline",           label: "Dog Park",      color: "#A78BFA" },
  sports_fields: { icon: "football-outline",      label: "Sports Fields", color: "#EF4444" },
  sledding:      { icon: "snow-outline",          label: "Sledding",      color: "#93C5FD" },
  farm:          { icon: "leaf-outline",          label: "Working Farm",  color: "#65A30D" },
  gardens:       { icon: "flower-outline",        label: "Gardens",       color: "#EC4899" },
  swimming:      { icon: "water",                 label: "Swimming",      color: "#0284C7" },
  camping:       { icon: "bonfire-outline",       label: "Camping",       color: "#92400E" },
  ice_skating:   { icon: "snow",                  label: "Ice Skating",   color: "#BAE6FD" },
  volleyball:    { icon: "balloon-outline",       label: "Volleyball",    color: "#F59E0B" },
  boat_launch:   { icon: "boat-outline",          label: "Boat Launch",   color: "#1D4ED8" },
};

// ─── MetroParks data ──────────────────────────────────────────────────────────
const METRO_PARKS: Park[] = [
  {
    name:        "RiverScape MetroPark",
    city:        "Dayton",
    description: "Downtown Dayton's flagship park along the Great Miami River. A hub for festivals, outdoor concerts, and year-round recreation.",
    amenities:   ["splash_pad", "ice_skating", "volleyball", "fishing", "trails"],
    website:     "https://www.metroparks.org/places-to-go/riverscape/",
    tip:         "The splash pad is free all summer — great for kids. Ice rink opens in winter.",
  },
  {
    name:        "Eastwood MetroPark",
    city:        "Dayton",
    description: "Centered on Eastwood Lake, this park is a favorite for fishing, picnicking, and casual hikes just east of downtown.",
    amenities:   ["fishing", "trails", "disc_golf", "dog_park", "playground"],
    website:     "https://www.metroparks.org/places-to-go/eastwood/",
    tip:         "Disc golf course is free. Dog park has separate small and large dog areas.",
  },
  {
    name:        "Island MetroPark",
    city:        "Dayton",
    description: "A peaceful island park on the Mad River with easy walking trails, butterfly gardens, and scenic river views.",
    amenities:   ["trails", "fishing"],
    website:     "https://www.metroparks.org/places-to-go/island/",
    tip:         "Beautiful sunset spot. Connects to the regional bike trail network.",
  },
  {
    name:        "Wegerzyn Gardens MetroPark",
    city:        "Dayton",
    description: "Formal gardens, a Children's Discovery Garden, and woodland trails make this one of the most unique parks in the region.",
    amenities:   ["gardens", "trails", "playground"],
    website:     "https://www.metroparks.org/places-to-go/wegerzyn-gardens/",
    tip:         "The Children's Discovery Garden is a highlight for families — interactive and educational.",
  },
  {
    name:        "Possum Creek MetroPark",
    city:        "Dayton",
    description: "A west-side gem with a popular disc golf course, fishing ponds, and open meadow trails.",
    amenities:   ["disc_golf", "fishing", "trails", "playground"],
    website:     "https://www.metroparks.org/places-to-go/possum-creek/",
    tip:         "One of the best free disc golf courses in the region — 18 holes.",
  },
  {
    name:        "Aullwood Audubon MetroPark",
    city:        "Dayton",
    description: "A working organic farm and nature education center on 350 acres of native prairie, woodlands, and wetlands. One of the most peaceful spots in the region.",
    amenities:   ["farm", "gardens", "trails"],
    website:     "https://www.metroparks.org/places-to-go/aullwood/",
    tip:         "The farm animals and nature center make this a top pick for families with young children.",
  },
  {
    name:        "Cox Arboretum MetroPark",
    city:        "Dayton",
    description: "A stunning 189-acre botanical garden featuring specialty gardens, prairie grasses, mature forests, and one of the largest native Ohio butterfly houses in the region.",
    amenities:   ["gardens", "trails"],
    website:     "https://www.metroparks.org/places-to-go/cox-arboretum/",
    tip:         "The butterfly house is a must-see in summer. The tree tower gives a treetop view of the forest.",
  },
  {
    name:        "Englewood MetroPark",
    city:        "Englewood",
    description: "The largest park in the Five Rivers system — over 1,900 acres of river bottom land, wooded ravines, open meadows, and a reservoir with camping and fishing.",
    amenities:   ["camping", "fishing", "trails", "swimming", "sports_fields", "playground"],
    website:     "https://www.metroparks.org/places-to-go/englewood/",
    tip:         "The swimming area at the reservoir is one of the few places to swim for free in the Dayton region.",
  },
  {
    name:        "Hills & Dales MetroPark",
    city:        "Kettering",
    description: "Rolling wooded terrain perfect for trail running and hiking, with a great sledding hill in winter.",
    amenities:   ["trails", "sledding"],
    website:     "https://www.metroparks.org/places-to-go/hills-dales/",
    tip:         "The sledding hill is legendary in winter. Trails are well-maintained year-round.",
  },
  {
    name:        "Carriage Hill MetroPark",
    city:        "Huber Heights",
    description: "A working 1880s farm surrounded by miles of trails. Incredible for families who want a rural experience close to the city.",
    amenities:   ["farm", "trails", "fishing", "sledding", "playground"],
    website:     "https://www.metroparks.org/places-to-go/carriage-hill/",
    tip:         "Farm demonstrations run on weekends. Kids love meeting the animals.",
  },
  {
    name:        "Taylorsville MetroPark",
    city:        "Huber Heights",
    description: "A peaceful river park along the Great Miami with miles of paved trails connecting to the regional trail network, scenic meadows, and dense woodlands.",
    amenities:   ["trails", "fishing", "camping"],
    website:     "https://www.metroparks.org/places-to-go/taylorsville/",
    tip:         "The Great Miami River Recreation Trail runs through here — great for biking or a long walk.",
  },
  {
    name:        "Sugarcreek MetroPark",
    city:        "Bellbrook",
    description: "One of the most scenic parks in the region — dramatic limestone gorges, cedar cliffs, and pristine woodland trails.",
    amenities:   ["trails", "fishing"],
    website:     "https://www.metroparks.org/places-to-go/sugarcreek/",
    tip:         "The Cedar Cliff Falls trail is stunning. Worth the short drive from Centerville.",
  },
  {
    name:        "Twin Creek MetroPark",
    city:        "Germantown",
    description: "Hidden gem with a natural swimming hole, waterfall, and scenic creek-side trails through a shaded gorge.",
    amenities:   ["swimming", "trails", "fishing"],
    website:     "https://www.metroparks.org/places-to-go/twin-creek/",
    tip:         "The swimming hole is a local secret — perfect on hot summer days.",
  },
  {
    name:        "Caesar Creek State Park",
    city:        "Waynesville",
    description: "A massive 10,000-acre park with a reservoir lake, sandy beach, camping, and over 43 miles of trails. 30 min south of Dayton.",
    amenities:   ["swimming", "camping", "fishing", "boat_launch", "trails", "sports_fields"],
    website:     "https://parks.ohiodnr.gov/caesarcreek",
    tip:         "The fossil collecting area is unique — you can find 450-million-year-old fossils on the beach.",
  },
];

// ─── City parks data ──────────────────────────────────────────────────────────
const CITY_PARKS: Park[] = [
  // ── Kettering ──────────────────────────────────────────────────────────────
  {
    name:        "Delco Park",
    city:        "Kettering",
    description: "Kettering's largest and most feature-rich park, with something for every age. Features a splash pad, disc golf, fishing pond, pickleball, and a dog park — all free.",
    amenities:   ["playground", "tennis", "pickleball", "splash_pad", "sports_fields", "fishing", "trails", "disc_golf", "dog_park"],
    website:     "https://www.playkettering.org/delco-park/",
    tip:         "The splash pad is hugely popular in summer. Disc golf course is free. Dog park has separate large and small dog areas.",
  },
  {
    name:        "Kennedy Park",
    city:        "Kettering",
    description: "Home to Kettering's premier pickleball facility — 12 newly renovated outdoor courts plus a splash pad, walking trails, and open green space.",
    amenities:   ["pickleball", "tennis", "splash_pad", "trails", "playground"],
    website:     "https://www.playkettering.org/kennedy-park/",
    tip:         "The John & Betty Meyer Pickleball Courts expanded to 12 courts in 2023 — the top outdoor pickleball spot in Kettering.",
  },
  {
    name:        "Indian Riffle Park",
    city:        "Kettering",
    description: "A large neighborhood park along the creek corridor with sports fields, a playground, and wooded trail segments.",
    amenities:   ["sports_fields", "playground", "trails"],
    website:     "https://www.playkettering.org/departments/parks/",
  },
  {
    name:        "Spinning Hills Park",
    city:        "Kettering",
    description: "A nature-focused neighborhood park with disc golf and wooded trails winding through rolling hills.",
    amenities:   ["trails", "disc_golf", "playground"],
    website:     "https://www.playkettering.org/departments/parks/",
  },

  // ── Centerville ────────────────────────────────────────────────────────────
  {
    name:        "Activity Center Park",
    city:        "Centerville",
    description: "A 22-acre park anchored by the Centerville-Washington Park District headquarters. Features an all-access inclusive playground, water play area, pickleball courts, baseball diamonds, shelters, and wide open green space.",
    amenities:   ["playground", "splash_pad", "pickleball", "sports_fields", "dog_park"],
    website:     "https://cwpd.org/parks/",
    tip:         "The all-access playground is designed for kids of all abilities — one of the best in the region.",
  },
  {
    name:        "Stubbs Park",
    city:        "Centerville",
    description: "Centerville's beloved community gathering park, reopened in 2025 after a major renovation. Features disc golf, free summer concerts, local theater performances, wide open green space, and dog-friendly paths.",
    amenities:   ["playground", "sports_fields", "trails", "disc_golf"],
    website:     "https://cwpd.org/parks/",
    tip:         "Summer concerts and outdoor theater run regularly — check CWPD's calendar for the schedule.",
  },
  {
    name:        "Spring Valley Park",
    city:        "Centerville",
    description: "Quiet neighborhood park with a creek-side trail and well-maintained playground equipment. A local favorite for evening walks.",
    amenities:   ["playground", "trails"],
    website:     "https://cwpd.org/parks/",
  },

  // ── Beavercreek ────────────────────────────────────────────────────────────
  {
    name:        "Rotary Park",
    city:        "Beavercreek",
    description: "Beavercreek's flagship community park — features one of the best free splash pads in the region, a large playground, sports fields, and pickleball courts.",
    amenities:   ["playground", "splash_pad", "trails", "sports_fields", "pickleball"],
    website:     "https://www.beavercreekohio.gov/182/City-Parks-and-Trails",
    tip:         "The splash pad is one of the nicest in the Dayton area. Open Memorial Day through Labor Day.",
  },
  {
    name:        "Spring House Park",
    city:        "Beavercreek",
    description: "Beavercreek's newest and largest park at 148 acres — a destination park with nearly every amenity: splash pad, dog park, disc golf, pickleball, archery range, fishing dock, multi-sport fields, and miles of trails.",
    amenities:   ["splash_pad", "dog_park", "disc_golf", "pickleball", "fishing", "trails", "sports_fields", "playground"],
    website:     "https://beavercreekohio.gov/781/Spring-House-Park",
    tip:         "Still being developed in phases — already one of the most impressive parks in the region when complete.",
  },
  {
    name:        "Dominick Lofino Park",
    city:        "Beavercreek",
    description: "A well-established community park on the north side of Beavercreek with sports facilities, a playground, and green space popular with youth leagues.",
    amenities:   ["playground", "sports_fields", "tennis", "trails"],
    website:     "https://www.beavercreekohio.gov/182/City-Parks-and-Trails",
  },
  {
    name:        "John Ankeney Soccer Complex",
    city:        "Beavercreek",
    description: "Major regional soccer facility with 14 fields hosting youth and adult leagues throughout the year.",
    amenities:   ["sports_fields"],
    website:     "https://www.beavercreekohio.gov/182/City-Parks-and-Trails",
  },

  // ── Miamisburg ─────────────────────────────────────────────────────────────
  {
    name:        "Mound Park",
    city:        "Miamisburg",
    description: "Built around a 65-foot prehistoric Native American burial mound — one of the tallest in the U.S. Climb to the top for panoramic views, then enjoy tennis, sports fields, and a playground.",
    amenities:   ["playground", "tennis", "trails", "sports_fields"],
    website:     "https://www.playmiamisburg.com/parks_facilities/parks/",
    tip:         "The mound is a truly unique Dayton-area landmark. Great photo spot at the top.",
  },
  {
    name:        "Sycamore Trails Park",
    city:        "Miamisburg",
    description: "The gem of Miamisburg — 75 acres of natural park with an 18-hole disc golf course, pickleball and tennis courts, swimming at the Sycamore Trails Aquatic Center, and wooded trails.",
    amenities:   ["disc_golf", "pickleball", "tennis", "swimming", "trails", "playground"],
    website:     "https://www.playmiamisburg.com/sycamore-trails-park/",
    tip:         "The disc golf course was redesigned with 18 holes through creeks and elevation changes — one of the best in the area.",
  },
  {
    name:        "Riverfront Park",
    city:        "Miamisburg",
    description: "Beautiful 7-acre park along the Great Miami River with a splash pad, large playground, and pavilion. Access point for the Great Miami River Recreation Trail.",
    amenities:   ["splash_pad", "playground", "fishing", "trails"],
    website:     "https://www.playmiamisburg.com/parks_facilities/parks/",
    tip:         "One of the best riverfront parks in the region for families.",
  },
  {
    name:        "Canal Run / Community Park",
    city:        "Miamisburg",
    description: "Miamisburg's community activity hub featuring the Canal Run Dog Park, a skate park, basketball courts, playground, and walking path along a scenic canal corridor.",
    amenities:   ["dog_park", "playground", "trails"],
    website:     "https://www.playmiamisburg.com/parks_facilities/canal_run_dog_park/",
    tip:         "Canal Run Dog Park has three separate fenced areas for dogs of all sizes — one of the nicest dog parks in the area.",
  },

  // ── Springboro ─────────────────────────────────────────────────────────────
  {
    name:        "North Park",
    city:        "Springboro",
    description: "Springboro's premier 39-acre park on W. Central Ave. Features 6 lighted pickleball courts (added 2024), 2 lighted tennis courts, 3 soccer/LAX fields, a 30,000 sq ft all-accessible Dayton Children's Hospital playground, an amphitheater, basketball, and a 0.89-mile walking trail.",
    amenities:   ["pickleball", "tennis", "sports_fields", "playground", "trails"],
    website:     "https://www.cityofspringboro.com/facilities/facility/details/North-Park-1",
    tip:         "The new all-accessible playground (2024) is one of the best in the region. Summer concert series and outdoor theater at the amphitheater are free.",
  },
  {
    name:        "Community Park",
    city:        "Springboro",
    description: "A versatile sports and recreation park with baseball and basketball courts, tennis, a playground, and the DK Pump Tracks — a free BMX-style pump track for all ages and skill levels.",
    amenities:   ["sports_fields", "playground", "tennis"],
    website:     "https://www.cityofspringboro.com/facilities/facility/details/Community-Park-2",
    tip:         "The pump track is a hidden gem — free to use and popular with kids on bikes and scooters.",
  },
  {
    name:        "Clearcreek Park",
    city:        "Springboro",
    description: "A nature-forward park with creek access, open green space, and a peaceful setting along Clearcreek. Great for casual walks and picnics.",
    amenities:   ["trails", "playground"],
    website:     "https://www.cityofspringboro.com/176/Parks-Recreation",
  },

  // ── Huber Heights ──────────────────────────────────────────────────────────
  {
    name:        "Thomas A. Cloud Park",
    city:        "Huber Heights",
    description: "Huber Heights' largest park at 124 acres — a massive athletic complex with 12 tennis courts, 10 ball diamonds, volleyball, 4 soccer fields, 4 basketball courts, a splash pad, and 1.2 miles of paved trails.",
    amenities:   ["tennis", "sports_fields", "volleyball", "splash_pad", "trails", "playground"],
    website:     "https://www.hhoh.org/646/City-Parks",
    tip:         "The splash pad runs free from Memorial Day through Labor Day. Six picnic shelters available to reserve.",
  },
  {
    name:        "Wayne Park",
    city:        "Huber Heights",
    description: "Community recreation park serving the heart of Huber Heights with sports fields, pickleball courts, a splash pad, and open play areas.",
    amenities:   ["playground", "splash_pad", "tennis", "pickleball", "sports_fields"],
    website:     "https://www.hhoh.org/290/Parks-Recreation",
    tip:         "The splash pad was recently renovated — one of the larger ones in the area.",
  },

  // ── Fairborn ───────────────────────────────────────────────────────────────
  {
    name:        "Fairborn Community Park",
    city:        "Fairborn",
    description: "Fairborn's flagship park with something for everyone — soccer and softball fields, a 500-seat amphitheater, 18-hole disc golf course, volleyball, basketball, tennis, a 2-mile fitness trail, a 5-acre pond, and over 40 acres of restored forest and wetlands.",
    amenities:   ["sports_fields", "disc_golf", "volleyball", "tennis", "trails", "fishing"],
    website:     "https://www.fairbornoh.gov/government/parks___recreation/index.php",
    tip:         "The 5-acre pond and restored wetlands make this feel like a nature park, not just an athletic complex.",
  },
  {
    name:        "Gracemore Park",
    city:        "Fairborn",
    description: "Community park close to Wright State University with sports facilities and open green space. Popular with students and families alike.",
    amenities:   ["playground", "sports_fields", "tennis"],
    website:     "https://www.fairbornoh.gov/government/parks___recreation/index.php",
  },
  {
    name:        "John Bryan State Park",
    city:        "Yellow Springs",
    description: "Just 20 min from WPAFB — one of Ohio's most stunning parks, with a dramatic limestone gorge along the Little Miami River, world-class hiking, and rock climbing.",
    amenities:   ["trails", "camping", "fishing"],
    website:     "https://parks.ohiodnr.gov/johnbryan",
    tip:         "The gorge trail is a must-do for new residents. Connects to Clifton Gorge State Nature Preserve for extended hiking.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────
function AmenityBadge({ amenity }: { amenity: Amenity }) {
  const cfg = AMENITY_CONFIG[amenity];
  return (
    <View style={[sb.badge, { backgroundColor: cfg.color + "20", borderColor: cfg.color + "40" }]}>
      <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[sb.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function ParkCard({ park }: { park: Park }) {
  return (
    <View style={sb.card}>
      <View style={sb.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={sb.parkName}>{park.name}</Text>
          <View style={sb.cityRow}>
            <Ionicons name="location-outline" size={12} color={Colors.gray} />
            <Text style={sb.cityText}>{park.city}</Text>
          </View>
        </View>
      </View>

      <Text style={sb.desc}>{park.description}</Text>

      <View style={sb.amenitiesWrap}>
        {park.amenities.map(a => <AmenityBadge key={a} amenity={a} />)}
      </View>

      {park.tip && (
        <View style={sb.tipRow}>
          <Ionicons name="flash" size={13} color={Colors.gold} />
          <Text style={sb.tipText}>{park.tip}</Text>
        </View>
      )}

      {park.website && (
        <TouchableOpacity
          style={sb.websiteBtn}
          onPress={() => Linking.openURL(park.website!)}
        >
          <Ionicons name="globe-outline" size={14} color={Colors.black} />
          <Text style={sb.websiteBtnText}>Visit Website</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ParksScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"metro" | "city">("metro");

  const parks = tab === "metro" ? METRO_PARKS : CITY_PARKS;

  // Group city parks by city
  const grouped = tab === "city"
    ? CITY_PARKS.reduce<Record<string, Park[]>>((acc, p) => {
        if (!acc[p.city]) acc[p.city] = [];
        acc[p.city].push(p);
        return acc;
      }, {})
    : {};

  return (
    <SafeAreaView style={sb.safe} edges={["top"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      {/* Tab switcher */}
      <View style={sb.tabRow}>
        <TouchableOpacity
          style={[sb.tabBtn, tab === "metro" && sb.tabBtnActive]}
          onPress={() => setTab("metro")}
        >
          <Text style={[sb.tabLabel, tab === "metro" && sb.tabLabelActive]}>
            🌿 MetroParks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sb.tabBtn, tab === "city" && sb.tabBtnActive]}
          onPress={() => setTab("city")}
        >
          <Text style={[sb.tabLabel, tab === "city" && sb.tabLabelActive]}>
            🏘️ City Parks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={sb.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === "metro" ? (
          <>
            <View style={sb.sectionNote}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.gray} />
              <Text style={sb.sectionNoteText}>
                Five Rivers MetroParks manages 35+ locations across the Dayton region — all free to visit.
              </Text>
            </View>
            {METRO_PARKS.map(p => <ParkCard key={p.name} park={p} />)}
          </>
        ) : (
          Object.entries(grouped).map(([city, cityParks]) => (
            <View key={city}>
              <View style={sb.cityHeader}>
                <View style={sb.cityDot} />
                <Text style={sb.cityHeaderText}>{city}</Text>
              </View>
              {cityParks.map(p => <ParkCard key={p.name} park={p} />)}
            </View>
          ))
        )}
      </ScrollView>

      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sb = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.black },
  scroll: { padding: 16, paddingBottom: 120 },

  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
  },
  tabBtnActive: { backgroundColor: Colors.gold },
  tabLabel:     { fontSize: 13, fontWeight: "700", color: Colors.gray },
  tabLabelActive: { color: Colors.black },

  // Section note
  sectionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  sectionNoteText: { flex: 1, fontSize: 12, color: "#166534", lineHeight: 17 },

  // City grouping
  cityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  cityDot: {
    width: 4, height: 20,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  cityHeaderText: { fontSize: 16, fontWeight: "800", color: Colors.black },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader:  { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  parkName:    { fontSize: 16, fontWeight: "800", color: Colors.black, marginBottom: 3 },
  cityRow:     { flexDirection: "row", alignItems: "center", gap: 4 },
  cityText:    { fontSize: 12, color: Colors.gray },
  desc:        { fontSize: 13, color: Colors.gray, lineHeight: 19, marginBottom: 12 },

  // Amenity badges
  amenitiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  // Tip
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  tipText: { flex: 1, fontSize: 12, color: "#78350F", lineHeight: 17 },

  // Website button
  websiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 10,
  },
  websiteBtnText: { fontSize: 13, fontWeight: "700", color: Colors.black },
});
