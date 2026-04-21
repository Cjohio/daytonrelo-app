import { useState, useEffect } from "react";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../shared/theme/colors";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import { supabase } from "../../lib/supabase";

// ─── Restaurant logo registry ──────────────────────────────────────────────────
// React Native requires static require() paths, so we build a map by id.
// Restaurants not in this map fall back to a gold-bordered letter badge.
const RESTAURANT_LOGOS: Record<string, any> = {
  "amber-rose":    require("../../assets/images/restaurants/amber-rose.png"),
  "flying-pizza":  require("../../assets/images/restaurants/flying-pizza.png"),
  "grist":         require("../../assets/images/restaurants/grist.png"),
  "jays-seafood":  require("../../assets/images/restaurants/jays-seafood.png"),
  "lilys":         require("../../assets/images/restaurants/lilys.png"),
  "luckys":        require("../../assets/images/restaurants/luckys.png"),
  "manna":         require("../../assets/images/restaurants/manna.png"),
  "meefs":         require("../../assets/images/restaurants/meefs.png"),
  "pine-club":     require("../../assets/images/restaurants/pine-club.png"),
  "slyders":       require("../../assets/images/restaurants/slyders.png"),
  "thai-9":        require("../../assets/images/restaurants/thai-9.png"),
  "wheat-penny":   require("../../assets/images/restaurants/wheat-penny.png"),
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Restaurant {
  id:          string;
  name:        string;
  cuisine:     string;
  hood:        string;        // neighborhood / city
  since?:      string;        // "Since 1947"
  price:       "$" | "$$" | "$$$" | "$$$$";
  description: string;
  tip?:        string;        // local pro-tip
  mapsQuery:   string;        // passed to Google Maps
}

// Map a Supabase row → Restaurant (column names → camelCase)
function mapRow(row: any): Restaurant {
  return {
    id:          row.id,
    name:        row.name,
    cuisine:     row.cuisine,
    hood:        row.hood,
    since:       row.since ?? undefined,
    price:       row.price,
    description: row.description,
    tip:         row.tip ?? undefined,
    mapsQuery:   row.maps_query,
  };
}

// ─── Dayton Staples ────────────────────────────────────────────────────────────
// The iconic, historic spots every new Daytonian must experience
const STAPLES: Restaurant[] = [
  {
    id: "pine-club",
    name: "The Pine Club",
    cuisine: "🥩 Steakhouse",
    hood: "Oakwood",
    since: "Since 1947",
    price: "$$$",
    description:
      "Dayton's most legendary restaurant and a true American original. No reservations, no credit cards, no desserts — just perfectly aged hand-cut steaks, stewed tomatoes, and onion rings. Presidents and Hall of Famers have eaten here. You should too.",
    tip: "Cash only. Expect a wait — it's always worth it.",
    mapsQuery: "The Pine Club Dayton Ohio",
  },
  {
    id: "marions-piazza",
    name: "Marion's Piazza",
    cuisine: "🍕 Pizza",
    hood: "Multiple Locations",
    since: "Since 1965",
    price: "$",
    description:
      "Voted Dayton's Best Pizza over 33 times and counting. Thin crust, cut into signature small squares, with a sauce recipe that hasn't changed in decades. This is the pizza every Daytonian grows up on. You'll be hooked after one slice.",
    tip: "Try the house special. Nine locations across the metro.",
    mapsQuery: "Marion's Piazza Dayton Ohio",
  },
  {
    id: "slyders",
    name: "Slyder's Tavern",
    cuisine: "🍔 Burgers & Bar",
    hood: "Belmont",
    since: "Since 1948",
    price: "$",
    description:
      "Won Best Hamburger in Dayton six out of eight times. A true neighborhood tavern with no pretension and outstanding wings. Exactly the kind of place that makes Dayton special — and has for over 75 years.",
    tip: "Order the wings. They're legendary.",
    mapsQuery: "Slyder's Tavern Dayton Ohio",
  },
  {
    id: "jays-seafood",
    name: "Jay's Seafood",
    cuisine: "🦞 Seafood",
    hood: "Oregon District",
    since: "Since 1976",
    price: "$$$",
    description:
      "Dayton's premier independent seafood restaurant, holding court in the historic Oregon District for nearly 50 years. Seasonal, fresh fish and shellfish in a classic setting that never goes out of style.",
    tip: "Ask your server what came in fresh that day.",
    mapsQuery: "Jay's Seafood Dayton Ohio",
  },
  {
    id: "amber-rose",
    name: "The Amber Rose",
    cuisine: "🥟 Eastern European",
    hood: "North Dayton",
    since: "Since 1968",
    price: "$$",
    description:
      "Housed in a building dating to 1910, The Amber Rose serves old-world Eastern European comfort food — pierogies, schnitzel, stuffed cabbage — made from recipes passed down through generations. A Dayton hidden gem.",
    tip: "Don't skip the pierogies. They're the real deal.",
    mapsQuery: "The Amber Rose Dayton Ohio",
  },
  {
    id: "root-beer-stand",
    name: "Root Beer Stand",
    cuisine: "🌭 American Drive-In",
    hood: "Sharonville / Dayton",
    since: "Since 1928",
    price: "$",
    description:
      "A classic carhop drive-in serving frosty mugs of homemade root beer and hot dogs. A Dayton summer tradition stretching back nearly 100 years. Pull up, roll down your window, and experience something genuinely American.",
    tip: "The root beer float is non-negotiable.",
    mapsQuery: "Root Beer Stand Dayton Ohio",
  },
  {
    id: "flying-pizza",
    name: "Flying Pizza",
    cuisine: "🍕 New York Pizza",
    hood: "Dayton",
    since: "Since 1971",
    price: "$",
    description:
      "New York-style pizza by the slice, made with the same cheese, same flour, and same sauce recipe for over 50 years. No frills, no reinvention — just great pizza done right, every single time.",
    tip: "Grab a slice to go. Eat it standing up. You'll understand.",
    mapsQuery: "Flying Pizza Dayton Ohio",
  },
  {
    id: "oakwood-club",
    name: "The Oakwood Club",
    cuisine: "🥩 Surf & Turf",
    hood: "Oakwood",
    since: "Since 1962",
    price: "$$$",
    description:
      "Dayton's go-to for special occasions since 1962. Impeccably aged Angus beef, freshly flown-in seafood, homemade breads and desserts. The kind of place you bring someone you want to impress.",
    tip: "Make a reservation. This one fills up.",
    mapsQuery: "The Oakwood Club Dayton Ohio",
  },
];

// ─── Best of Dayton ────────────────────────────────────────────────────────────
// Top modern and contemporary picks by neighborhood
const BEST: Restaurant[] = [
  {
    id: "salar",
    name: "Salar Restaurant & Lounge",
    cuisine: "🌮 Peruvian / Mediterranean",
    hood: "Oregon District",
    price: "$$$",
    description:
      "Chef Margot Blondet's stunning fusion of Peruvian heritage and Mediterranean technique. The ceviche and pisco sours are worth the trip alone. One of the most exciting restaurants in all of Ohio.",
    tip: "Start with the ceviche. Order the pisco sour. Thank us later.",
    mapsQuery: "Salar Restaurant Dayton Oregon District",
  },
  {
    id: "wheat-penny",
    name: "Wheat Penny Oven and Bar",
    cuisine: "🍕 Wood-Fired Pizza",
    hood: "South Park",
    price: "$$",
    description:
      "Artisan wood-fired pizzas with inventive, seasonal toppings — think roasted cauliflower, eggplant parm, local cheeses. One of Dayton's most beloved modern dining spots and a neighborhood anchor.",
    tip: "The seasonal specials are always the move.",
    mapsQuery: "Wheat Penny Oven and Bar Dayton Ohio",
  },
  {
    id: "thai-9",
    name: "Thai 9",
    cuisine: "🍜 Thai & Sushi",
    hood: "Oregon District",
    price: "$$",
    description:
      "An expansive menu of authentic Thai dishes and fresh sushi under one roof. From spicy green curries to creative sushi rolls, Thai 9 has been a neighborhood anchor in the Oregon District for years.",
    tip: "Great happy hour. The pad see ew is outstanding.",
    mapsQuery: "Thai 9 Restaurant Dayton Oregon District",
  },
  {
    id: "lilys",
    name: "Lily's Dayton",
    cuisine: "🌺 Southern / Tiki",
    hood: "Oregon District",
    price: "$$",
    description:
      "A one-of-a-kind tiki-inspired eatery blending American Southern cooking with Polynesian flair. Bao bun sliders, rumaki, free-range fried chicken, and creative cocktails in a wildly fun atmosphere.",
    tip: "Come for the food, stay for the cocktails and vibe.",
    mapsQuery: "Lily's Dayton Ohio",
  },
  {
    id: "luckys",
    name: "Lucky's Taproom & Eatery",
    cuisine: "🍺 American / Craft Beer",
    hood: "Downtown Dayton",
    price: "$$",
    description:
      "Dayton's favorite craft beer hub with generous, crowd-pleasing food. Great for groups — big booths, long beer lists, and a menu that covers everyone from meat lovers to vegans.",
    tip: "Great spot for a first night out with your new Dayton crew.",
    mapsQuery: "Lucky's Taproom Dayton Ohio",
  },
  {
    id: "sonora-grill",
    name: "Sonora Grill",
    cuisine: "🌮 Mexican / Latin",
    hood: "Beavercreek",
    price: "$$",
    description:
      "Fresh, vibrant Latin flavors that punch well above their weight. A favorite near WPAFB for its bold flavors, generous portions, and lively atmosphere. Solid margaritas too.",
    tip: "The carne asada tacos are a must.",
    mapsQuery: "Sonora Grill Beavercreek Ohio",
  },
  {
    id: "meefs",
    name: "Meef's Pasteria",
    cuisine: "🍝 Italian",
    hood: "Beavercreek",
    price: "$$",
    description:
      "Handmade pasta and Italian comfort food done with real care. Meef's has built a loyal following in Beavercreek for its scratch-made dishes and warm, unpretentious atmosphere.",
    tip: "Ask about the fresh pasta special — it changes regularly.",
    mapsQuery: "Meef's Pasteria Beavercreek Ohio",
  },
  {
    id: "flemings",
    name: "Fleming's Prime Steakhouse",
    cuisine: "🥩 Steakhouse",
    hood: "The Greene, Beavercreek",
    price: "$$$$",
    description:
      "Premium USDA Prime steaks and an exceptional wine list at The Greene Town Center. The place for a true special-occasion dinner near WPAFB. Impeccable service and a top-tier bar program.",
    tip: "The Brussels sprouts side dish is surprisingly incredible.",
    mapsQuery: "Fleming's Prime Steakhouse Beavercreek Ohio",
  },
  {
    id: "manna",
    name: "Manna Uptown",
    cuisine: "🍽 European / South American",
    hood: "Centerville",
    price: "$$$",
    description:
      "A sophisticated fusion of modern European and South American flavors in the heart of Centerville. Manna punches well above a suburb's expectations — creative, beautifully plated, and consistently excellent.",
    tip: "Great date-night spot. Reservations recommended on weekends.",
    mapsQuery: "Manna Uptown Centerville Ohio",
  },
  {
    id: "grist",
    name: "Grist",
    cuisine: "🌾 American / Upscale",
    hood: "Beavercreek",
    price: "$$$",
    description:
      "Modern American cuisine in a stylish, contemporary setting. Grist brings big-city dining energy to Beavercreek with a seasonal menu, craft cocktails, and a wine list that impresses regulars and visitors alike.",
    tip: "The brunch menu is a sleeper hit on weekends.",
    mapsQuery: "Grist Restaurant Beavercreek Ohio",
  },
];

// ─── Price display ─────────────────────────────────────────────────────────────
function PriceBadge({ price }: { price: Restaurant["price"] }) {
  return (
    <Text style={s.price}>
      <Text style={s.priceActive}>{price}</Text>
      <Text style={s.priceGhost}>{"$$$$".slice(price.length)}</Text>
    </Text>
  );
}

// ─── Logo (with gold letter-badge fallback) ────────────────────────────────────
function RestaurantLogo({ id, name }: { id: string; name: string }) {
  const source = RESTAURANT_LOGOS[id];
  if (source) {
    return (
      <View style={s.logoWrap}>
        <Image source={source} style={s.logoImg} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={[s.logoWrap, s.logoBadge]}>
      <Text style={s.logoBadgeText}>{name.charAt(0)}</Text>
    </View>
  );
}

// ─── Restaurant card ───────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <View style={s.card}>
      {/* Logo header */}
      <RestaurantLogo id={r.id} name={r.name} />

      {/* Top row */}
      <View style={s.cardTop}>
        <View style={s.cardMeta}>
          <Text style={s.cardCuisine}>{r.cuisine}</Text>
          {r.since && <Text style={s.cardSince}>{r.since}</Text>}
        </View>
        <PriceBadge price={r.price} />
      </View>

      {/* Name */}
      <Text style={s.cardName}>{r.name}</Text>

      {/* Neighborhood */}
      <View style={s.hoodRow}>
        <Ionicons name="location-outline" size={12} color={Colors.gray} />
        <Text style={s.cardHood}>{r.hood}</Text>
      </View>

      {/* Description */}
      <Text style={s.cardDesc}>{r.description}</Text>

      {/* Pro tip */}
      {r.tip && (
        <View style={s.tipRow}>
          <Ionicons name="flash" size={12} color={Colors.gold} />
          <Text style={s.cardTip}>{r.tip}</Text>
        </View>
      )}

      {/* Directions button */}
      <TouchableOpacity
        style={s.dirBtn}
        onPress={() =>
          Linking.openURL(
            `https://maps.google.com/?q=${encodeURIComponent(r.mapsQuery)}`
          )
        }
        activeOpacity={0.8}
      >
        <Ionicons name="navigate-outline" size={14} color={Colors.black} />
        <Text style={s.dirBtnText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type Tab = "staples" | "best";

export default function EatsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("staples");
  const [staples,   setStaples]   = useState<Restaurant[]>(STAPLES);
  const [best,      setBest]      = useState<Restaurant[]>(BEST);

  // Live-fetch from Supabase. Falls back to bundled arrays on error.
  useEffect(() => {
    supabase
      .from("restaurants")
      .select("*")
      .eq("is_active", true)
      .order("tier", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return;
        const mapped = data.map(mapRow);
        const s = data
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.tier === "staple")
          .map(({ i }) => mapped[i]);
        const b = data
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.tier === "best")
          .map(({ i }) => mapped[i]);
        if (s.length > 0) setStaples(s);
        if (b.length > 0) setBest(b);
      });
  }, []);

  const list = activeTab === "staples" ? staples : best;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>DAYTON EATS</Text>
          <Text style={s.headerSub}>The Local Food Guide</Text>
        </View>
        <HeaderActions />
      </View>

      {/* Category tabs */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, activeTab === "staples" && s.tabActive]}
          onPress={() => setActiveTab("staples")}
          activeOpacity={0.8}
        >
          <Text style={[s.tabLabel, activeTab === "staples" && s.tabLabelActive]}>
            🏛 Dayton Staples
          </Text>
          <Text style={[s.tabSub, activeTab === "staples" && s.tabSubActive]}>
            Iconic & Historic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, activeTab === "best" && s.tabActive]}
          onPress={() => setActiveTab("best")}
          activeOpacity={0.8}
        >
          <Text style={[s.tabLabel, activeTab === "best" && s.tabLabelActive]}>
            ⭐ Best of Dayton
          </Text>
          <Text style={[s.tabSub, activeTab === "best" && s.tabSubActive]}>
            Top Picks by Neighborhood
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "staples" && (
          <Text style={s.intro}>
            These are the restaurants that define Dayton — the places locals fiercely defend, newcomers quickly adopt, and everyone ends up loving.
          </Text>
        )}
        {activeTab === "best" && (
          <Text style={s.intro}>
            The best of what Dayton's food scene has to offer right now, from the Oregon District to Beavercreek and beyond.
          </Text>
        )}

        {list.map(r => (
          <RestaurantCard key={r.id} r={r} />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  header: {
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  headerSub:   { color: Colors.grayLight, fontSize: 10, letterSpacing: 1, marginTop: 2 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, alignItems: "center", paddingVertical: 12,
    borderBottomWidth: 3, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: Colors.gold },
  tabLabel: { fontSize: 13, fontWeight: "700", color: Colors.grayLight },
  tabLabelActive: { color: Colors.black },
  tabSub: { fontSize: 10, color: Colors.grayLight, marginTop: 2 },
  tabSubActive: { color: Colors.gray },

  scroll:        { flex: 1, backgroundColor: Colors.offWhite },
  scrollContent: { padding: 16 },

  intro: {
    color: Colors.gray, fontSize: 13, lineHeight: 20,
    marginBottom: 16, marginTop: 4,
    backgroundColor: Colors.white,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
    fontStyle: "italic",
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },

  logoWrap: {
    width: 64, height: 64, borderRadius: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10, alignSelf: "flex-start",
    overflow: "hidden",
  },
  logoImg: { width: "100%", height: "100%" },
  logoBadge: {
    backgroundColor: Colors.black,
    borderColor: Colors.gold, borderWidth: 2,
  },
  logoBadgeText: {
    fontSize: 28, fontWeight: "800",
    color: Colors.gold, letterSpacing: 0.5,
  },

  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 6,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  cardCuisine: { fontSize: 12, color: Colors.gray, fontWeight: "600" },
  cardSince: {
    fontSize: 10, color: Colors.gold, fontWeight: "700",
    backgroundColor: Colors.gold + "18",
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },

  price:       { fontSize: 13, fontWeight: "800" },
  priceActive: { color: Colors.black },
  priceGhost:  { color: "#D0D0D0" },

  cardName: {
    color: Colors.black, fontSize: 18, fontWeight: "800",
    marginBottom: 4, lineHeight: 24,
  },

  hoodRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10,
  },
  cardHood: { color: Colors.gray, fontSize: 12 },

  cardDesc: {
    color: Colors.black, fontSize: 14, lineHeight: 21, marginBottom: 10,
  },

  tipRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 8, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: "#F5E088",
  },
  cardTip: { flex: 1, color: "#7A6000", fontSize: 12, lineHeight: 17, fontStyle: "italic" },

  dirBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: Colors.gold,
    borderRadius: 10, paddingVertical: 10,
  },
  dirBtnText: { color: Colors.black, fontSize: 13, fontWeight: "700" },
});
