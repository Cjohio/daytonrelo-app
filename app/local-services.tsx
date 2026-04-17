import { useEffect, useState } from "react";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../shared/theme/colors";
import { supabase } from "../lib/supabase";
import SaveButton from "../shared/components/SaveButton";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

interface LocalService {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  website: string | null;
  neighborhood: string | null;
  description: string | null;
  is_featured: boolean;
  logo?: number | null; // local require() asset
}

type Category = { key: string; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] };

const CATEGORIES: Category[] = [
  { key: "all",        label: "All",           icon: "apps-outline" },
  { key: "mover",      label: "Movers",        icon: "cube-outline" },
  { key: "plumber",    label: "Plumbing",      icon: "water-outline" },
  { key: "electrician",label: "Electric",      icon: "flash-outline" },
  { key: "hvac",       label: "HVAC",          icon: "thermometer-outline" },
  { key: "cleaner",    label: "Cleaning",      icon: "sparkles-outline" },
  { key: "handyman",   label: "Handyman",      icon: "build-outline" },
  { key: "contractor", label: "Contractor",    icon: "hammer-outline" },
  { key: "painter",    label: "Painter",       icon: "color-palette-outline" },
  { key: "landscaper", label: "Landscaping",   icon: "leaf-outline" },
];

// Fallback if Supabase has no data yet
const FALLBACK: LocalService[] = [
  { id: "1", name: "Two Men and a Truck – Dayton", category: "mover",       phone: "(937) 291-7161", website: "https://www.twomenandatruck.com", neighborhood: "Citywide", description: "Full-service moving. Chris's go-to for PCS and corporate moves.", is_featured: true },
  { id: "2", name: "Dayton Moving & Storage",       category: "mover",       phone: "(937) 254-3636", website: "https://daytonmoving.com",         neighborhood: "Citywide", description: "Family-owned. Specializes in military and corporate relocations.", is_featured: true },
  { id: "7", name: "Bluebird Construction",          category: "contractor",  phone: "(937) 315-1532", website: "https://bluebirdohio.com",         neighborhood: "New Carlisle / Dayton area", description: "Residential remodeling and construction with 18+ years of experience. Full-service from roofing, siding, and decks to kitchens, baths, and basements. Known for quality craftsmanship and on-time delivery.", is_featured: true, logo: require("../assets/images/bluebird-construction-logo.png") },
  { id: "3", name: "Roto-Rooter Dayton",             category: "plumber",     phone: "(937) 222-3030", website: "https://www.rotorooter.com",        neighborhood: "Citywide", description: "24/7 plumbing and drain service.", is_featured: false },
  { id: "4", name: "ARS / Rescue Rooter Dayton",     category: "hvac",        phone: "(937) 401-5050", website: "https://www.ars.com",               neighborhood: "Citywide", description: "Heating, cooling, and plumbing. Good for new homeowners.", is_featured: false },
  { id: "5", name: "Merry Maids Dayton",              category: "cleaner",     phone: "(937) 277-9993", website: "https://www.merrymaids.com",        neighborhood: "Citywide", description: "Move-in/move-out cleaning. Bonded and insured.", is_featured: false },
  { id: "6", name: "Mr. Electric of Dayton",          category: "electrician", phone: "(937) 401-0037", website: "https://www.mrelectric.com",        neighborhood: "Citywide", description: "Licensed electricians for panel upgrades, outlets, and inspections.", is_featured: false },
];

