import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../shared/theme/colors";
import { loadPersonaAsync, type Persona } from "../../shared/persona";
import ChatFAB from "../../shared/components/ChatFAB";
import HeaderActions from "../../shared/components/HeaderActions";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";
import SaveButton from "../../shared/components/SaveButton";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToolDef {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: string;
}

interface SectionDef {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  toolIds: string[];
}

// ─── All tools ─────────────────────────────────────────────────────────────────
const ALL_TOOLS: Record<string, ToolDef> = {
  "pcs-timeline": {
    id: "pcs-timeline",
    title: "PCS Timeline Tracker",
    subtitle: "6-phase checklist from 6 months out to your first 30 days in Dayton.",
    icon: "checkbox-outline",
    route: "/pcs-timeline",
  },
  "on-base-off": {
    id: "on-base-off",
    title: "On-Base vs Off-Base",
    subtitle: "WPAFB housing neighborhoods vs. top off-base areas — waitlists, pros, cons, commutes.",
    icon: "shield-outline",
    route: "/on-base-vs-off",
  },
  "bah-calculator": {
    id: "bah-calculator",
    title: "BAH Calculator",
    subtitle: "Calculate your Basic Allowance for Housing by pay grade and dependency status.",
    icon: "calculator-outline",
    route: "/bah-calculator",
  },
  "military-va": {
    id: "military-va",
    title: "Military & VA Guide",
    subtitle: "VA loan eligibility, entitlement, funding fees, and Dayton-area lender resources.",
    icon: "shield-checkmark-outline",
    route: "/military",
  },
  "first-30-days": {
    id: "first-30-days",
    title: "First 30 Days Checklist",
    subtitle: "Everything you need to do in your first month — admin, utilities, DMV, schools.",
    icon: "list-outline",
    route: "/first-30-days",
  },
  "relo-package": {
    id: "relo-package",
    title: "Relocation Package Guide",
    subtitle: "Everything you can negotiate — moving costs, housing stipends, closing cost reimbursement.",
    icon: "briefcase-outline",
    route: "/relo-package",
  },
  "commute-finder": {
    id: "commute-finder",
    title: "Commute Finder",
    subtitle: "Pick your employer and see which neighborhoods are within your target commute time.",
    icon: "car-outline",
    route: "/commute-finder",
  },
  "temp-housing": {
    id: "temp-housing",
    title: "Temporary Housing Guide",
    subtitle: "Extended stays, furnished apartments, and corporate housing for your transition.",
    icon: "bed-outline",
    route: "/temp-housing",
  },
  "cost-of-living": {
    id: "cost-of-living",
    title: "Cost of Living Comparison",
    subtitle: "Pick where you're coming from and see how Dayton stacks up on rent, homes, and taxes.",
    icon: "swap-horizontal-outline",
    route: "/cost-of-living",
  },
  "closing-costs": {
    id: "closing-costs",
    title: "Closing Cost Calculator",
    subtitle: "Estimate cash needed at closing for VA, conventional, or FHA loans — line-by-line.",
    icon: "receipt-outline",
    route: "/closing-costs",
  },
  "mortgage-calculator": {
    id: "mortgage-calculator",
    title: "Mortgage Calculator",
    subtitle: "What can I afford? Monthly payment breakdown with taxes, insurance, and PMI.",
    icon: "home-outline",
    route: "/mortgage-calculator",
  },
  "rent-vs-buy": {
    id: "rent-vs-buy",
    title: "Rent vs. Buy Calculator",
    subtitle: "Enter your numbers and see whether buying or renting makes more financial sense.",
    icon: "home-outline",
    route: "/rent-vs-buy",
  },
  "compare-neighborhoods": {
    id: "compare-neighborhoods",
    title: "Compare Neighborhoods",
    subtitle: "3-way comparison of Dayton neighborhoods — price, schools, commute & cost of living.",
    icon: "git-compare-outline",
    route: "/neighborhood-compare",
  },
  "neighborhood-quiz": {
    id: "neighborhood-quiz",
    title: "Neighborhood Quiz",
    subtitle: "Answer 5 quick questions and get a ranked list of Dayton neighborhoods.",
    icon: "map-outline",
    route: "/neighborhood-quiz",
  },
  "schools": {
    id: "schools",
    title: "School Guide",
    subtitle: "Public district ratings + private, Catholic, Montessori & Christian schools.",
    icon: "school-outline",
    route: "/schools",
  },
  "dayton-events": {
    id: "dayton-events",
    title: "Dayton Events Calendar",
    subtitle: "Fraze, Rose, Schuster, Nutter + festivals, fairs, air show & more.",
    icon: "calendar-outline",
    route: "/dayton-events",
  },
  "things-to-do": {
    id: "things-to-do",
    title: "Things To Do Near Dayton",
    subtitle: "73 attractions within 1 hour — museums, nature, amusement, arts & local gems.",
    icon: "compass-outline",
    route: "/things-to-do",
  },
  "parks": {
    id: "parks",
    title: "Parks & Recreation",
    subtitle: "MetroParks + city parks — playgrounds, pickleball, splash pads, trails.",
    icon: "leaf-outline",
    route: "/parks",
  },
  "eats": {
    id: "eats",
    title: "Dayton Eats Guide",
    subtitle: "Dayton staples everyone must try + the best of Dayton by neighborhood.",
    icon: "restaurant-outline",
    route: "/(tabs)/eats",
  },
  "day-trips": {
    id: "day-trips",
    title: "Day Trips Guide",
    subtitle: "8 great destinations within 2.5 hours — Hocking Hills, Columbus, Kings Island & more.",
    icon: "map-outline",
    route: "/day-trips",
  },
  "local-services": {
    id: "local-services",
    title: "Local Services Directory",
    subtitle: "Chris-curated movers, plumbers, HVAC, electricians, and cleaners.",
    icon: "construct-outline",
    route: "/local-services",
  },
  "employer-map": {
    id: "employer-map",
    title: "Dayton Employer Map",
    subtitle: "Top employers by industry — locations, employee count, and nearest neighborhoods.",
    icon: "business-outline",
    route: "/employer-map",
  },
  "dity-calculator": {
    id: "dity-calculator",
    title: "DITY / PPM Calculator",
    subtitle: "Estimate your incentive pay for a Personally Procured Move — by pay grade and distance.",
    icon: "cube-outline",
    route: "/dity-calculator",
  },
  "tle-calculator": {
    id: "tle-calculator",
    title: "TLE Calculator",
    subtitle: "Estimate Temporary Lodging Expense reimbursement for your CONUS PCS move.",
    icon: "bed-outline",
    route: "/tle-calculator",
  },
  "open-houses": {
    id: "open-houses",
    title: "Open Houses",
    subtitle: "Browse upcoming open houses in the Dayton metro — filter by neighborhood.",
    icon: "calendar-outline",
    route: "/open-houses",
  },
};

