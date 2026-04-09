import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Colors } from "../theme/colors";

interface GoldButtonProps {
  label:      string;
  onPress:    () => void;
  loading?:   boolean;
  disabled?:  boolean;
  variant?:   "filled" | "outline";
  style?:     ViewStyle;
}

export default function GoldButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "filled",
  style,
}: GoldButtonProps) {
  const isFilled = variant === "filled";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isFilled ? styles.filled : styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? Colors.black : Colors.gold} />
      ) : (
        <Text style={[styles.label, isFilled ? styles.labelFilled : styles.labelOutline]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: {
    backgroundColor: Colors.gold,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  labelFilled: {
    color: Colors.black,
  },
  labelOutline: {
    color: Colors.gold,
  },
});
