import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import employers from "../content/employers.json";

interface Employer {
  id:        string;
  name:      string;
  industry:  string;
  employees: string;
  address:   string;
  nearestNeighborhoods: string[];
  avgCommute: string;
  mapsUrl:   string;
}

export default function EmployerMapScreen() {
  const typed = employers as Employer[];

  return (
    <>
    <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Dayton Employer Map</Text>
        <Text style={styles.introBody}>
          Tap an employer to see nearby neighborhoods and commute estimates.
          Live map integration available via Google Maps API.
        </Text>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={40} color={Colors.grayLight} />
        <Text style={styles.mapTitle}>Interactive Map</Text>
        <Text style={styles.mapBody}>
          Integrate Google Maps or Mapbox to show employer pins and commute
          radii. Add your API key to api/config.ts to activate.
        </Text>
      </View>

      {/* Employer list */}
      <Text style={styles.listHeading}>Major Employers</Text>

      {typed.map((emp) => (
        <View key={emp.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Ionicons name="business" size={20} color={Colors.gold} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.empName}>{emp.name}</Text>
              <Text style={styles.empIndustry}>{emp.industry}</Text>
            </View>
            <View style={styles.empSizeBadge}>
              <Text style={styles.empSizeText}>{emp.employees}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Address */}
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(emp.mapsUrl)}
            activeOpacity={0.75}
          >
            <Ionicons name="location-outline" size={15} color={Colors.gold} />
            <Text style={styles.infoText}>{emp.address}</Text>
            <Ionicons name="open-outline" size={13} color={Colors.grayLight} />
          </TouchableOpacity>

          {/* Commute */}
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={15} color={Colors.gold} />
            <Text style={styles.infoText}>Avg commute: <Text style={styles.infoHighlight}>{emp.avgCommute}</Text></Text>
          </View>

          {/* Nearest neighborhoods */}
          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={15} color={Colors.gold} />
            <Text style={styles.infoText}>Near: {emp.nearestNeighborhoods.join(", ")}</Text>
          </View>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => router.push("/(tabs)/explore")}
            activeOpacity={0.85}
          >
            <Text style={styles.searchBtnText}>Search Homes Nearby</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.black} />
          </TouchableOpacity>
        </View>
      ))}

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaText}>
          Not seeing your employer? We cover all of the Dayton metro.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/(tabs)/contact")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Ask an Agent</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
    <AppTabBar />
    <ChatFAB />
    </>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20 },
  intro:   { marginBottom: 20 },
  introTitle: { color: Colors.black, fontSize: 20, fontWeight: "800", marginBottom: 8 },
  introBody:  { color: Colors.gray, fontSize: 14, lineHeight: 20 },
  mapPlaceholder: {
    backgroundColor: Colors.offWhite, borderRadius: 16,
    padding: 28, alignItems: "center", marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed",
  },
  mapTitle: { color: Colors.black, fontWeight: "700", fontSize: 15, marginTop: 10, marginBottom: 6 },
  mapBody:  { color: Colors.gray, fontSize: 13, textAlign: "center", lineHeight: 19 },
  listHeading: {
    color: Colors.black, fontWeight: "800", fontSize: 16,
    marginBottom: 14, letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  cardIconBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: Colors.black, alignItems: "center", justifyContent: "center",
  },
  cardHeaderText: { flex: 1 },
  empName:         { color: Colors.black, fontWeight: "700", fontSize: 15 },
  empIndustry:     { color: Colors.gray, fontSize: 12, marginTop: 2 },
  empSizeBadge: {
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.border,
  },
  empSizeText: { color: Colors.gray, fontSize: 11, fontWeight: "600" },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 8,
  },
  infoText:      { color: Colors.gray, fontSize: 13, flex: 1 },
  infoHighlight: { color: Colors.black, fontWeight: "700" },
  searchBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 10,
    paddingVertical: 10, marginTop: 10,
  },
  searchBtnText: { color: Colors.black, fontWeight: "700", fontSize: 13 },
  cta: {
    backgroundColor: Colors.black, borderRadius: 14, padding: 20,
    alignItems: "center", borderWidth: 1, borderColor: Colors.goldDark,
  },
  ctaText:    { color: Colors.grayLight, fontSize: 13, textAlign: "center", marginBottom: 14, lineHeight: 19 },
  ctaBtn:     { backgroundColor: Colors.gold, paddingVertical: 11, paddingHorizontal: 24, borderRadius: 10 },
  ctaBtnText: { color: Colors.black, fontWeight: "700", fontSize: 14 },
});