// ─── Sections per persona ──────────────────────────────────────────────────────
const PERSONA_SECTIONS: Record<Persona, SectionDef[]> = {
  military: [
    {
      title: "Home Search",
      icon: "home-outline",
      toolIds: ["mortgage-calculator", "closing-costs", "compare-neighborhoods", "neighborhood-quiz", "schools", "open-houses"],
    },
    {
      title: "PCS Planning",
      icon: "checkbox-outline",
      toolIds: ["pcs-timeline", "first-30-days", "on-base-off", "commute-finder", "employer-map"],
    },
    {
      title: "Military Finance",
      icon: "calculator-outline",
      toolIds: ["bah-calculator", "military-va", "dity-calculator", "tle-calculator"],
    },
    {
      title: "Explore Dayton",
      icon: "compass-outline",
      toolIds: ["dayton-events", "things-to-do", "parks", "eats", "day-trips"],
    },
    {
      title: "Local Services",
      icon: "construct-outline",
      toolIds: ["local-services"],
    },
  ],
  relocation: [
    {
      title: "Home Search",
      icon: "home-outline",
      toolIds: ["mortgage-calculator", "rent-vs-buy", "closing-costs", "compare-neighborhoods", "neighborhood-quiz", "schools", "open-houses"],
    },
    {
      title: "Your Relocation",
      icon: "briefcase-outline",
      toolIds: ["relo-package", "temp-housing", "commute-finder", "cost-of-living", "employer-map"],
    },
    {
      title: "Getting Settled",
      icon: "list-outline",
      toolIds: ["first-30-days"],
    },
    {
      title: "Explore Dayton",
      icon: "compass-outline",
      toolIds: ["dayton-events", "things-to-do", "parks", "eats", "day-trips"],
    },
    {
      title: "Local Services",
      icon: "construct-outline",
      toolIds: ["local-services"],
    },
  ],
  discover: [
    {
      title: "Explore Dayton",
      icon: "compass-outline",
      toolIds: ["dayton-events", "things-to-do", "parks", "eats", "day-trips"],
    },
    {
      title: "Your Home & Services",
      icon: "home-outline",
      toolIds: ["local-services", "schools", "first-30-days"],
    },
    {
      title: "Neighborhoods",
      icon: "map-outline",
      toolIds: ["compare-neighborhoods", "neighborhood-quiz", "cost-of-living"],
    },
  ],
};

