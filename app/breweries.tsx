import { useState, useEffect } from "react";
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
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type FoodType = "full_kitchen" | "food_trucks" | "snacks" | "no_food";
type Feature  = "dog_friendly" | "live_music" | "patio" | "historic" | "coop" | "bike_trail" | "cocktails" | "coffee";

interface Brewery {
  name:        string;
  city:        string;
  description: string;
  food:        FoodType;
  features:    Feature[];
  website:     string;
  address:     string;
  tip?:        string;
}

// Map a Supabase row → Brewery. Unknown enum values fall back to safe defaults.
const ALLOWED_FEATURES: readonly Feature[] = [
  "dog_friendly","live_music","patio","historic","coop","bike_trail","cocktails","coffee",
];
const ALLOWED_FOOD: readonly FoodType[] = ["full_kitchen","food_trucks","snacks","no_food"];

function mapRow(row: any): Brewery {
  const food: FoodType = ALLOWED_FOOD.includes(row.food) ? row.food : "no_food";
  const features: Feature[] = Array.isArray(row.features)
    ? (row.features.filter((f: string) => ALLOWED_FEATURES.includes(f as Feature)) as Feature[])
    : [];
  return {
    name: row.name,
    city: row.city,
    description: row.description,
    food,
    features,
    website: row.website,
    address: row.address,
    tip: row.tip ?? undefined,
  };
}

// ─── Feature config ───────────────────────────────────────────────────────────
const FOOD_CONFIG: Record<FoodType, { label: string; color: string; icon: string }> = {
  full_kitchen: { label: "Full Kitchen",  color: "#10B981", icon: "restaurant-outline" },
  food_trucks:  { label: "Food Trucks",   color: "#F97316", icon: "car-outline" },
  snacks:       { label: "Snacks Only",   color: "#F59E0B", icon: "nutrition-outline" },
  no_food:      { label: "Taproom Only",  color: "#6B6B6B", icon: "beer-outline" },
};

const FEATURE_CONFIG: Record<Feature, { label: string; color: string; icon: string }> = {
  dog_friendly: { label: "Dog Friendly",   color: "#A78BFA", icon: "paw-outline" },
  live_music:   { label: "Live Music",     color: "#EC4899", icon: "musical-notes-outline" },
  patio:        { label: "Patio",          color: "#84CC16", icon: "sunny-outline" },
  historic:     { label: "Historic Bldg",  color: "#92400E", icon: "business-outline" },
  coop:         { label: "Co-op Owned",    color: "#0EA5E9", icon: "people-outline" },
  bike_trail:   { label: "Bike Trail",     color: "#65A30D", icon: "bicycle-outline" },
  cocktails:    { label: "Cocktails",      color: "#C084FC", icon: "wine-outline" },
  coffee:       { label: "Coffee Bar",     color: "#78350F", icon: "cafe-outline" },
};

