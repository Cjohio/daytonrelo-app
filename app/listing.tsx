import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Image, FlatList,
  TouchableOpacity, StyleSheet, Linking, Platform,
  ActivityIndicator, Dimensions, Alert, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import { trestleApi } from "../api/trestle";
import { Listing, formatPrice, formatAddress } from "../shared/types/listing";
import { useAuth } from "../shared/auth/AuthContext";
import { track } from "../shared/analytics";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Chris's real contact info ────────────────────────────────────────────────
const CHRIS_PHONE = "9372413484";

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ListingDetailScreen() {
  const { mlsId } = useLocalSearchParams<{ mlsId: string }>();
  const { user, isSaved, saveItem, unsaveItem } = useAuth();

  const [listing,    setListing]    = useState<Listing | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!mlsId) { setError("No listing ID provided."); setLoading(false); return; }
    trestleApi.getListing(mlsId)
      .then((data) => {
        setListing(data);
        track("listing_viewed", {
          mlsId,
          listPrice: data?.listPrice ?? null,
          city:      data?.address?.city ?? null,
          beds:      data?.property?.bedrooms ?? null,
          baths:     data?.property?.bathsFull ?? null,
        });
      })
      .catch(() => setError("Could not load this listing. Check your SimplyRETS credentials."))
      .finally(() => setLoading(false));
  }, [mlsId]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={s.loadingText}>Loading listing…</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.grayLight} />
        <Text style={s.errorTitle}>Listing Unavailable</Text>
        <Text style={s.errorBody}>{error ?? "Listing not found."}</Text>
        <TouchableOpacity style={s.errorBack} onPress={() => router.back()}>
          <Text style={s.errorBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const photos = listing.photos?.length > 0
    ? listing.photos
    : ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"];

  const beds      = listing.property.bedrooms;
  const baths     = listing.property.bathsFull + listing.property.bathsHalf * 0.5;
  const sqft      = listing.property.area?.toLocaleString() ?? "—";
  const yearBuilt = listing.property.yearBuilt;
  const daysOnMarket = Math.max(0, Math.floor(
    (Date.now() - new Date(listing.listDate).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const fullAddress = formatAddress(listing.address);
  const saved = isSaved("listing", listing.mlsId);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleShare() {
    const price   = listing ? `${formatPrice(listing.listPrice)} · ` : "";
    const beds_b  = listing ? `${listing.property.bedrooms}bd/${listing.property.bathsFull}ba · ` : "";
    const sqftStr = listing?.property.area ? `${listing.property.area.toLocaleString()} sqft · ` : "";
    await Share.share({
      title:   `${fullAddress} — Dayton Relo`,
      message: `Check out this home in Dayton!\n\n${fullAddress}\n${price}${beds_b}${sqftStr}\n\nFound on Dayton Relo — contact Chris Jurgens: (937) 241-3484`,
    });
  }

  function handleSave() {
    if (!user) {
      Alert.alert(
        "Save This Home",
        "Create a free profile to save listings and get notified of price drops.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Sign Up Free", onPress: () => router.push("/auth/signup" as any) },
        ]
      );
      return;
    }
    if (!listing) return;
    if (saved) {
      unsaveItem("listing", listing.mlsId);
    } else {
      saveItem({
        item_type: "listing",
        item_id:   listing.mlsId,
        title:     fullAddress,
        subtitle:  formatPrice(listing.listPrice),
        route:     null,
        metadata:  null,
      });
    }
  }

  function scheduleTour() {
    const msg = encodeURIComponent(
      `Hi Chris! I'm interested in scheduling a tour of ${fullAddress}. Is that possible?`
    );
    // iOS requires &body=, Android requires ?body=
    const smsUrl = Platform.OS === "ios"
      ? `sms:+1${CHRIS_PHONE}&body=${msg}`
      : `sms:+1${CHRIS_PHONE}?body=${msg}`;

    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(smsUrl);
        // Fallback: show options if SMS isn't available
        Alert.alert(
          "Schedule a Tour",
          `Contact Chris to schedule a tour of ${fullAddress}`,
          [
            { text: "Call Chris", onPress: () => Linking.openURL(`tel:+1${CHRIS_PHONE}`) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      })
      .catch(() => {
        Alert.alert(
          "Schedule a Tour",
          "Contact Chris at (937) 241-3484 to schedule a tour.",
          [
            { text: "Call Now", onPress: () => Linking.openURL(`tel:+1${CHRIS_PHONE}`) },
            { text: "OK", style: "cancel" },
          ]
        );
      });
  }

  function callChris() {
    Linking.openURL(`tel:+1${CHRIS_PHONE}`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      {/* ── Photo gallery ────────────────────────────────────────────────── */}
      <View style={s.gallery}>
        <FlatList
          data={photos}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
          }
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={s.photo} resizeMode="cover" />
          )}
        />

        {/* Status badge top-left */}
        <View style={s.statusBadge}>
          <Text style={s.statusBadgeText}>{listing.status}</Text>
        </View>

        {/* Photo counter top-right */}
        <View style={s.photoCounter}>
          <Ionicons name="images-outline" size={12} color={Colors.white} />
          <Text style={s.photoCounterText}>{photoIndex + 1} / {photos.length}</Text>
        </View>

        {/* Share + Heart bottom-right */}
        <View style={s.photoActions}>
          <TouchableOpacity
            style={s.heartBtn}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.heartBtn, saved && s.heartBtnSaved]}
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={20}
              color={saved ? "#E53935" : Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Dot indicators */}
        {photos.length > 1 && (
          <View style={s.dots}>
            {photos.slice(0, 9).map((_, i) => (
              <View key={i} style={[s.dot, i === photoIndex && s.dotActive]} />
            ))}
          </View>
        )}
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Price + days on market */}
        <View style={s.priceRow}>
          <Text style={s.price}>{formatPrice(listing.listPrice)}</Text>
          <View style={[s.domBadge, daysOnMarket <= 7 && s.domBadgeNew]}>
            <Ionicons
              name="time-outline"
              size={12}
              color={daysOnMarket <= 7 ? "#166534" : Colors.gray}
            />
            <Text style={[s.domText, daysOnMarket <= 7 && s.domTextNew]}>
              {daysOnMarket === 0 ? "Listed today" : `${daysOnMarket}d on market`}
            </Text>
          </View>
        </View>

        {/* Address */}
        <Text style={s.address}>{fullAddress}</Text>

        {/* Stats bar */}
        <View style={s.statsBar}>
          <StatPill icon="bed-outline"      value={`${beds}`}  label="Beds"  />
          <View style={s.statDivider} />
          <StatPill icon="water-outline"    value={`${baths}`} label="Baths" />
          <View style={s.statDivider} />
          <StatPill icon="resize-outline"   value={sqft}       label="Sq Ft" />
          {yearBuilt ? (
            <>
              <View style={s.statDivider} />
              <StatPill icon="calendar-outline" value={`${yearBuilt}`} label="Built" />
            </>
          ) : null}
        </View>

        {/* Description */}
        {listing.remarks ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About This Home</Text>
            <Text style={s.remarks}>{listing.remarks}</Text>
          </View>
        ) : null}

        {/* Property details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Property Details</Text>
          <DetailRow label="Type"     value={listing.property.type}   />
          {listing.property.style       ? <DetailRow label="Style"    value={listing.property.style} /> : null}
          {listing.property.garageSpaces ? <DetailRow label="Garage"  value={`${listing.property.garageSpaces} spaces`} /> : null}
          {listing.property.lotSize      ? <DetailRow label="Lot Size" value={`${listing.property.lotSize.toLocaleString()} sq ft`} /> : null}
          <DetailRow label="MLS #"    value={`#${listing.mlsId}`}     />
        </View>

        {/* Schools */}
        {listing.schools && Object.values(listing.schools).some(Boolean) ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Schools</Text>
            {listing.schools.district   ? <DetailRow label="District"    value={listing.schools.district} /> : null}
            {listing.schools.elementary ? <DetailRow label="Elementary"  value={listing.schools.elementary} /> : null}
            {listing.schools.middle     ? <DetailRow label="Middle"      value={listing.schools.middle} /> : null}
            {listing.schools.high       ? <DetailRow label="High School" value={listing.schools.high} /> : null}
          </View>
        ) : null}

        {/* Listed by */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Listed By</Text>
          <Text style={s.agentName}>
            {listing.listAgent.firstName} {listing.listAgent.lastName}
          </Text>
          {listing.listOffice?.name
            ? <Text style={s.agentOffice}>{listing.listOffice.name}</Text>
            : null}
        </View>

        {/* Chris CTA card */}
        <View style={s.chrisCard}>
          <View style={s.chrisCardLeft}>
            <Ionicons name="person-circle" size={36} color={Colors.gold} />
            <View>
              <Text style={s.chrisName}>Chris Jurgens</Text>
              <Text style={s.chrisSub}>Dayton Relocation Specialist</Text>
            </View>
          </View>
          <Text style={s.chrisBody}>
            Have questions about this home or the neighborhood? Chris is your local expert.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky CTA bar ────────────────────────────────────────────────── */}
      <View style={s.ctaBar}>
        <TouchableOpacity style={s.callBtn} onPress={callChris} activeOpacity={0.85}>
          <Ionicons name="call-outline" size={20} color={Colors.gold} />
          <Text style={s.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tourBtn} onPress={scheduleTour} activeOpacity={0.85}>
          <Ionicons name="calendar-outline" size={18} color={Colors.black} />
          <Text style={s.tourBtnText}>Schedule a Tour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatPill({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={16} color={Colors.gold} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // Loading / error
  center:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  loadingText: { color: Colors.gray, fontSize: 14, marginTop: 8 },
  errorTitle:  { fontSize: 18, fontWeight: "800", color: Colors.black },
  errorBody:   { fontSize: 14, color: Colors.gray, textAlign: "center", lineHeight: 20 },
  errorBack: {
    marginTop: 8, backgroundColor: Colors.gold, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  errorBackText: { color: Colors.black, fontWeight: "700", fontSize: 14 },

  // Gallery
  gallery:  { height: 280, position: "relative" },
  photo:    { width: SCREEN_W, height: 280 },
  statusBadge: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: Colors.black,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7,
  },
  statusBadgeText: { color: Colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  photoCounter: {
    position: "absolute", top: 14, right: 14,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  photoCounterText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  photoActions: {
    position: "absolute", bottom: 14, right: 14,
    flexDirection: "row", gap: 8,
  },
  heartBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  heartBtnSaved: { backgroundColor: "rgba(255,255,255,0.92)" },
  dots: {
    position: "absolute", bottom: 14,
    left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5,
  },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { width: 18, backgroundColor: Colors.white },

  // Body
  scroll:   { flex: 1 },
  content:  { padding: 20 },

  priceRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  price: { fontSize: 28, fontWeight: "900", color: Colors.black },
  domBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.offWhite, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  domBadgeNew: { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" },
  domText:    { fontSize: 12, color: Colors.gray,   fontWeight: "600" },
  domTextNew: { fontSize: 12, color: "#166534",     fontWeight: "700" },
  address:    { fontSize: 14, color: Colors.gray, lineHeight: 21, marginBottom: 18 },

  // Stats bar
  statsBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.offWhite, borderRadius: 14,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  statPill:    { flex: 1, alignItems: "center", gap: 4 },
  statValue:   { fontSize: 18, fontWeight: "900", color: Colors.black },
  statLabel:   { fontSize: 11, color: Colors.gray, textAlign: "center" },
  statDivider: { width: 1, height: 38, backgroundColor: Colors.border },

  // Section
  section:      { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: Colors.black,
    letterSpacing: 1.2, textTransform: "uppercase",
    marginBottom: 14, borderLeftWidth: 3,
    borderLeftColor: Colors.gold, paddingLeft: 10,
  },
  remarks: { fontSize: 14, color: Colors.gray, lineHeight: 22 },

  detailRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailLabel: { fontSize: 13, color: Colors.gray },
  detailValue: { fontSize: 13, color: Colors.black, fontWeight: "600", maxWidth: "55%", textAlign: "right" },

  agentName:   { fontSize: 14, fontWeight: "700", color: Colors.black },
  agentOffice: { fontSize: 12, color: Colors.gray, marginTop: 3 },

  // Chris card
  chrisCard: {
    backgroundColor: Colors.black, borderRadius: 16,
    padding: 18, marginBottom: 4,
    borderWidth: 1, borderColor: Colors.goldDark,
  },
  chrisCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  chrisName:  { color: Colors.white, fontWeight: "800", fontSize: 15 },
  chrisSub:   { color: Colors.gray, fontSize: 12, marginTop: 2 },
  chrisBody:  { color: Colors.grayLight, fontSize: 13, lineHeight: 19 },

  // Sticky CTA
  ctaBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 12,
  },
  callBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, height: 52, borderRadius: 12,
    backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.goldDark,
  },
  callBtnText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
  tourBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 12, height: 52,
  },
  tourBtnText: { fontSize: 16, fontWeight: "800", color: Colors.black },
});
