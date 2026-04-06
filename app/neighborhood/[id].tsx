import { useLocalSearchParams, useRouter } from "expo-router";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import YoutubePlayer from "react-native-youtube-iframe";
import { Colors } from "../../shared/theme/colors";
import AppTabBar from "../../shared/components/AppTabBar";
import ChatFAB from "../../shared/components/ChatFAB";
import neighborhoodsData from "../../content/neighborhoods.json";

// ─── Type Definitions ────────────────────────────────────────────────────────
type NeighborhoodStats = {
  population: string;
  growthRate: string;
  incomeTax: string;
  propertyTax: string;
  schoolRating: string;
  publicSchools: string;
  medianIncome: string;
  driveToDayton: string;
  ownerOccupied: string;
  parks: string;
  crimeIndex: string;
};

type Neighborhood = {
  id: string;
  name: string;
  tagline: string;
  medianPrice: number;
  avgRent: number;
  driveToWPAFB: string;
  schools: string;
  highlights: string[];
  zipCodes: string[];
  youtubeVideoId: string | null;
  lat: number;
  lng: number;
  stats?: NeighborhoodStats;
  overview?: string;
  schoolsDetail?: string;
  parksAttractions?: string;
  housingMarket?: string;
  funFacts?: string;
};

const neighborhoods = neighborhoodsData as Neighborhood[];

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NeighborhoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const hood = neighborhoods.find((n) => n.id === id);

  if (!hood) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Neighborhood not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const videoHeight = Math.round(width * (9 / 16));
  const mapHeight   = 220;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${hood.lng - 0.06},${hood.lat - 0.04},${hood.lng + 0.06},${hood.lat + 0.04}&layer=mapnik&marker=${hood.lat},${hood.lng}`;

  const medianPriceLabel = hood.medianPrice >= 1000
    ? `$${Math.round(hood.medianPrice / 1000)}K`
    : `$${hood.medianPrice}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{hood.name.toUpperCase()}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => Share.share({
            title: `${hood.name} — Dayton Relo`,
            message: `Check out ${hood.name} on Dayton Relo!\n\n📍 ${hood.tagline}\n💰 Median: $${hood.medianPrice.toLocaleString()} · Rent: $${hood.avgRent.toLocaleString()}/mo\n🚗 ${hood.driveToWPAFB} to WPAFB\n\nExplore with Chris Jurgens: (937) 241-3484\ndaytonrelo://neighborhood/${hood.id}`,
          })}
        >
          <Ionicons name="share-outline" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* ── Hero Stats Strip ── */}
        <View style={styles.heroStrip}>
          <HeroStat icon="home-outline"  label="Median Price" value={medianPriceLabel} />
          <View style={styles.heroDivider} />
          <HeroStat icon="car-outline"   label="To WPAFB"     value={hood.driveToWPAFB} />
          <View style={styles.heroDivider} />
          <HeroStat icon="cash-outline"  label="Avg Rent"     value={`$${hood.avgRent.toLocaleString()}`} />
        </View>

        {/* ── Tagline ── */}
        <View style={styles.section}>
          <Text style={styles.tagline}>{hood.tagline}</Text>
        </View>

        {/* ── Overview ── */}
        {hood.overview ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OVERVIEW</Text>
            <Text style={styles.bodyText}>{hood.overview}</Text>
          </View>
        ) : null}

        {/* ── By the Numbers ── */}
        {hood.stats ? (
          <View style={styles.section}>
            <View style={styles.byTheNumbersHeader}>
              <Text style={styles.byTheNumbersScript}>By the</Text>
              <Text style={styles.byTheNumbersTitle}>NUMBERS</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCircle label="TOTAL POPULATION" value={hood.stats.population} />
                <StatCircle label="5 YEAR GROWTH"    value={hood.stats.growthRate} />
                <StatCircle label="INCOME TAX"       value={hood.stats.incomeTax} />
              </View>
              <View style={styles.statsRow}>
                <StatCircle label="PROPERTY TAX"     value={hood.stats.propertyTax} />
                <StatCircle label="MEDIAN HOME"      value={medianPriceLabel} />
                <StatCircle label="SCHOOL RATING"    value={hood.stats.schoolRating} />
              </View>
              <View style={styles.statsRow}>
                <StatCircle label="PUBLIC SCHOOLS"   value={hood.stats.publicSchools} />
                <StatCircle label="MEDIAN INCOME"    value={hood.stats.medianIncome} />
                <StatCircle label="TO DAYTON"        value={hood.stats.driveToDayton} />
              </View>
              <View style={styles.statsRow}>
                <StatCircle label="OWNER OCCUPIED"   value={hood.stats.ownerOccupied} />
                <StatCircle label="PARKS"            value={hood.stats.parks} />
                <StatCircle label="CRIME INDEX"      value={hood.stats.crimeIndex} />
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Map ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <View style={[styles.mapWrapper, { height: mapHeight }]}>
            <WebView
              source={{ uri: mapUrl }}
              style={styles.map}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View style={styles.mapLabel}>
              <Ionicons name="location" size={12} color={Colors.white} />
              <Text style={styles.mapLabelText}>{hood.name}, Ohio</Text>
            </View>
          </View>
        </View>

        {/* ── Schools ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SCHOOLS</Text>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={18} color={Colors.gold} />
            <Text style={styles.infoText}>{hood.schools}</Text>
          </View>
          {hood.schoolsDetail ? (
            <Text style={[styles.bodyText, { marginTop: 10 }]}>{hood.schoolsDetail}</Text>
          ) : null}
        </View>

        {/* ── Parks & Attractions ── */}
        {hood.parksAttractions ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PARKS & ATTRACTIONS</Text>
            <Text style={styles.bodyText}>{hood.parksAttractions}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HIGHLIGHTS</Text>
            {hood.highlights.map((h, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Housing Market ── */}
        {hood.housingMarket ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOUSING MARKET</Text>
            <Text style={styles.bodyText}>{hood.housingMarket}</Text>
          </View>
        ) : null}

        {/* ── Fun Facts ── */}
        {hood.funFacts ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FUN FACTS</Text>
            <View style={styles.funFactsCard}>
              <Ionicons name="star-outline" size={18} color={Colors.gold} style={{ marginBottom: 8 }} />
              <Text style={styles.bodyText}>{hood.funFacts}</Text>
            </View>
          </View>
        ) : null}

        {/* ── ZIP Codes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ZIP CODES</Text>
          <View style={styles.zipRow}>
            {hood.zipCodes.map((z) => (
              <View key={z} style={styles.zipChip}>
                <Text style={styles.zipText}>{z}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── YouTube Video ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NEIGHBORHOOD TOUR</Text>
          {hood.youtubeVideoId ? (
            <View style={styles.videoWrapper}>
              <YoutubePlayer
                height={videoHeight}
                videoId={hood.youtubeVideoId}
                play={false}
              />
            </View>
          ) : (
            <View style={[styles.videoPlaceholder, { height: videoHeight }]}>
              <Ionicons name="videocam-outline" size={40} color={Colors.grayLight} />
              <Text style={styles.videoPlaceholderTitle}>Video Tour Coming Soon</Text>
              <Text style={styles.videoPlaceholderSub}>
                We're filming a neighborhood tour for {hood.name}. Check back soon!
              </Text>
            </View>
          )}
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/contact")}
        >
          <Text style={styles.ctaBtnText}>Ask About {hood.name}</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.black} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function HeroStat({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.heroStatBox}>
      <Ionicons name={icon} size={20} color={Colors.gold} />
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function StatCircle({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.circleContainer}>
      <Text style={styles.circleLabel}>{label}</Text>
      <View style={styles.circleRing}>
        <Text style={styles.circleValue} adjustsFontSizeToFit numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.black },
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 20 },
  centered:{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: Colors.gray, fontSize: 16 },
  backLink:  { color: Colors.gold, marginTop: 12, fontSize: 15 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.black,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  backBtn:     { padding: 4 },
  headerTitle: { color: Colors.gold, fontSize: 16, fontWeight: "900", letterSpacing: 2, flex: 1, textAlign: "center" },

  // Hero stats strip
  heroStrip: {
    flexDirection: "row", backgroundColor: Colors.black,
    paddingVertical: 16, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.goldDark,
  },
  heroStatBox:   { flex: 1, alignItems: "center", gap: 4 },
  heroStatValue: { color: Colors.white, fontSize: 16, fontWeight: "800" },
  heroStatLabel: { color: Colors.grayLight, fontSize: 10, letterSpacing: 0.5 },
  heroDivider:   { width: 1, backgroundColor: Colors.goldDark, marginVertical: 4 },

  // Sections
  section:      { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { color: Colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
  tagline:      { color: Colors.black, fontSize: 17, fontWeight: "600", lineHeight: 25 },
  bodyText:     { color: "#333", fontSize: 14, lineHeight: 22 },

  // By the Numbers header
  byTheNumbersHeader: { alignItems: "center", marginBottom: 20 },
  byTheNumbersScript: {
    fontStyle: "italic", color: Colors.goldDark, fontSize: 22,
    fontWeight: "400", letterSpacing: 0.5,
  },
  byTheNumbersTitle: {
    color: Colors.black, fontSize: 26, fontWeight: "900",
    letterSpacing: 3, marginTop: -4,
  },

  // Stats circles grid
  statsGrid: { gap: 16 },
  statsRow:  { flexDirection: "row", justifyContent: "space-between" },

  circleContainer: {
    flex: 1, alignItems: "center", paddingHorizontal: 2,
  },
  circleLabel: {
    color: Colors.black, fontSize: 8, fontWeight: "800",
    letterSpacing: 0.5, textAlign: "center", marginBottom: 6,
    textTransform: "uppercase",
  },
  circleRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: Colors.goldDark,
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.white,
    shadowColor: Colors.goldDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  circleValue: {
    color: Colors.goldDark, fontSize: 13, fontWeight: "900",
    textAlign: "center", paddingHorizontal: 4,
  },

  // Map
  mapWrapper: {
    borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
  },
  map: { flex: 1 },
  mapLabel: {
    position: "absolute", bottom: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  mapLabelText: { color: Colors.white, fontSize: 12, fontWeight: "600" },

  // Info row (schools icon + text)
  infoRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { color: Colors.black, fontSize: 14, flex: 1, lineHeight: 20 },

  // Bullet list (fallback highlights)
  bulletRow:  { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  bullet:     { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  bulletText: { color: Colors.black, fontSize: 14 },

  // Fun facts card
  funFactsCard: {
    backgroundColor: "#FFFBF0",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },

  // ZIP codes
  zipRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  zipChip: {
    backgroundColor: Colors.offWhite, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  zipText: { color: Colors.gray, fontSize: 13, fontWeight: "600" },

  // Video
  videoWrapper:     { borderRadius: 10, overflow: "hidden", marginTop: 4 },
  videoPlaceholder: {
    backgroundColor: Colors.offWhite, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border, gap: 10, marginTop: 4,
  },
  videoPlaceholderTitle: { color: Colors.black, fontSize: 15, fontWeight: "700" },
  videoPlaceholderSub:   { color: Colors.gray, fontSize: 13, textAlign: "center", paddingHorizontal: 24 },

  // CTA button
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.gold,
    marginHorizontal: 20, marginTop: 28, paddingVertical: 16, borderRadius: 12,
  },
  ctaBtnText: { color: Colors.black, fontSize: 16, fontWeight: "800" },
});