// ─── Brewery data ─────────────────────────────────────────────────────────────
const BREWERIES: Brewery[] = [
  // ── Dayton ─────────────────────────────────────────────────────────────────
  {
    name:        "Warped Wing Brewing Co.",
    city:        "Dayton",
    address:     "26 Wyandot St, Dayton",
    description: "One of Dayton's flagship craft breweries inside a stunning 1938 iron foundry. Beer hall vibes with pinball, foosball, and giant Jenga. Multiple area locations.",
    food:        "full_kitchen",
    features:    ["patio", "historic"],
    website:     "https://warpedwing.com",
    tip:         "Also has locations in Springboro, Huber Heights, and Mason. Great for groups.",
  },
  {
    name:        "Toxic Brew Company",
    city:        "Dayton",
    address:     "431 E 5th St, Dayton (Oregon District)",
    description: "Craft beer and whiskey in the heart of the Oregon District. Late-night hours make it a go-to after dinner or a show.",
    food:        "no_food",
    features:    ["cocktails"],
    website:     "https://toxicbrewcompany.com",
    tip:         "Oregon District is walkable — grab dinner at a neighboring restaurant and head here after.",
  },
  {
    name:        "Branch & Bone Artisan Ales",
    city:        "Dayton",
    address:     "905 Wayne Ave, Dayton",
    description: "Artisan ales in a relaxed neighborhood taproom. Known for creative small-batch brews. Food trucks on-site Sundays and for special events.",
    food:        "food_trucks",
    features:    ["patio"],
    website:     "https://branchandboneales.com",
    tip:         "Sunday food truck lineup is a local favorite. Check their socials for the weekly schedule.",
  },
  {
    name:        "Dayton Beer Company",
    city:        "Dayton",
    address:     "41 Madison St, Dayton",
    description: "European-style beer hall steps from Fifth Third Field with 36 Ohio craft taps and locally sourced food. Perfect before or after a Dragons game.",
    food:        "full_kitchen",
    features:    ["historic"],
    website:     "https://thedaytonbeerco.com",
    tip:         "Go on a Dragons game day for the full downtown Dayton experience.",
  },
  {
    name:        "Little Fish Brewing Co. — Dayton",
    city:        "Dayton",
    address:     "116 Webster St, Dayton",
    description: "Farm-to-table food and rotating craft beers inside a beautifully restored 100+ year-old factory and train stop. One of Dayton's best overall experiences.",
    food:        "full_kitchen",
    features:    ["historic", "patio"],
    website:     "https://littlefishbrewing.com",
    tip:         "Brunch on Sat-Sun is exceptional. Barrel-aged sours and IPAs are standouts on tap.",
  },
  {
    name:        "Fifth Street Brewpub",
    city:        "Dayton",
    address:     "1600 E 5th St, Dayton (St. Anne's Hill)",
    description: "Ohio's first cooperatively owned brewpub in the charming St. Anne's Hill historic district. Scratch-made food including famous smashburgers and cheese curds.",
    food:        "full_kitchen",
    features:    ["coop", "historic", "patio"],
    website:     "https://fifthstreetbrewpub.com",
    tip:         "Saturday brunch starting at 10am — the Chevre burger and salmon B.E.L.T. are must-tries.",
  },
  {
    name:        "Carillon Brewing Company",
    city:        "Dayton",
    address:     "1000 Carillon Blvd, Dayton",
    description: "Historic brewery at Carillon Historical Park — one of the most unique settings in Dayton. Brews traditional 19th-century-style Ohio ales using period techniques.",
    food:        "snacks",
    features:    ["historic", "patio"],
    website:     "https://daytonshistory.org/carillon-brewing-co/",
    tip:         "Visit during Carillon Park hours — the museum and park grounds make this a full afternoon.",
  },

  // ── Kettering ──────────────────────────────────────────────────────────────
  {
    name:        "Eudora Brewing Company",
    city:        "Kettering",
    address:     "3022 Wilmington Pike, Kettering",
    description: "Elevated brewpub with a massive dog-friendly patio featuring 6 glass garage doors. Scratch kitchen with locally sourced ingredients and happy hour specials.",
    food:        "full_kitchen",
    features:    ["dog_friendly", "patio"],
    website:     "https://eudorabrewing.com",
    tip:         "One of the best dog-friendly patios in the Dayton area. Trivia nights on weeknights.",
  },

  // ── Centerville ────────────────────────────────────────────────────────────
  {
    name:        "Loose Ends Brewing",
    city:        "Centerville",
    address:     "890 S Main St, Centerville",
    description: "Community-focused neighborhood brewery with artisan pizza, ice cream, and a famous Sunday brunch with signature rangoons and Bloody Marys.",
    food:        "full_kitchen",
    features:    ["patio"],
    website:     "https://looseendsbrewing.com",
    tip:         "Sunday brunch is the move — the rangoons and Bloody Marys are locally legendary.",
  },
  {
    name:        "Heavier Than Air Brewing Co.",
    city:        "Centerville",
    address:     "497 Miamisburg-Centerville Rd, Centerville",
    description: "Aviation-themed taproom with creative craft brews. Outside food is welcome and encouraged. A relaxed neighborhood spot with a loyal local following.",
    food:        "no_food",
    features:    ["patio"],
    website:     "https://heavierthanairbrewing.com",
    tip:         "Bring your own food or order delivery — they're very welcoming of outside food.",
  },
  {
    name:        "Bock Family Brewing",
    city:        "Centerville",
    address:     "8150 Washington Village Dr, Centerville",
    description: "Family-owned neighborhood brewery in Washington Township. Great rotating tap selection in a welcoming, low-key taproom.",
    food:        "no_food",
    features:    [],
    website:     "https://bockfamilybrewing.com",
  },
  {
    name:        "Lock 27 Brewing",
    city:        "Centerville",
    address:     "1035 S Main St, Centerville",
    description: "Full-service restaurant and brewery named after Miami-Erie Canal lock history. Solid food menu alongside a well-rounded house tap list.",
    food:        "full_kitchen",
    features:    [],
    website:     "https://lock27brewing.com",
  },

  // ── Beavercreek ────────────────────────────────────────────────────────────
  {
    name:        "Wandering Griffin Brewery & Pub",
    city:        "Beavercreek",
    address:     "3725 Presidential Dr, Beavercreek",
    description: "10,000 sq ft brewpub with smoked BBQ, gourmet pizza, and a full-service coffee bar (Wanderlust) open daily. Covered beer garden patio with its own bar.",
    food:        "full_kitchen",
    features:    ["dog_friendly", "patio", "coffee"],
    website:     "https://wanderinggriffin.com",
    tip:         "Coffee bar opens at 6:30am — great for a morning stop. Beer garden patio has its own bar.",
  },
  {
    name:        "Southern Ohio Brewing",
    city:        "Beavercreek",
    address:     "818 Factory Rd, Beavercreek",
    description: "Family-owned taproom right on the Miami Valley Bike Trail with 12-14 rotating taps. Regular food truck on-site Wed-Sun during warmer months.",
    food:        "food_trucks",
    features:    ["bike_trail", "patio"],
    website:     "https://southernohiobrewing.com",
    tip:         "Perfect stop on a Miami Valley Trail ride. Lock up the bike and grab a pint.",
  },

  // ── Miamisburg ─────────────────────────────────────────────────────────────
  {
    name:        "Star City Brewing Company",
    city:        "Miamisburg",
    address:     "319 S 2nd St, Miamisburg",
    description: "Craft micro-brewery inside a stunning 19th-century Peerless Mill Inn building. Hidden basement speakeasy-style cocktail lounge with live music on Friday and Saturday nights.",
    food:        "no_food",
    features:    ["live_music", "cocktails", "historic"],
    website:     "https://starcitybrewing.com",
    tip:         "The basement lounge is a hidden gem — live music Fri-Sat makes it a full night out.",
  },

  // ── Yellow Springs ─────────────────────────────────────────────────────────
  {
    name:        "Yellow Springs Brewery",
    city:        "Yellow Springs",
    address:     "305 N Walnut St, Yellow Springs",
    description: "Founded 2013, one of the region's most celebrated craft breweries with 20 rotating taps. Local snacks and food trucks. A must-visit when exploring Yellow Springs.",
    food:        "food_trucks",
    features:    ["patio"],
    website:     "https://yellowspringsbrewery.com",
    tip:         "Pair with a walk through the village — Yellow Springs is one of Ohio's most unique towns.",
  },
  {
    name:        "Trail Town Brewing",
    city:        "Yellow Springs",
    address:     "101 Corry St, Yellow Springs",
    description: "Cozy neighborhood brewery in the heart of Yellow Springs, steps from the Little Miami Scenic Trail. Laid-back atmosphere with a rotating tap list.",
    food:        "snacks",
    features:    ["bike_trail"],
    website:     "https://trailtownbrewingys.com",
    tip:         "Great fuel stop before or after a trail ride on the Little Miami Scenic Trail.",
  },

  // ── Xenia ──────────────────────────────────────────────────────────────────
  {
    name:        "Devil Wind Brewing",
    city:        "Xenia",
    address:     "130 S Detroit St, Xenia",
    description: "Dog-friendly taproom and cocktail bar in downtown Xenia with creative craft brews and a welcoming atmosphere. Both indoor and outdoor seating.",
    food:        "no_food",
    features:    ["dog_friendly", "cocktails", "patio"],
    website:     "https://devilwindbrewing.com",
    tip:         "One of Xenia's best spots — grab dinner nearby and make a night of downtown Xenia.",
  },

  // ── Vandalia ───────────────────────────────────────────────────────────────
  {
    name:        "Hairless Hare Brewery",
    city:        "Vandalia",
    address:     "738 W National Rd, Vandalia",
    description: "Established 2013, this microbrewery north of Dayton is known for exceptional sours and a rotating craft lineup. Full kitchen with food service.",
    food:        "full_kitchen",
    features:    ["patio"],
    website:     "https://hairlessharebrewery.com",
    tip:         "Known for some of the best sours in the region. Worth the drive from Dayton.",
  },

  // ── Piqua ──────────────────────────────────────────────────────────────────
  {
    name:        "Crooked Handle Brewing Co.",
    city:        "Piqua",
    address:     "123 N Main St, Piqua",
    description: "Full brewpub in historic downtown Piqua with a well-rounded food menu and quality house brews. A great anchor for exploring the upper Miami Valley.",
    food:        "full_kitchen",
    features:    ["historic", "patio"],
    website:     "https://crookedhandle.com",
    tip:         "About 30 min north of Dayton — combine with a visit to historic downtown Piqua.",
  },
];

