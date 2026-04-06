import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../auth/AuthContext";
import { Colors } from "../theme/colors";
import GlobalSearch from "./GlobalSearch";

/**
 * Drop-in replacement for <GlobalSearch /> that includes
 * a profile icon on the left and the search icon on the right.
 * Use this in every header's top-right actions area.
 */
export default function HeaderActions() {
  const { user } = useAuth();

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.iconBtn}
        onPress={() => router.push("/(tabs)/profile" as any)}
      >
        <Ionicons
          name={user ? "person-circle" : "person-circle-outline"}
          size={24}
          color={user ? Colors.gold : Colors.gold}
        />
      </TouchableOpacity>
      <GlobalSearch />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