export default function LocalServicesScreen() {
  const [services, setServices] = useState<LocalService[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("local_services")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order");
      setServices(data && data.length > 0 ? (data as LocalService[]) : FALLBACK);
      setLoading(false);
    }
    load();
  }, []);

  const visible = filter === "all" ? services : services.filter(s => s.category === filter);

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.intro}>
          <Ionicons name="star-outline" size={18} color={Colors.gold} />
          <Text style={s.introText}>
            Chris-curated local services for new Dayton residents. These are providers
            he has personally worked with or received strong client feedback on.
          </Text>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[s.pill, filter === cat.key && s.pillActive]}
              onPress={() => setFilter(cat.key)}
            >
              <Ionicons name={cat.icon} size={13} color={filter === cat.key ? Colors.gold : Colors.gray} />
              <Text style={[s.pillText, filter === cat.key && s.pillTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
        ) : visible.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="construct-outline" size={40} color={Colors.border} />
            <Text style={s.emptyText}>No listings in this category yet.</Text>
            <Text style={s.emptySubText}>Check back soon — Chris is adding more.</Text>
          </View>
        ) : (
          visible.map(svc => (
            <View key={svc.id} style={[s.card, svc.is_featured && s.cardFeatured]}>
              {svc.is_featured && (
                <Text style={s.featuredLabel}>⭐ Chris Recommends</Text>
              )}
              {svc.logo ? (
                <Image source={svc.logo} style={s.cardLogo} resizeMode="contain" />
              ) : null}
              <View style={s.cardHeader}>
                {!svc.logo && <Text style={s.cardName}>{svc.name}</Text>}
                {svc.neighborhood && (
                  <View style={s.locationTag}>
                    <Ionicons name="location-outline" size={11} color={Colors.gray} />
                    <Text style={s.locationText}>{svc.neighborhood}</Text>
                  </View>
                )}
              </View>
              {svc.description && (
                <Text style={s.cardDesc}>{svc.description}</Text>
              )}
              <View style={s.actions}>
                {svc.phone && (
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() => Linking.openURL(`tel:${svc.phone!.replace(/\D/g, "")}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call-outline" size={14} color={Colors.black} />
                    <Text style={s.actionBtnText}>{svc.phone}</Text>
                  </TouchableOpacity>
                )}
                {svc.website && (
                  <TouchableOpacity
                    style={[s.actionBtn, s.actionBtnOutline]}
                    onPress={() => Linking.openURL(svc.website!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="open-outline" size={14} color={Colors.gold} />
                    <Text style={s.actionBtnOutlineText}>Website</Text>
                  </TouchableOpacity>
                )}
                <SaveButton
                  itemType="page"
                  itemId={`service-${svc.id}`}
                  title={svc.name}
                  subtitle={svc.category}
                  route="/local-services"
                  size={22}
                />
              </View>
            </View>
          ))
        )}

        <View style={s.suggest}>
          <Text style={s.suggestTitle}>Know a great local service?</Text>
          <Text style={s.suggestBody}>
            Contact Chris to recommend a business for this list.
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
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#FFFBF0", borderRadius: 12, padding: 14, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },
  introText: { flex: 1, color: Colors.black, fontSize: 13, lineHeight: 19 },

  filterRow: { marginBottom: 14 },
  pill:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  pillActive:{ backgroundColor: Colors.black, borderColor: Colors.black },
  pillText:  { color: Colors.gray, fontSize: 12, fontWeight: "600" },
  pillTextActive: { color: Colors.gold },

  empty:       { alignItems: "center", paddingTop: 50, gap: 8 },
  emptyText:   { color: Colors.black, fontSize: 15, fontWeight: "600" },
  emptySubText:{ color: Colors.gray, fontSize: 13 },

  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardFeatured:  { borderColor: Colors.gold, borderWidth: 1.5 },
  featuredLabel: { color: Colors.gold, fontSize: 12, fontWeight: "700", marginBottom: 6 },
  cardLogo:      { width: "70%", height: 44, marginBottom: 10, alignSelf: "flex-start" },
  cardHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 },
  cardName:      { fontWeight: "700", fontSize: 15, color: Colors.black, flex: 1 },
  locationTag:   { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText:  { color: Colors.gray, fontSize: 12 },
  cardDesc:      { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  actions:       { flexDirection: "row", gap: 8, alignItems: "center" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.gold, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  actionBtnText:    { color: Colors.black, fontWeight: "700", fontSize: 13 },
  actionBtnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.gold },
  actionBtnOutlineText: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  suggest: {
    marginTop: 16, padding: 14, backgroundColor: "#F5F5F5", borderRadius: 12,
    alignItems: "center",
  },
  suggestTitle: { fontWeight: "700", fontSize: 14, color: Colors.black, marginBottom: 4 },
  suggestBody:  { color: Colors.gray, fontSize: 13, textAlign: "center" },
});
