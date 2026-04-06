import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../shared/theme/colors";

const TAB_BAR_STYLE = {
  backgroundColor:  Colors.white,
  borderTopWidth:   1,
  borderTopColor:   Colors.border,
  height:           64,
  paddingBottom:    10,
  paddingTop:       6,
  shadowColor:      Colors.gold,
  shadowOffset:     { width: 0, height: -2 },
  shadowOpacity:    0.08,
  shadowRadius:     8,
  elevation:        12,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor:   Colors.gold,
        tabBarInactiveTintColor: Colors.gray,
        tabBarLabelStyle: {
          fontSize:      11,
          fontWeight:    "600",
          letterSpacing: 0.3,
          marginTop:     2,
        },
      }}
    >
      {/* Hidden — landing screen, not in tab bar */}
      <Tabs.Screen name="index"   options={{ href: null }} />
      {/* Hidden — accessed via tools, not in tab bar */}
      <Tabs.Screen name="eats"    options={{ href: null }} />
      {/* Hidden — accessed via header icon, not tab bar */}
      <Tabs.Screen name="profile" options={{ href: null }} />

      {/* ── Visible tabs ─────────────────────────────────────── */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Search",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size} color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "apps" : "apps-outline"}
              size={size} color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size} color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={size} color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "call" : "call-outline"}
              size={size} color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
