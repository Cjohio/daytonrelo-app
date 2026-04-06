// Floating chat button — appears bottom-right on every screen.
// Tapping opens the DaytonBot chat tab.
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Colors } from "../theme/colors";

interface ChatFABProps {
  /** Extra bottom offset — pass tab bar height when on a screen with a tab bar */
  extraBottom?: number;
}

export default function ChatFAB({ extraBottom = 0 }: ChatFABProps) {
  const insets  = useSafeAreaInsets();
  const current = usePathname();

  // Don't show on the chat screen itself
  if (current === "/(tabs)/chat") return null;

  const bottom = Math.max(insets.bottom, 10) + extraBottom + 16;

  return (
    <TouchableOpacity
      style={[s.fab, { bottom }]}
      onPress={() => router.push("/(tabs)/chat" as any)}
      activeOpacity={0.85}
    >
      <View style={s.inner}>
        <Ionicons name="chatbubble-ellipses" size={22} color={Colors.black} />
      </View>
      {/* Pulse ring */}
      <View style={s.ring} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  fab: {
    position:  "absolute",
    right:     20,
    width:     52,
    height:    52,
    alignItems:     "center",
    justifyContent: "center",
    zIndex:    999,
  },
  inner: {
    width:          52,
    height:         52,
    borderRadius:   26,
    backgroundColor: Colors.gold,
    alignItems:     "center",
    justifyContent: "center",
    shadowColor:    "#000",
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.25,
    shadowRadius:   8,
    elevation:      10,
  },
  ring: {
    position:        "absolute",
    width:           62,
    height:          62,
    borderRadius:    31,
    borderWidth:     2,
    borderColor:     Colors.gold,
    opacity:         0.3,
  },
});
