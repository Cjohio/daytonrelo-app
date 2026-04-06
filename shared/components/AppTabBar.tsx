// Shared bottom tab bar — rendered on hub screens (Stack screens) so they
// match the visual language of the tab navigator.
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Colors } from "../theme/colors";

const TABS = [
  {
    label:      "Neighborhoods",
    icon:       "location-outline"       as const,
    activeIcon: "location"              as const,
    route:      "/(tabs)/explore",
  },
  {
    label:      "Tools",
    icon:       "apps-outline"           as const,
    activeIcon: "apps"                  as const,
    route:      "/(tabs)/tools",
  },
  {
    label:      "Chat",
    icon:       "chatbubble-ellipses-outline" as const,
    activeIcon: "chatbubble-ellipses"   as const,
    route:      "/(tabs)/chat",
  },
  {
    label:      "Contact",
    icon:       "person-outline"         as const,
    activeIcon: "person"                as const,
    route:      "/(tabs)/contact",
  },
];

export default function AppTabBar() {
  const insets  = useSafeAreaInsets();
  const current = usePathname();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map(({ label, icon, activeIcon, route }) => {
        const active = current === route || current.startsWith(route);
        return (
          <TouchableOpacity
            key={label}
            style={s.tab}
            onPress={() => router.push(route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? activeIcon : icon}
              size={22}
              color={active ? Colors.gold : Colors.gray}
            />
            <Text style={[s.label, active && s.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:   "row",
    backgroundColor: Colors.white,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
    paddingTop:      6,
    shadowColor:     Colors.gold,
    shadowOffset:    { width: 0, height: -2 },
    shadowOpacity:   0.08,
    shadowRadius:    8,
    elevation:       12,
  },
  tab: {
    flex:           1,
    alignItems:     "center",
    gap:            2,
  },
  label: {
    fontSize:    11,
    fontWeight:  "600",
    letterSpacing: 0.3,
    color:       Colors.gray,
    marginTop:   2,
  },
  labelActive: {
    color: Colors.gold,
  },
});
