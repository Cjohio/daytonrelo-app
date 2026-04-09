// Global search overlay — renders a search icon button that opens a full-screen
// modal. Drop <GlobalSearch /> anywhere in a screen's header.
import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../theme/colors";
import {
  SEARCH_ITEMS, CATEGORY_CONFIG, CATEGORY_ORDER, POPULAR_IDS,
  SearchItem, SearchCategory,
} from "../search/data";

// ─── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ item, onPress }: { item: SearchItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.75}>
      <View style={s.rowIcon}>
        <Ionicons name={item.icon as any} size={18} color={Colors.gold} />
      </View>
      <View style={s.rowText}>
        <Text style={s.rowTitle}>{item.title}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={15} color={Colors.grayLight} />
    </TouchableOpacity>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");

  // Filter items
  const q = query.trim().toLowerCase();
  const results: SearchItem[] = q.length > 0
    ? SEARCH_ITEMS.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.some(k => k.includes(q))
      )
    : [];

  // Group by category
  const grouped: Partial<Record<SearchCategory, SearchItem[]>> = {};
  for (const item of results) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category]!.push(item);
  }

  // Popular shortcuts
  const popular = POPULAR_IDS.map(id => SEARCH_ITEMS.find(i => i.id === id)!).filter(Boolean);

  function navigate(route: string) {
    setOpen(false);
    setQuery("");
    setTimeout(() => router.push(route as any), 120);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      {/* Search icon button — placed in the screen header */}
      <TouchableOpacity
        style={s.iconBtn}
        onPress={() => setOpen(true)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={21} color={Colors.white} />
      </TouchableOpacity>

      {/* Search modal */}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <SafeAreaView style={s.modal} edges={["top"]}>

          {/* Search bar row */}
          <View style={s.barRow}>
            <View style={s.bar}>
              <Ionicons name="search" size={17} color={Colors.gray} />
              <TextInput
                style={s.barInput}
                placeholder="Search pages, tools, neighborhoods…"
                placeholderTextColor={Colors.grayLight}
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            <TouchableOpacity onPress={close} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          <ScrollView
            style={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Empty state / popular */}
            {q.length === 0 && (
              <>
                <Text style={s.sectionLabel}>POPULAR</Text>
                {popular.map(item => (
                  <ResultRow key={item.id} item={item} onPress={() => navigate(item.route)} />
                ))}
                <Text style={s.hint}>
                  Search for tools, neighborhoods, restaurants, schools, and more.
                </Text>
              </>
            )}

            {/* No results */}
            {q.length > 0 && results.length === 0 && (
              <View style={s.empty}>
                <Ionicons name="search-outline" size={44} color={Colors.grayLight} />
                <Text style={s.emptyTitle}>No results for "{query}"</Text>
                <Text style={s.emptyHint}>
                  Try "mortgage", "schools", "Beavercreek", "pizza", or "VA loan"
                </Text>
              </View>
            )}

            {/* Grouped results */}
            {q.length > 0 && CATEGORY_ORDER.map(cat => {
              const items = grouped[cat];
              if (!items?.length) return null;
              return (
                <View key={cat}>
                  <Text style={s.sectionLabel}>{CATEGORY_CONFIG[cat].label.toUpperCase()}</Text>
                  {items.map(item => (
                    <ResultRow key={item.id} item={item} onPress={() => navigate(item.route)} />
                  ))}
                </View>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  iconBtn: { padding: 2 },

  modal: { flex: 1, backgroundColor: Colors.white },

  barRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  bar: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.offWhite,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  barInput: { flex: 1, fontSize: 16, color: Colors.black },

  cancelBtn: { paddingLeft: 4 },
  cancelText: { color: Colors.gold, fontSize: 15, fontWeight: "600" },

  scroll: { flex: 1 },

  sectionLabel: {
    color: Colors.gray, fontSize: 11, fontWeight: "800", letterSpacing: 1,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4,
  },

  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: Colors.black,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowText:  { flex: 1 },
  rowTitle: { color: Colors.black, fontSize: 15, fontWeight: "700" },
  rowSub:   { color: Colors.gray, fontSize: 12, marginTop: 1 },

  hint: {
    color: Colors.grayLight, fontSize: 13, textAlign: "center",
    marginTop: 24, paddingHorizontal: 32, lineHeight: 19,
  },

  empty: {
    alignItems: "center", paddingTop: 64, paddingHorizontal: 32, gap: 12,
  },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyHint:  { color: Colors.gray, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
