import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Listing, formatPrice, formatAddress } from "../types/listing";
import { Colors } from "../theme/colors";
import { useAuth } from "../auth/AuthContext";

const CHRIS_PHONE = "9372413484";

interface ListingCardProps {
  listing:  Listing;
  onPress:  () => void;
  compact?: boolean;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80";

export default function ListingCard({
  listing,
  onPress,
  compact,
}: ListingCardProps) {
  const { user, isSaved, saveItem, unsaveItem } = useAuth();
  const photo   = listing.photos?.[0] ?? PLACEHOLDER_IMAGE;
  const beds    = listing.property.bedrooms;
  const baths   = listing.property.bathsFull + listing.property.bathsHalf * 0.5;
  const sqft    = listing.property.area?.toLocaleString() ?? "—";
  const mlsId   = listing.mlsId.toString();
  const saved   = isSaved("listing", mlsId);

  function handleScheduleTour() {
    const address = formatAddress(listing.address);
    const msg = encodeURIComponent(
      `Hi Chris! I'm interested in scheduling a tour of ${address}. Is that possible?`
    );
    Linking.openURL(`sms:+1${CHRIS_PHONE}?body=${msg}`);
  }

  function handleSave() {
    if (!user) {
      Alert.alert(
        "Save Listings",
        "Create a free profile to save homes and get notified of price drops.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Sign Up", onPress: () => router.push("/auth/signup" as any) },
        ]
      );
      return;
    }
    if (saved) {
      unsaveItem("listing", mlsId);
    } else {
      saveItem({
        item_type: "listing",
        item_id:   mlsId,
        title:     formatAddress(listing.address),
        subtitle:  formatPrice(listing.listPrice),
        route:     null,
        metadata:  null,
      });
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, compact && styles.cardCompact]}
    >
      {/* Photo */}
      <Image
        source={{ uri: photo }}
        style={[styles.photo, compact && styles.photoCompact]}
        resizeMode="cover"
      />

      {/* Status badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{listing.status}</Text>
      </View>

      {/* Save / heart button */}
      <TouchableOpacity
        style={[styles.heartBtn, saved && styles.heartBtnActive]}
        onPress={handleSave}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={saved ? "heart" : "heart-outline"}
          size={18}
          color={saved ? "#E53935" : Colors.white}
        />
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.price}>{formatPrice(listing.listPrice)}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {formatAddress(listing.address)}
        </Text>

        {/* Specs row */}
        <View style={styles.specs}>
          <Spec icon="bed-outline"       value={`${beds} bd`}   />
          <Spec icon="water-outline"     value={`${baths} ba`}  />
          <Spec icon="resize-outline"    value={`${sqft} sf`}   />
        </View>

        {/* Schedule Tour button (hidden in compact mode) */}
        {!compact && (
          <TouchableOpacity
            style={styles.tourBtn}
            onPress={(e) => { e.stopPropagation?.(); handleScheduleTour(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={15} color={Colors.black} />
            <Text style={styles.tourBtnText}>Schedule a Tour</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function Spec({ icon, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; value: string }) {
  return (
    <View style={styles.spec}>
      <Ionicons name={icon} size={13} color={Colors.gray} />
      <Text style={styles.specText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    width: 240,
    marginRight: 12,
    marginBottom: 0,
  },
  photo: {
    width: "100%",
    height: 200,
  },
  photoCompact: {
    height: 150,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  info: {
    padding: 16,
  },
  price: {
    color: Colors.black,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  address: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 12,
  },
  specs: {
    flexDirection: "row",
    gap: 16,
  },
  spec: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    color: Colors.gray,
    fontSize: 13,
  },
  tourBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.gold,
  },
  tourBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
});
