/**
 * SaveButton — reusable bookmark/save icon for tools, events, listings.
 *
 * - Logged in:  toggles save/unsave in Supabase via AuthContext
 * - Guest:      shows an alert nudging them to sign up
 */

import { useState } from "react";
import { TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { Colors } from "../theme/colors";
import type { SavedItem } from "../auth/AuthContext";

interface SaveButtonProps {
  itemType: SavedItem["item_type"];
  itemId:   string;
  title:    string;
  subtitle?: string;
  route?:   string;
  size?:    number;
  /** Light variant — white icon (for use over dark/photo backgrounds) */
  light?:   boolean;
}

export default function SaveButton({
  itemType, itemId, title, subtitle, route,
  size = 22, light = false,
}: SaveButtonProps) {
  const { user, isSaved, saveItem, unsaveItem } = useAuth();
  const [busy, setBusy] = useState(false);

  const saved = isSaved(itemType, itemId);

  async function handlePress() {
    if (!user) {
      Alert.alert(
        "Sign In to Save",
        "Create a free profile to bookmark tools, save homes, and get personalized tips from Chris.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Sign In",  onPress: () => router.push("/auth/login"  as any) },
          { text: "Sign Up",  onPress: () => router.push("/auth/signup" as any) },
        ]
      );
      return;
    }

    setBusy(true);
    try {
      if (saved) {
        await unsaveItem(itemType, itemId);
      } else {
        await saveItem({
          item_type: itemType,
          item_id:   itemId,
          title,
          subtitle:  subtitle ?? null,
          route:     route    ?? null,
          metadata:  null,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <ActivityIndicator
        size="small"
        color={light ? Colors.white : Colors.gold}
        style={{ width: size, height: size }}
      />
    );
  }

  const iconName = saved
    ? "bookmark"
    : "bookmark-outline";

  const iconColor = saved
    ? Colors.gold
    : light
      ? "rgba(255,255,255,0.75)"
      : Colors.grayLight;

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.btn}
      activeOpacity={0.7}
    >
      <Ionicons name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
});
