import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LeadCaptureForm from "../../shared/components/LeadCaptureForm";
import { Colors } from "../../shared/theme/colors";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";

// ── Paste your YouTube video ID here when ready ───────────────────────────────
// e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ the ID is "dQw4w9WgXcQ"
const CHRIS_VIDEO_ID = "";

const CONTACT_METHODS = [
  { icon: "call-outline",   label: "Call / Text", value: "(937) 241-3484", action: () => Linking.openURL("tel:+19372413484") },
  { icon: "mail-outline",   label: "Email",       value: "Chris@cjohio.com", action: () => Linking.openURL("mailto:Chris@cjohio.com") },
  { icon: "logo-instagram", label: "Instagram",   value: "@daytonrelo",   action: () => Linking.openURL("https://instagram.com/daytonrelo") },
];

const BIO_HIGHLIGHTS = [
  { icon: "home-outline",             label: "15 Years Real Estate Experience" },
  { icon: "shield-checkmark-outline", label: "U.S. Army · Iraq War Veteran · 9 Years" },
  { icon: "trending-up-outline",      label: "7-Figure Entrepreneur & Sales Strategist" },
];

export default function ContactScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />
      <BrandHeader
          left={<BackBtn onPress={() => router.back()} />}
          right={<HeaderActions />}
        />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* ── Hero agent card — centered portrait layout ─────────── */}
        <View style={styles.heroCard}>
          {/* Top gold bar */}
          <View style={styles.heroAccent} />

          {/* Centered photo */}
          <View style={styles.photoSection}>
            <View style={styles.photoWrapper}>
              <Image
                source={require("../../assets/images/headshot.jpg")}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.photoBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.black} />
              </View>
            </View>
          </View>

          {/* Name + title */}
          <View style={styles.heroNameBlock}>
            <Text style={styles.heroName}>Chris Jurgens</Text>
            <Text style={styles.heroTitle}>Licensed Ohio Realtor · Team Flory · eXp Realty</Text>
            <View style={styles.contactBtns}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL("tel:+19372413484")}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={14} color={Colors.black} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.textBtn}
                onPress={() => Linking.openURL("sms:+19372413484")}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" size={14} color={Colors.gold} />
                <Text style={styles.textBtnText}>Text</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Highlight pillars — 2x2 grid */}
          <View style={styles.highlights}>
            {BIO_HIGHLIGHTS.map(({ icon, label }) => (
              <View key={label} style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={icon as any} size={15} color={Colors.gold} />
                </View>
                <Text style={styles.highlightText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick contact methods ─────────────────────────────── */}
        <View style={styles.methodsRow}>
          {CONTACT_METHODS.map(({ icon, label, value, action }) => (
            <TouchableOpacity
              key={label}
              style={styles.methodBtn}
              onPress={action}
              activeOpacity={0.8}
            >
              <Ionicons name={icon as any} size={22} color={Colors.gold} />
              <Text style={styles.methodLabel}>{label}</Text>
              <Text style={styles.methodValue} numberOfLines={1}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── YouTube video — above the bio ────────────────────── */}
        <View style={styles.videoSection}>
          <View style={styles.videoLabelRow}>
            <View style={styles.videoLabelBar} />
            <Text style={styles.videoLabel}>Meet Chris</Text>
          </View>

          {CHRIS_VIDEO_ID ? (
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${CHRIS_VIDEO_ID}`)}
              activeOpacity={0.88}
            >
              <Image
                source={{ uri: `https://img.youtube.com/vi/${CHRIS_VIDEO_ID}/hqdefault.jpg` }}
                style={styles.videoThumb}
                resizeMode="cover"
              />
              <View style={styles.videoOverlay}>
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={28} color={Colors.black} />
                </View>
              </View>
              <View style={styles.videoFooter}>
                <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                <Text style={styles.videoFooterText}>Watch Introduction</Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Placeholder shown until video ID is added */
            <View style={styles.videoPlaceholder}>
              <View style={styles.playBtnGray}>
                <Ionicons name="play" size={30} color={Colors.gold} />
              </View>
              <Text style={styles.videoPlaceholderTitle}>Introduction Video</Text>
              <Text style={styles.videoPlaceholderSub}>Coming soon — add your YouTube video ID to go live</Text>
            </View>
          )}
        </View>

        {/* ── Bio ──────────────────────────────────────────────── */}
        <View style={styles.bioCard}>
          <View style={styles.bioTitleRow}>
            <View style={styles.bioTitleBar} />
            <Text style={styles.bioTitle}>About Chris</Text>
          </View>

          <Text style={styles.bioPara}>
            Chris Jurgens is a Dayton-based Realtor, U.S. Army Iraq War veteran, and 7-figure entrepreneur with 15 years of real estate experience. He brings a rare combination of discipline, business strategy, and hands-on expertise to every deal — trained by industry leaders like Gary Vaynerchuk, Daymond John, and Matt Higgins.
          </Text>

          <Text style={styles.bioPara}>
            Chris works with buyers, sellers, and investors across Dayton, Centerville, Beavercreek, Springboro, and Kettering. With a background in construction and operations, he helps clients spot issues before inspections, find off-market deals, and make smarter decisions — with aggressive marketing and sharp negotiation every step of the way.
          </Text>

        </View>

        {/* ── Divider ───────────────────────────────────────────── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>send a message</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Lead capture form ─────────────────────────────────── */}
        <LeadCaptureForm />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.black },
  header: {
    backgroundColor: Colors.black, paddingHorizontal: 20,
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLogo:  { width: 160, height: 48, flex: 1, },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll:      { flex: 1, backgroundColor: Colors.white },
  content:     { padding: 20 },

  // ── Hero card — centered portrait ───────────────────────────
  heroCard: {
    backgroundColor: Colors.black,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    overflow: "hidden",
    alignItems: "center",
  },
  heroAccent: {
    height: 4,
    backgroundColor: Colors.gold,
    width: "100%",
  },
  photoSection: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 16,
  },
  photoWrapper: {
    position: "relative",
  },
  photo: {
    width: 150,
    height: 180,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  photoBadge: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.black,
  },
  heroNameBlock: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 6,
  },
  heroName: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  heroTitle: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  contactBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "800",
  },
  textBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  textBtnText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "800",
  },
  highlights: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  highlightText: {
    color: Colors.grayLight,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Contact methods ───────────────────────────────────────────
  methodsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  methodBtn: {
    flex: 1, alignItems: "center", backgroundColor: Colors.offWhite,
    borderRadius: 12, padding: 14, gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  methodLabel: { color: Colors.gray,  fontSize: 11, fontWeight: "600" },
  methodValue: { color: Colors.black, fontSize: 11, fontWeight: "500", textAlign: "center" },

  // ── YouTube video ─────────────────────────────────────────────
  videoSection: { marginBottom: 20 },
  videoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  videoLabelBar: {
    width: 4, height: 18, borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  videoLabel: {
    color: Colors.black, fontSize: 15, fontWeight: "800",
  },
  videoCard: {
    borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.black,
  },
  videoThumb: { width: "100%", height: 210 },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    bottom: 44,
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  videoFooter: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.black,
  },
  videoFooterText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  // Placeholder when no video ID is set
  videoPlaceholder: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  playBtnGray: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#E8E8E8",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.gold,
    marginBottom: 4,
  },
  videoPlaceholderTitle: {
    color: Colors.black, fontSize: 15, fontWeight: "700",
  },
  videoPlaceholderSub: {
    color: Colors.gray, fontSize: 12, textAlign: "center",
    paddingHorizontal: 30,
  },

  // ── Bio card ─────────────────────────────────────────────────
  bioCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  bioTitleBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  bioTitle: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  bioPara: {
    color: "#333",
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 14,
  },
  bioQuoteBox: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 18,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  bioQuote: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 8,
  },
  bioQuoteAttr: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.gray, fontSize: 12 },
});
