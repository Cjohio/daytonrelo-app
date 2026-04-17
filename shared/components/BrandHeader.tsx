import React from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

interface Props {
  /** Left slot — pass a back button, switch button, or null */
  left?:  React.ReactNode;
  /** Right slot — pass HeaderActions, a search icon, or null */
  right?: React.ReactNode;
  /** Set to true if the parent SafeAreaView already handles the top inset */
  noTopInset?: boolean;
}

/**
 * Shared branded header: [left] [CENTERED LOGO] [right]
 * Automatically pads for the status bar / notch unless noTopInset is passed.
 */
export default function BrandHeader({ left, right, noTopInset = false }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = noTopInset ? 10 : insets.top + 10;
  return (
    <View style={[s.bar, { paddingTop: topPad }]}>
      {/* Left slot — fixed width so logo stays centered */}
      <View style={s.side}>{left ?? <View />}</View>

      {/* Centered logo */}
      <Image
        source={require("../../assets/images/logo-black.png")}
        style={s.logo}
        resizeMode="contain"
      />

      {/* Right slot */}
      <View style={[s.side, s.sideRight]}>{right ?? <View />}</View>
    </View>
  );
}

/** Convenience: a gold chevron-back button */
export function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.iconBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="chevron-back" size={24} color={Colors.gold} />
    </TouchableOpacity>
  );
}

/** Convenience: the "Switch Path" button used on hub screens */
export function SwitchBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.switchBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="swap-horizontal-outline" size={16} color={Colors.gold} />
      <Text style={s.switchText}>Switch</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:    "row",
    alignItems:       "center",
    justifyContent:   "space-between",
    backgroundColor:  Colors.black,
    paddingHorizontal: 12,
    paddingBottom:    10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldDark,
  },
  side: {
    width: 72,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  logo: {
    width: 160,
    height: 46,
  },
  iconBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  switchText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
