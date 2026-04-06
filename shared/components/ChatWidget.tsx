// ─────────────────────────────────────────────
//  Live Chat Widget — Placeholder
//
//  To activate Intercom:
//    npm install @intercom/intercom-react-native
//    import Intercom from '@intercom/intercom-react-native';
//    Replace openChat() body with: Intercom.present();
//
//  To activate Tidio:
//    npm install @tidio/tidio-react-native
//    Replace openChat() body with Tidio SDK call.
// ─────────────────────────────────────────────

import { useState } from "react";
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { API_CONFIG } from "../../api/config";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const openChat = () => {
    // ── Intercom (uncomment when SDK installed) ──────────────
    // import Intercom from '@intercom/intercom-react-native';
    // if (API_CONFIG.chat.intercomAppId) { Intercom.present(); return; }

    // ── Tidio (uncomment when SDK installed) ─────────────────
    // import Tidiochat from '@tidio/tidio-react-native';
    // if (API_CONFIG.chat.tidioKey) { Tidiochat.open(); return; }

    // ── Placeholder toggle ───────────────────────────────────
    setOpen((v) => !v);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Pop-up card */}
      {open && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Chat with Us</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={20} color={Colors.gray} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardBody}>
            Have a question about relocating to Dayton? We typically reply in
            under an hour during business hours.
          </Text>
          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => Linking.openURL("sms:+19375550199")}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={15} color={Colors.black} />
            <Text style={styles.cardBtnText}>Send a Text</Text>
          </TouchableOpacity>
          <Text style={styles.cardNote}>
            Connect Intercom or Tidio in api/config.ts for live chat.
          </Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openChat}
        activeOpacity={0.85}
      >
        <Ionicons
          name={open ? "close" : "chatbubble-ellipses"}
          size={24}
          color={Colors.gold}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 28,
    right: 20,
    alignItems: "flex-end",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.goldDark,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    width: 280,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "700",
  },
  cardBody: {
    color: Colors.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardBtnText: {
    color: Colors.black,
    fontWeight: "700",
    fontSize: 14,
  },
  cardNote: {
    color: Colors.grayLight,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
});