// Hub route for each persona (for the back button)
const HUB_ROUTE: Record<Persona, string> = {
  military:   "/military-hub",
  relocation: "/relocation",
  discover:   "/discover",
};

const HUB_LABEL: Record<Persona, string> = {
  military:   "Military Hub",
  relocation: "Corporate Hub",
  discover:   "Discover Hub",
};

// ─── Collapsible Section ───────────────────────────────────────────────────────
function Section({
  section,
  isOpen,
  onToggle,
}: {
  section: SectionDef;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tools = section.toolIds.map(id => ALL_TOOLS[id]).filter(Boolean);

  return (
    <View style={ss.section}>
      <TouchableOpacity style={ss.sectionHeader} onPress={onToggle} activeOpacity={0.75}>
        <View style={ss.sectionHeaderLeft}>
          <View style={ss.sectionIconBox}>
            <Ionicons name={section.icon} size={18} color={Colors.gold} />
          </View>
          <Text style={ss.sectionTitle}>{section.title}</Text>
          <View style={ss.sectionBadge}>
            <Text style={ss.sectionBadgeText}>{tools.length}</Text>
          </View>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.grayLight}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={ss.sectionBody}>
          {tools.map((tool, i) => (
            <TouchableOpacity
              key={tool.id}
              style={[ss.toolRow, i < tools.length - 1 && ss.toolRowDivider]}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.8}
            >
              <View style={ss.toolIconBox}>
                <Ionicons name={tool.icon} size={20} color={Colors.gold} />
              </View>
              <View style={ss.toolBody}>
                <Text style={ss.toolTitle}>{tool.title}</Text>
                <Text style={ss.toolSubtitle}>{tool.subtitle}</Text>
              </View>
              <SaveButton
                itemType="tool"
                itemId={tool.id}
                title={tool.title}
                subtitle={tool.subtitle}
                route={tool.route}
                size={20}
              />
              <Ionicons name="chevron-forward" size={16} color={Colors.grayLight} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ToolsScreen() {
  const [persona, setPersonaState] = useState<Persona>("military");
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadPersonaAsync().then(p => {
        if (p) {
          setPersonaState(p);
          setOpenSections({});
        }
      });
    }, [])
  );

  function toggleSection(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
  }

  const sections = PERSONA_SECTIONS[persona];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ChatFAB extraBottom={64} />

      {/* Header */}
      <BrandHeader
          left={<BackBtn onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)} />}
          right={<HeaderActions />}
        />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your Relocation Toolkit</Text>
          <Text style={styles.heroBody}>
            Everything you need to find the right home in Dayton — calculators, neighborhood guides, commute tools, and local resources, all in one place.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{sections.reduce((n, s) => n + s.toolIds.length, 0)}</Text>
              <Text style={styles.heroStatLabel}>Tools</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{sections.length}</Text>
              <Text style={styles.heroStatLabel}>Categories</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>Free</Text>
              <Text style={styles.heroStatLabel}>Always</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
        {sections.map((section, i) => (
          <Section
            key={i}
            section={section}
            isOpen={!!openSections[i]}
            onToggle={() => toggleSection(i)}
          />
        ))}
        </View>

        {/* External Resources */}
        <Text style={[styles.externalHeading, { paddingHorizontal: 16 }]}>External Resources</Text>
        {EXTERNAL.map(({ label, url, icon }) => (
          <TouchableOpacity
            key={label}
            style={styles.externalRow}
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.75}
          >
            <Ionicons name={icon} size={18} color={Colors.gold} />
            <Text style={styles.externalLabel}>{label}</Text>
            <Ionicons name="open-outline" size={15} color={Colors.grayLight} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── External Resources ────────────────────────────────────────────────────────
const EXTERNAL = [
  { label: "Official BAH Rates (DFAS)",       icon: "globe-outline" as const, url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm" },
  { label: "VA Home Loan Eligibility",         icon: "globe-outline" as const, url: "https://www.va.gov/housing-assistance/home-loans/" },
  { label: "WPAFB Housing Office",             icon: "globe-outline" as const, url: "https://www.wpafb.af.mil/Units/88th-Air-Base-Wing/Directorates/Housing/" },
  { label: "Ohio Schools Report Card",         icon: "globe-outline" as const, url: "https://reportcard.education.ohio.gov/" },
  { label: "Dayton Area Chamber of Commerce", icon: "globe-outline" as const, url: "https://daytonareachamber.com" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.black },

  header: {
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
  },
  backLabel: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },

  titleBar: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldDark,
  },
  headerTitle: { color: Colors.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  headerSub:   { color: Colors.grayLight, fontSize: 10, letterSpacing: 1, marginTop: 2 },

  scroll:  { flex: 1, backgroundColor: "#F5F5F5" },
  content: { paddingBottom: 32 },

  // Hero
  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    marginBottom: 16,
  },
  heroIconRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  heroIconBubble: {
    width: 42, height: 42,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: Colors.goldDark,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  heroBody: {
    color: Colors.grayLight,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  heroStatNum: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "800",
  },
  heroStatLabel: {
    color: Colors.grayLight,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "#2A2A2A",
  },

  externalHeading: {
    color: Colors.black, fontWeight: "800", fontSize: 15,
    marginTop: 24, marginBottom: 8, letterSpacing: 0.3,
  },
  externalRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#E8E8E8",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  externalLabel: { color: Colors.black, fontSize: 14 },
});

const ss = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  sectionIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.black,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: {
    color: Colors.black, fontWeight: "800", fontSize: 15,
  },
  sectionBadge: {
    backgroundColor: Colors.goldMuted + "33",
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  sectionBadgeText: {
    color: Colors.goldDark, fontSize: 11, fontWeight: "700",
  },
  sectionBody: {
    borderTopWidth: 1, borderTopColor: "#F0F0F0",
  },
  toolRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    backgroundColor: Colors.white,
  },
  toolRowDivider: {
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  toolIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#F8F6F0",
    alignItems: "center", justifyContent: "center",
  },
  toolBody: { flex: 1 },
  toolTitle: {
    color: Colors.black, fontWeight: "700", fontSize: 14, marginBottom: 2,
  },
  toolSubtitle: {
    color: Colors.gray, fontSize: 12, lineHeight: 17,
  },
});
