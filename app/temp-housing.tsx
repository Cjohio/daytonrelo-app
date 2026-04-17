import { useEffect, useState } from "react";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from "react-native";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import { supabase } from "../lib/supabase";

type HousingType = "extended_stay" | "furnished_apt" | "corporate_housing";

interface TempHousing {
  id: string;
  name: string;
  address: string | null;
  city: string;
  housing_type: HousingType;
  nightly_rate_min: number | null;
  nightly_rate_max: number | null;
  amenities: string[];
  booking_url: string | null;
  phone: string | null;
  description: string | null;
  is_featured: boolean;
}

const TYPE_LABELS: Record<HousingType, string> = {
  extended_stay:    "Extended Stay Hotel",
  furnished_apt:    "Furnished Apartment",
  corporate_housing:"Corporate Housing",
};

const TYPE_COLORS: Record<HousingType, string> = {
  extended_stay:    "#4A90D9",
  furnished_apt:    "#F5A623",
  corporate_housing:"#7ED321",
};

// Fallback data if Supabase is empty / offline
const FALLBACK: TempHousing[] = [
  {
    id: "1", name: "Homewood Suites Beavercreek", address: "2750 Fairfield Commons Blvd",
    city: "Beavercreek", housing_type: "extended_stay",
    nightly_rate_min: 129, nightly_rate_max: 179,
    amenities: ["WiFi", "Kitchen", "Parking", "Pool", "Breakfast"],
    booking_url: "https://www.hilton.com", phone: null,
    description: "Full kitchen suites. Weekly/monthly rates. 10 min from WPAFB.", is_featured: true,
  },
  {
    id: "2", name: "Extended Stay America – Dayton", address: "7571 Brandt Pike",
    city: "Huber Heights", housing_type: "extended_stay",
    nightly_rate_min: 79, nightly_rate_max: 109,
    amenities: ["WiFi", "Kitchen", "Parking", "Pet Friendly"],
    booking_url: "https://www.extendedstayamerica.com", phone: null,
    description: "Budget-friendly weekly rates. Great for 30–90 day stays.", is_featured: true,
  },
  {
    id: "3", name: "Residence Inn Beavercreek", address: "2779 Fairfield Commons Blvd",
    city: "Beavercreek", housing_type: "extended_stay",
    nightly_rate_min: 149, nightly_rate_max: 199,
    amenities: ["WiFi", "Kitchen", "Parking", "Pool", "Gym", "Breakfast"],
    booking_url: "https://www.marriott.com", phone: null,
    description: "Marriott property. Full kitchens, 10 min from WPAFB and L3Harris.", is_featured: false,
  },
];

export default function TempHousingScreen() {
  const [listings, setListings] = useState<TempHousing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<HousingType | "all">("all");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("temp_housing")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order");
      setListings(data && data.length > 0 ? (data as TempHousing[]) : FALLBACK);
      setLoading(false);
    }
    load();
  }, []);

  const filters: Array<{ key: HousingType | "all"; label: string }> = [
    { key: "all",             label: "All" },
    { key: "extended_stay",   label: "Extended Stay" },
    { key: "furnished_apt",   label: "Furnished Apt" },
    { key: "corporate_housing",label: "Corporate" },
  ];

  const visible = filter === "all" ? listings : listings.filter(l => l.housing_type === filter);

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.intro}>
          <Text style={s.introText}>
            Bridge the gap between your old home and new one. These options are
            vetted for corporate relocators and PCS families in the Dayton area.
          </Text>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterPill, filter === f.key && s.filterPillActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
        ) : visible.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="bed-outline" size={40} color={Colors.border} />
            <Text style={s.emptyText}>No listings in this category yet.</Text>
          </View>
        ) : (
          visible.map(item => (
            <View key={item.id} style={[s.card, item.is_featured && s.cardFeatured]}>
              {item.is_featured && (
                <View style={s.featuredBadge}>
                  <Text style={s.featuredText}>⭐ Chris Recommends</Text>
                </View>
              )}
              <View style={s.cardHeader}>
                <View style={[s.typeTag, { backgroundColor: TYPE_COLORS[item.housing_type] + "20" }]}>
                  <Text style={[s.typeTagText, { color: TYPE_COLORS[item.housing_type] }]}>
                    {TYPE_LABELS[item.housing_type]}
                  </Text>
                </View>
              </View>
              <Text style={s.cardName}>{item.name}</Text>
              {item.address && (
                <Text style={s.cardAddr}>{item.address}, {item.city}</Text>
              )}
              {item.description && (
                <Text style={s.cardDesc}>{item.description}</Text>
              )}
              {(item.nightly_rate_min || item.nightly_rate_max) && (
                <Text style={s.cardRate}>
                  ${item.nightly_rate_min}–${item.nightly_rate_max}/night · Ask for weekly/monthly rates
                </Text>
              )}
              {item.amenities && item.amenities.length > 0 && (
                <View style={s.amenities}>
                  {item.amenities.map(a => (
                    <View key={a} style={s.amenityPill}>
                      <Text style={s.amenityText}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={s.cardActions}>
                {item.booking_url && (
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() => Linking.openURL(item.booking_url!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="open-outline" size={14} color={Colors.black} />
                    <Text style={s.actionBtnText}>Book / View</Text>
                  </TouchableOpacity>
                )}
                {item.phone && (
                  <TouchableOpacity
                    style={[s.actionBtn, s.actionBtnSecondary]}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call-outline" size={14} color={Colors.gold} />
                    <Text style={s.actionBtnSecText}>{item.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={s.tip}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.gold} />
          <Text style={s.tipText}>
            Ask Chris for his preferred extended-stay contacts — he can sometimes negotiate
            corporate rates for clients in transition.
          </Text>
        </View>
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  intro: {
    backgroundColor: "#EEF4FF", borderRadius: 12, padding: 14, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: "#4A90D9",
  },
  introText: { color: "#1A3A5C", fontSize: 14, lineHeight: 20 },

  filterRow:    { marginBottom: 14 },
  filterContent:{ gap: 8, paddingRight: 16 },
  filterPill:   {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  filterPillActive: { backgroundColor: Colors.black, borderColor: Colors.black },
  filterText:       { color: Colors.gray, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: Colors.gold },

  empty:     { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { color: Colors.gray, fontSize: 15 },

  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardFeatured: { borderColor: Colors.gold, borderWidth: 1.5 },
  featuredBadge:{ marginBottom: 8 },
  featuredText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },
  cardHeader:   { marginBottom: 6 },
  typeTag:      { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  typeTagText:  { fontSize: 11, fontWeight: "700" },
  cardName:     { fontWeight: "800", fontSize: 16, color: Colors.black, marginBottom: 2 },
  cardAddr:     { color: Colors.gray, fontSize: 13, marginBottom: 6 },
  cardDesc:     { color: Colors.black, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  cardRate:     { color: Colors.gold, fontWeight: "700", fontSize: 13, marginBottom: 8 },
  amenities:    { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  amenityPill:  { backgroundColor: "#F5F5F5", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  amenityText:  { fontSize: 11, color: Colors.black },
  cardActions:  { flexDirection: "row", gap: 10 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  actionBtnText:      { color: Colors.black, fontWeight: "700", fontSize: 13 },
  actionBtnSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.gold },
  actionBtnSecText:   { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  tip: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#FFFBF0", borderRadius: 12, padding: 14, marginTop: 8,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },
  tipText: { flex: 1, color: Colors.black, fontSize: 13, lineHeight: 19 },
});
