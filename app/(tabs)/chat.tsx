import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../../shared/theme/colors";
import BrandHeader, { BackBtn } from "../../shared/components/BrandHeader";
import { sendChatMessage, shouldEscalateToChris, ChatMessage } from "../../api/claude";
import { sendAgentSMS } from "../../api/sms";
import { useAnalytics } from "../../shared/analytics";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id:        string;
  role:      "user" | "assistant" | "system";
  content:   string;
  escalated?: boolean;
}

// ── Starter suggestions ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What neighborhoods are closest to WPAFB?",
  "How does my BAH compare to rent in Dayton?",
  "What are VA loan benefits?",
  "How does Dayton's cost of living compare?",
  "Best areas for families with kids?",
];

// ── Opening message ────────────────────────────────────────────────────────────
const WELCOME: Message = {
  id:      "welcome",
  role:    "assistant",
  content: "Hey! I'm DaytonBot 👋 — Chris's AI assistant for all things Dayton relocation.\n\nAsk me anything about neighborhoods, BAH, VA loans, cost of living, schools, or what it's like to live here. If you want to schedule a showing or talk to Chris directly, just say the word and I'll loop him in right away.",
};

export default function ChatScreen() {
  const [messages,   setMessages]   = useState<Message[]>([WELCOME]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showSuggest,setShowSuggest]= useState(true);
  const scrollRef  = useRef<ScrollView>(null);
  const { capture } = useAnalytics();

  // Track chat opened
  useEffect(() => {
    capture("chat_opened");
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const send = async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setShowSuggest(false);

    // Add user message
    const userMsg: Message = {
      id:      Date.now().toString(),
      role:    "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Check for escalation before calling Claude
    const needsChris = shouldEscalateToChris(trimmed);

    // Track the message
    capture("chat_message_sent", {
      message_length: trimmed.length,
      escalation_triggered: needsChris,
    });

    try {
      // Build history for Claude (exclude system messages)
      const history: ChatMessage[] = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      history.push({ role: "user", content: trimmed });

      const reply = await sendChatMessage(history);

      const botMsg: Message = {
        id:        (Date.now() + 1).toString(),
        role:      "assistant",
        content:   reply,
        escalated: needsChris,
      };
      setMessages((prev) => [...prev, botMsg]);

      // If escalation triggered, also fire SMS to Chris
      if (needsChris) {
        capture("chat_escalation_triggered", { trigger_message: trimmed.slice(0, 80) });
        try {
          await sendAgentSMS({
            name:         "DaytonBot Chat Lead",
            email:        "",
            phone:        "",
            moveTimeline: "just-browsing",
            employer:     "",
            message:      `💬 Chat escalation\nUser message: "${trimmed}"`,
          });
        } catch {
          // SMS is best-effort; don't break the chat
        }

        // Add a system notice
        setMessages((prev) => [
          ...prev,
          {
            id:      (Date.now() + 2).toString(),
            role:    "system",
            content: "✓ I've notified Chris — he'll be in touch within 2 hours.",
          },
        ]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[ChatScreen] Error:", errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id:      (Date.now() + 1).toString(),
          role:    "assistant",
          content: `⚠️ Error: ${errMsg}\n\nReach Chris directly on the Contact tab!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <BrandHeader
          left={<BackBtn onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/" as any)} />}
          right={
            <View style={s.headerRight}>
              {messages.length > 1 && (
                <TouchableOpacity
                  style={s.clearBtn}
                  onPress={() => {
                    setMessages([WELCOME]);
                    setShowSuggest(true);
                    setInput("");
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="refresh-outline" size={20} color={Colors.gold} />
                </TouchableOpacity>
              )}
              <View style={s.onlineDot} />
            </View>
          }
        />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <View style={s.typingRow}>
              <View style={s.botAvatarSm}>
                <Ionicons name="chatbubble-ellipses" size={11} color={Colors.black} />
              </View>
              <View style={s.typingBubble}>
                <ActivityIndicator size="small" color={Colors.gray} />
              </View>
            </View>
          )}

          {/* Suggestion chips — only shown at start */}
          {showSuggest && !loading && (
            <View style={s.suggestWrap}>
              <Text style={s.suggestLabel}>Try asking…</Text>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={st.chip}
                  onPress={() => send(s)}
                  activeOpacity={0.75}
                >
                  <Text style={st.chipText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={12} color={Colors.gold} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Ask anything about Dayton…"
            placeholderTextColor={Colors.grayLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Message bubble component ───────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser   = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <View style={s.systemRow}>
        <Text style={s.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[s.msgRow, isUser && s.msgRowUser]}>
      {!isUser && (
        <View style={s.botAvatarSm}>
          <Ionicons name="chatbubble-ellipses" size={11} color={Colors.black} />
        </View>
      )}
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleBot]}>
        <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>
          {message.content}
        </Text>
        {message.escalated && (
          <View style={s.escalatedBadge}>
            <Ionicons name="notifications-outline" size={11} color={Colors.gold} />
            <Text style={s.escalatedText}>Notifying Chris</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: Colors.black,
    borderBottomWidth: 1, borderBottomColor: "#222",
  },
  backBtn: {
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
    marginRight: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  botAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: Colors.white, fontWeight: "800", fontSize: 15 },
  headerSub:   { color: "#666", fontSize: 10, marginTop: 1 },
  onlineDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2ECC71" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearBtn:    { padding: 4 },

  messages:        { flex: 1, backgroundColor: Colors.offWhite },
  messagesContent: { padding: 16, paddingBottom: 8 },

  msgRow: {
    flexDirection: "row", alignItems: "flex-end",
    gap: 8, marginBottom: 12,
  },
  msgRowUser: { flexDirection: "row-reverse" },

  botAvatarSm: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },

  bubble: {
    maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  bubbleUser: {
    backgroundColor: Colors.black,
    borderBottomRightRadius: 4,
  },
  bubbleText:     { color: Colors.black, fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: Colors.white },

  escalatedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 6, paddingTop: 6,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  escalatedText: { color: Colors.gold, fontSize: 11, fontWeight: "600" },

  typingRow: {
    flexDirection: "row", alignItems: "flex-end",
    gap: 8, marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: Colors.white, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },

  systemRow: {
    alignItems: "center", marginVertical: 8,
  },
  systemText: {
    color: Colors.gray, fontSize: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
  },

  suggestWrap: { marginTop: 8, gap: 8 },
  suggestLabel: { color: Colors.gray, fontSize: 12, fontWeight: "600", marginBottom: 4 },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.offWhite,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: Colors.black, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});

// Suggestion chip styles (named `st` to avoid conflict with outer `s`)
const st = StyleSheet.create({
  chip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.white, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { color: Colors.black, fontSize: 13, flex: 1, marginRight: 8 },
});
