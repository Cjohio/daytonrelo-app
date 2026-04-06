import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface QuickActionTileProps {
  title:    string;
  subtitle: string;
  icon:     IoniconName;
  onPress:  () => void;
}

export default function QuickActionTile({
  title,
  subtitle,
  icon,
  onPress,
}: QuickActionTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={styles.tile}
    >
      {/* Gold icon in a subtle dark circle */}
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={26} color={Colors.gold} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Gold bottom accent bar */}
      <View style={styles.accent} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.black,
    borderRadius: 16,
    padding: 18,
    flex: 1,
    minHeight: 140,
    // Gold border subtlety
    borderWidth: 1,
    borderColor: "#1A1A1A",
    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Shadow (Android)
    elevation: 6,
    overflow: "hidden",
  },
  iconWrapper: {
    backgroundColor: "#1C1C1C",
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 12,
    lineHeight: 17,
  },
  accent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.gold,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});
