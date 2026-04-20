import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, Image, Modal, TextInput, KeyboardAvoidingView,
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
import { API_CONFIG } from "../api/config";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Chris's real contact info ────────────────────────────────────────────────
const CHRIS_PHONE = "9372413484";

// ─── Showing time slots (mirrors website) ────────────────────────────────────
const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM",  "1:30 PM",  "2:00 PM",  "2:30 PM",
  "3:00 PM",  "3:30 PM",  "4:00 PM",  "4:30 PM",
  "5:00 PM",  "5:30 PM",  "6:00 PM",
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ListingDetailScreen() {
  const { mlsId } = useLocalSearchParams<{ mlsId: string }>();
  const { user, isSaved, saveItem, unsaveItem } = useAuth();

  const [listing,    setListing]    = useState<Listing | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const galleryRef = useRef<ScrollView>(null);

  // ── Showing form modal ───────────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false);
  const [formName,    setFormName]    = useState("");
  const [formPhone,   setFormPhone]   = useState("");
  const [formDate,    setFormDate]    = useState("");
  const [formTime,    setFormTime]    = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
      .catch(() => setError("Could not load this listing. It may have been removed from the MLS."))
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
  const THUMB_SIZE = 64;

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

  function openShowingModal() {
    setSubmitState("idle");
    setFormName(""); setFormPhone(""); setFormDate("");
    setFormTime(""); setFormMessage("");
    setShowModal(true);
  }

  async function submitShowing() {
    if (!formName.trim() || !formPhone.trim()) {
      Alert.alert("Required Fields", "Please enter your name and phone number.");
      return;
    }
    setSubmitState("sending");
    try {
      const payload = {
        name:          formName.trim(),
        phone:         formPhone.trim(),
        preferredDate: formDate.trim(),
        preferredTime: formTime,
        message:       formMessage.trim(),
        source:        `showing-${listing?.mlsId ?? "app"}`,
        property:      fullAddress,
        listPrice:     listing ? formatPrice(listing.listPrice) : "",
        submittedAt:   new Date().toISOString(),
      };

      // Fire to Zapier / Lofty CRM webhook
      const webhookURL = API_CONFIG.crm.webhookURL;
      if (webhookURL) {
        await fetch(webhookURL, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
      }

      track("showing_requested", { mlsId: listing?.mlsId, listPrice: listing?.listPrice });
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  }

  function callChris() {
    Linking.openURL(`tel:+1${CHRIS_PHONE}`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />

      {/* ── Single outer scroll — gallery + thumbnails + content all inside ── */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo gallery */}
        <View style={s.gallery}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={s.galleryScroll}
            onMomentumScrollEnd={(e) =>
              setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
            }
          >
            {photos.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={s.photo} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Status badge */}
          <View style={s.statusBadge}>
            <Text style={s.statusBadgeText}>{listing.status}</Text>
          </View>

          {/* Photo counter */}
          <View style={s.photoCounter}>
            <Ionicons name="images-outline" size={12} color={Colors.white} />
            <Text style={s.photoCounterText}>{photoIndex + 1} / {photos.length}</Text>
          </View>

          {/* Share + Heart */}
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

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.thumbList}
            contentContainerStyle={s.thumbStrip}
          >
            {photos.slice(0, 10).map((photo, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                onPress={() => {
                  setPhotoIndex(index);
                  galleryRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
                }}
                activeOpacity={0.8}
                style={[s.thumb, index === photoIndex && s.thumbActive]}
              >
                <Image source={{ uri: photo }} style={s.thumbImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Content ────────────────────────────────────────────────────── */}
        <View style={s.content}>
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
            {listing.property.style        ? <DetailRow label="Style"    value={listing.property.style} /> : null}
            {listing.property.garageSpaces ? <DetailRow label="Garage"   value={`${listing.property.garageSpaces} spaces`} /> : null}
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
        </View>
      </ScrollView>

      {/* ── Sticky CTA bar ────────────────────────────────────────────────── */}
      <View style={s.ctaBar}>
        <TouchableOpacity style={s.callBtn} onPress={callChris} activeOpacity={0.85}>
          <Ionicons name="call-outline" size={20} color={Colors.gold} />
          <Text style={s.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.tourBtn} onPress={openShowingModal} activeOpacity={0.85}>
          <Ionicons name="calendar-outline" size={18} color={Colors.black} />
          <Text style={s.tourBtnText}>Schedule a Tour</Text>
        </TouchableOpacity>
      </View>

      {/* ── Showing request modal ──────────────────────────────────────────── */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setShowModal(false)} />

          <View style={s.modalSheet}>
            {/* Header */}
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>Schedule a Showing</Text>
                <Text style={s.modalSub} numberOfLines={1}>{fullAddress}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            {submitState === "sent" ? (
              /* ── Success state ── */
              <View style={s.successWrap}>
                <View style={s.successIcon}>
                  <Ionicons name="checkmark" size={32} color={Colors.gold} />
                </View>
                <Text style={s.successTitle}>Request Sent!</Text>
                <Text style={s.successBody}>
                  Chris will confirm your{formDate ? ` ${formDate}` : ""}{formTime ? ` at ${formTime}` : ""} showing shortly.{"\n"}You can also reach him at (937) 241-3484.
                </Text>
                <TouchableOpacity style={s.successBtn} onPress={() => setShowModal(false)}>
                  <Text style={s.successBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── Form ── */
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Name */}
                <Text style={s.fieldLabel}>Your Name *</Text>
                <TextInput
                  style={s.input}
                  placeholder="First and last name"
                  placeholderTextColor={Colors.grayLight}
                  value={formName}
                  onChangeText={setFormName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />

                {/* Phone */}
                <Text style={s.fieldLabel}>Phone Number *</Text>
                <TextInput
                  style={s.input}
                  placeholder="(937) 555-0000"
                  placeholderTextColor={Colors.grayLight}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />

                {/* Preferred date */}
                <Text style={s.fieldLabel}>Preferred Date</Text>
                <TextInput
                  style={s.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={Colors.grayLight}
                  value={formDate}
                  onChangeText={setFormDate}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                />

                {/* Time slot chips */}
                <Text style={s.fieldLabel}>Preferred Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeRow}>
                  {TIME_SLOTS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[s.timeChip, formTime === t && s.timeChipActive]}
                      onPress={() => setFormTime(formTime === t ? "" : t)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.timeChipText, formTime === t && s.timeChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Message */}
                <Text style={s.fieldLabel}>Message (optional)</Text>
                <TextInput
                  style={[s.input, s.inputMulti]}
                  placeholder="Any questions about the home or anything Chris should know?"
                  placeholderTextColor={Colors.grayLight}
                  value={formMessage}
                  onChangeText={setFormMessage}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                />

                {/* Submit */}
                <TouchableOpacity
                  style={[s.submitBtn, submitState === "sending" && s.submitBtnDisabled]}
                  onPress={submitShowing}
                  disabled={submitState === "sending"}
                  activeOpacity={0.85}
                >
                  {submitState === "sending" ? (
                    <ActivityIndicator size="small" color={Colors.black} />
                  ) : (
                    <>
                      <Ionicons name="calendar-outline" size={18} color={Colors.black} />
                      <Text style={s.submitBtnText}>Request a Showing</Text>
                    </>
                  )}
                </TouchableOpacity>

                {submitState === "error" && (
                  <Text style={s.errorMsg}>
                    Something went wrong. Please call or text Chris at (937) 241-3484.
                  </Text>
                )}

                <View style={{ height: 32 }} />
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Gallery — fixed height block, lives inside the outer ScrollView
  gallery:       { width: SCREEN_W, height: 280, overflow: "hidden" },
  galleryScroll: { width: SCREEN_W, height: 280 },
  photo:         { width: SCREEN_W, height: 280 },
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

  // Thumbnail strip
  thumbList:  { height: 72 },
  thumbStrip: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  thumb: {
    width: 64, height: 48, borderRadius: 8, overflow: "hidden",
    borderWidth: 2, borderColor: "transparent",
  },
  thumbActive: { borderColor: Colors.gold },
  thumbImg:    { width: 64, height: 48 },

  // Outer scroll + content
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

  // Showing modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    maxHeight: "88%",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  modalHeader: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.black },
  modalSub:   { fontSize: 12, color: Colors.gray, marginTop: 2, maxWidth: SCREEN_W - 100 },

  // Form fields
  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.gray,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: Colors.offWhite ?? "#F8F8F6",
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.black,
  },
  inputMulti: { height: 80, textAlignVertical: "top", paddingTop: 12 },

  // Time chips
  timeRow:         { paddingVertical: 2, gap: 8 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.offWhite ?? "#F8F8F6",
  },
  timeChipActive:  { backgroundColor: Colors.gold, borderColor: Colors.gold },
  timeChipText:    { fontSize: 13, color: Colors.gray,  fontWeight: "600" },
  timeChipTextActive: { color: Colors.black, fontWeight: "700" },

  // Submit button
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.gold, borderRadius: 12,
    height: 52, marginTop: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: "800", color: Colors.black },
  errorMsg: { fontSize: 13, color: "#E53935", textAlign: "center", marginTop: 12, lineHeight: 19 },

  // Success
  successWrap: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  successIcon: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.gold + "22",
    borderWidth: 2, borderColor: Colors.gold,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  successTitle: { fontSize: 20, fontWeight: "800", color: Colors.black, marginBottom: 8 },
  successBody:  { fontSize: 14, color: Colors.gray, textAlign: "center", lineHeight: 21, marginBottom: 24 },
  successBtn: {
    backgroundColor: Colors.gold, borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 14,
  },
  successBtnText: { fontSize: 15, fontWeight: "800", color: Colors.black },

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
