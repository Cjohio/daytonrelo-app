import { useState } from "react";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";

const TRIPS = [
  {
    name:     "Yellow Springs",
    drive:    "25 min",
    distance: "20 mi",
    icon:     "leaf-outline" as const,
    category: "Nature & Quirky",
    color:    "#7ED321",
    desc:     "Dayton's favorite day trip. Charming village with great food, hiking Glen Helen Nature Preserve, boutique shopping, and a laid-back arts scene. Home of Dave Chappelle.",
    highlights: ["Glen Helen Nature Preserve", "Young's Jersey Dairy (ice cream & mini golf)", "The Winds Café", "Antioch College area shops"],
    tip: "Go on a weekday — weekends get crowded. Spring and fall are stunning.",
    url: "https://www.villageofyellowsprings.org",
  },
  {
    name:     "Hocking Hills State Park",
    drive:    "1 hr 20 min",
    distance: "90 mi",
    icon:     "water-outline" as const,
    category: "Nature & Outdoors",
    color:    "#417505",
    desc:     "Ohio's most stunning natural area. Caves, waterfalls, old-growth forest, and sandstone cliffs. Old Man's Cave is the main attraction. Book cabins months in advance.",
    highlights: ["Old Man's Cave", "Ash Cave (largest recess cave in Ohio)", "Cedar Falls", "Rock House"],
    tip: "Arrive before 9am to beat the crowds at Old Man's Cave. Free admission to state park.",
    url: "https://hockinghills.com",
  },
  {
    name:     "Columbus",
    drive:    "1 hr 15 min",
    distance: "75 mi",
    icon:     "business-outline" as const,
    category: "City Day Trip",
    color:    "#4A90D9",
    desc:     "Ohio's capital and largest city. World-class Short North Arts District, Columbus Zoo (consistently ranked top 5 in US), great food scene, and Ohio State campus.",
    highlights: ["Short North Arts District", "Columbus Zoo & Aquarium", "North Market", "Franklin Park Conservatory", "German Village"],
    tip: "Short North on a Saturday morning is perfect. Columbus Museum of Art is worth a visit.",
    url: "https://www.experiencecolumbus.com",
  },
  {
    name:     "Kings Island",
    drive:    "45 min",
    distance: "50 mi",
    icon:     "ribbon-outline" as const,
    category: "Family / Thrills",
    color:    "#F5A623",
    desc:     "One of the Midwest's best amusement parks. World-class roller coasters including The Beast (longest wooden coaster in the world), plus a full waterpark. Season passes are a great deal.",
    highlights: ["The Beast roller coaster", "Orion (giga coaster)", "Soak City Waterpark", "Planet Snoopy (kids)"],
    tip: "Buy tickets online — always cheaper. Season passes pay for themselves in 2 visits. Best days: Tuesday/Wednesday.",
    url: "https://www.visitkingsisland.com",
  },
  {
    name:     "Cincinnati",
    drive:    "1 hr",
    distance: "55 mi",
    icon:     "restaurant-outline" as const,
    category: "City Day Trip",
    color:    "#D0021B",
    desc:     "Cincinnati has excellent food (chili, skyline), the Newport Aquarium, Cincinnati Art Museum (free), American Sign Museum, and the Bengals/Reds if games are in season.",
    highlights: ["Cincinnati Art Museum (free)", "Findlay Market", "Newport Aquarium", "Over-the-Rhine neighborhood", "Eden Park"],
    tip: "Free parking at Eden Park on weekends. Try Skyline Chili — it's Cincinnati's thing.",
    url: "https://www.visitcincinnati.com",
  },
  {
    name:     "Cedar Point",
    drive:    "2 hr",
    distance: "160 mi",
    icon:     "flash-outline" as const,
    category: "Family / Thrills",
    color:    "#9B59B6",
    desc:     "America's roller coaster capital. 17 coasters including Top Thrill 2 and Millennium Force. Worth the drive for any thrill-seeker. Plan a full day or weekend.",
    highlights: ["Top Thrill 2", "Millennium Force", "Dragster", "Cedar Point Shores Waterpark"],
    tip: "Stay on-site for early entry access. Bring a cooler to the adjacent parking — no food restrictions in the lot.",
    url: "https://www.cedarpoint.com",
  },
  {
    name:     "Indiana Dunes",
    drive:    "2 hr 30 min",
    distance: "175 mi",
    icon:     "sunny-outline" as const,
    category: "Nature & Outdoors",
    color:    "#F5A623",
    desc:     "National park on Lake Michigan's southern shore. Sandy beaches, towering dunes, and excellent hiking. Feels like a beach vacation without flying. Best May–September.",
    highlights: ["Mount Baldy (sand dune)", "West Beach swimming", "Cowles Bog Trail", "Sleeping Bear Dunes day trip"],
    tip: "National Park Pass gets you in free. West Beach parking fills by 10am on summer weekends.",
    url: "https://www.nps.gov/indu",
  },
  {
    name:     "Clifton Gorge & John Bryan State Park",
    drive:    "30 min",
    distance: "25 mi",
    icon:     "trail-sign-outline" as const,
    category: "Nature & Outdoors",
    color:    "#417505",
    desc:     "A hidden gem right next to Yellow Springs. Dramatic limestone gorge carved by the Little Miami River. Some of the best hiking in Ohio — technical trails with beautiful scenery.",
    highlights: ["Clifton Gorge Nature Preserve", "John Bryan State Park trails", "Little Miami River views", "Narrows Reserve"],
    tip: "Combine with Yellow Springs for a perfect full-day outing. Trails are moderate — good for older kids.",
    url: "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/john-bryan-state-park",
  },
];

