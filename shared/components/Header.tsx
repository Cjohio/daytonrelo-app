import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";

interface HeaderProps {
  showBack?:   boolean;
  onBack?:     () => void;
  rightIcon?:  React.ComponentProps<typeof Ionicons>["name"];
  onRightPress?: () => void;
  subtitle?:   string;
}

export default function Header({
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  subtitle,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Left — back button or spacer */}
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center — wordmark */}
      <View style={styles.center}>
        <Text style={styles.logo}>Dayton Relo</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* Right — optional action */}
      <View style={styles.side}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={22} color={Colors.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    flexDirection:   "row",
    alignItems:      "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    // Bottom gold divider
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldDark,
  },
  side: {
    width: 44,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    color:       Colors.gold,
    fontSize:    24,
    fontWeight:  "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  subtitle: {
    color:     Colors.grayLight,
    fontSize:  11,
    letterSpacing: 1,
    marginTop: 2,
  },
  iconBtn: {
    padding: 4,
  },
});
