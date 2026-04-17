import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";

const CATEGORIES = [
  {
    id: "moving",
    icon: "cube-outline" as const,
    title: "Moving Expenses",
    color: "#4A90D9",
    items: [
      { text: "Full pack-and-move service (door to door)", value: "$3,000–$12,000", priority: "high" },
      { text: "Temporary storage (up to 90 days)", value: "$150–$400/mo", priority: "high" },
      { text: "Vehicle shipping (if driving isn't practical)", value: "$800–$1,500", priority: "medium" },
      { text: "Travel reimbursement (mileage, hotel, meals)", value: "$500–$2,000", priority: "medium" },
      { text: "Professional cleaning of prior residence", value: "$200–$500", priority: "low" },
    ],
  },
  {
    id: "housing",
    icon: "home-outline" as const,
    title: "Housing Assistance",
    color: "#F5A623",
    items: [
      { text: "Temporary housing stipend (30–90 days)", value: "$2,000–$8,000", priority: "high" },
      { text: "Closing cost reimbursement on home purchase", value: "$3,000–$10,000", priority: "high" },
      { text: "Lease-break fee coverage at prior home", value: "$500–$3,000", priority: "high" },
      { text: "Home-finding trip (flights, hotel, meals)", value: "$500–$2,000", priority: "medium" },
      { text: "Loss-on-sale protection if market is down", value: "Varies", priority: "medium" },
      { text: "Mortgage rate buy-down assistance", value: "$1,000–$5,000", priority: "low" },
    ],
  },
  {
    id: "lifestyle",
    icon: "people-outline" as const,
    title: "Family & Lifestyle",
    color: "#7ED321",
    items: [
      { text: "Spouse career transition support or job placement", value: "Service", priority: "high" },
      { text: "School enrollment support and records transfer", value: "Service", priority: "medium" },
      { text: "Child/dependent care stipend during transition", value: "$500–$2,000", priority: "medium" },
      { text: "Cultural / community integration support", value: "Service", priority: "low" },
    ],
  },
  {
    id: "financial",
    icon: "cash-outline" as const,
    title: "Financial & Tax",
    color: "#9B59B6",
    items: [
      { text: "Lump-sum relocation allowance (instead of managed move)", value: "$5,000–$25,000", priority: "high" },
      { text: "Tax gross-up on relocation reimbursements", value: "30–40% of benefits", priority: "high" },
      { text: "Duplicate housing allowance (paying two rents/mortgages)", value: "Varies", priority: "medium" },
      { text: "CPA / tax preparation for relocation year", value: "$300–$800", priority: "medium" },
    ],
  },
];

const TIPS = [
  "Get everything in writing before you accept the offer. Verbal promises disappear.",
  "Ask for a lump-sum option — it gives you more flexibility than a managed move.",
  "Always request the tax gross-up. Relocation benefits are taxable income; your employer can cover the extra tax.",
  "Negotiate the home-finding trip as a separate line item — most HR teams will approve it.",
  "If your employer uses a third-party relo firm, ask Chris to work directly with them — he has experience with relocation transactions.",
  "Closing costs are 2–5% of purchase price. On a $265K Dayton home that's $5,300–$13,250 — worth asking for.",
];

export default function ReloPackageScreen() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["moving", "housing"]));

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.intro}>
          <Ionicons name="briefcase-outline" size={20} color="#4A90D9" />
          <Text style={s.introText}>
            Most companies offer more than they initially present. This checklist shows
            everything you can reasonably negotiate — know your number before you sign.
          </Text>
        </View>

        {CATEGORIES.map(cat => {
          const isOpen = expanded.has(cat.id);
          return (
            <View key={cat.id} style={s.cat}>
              <TouchableOpacity
                style={s.catHeader}
                onPress={() => toggle(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[s.catIcon, { backgroundColor: cat.color + "20" }]}>
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>
                <Text style={s.catTitle}>{cat.title}</Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18} color={Colors.gray}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={s.catBody}>
                  {cat.items.map(item => (
                    <View key={item.text} style={s.item}>
                      <View style={[s.priority, {
                        backgroundColor: item.priority === "high" ? "#FFEBEE" : item.priority === "medium" ? "#FFF8E1" : "#F3F3F3",
                      }]}>
                        <Text style={[s.priorityText, {
                          color: item.priority === "high" ? "#C62828" : item.priority === "medium" ? "#E65100" : Colors.gray,
                        }]}>
                          {item.priority === "high" ? "Must Ask" : item.priority === "medium" ? "Good Ask" : "Nice to Have"}
                        </Text>
                      </View>
                      <View style={s.itemBody}>
                        <Text style={s.itemText}>{item.text}</Text>
                        <Text style={s.itemValue}>{item.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Text style={s.tipsTitle}>Negotiation Tips from Chris</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={s.tip}>
            <View style={s.tipNum}>
              <Text style={s.tipNumText}>{i + 1}</Text>
            </View>
            <Text style={s.tipText}>{tip}</Text>
          </View>
        ))}

        <View style={s.cta}>
          <Text style={s.ctaTitle}>Ready to house-hunt in Dayton?</Text>
          <Text style={s.ctaBody}>
            Chris works with corporate relocation packages regularly and can coordinate
            directly with your employer's relo firm.
          </Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/contact" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-outline" size={16} color={Colors.black} />
            <Text style={s.ctaBtnText}>Contact Chris</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.white },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  intro: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#EEF4FF", borderRadius: 12, padding: 14, marginBottom: 16,
    borderLeftWidth: 4, borderLeftColor: "#4A90D9",
  },
  introText: { flex: 1, color: "#1A3A5C", fontSize: 14, lineHeight: 20 },

  cat: { marginBottom: 10, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  catHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.white, padding: 14,
  },
  catIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catTitle: { fontWeight: "700", fontSize: 15, color: Colors.black, flex: 1 },

  catBody: { backgroundColor: "#FAFAFA", padding: 12, gap: 10 },

  item: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border },
  priority: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  priorityText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  itemBody: { gap: 2 },
  itemText:  { color: Colors.black, fontSize: 14, lineHeight: 19 },
  itemValue: { color: Colors.gold, fontWeight: "700", fontSize: 13 },

  tipsTitle: { fontWeight: "800", fontSize: 17, color: Colors.black, marginTop: 24, marginBottom: 12 },
  tip: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  tipNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  tipNumText: { color: Colors.black, fontWeight: "800", fontSize: 12 },
  tipText:    { flex: 1, color: Colors.black, fontSize: 14, lineHeight: 20 },

  cta: { backgroundColor: Colors.black, borderRadius: 14, padding: 18, marginTop: 16 },
  ctaTitle: { color: Colors.gold, fontWeight: "800", fontSize: 16, marginBottom: 6 },
  ctaBody:  { color: "#CCC", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.gold, borderRadius: 10, padding: 12,
  },
  ctaBtnText: { fontWeight: "700", fontSize: 14, color: Colors.black },
});