const CATEGORIES = ["All", "Nature & Outdoors", "City Day Trip", "Family / Thrills", "Nature & Quirky"];

export default function DayTripsScreen() {
  const [activeFilter, setActiveFilter] = useState("All");

  const visible = activeFilter === "All"
    ? TRIPS
    : TRIPS.filter(t => t.category === activeFilter);

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <Text style={s.lead}>
          Living in Dayton puts you within 2.5 hours of some incredible destinations.
          Here are the best day trips from your new home base.
        </Text>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.pill, activeFilter === cat && s.pillActive]}
              onPress={() => setActiveFilter(cat)}
            >
              <Text style={[s.pillText, activeFilter === cat && s.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {visible.map(trip => (
          <View key={trip.name} style={s.card}>
            <View style={s.cardTop}>
              <View style={[s.iconBox, { backgroundColor: trip.color + "20" }]}>
                <Ionicons name={trip.icon} size={22} color={trip.color} />
              </View>
              <View style={s.cardTopText}>
                <Text style={s.cardName}>{trip.name}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.cardMetaItem}>🚗 {trip.drive}</Text>
                  <Text style={s.cardMetaItem}>📍 {trip.distance}</Text>
                </View>
              </View>
              <View style={[s.categoryTag, { backgroundColor: trip.color + "15" }]}>
                <Text style={[s.categoryTagText, { color: trip.color }]}>{trip.category}</Text>
              </View>
            </View>

            <Text style={s.cardDesc}>{trip.desc}</Text>

            <Text style={s.highlightsLabel}>Don't Miss</Text>
            {trip.highlights.map(h => (
              <Text key={h} style={s.highlight}>• {h}</Text>
            ))}

            <View style={s.tipBox}>
              <Ionicons name="bulb-outline" size={14} color={Colors.gold} />
              <Text style={s.tipText}>{trip.tip}</Text>
            </View>

            <TouchableOpacity
              style={s.linkBtn}
              onPress={() => Linking.openURL(trip.url)}
              activeOpacity={0.8}
            >
              <Ionicons name="open-outline" size={14} color={Colors.gold} />
              <Text style={s.linkBtnText}>Plan Your Visit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  lead: { color: Colors.gray, fontSize: 14, lineHeight: 20, marginBottom: 14 },

  filterRow: { marginBottom: 16 },
  pill:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  pillActive:{ backgroundColor: Colors.black, borderColor: Colors.black },
  pillText:  { color: Colors.gray, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: Colors.gold },

  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop:     { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  iconBox:     { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTopText: { flex: 1 },
  cardName:    { fontWeight: "800", fontSize: 16, color: Colors.black },
  cardMeta:    { flexDirection: "row", gap: 10, marginTop: 2 },
  cardMetaItem:{ color: Colors.gray, fontSize: 12 },
  categoryTag: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  categoryTagText: { fontSize: 10, fontWeight: "700" },

  cardDesc: { color: Colors.black, fontSize: 14, lineHeight: 20, marginBottom: 10 },

  highlightsLabel: { fontWeight: "700", fontSize: 12, color: Colors.gray, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  highlight:       { color: Colors.black, fontSize: 13, lineHeight: 19, marginBottom: 2 },

  tipBox:  {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#FFFBF0", borderRadius: 8, padding: 10, marginTop: 10, marginBottom: 10,
  },
  tipText: { flex: 1, color: Colors.black, fontSize: 13, lineHeight: 18 },

  linkBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  linkBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },
});
