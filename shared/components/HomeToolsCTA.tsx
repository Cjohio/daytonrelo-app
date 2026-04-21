/**
 * HomeToolsCTA — slim bottom-of-screen banner linking users to:
 *   • Browse Homes        → /(tabs)/explore
 *   • Mortgage Calculator → /mortgage-calculator
 *
 * Used at the bottom of property-adjacent screens in the Dayton Resident
 * hub (/discover, /neighborhoods, /schools) to give residents a low-friction
 * jump into home browsing and affordability tools without pulling them out
 * of the content they're reading.
 *
 * Visual: black card, gold accents, two equal-weight pill buttons.
 */
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../theme/colors";

interface Props {
  /** Optional override for the headline. */
  title?:    string;
  /** Optional override for the subheadline. */
  subtitle?: string;
}

export default function HomeToolsCTA({
  title    = "Home Tools",
  subtitle = "Browse active listings or run the mortgage numbers",
}: Props) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.iconWrap}>
          <Ionicons name="home" size={16} color={Colors.gold} />
        </View>
        <View style={s.textCol}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.sub}>{subtitle}</Text>
        </View>
      </View>

      <View style={s.btnRow}>
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.push("/(tabs)/explore" as any)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Browse homes for sale"
        >
          <Ionicons name="search-outline" size={14} color={Colors.black} />
          <Text style={s.btnText}>Browse Homes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnAlt]}
          onPress={() => router.push("/mortgage-calculator" as any)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open mortgage calculator"
        >
          <Ionicons name="calculator-outline" size={14} color={Colors.gold} />
          <Text style={s.btnTextAlt}>Mortgage Calculator</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical:   16,
    padding:          16,
    borderRadius:     14,
    backgroundColor:  Colors.black,
    borderWidth:      1,
    borderColor:      Colors.goldDark,
    gap:              12,
  },
  header: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
  },
  iconWrap: {
    width:           34,
    height:          34,
    borderRadius:    9,
    backgroundColor: "#1A1A1A",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },
  textCol: { flex: 1 },
  title: {
    color:      Colors.gold,
    fontSize:   14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  sub: {
    color:    Colors.grayLight,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  btnRow: {
    flexDirection: "row",
    gap:           8,
  },
  btn: {
    flex:            1,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             6,
    backgroundColor: Colors.gold,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius:    10,
  },
  btnText: {
    color:      Colors.black,
    fontSize:   12,
    fontWeight: "800",
  },
  btnAlt: {
    backgroundColor: "transparent",
    borderWidth:     1,
    borderColor:     Colors.goldDark,
  },
  btnTextAlt: {
    color:      Colors.gold,
    fontSize:   12,
    fontWeight: "800",
  },
});