// Get unique cities for filter tabs (derived at runtime from the active list)
function citiesOf(list: Brewery[]): string[] {
  return ["All", ...Array.from(new Set(list.map(b => b.city))).sort()];
}

// ─── Components ───────────────────────────────────────────────────────────────
function FoodBadge({ type }: { type: FoodType }) {
  const cfg = FOOD_CONFIG[type];
  return (
    <View style={[sb.badge, { backgroundColor: cfg.color + "22", borderColor: cfg.color + "55" }]}>
      <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[sb.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
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

function BreweryCard({ brewery }: { brewery: Brewery }) {
  return (
    <View style={sb.card}>
      <View style={sb.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={sb.brewName}>{brewery.name}</Text>
          <View style={sb.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.gray} />
            <Text style={sb.locationText}>{brewery.address}</Text>
          </View>
        </View>
      </View>

      <Text style={sb.desc}>{brewery.description}</Text>

      <View style={sb.badgesWrap}>
        <FoodBadge type={brewery.food} />
        {brewery.features.map(f => <FeatureBadge key={f} feature={f} />)}
      </View>

      {brewery.tip && (
        <View style={sb.tipRow}>
          <Ionicons name="flash" size={13} color={Colors.gold} />
          <Text style={sb.tipText}>{brewery.tip}</Text>
        </View>
      )}

      <TouchableOpacity
        style={sb.websiteBtn}
        onPress={() => Linking.openURL(brewery.website)}
      >
        <Ionicons name="globe-outline" size={14} color={Colors.black} />
        <Text style={sb.websiteBtnText}>Visit Website</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BreweriesScreen() {
  const router = useRouter();
  const [city, setCity]           = useState("All");
  const [breweries, setBreweries] = useState<Brewery[]>(BREWERIES);

  // Live-fetch from Supabase. Falls back to bundled array on error.
  useEffect(() => {
    supabase
      .from("breweries")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return;
        setBreweries(data.map(mapRow));
      });
  }, []);

  const CITIES = citiesOf(breweries);

  const filtered = city === "All"
    ? breweries
    : breweries.filter(b => b.city === city);

  return (
    <SafeAreaView style={sb.safe} edges={["top"]}>
      <BrandHeader noTopInset left={<BackBtn onPress={() => router.back()} />} />

      {/* City filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sb.filterScroll}
        contentContainerStyle={sb.filterContent}
      >
        {CITIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[sb.chip, city === c && sb.chipActive]}
            onPress={() => setCity(c)}
          >
            <Text style={[sb.chipText, city === c && sb.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={sb.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Count + legend */}
        <View style={sb.metaRow}>
          <Text style={sb.metaCount}>{filtered.length} breweries</Text>
          <View style={sb.legendRow}>
            <View style={[sb.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={sb.legendText}>Full Kitchen</Text>
            <View style={[sb.legendDot, { backgroundColor: "#F97316" }]} />
            <Text style={sb.legendText}>Food Trucks</Text>
            <View style={[sb.legendDot, { backgroundColor: "#6B6B6B" }]} />
            <Text style={sb.legendText}>Taproom Only</Text>
          </View>
        </View>

        {filtered.map(b => <BreweryCard key={b.name} brewery={b} />)}

        <View style={sb.footer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray} />
          <Text style={sb.footerText}>
            Hours and food offerings change seasonally. Always check the brewery's website before visiting.
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
  safe:  { flex: 1, backgroundColor: Colors.black },
  scroll: { padding: 16, paddingBottom: 40 },

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

  metaRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  metaCount: { color: Colors.gray, fontSize: 12, fontWeight: "600" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.gray, fontSize: 10 },

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
  cardHeader:   { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  brewName:     { fontSize: 16, fontWeight: "800", color: Colors.black, marginBottom: 3 },
  locationRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 11, color: Colors.gray },
  desc:         { fontSize: 13, color: Colors.gray, lineHeight: 19, marginBottom: 12 },

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
    backgroundColor: Colors.gold,
    borderRadius: 10, paddingVertical: 10,
  },
  websiteBtnText: { fontSize: 13, fontWeight: "700", color: Colors.black },

  footer: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 6, marginTop: 4, marginBottom: 8,
  },
  footerText: { flex: 1, fontSize: 11, color: Colors.gray, lineHeight: 16 },
});
