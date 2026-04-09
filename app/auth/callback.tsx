import { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../shared/theme/colors";

/**
 * Handles the OAuth deep-link redirect from Supabase after Google sign in.
 * Supabase sends the user back to exp://IP:PORT/--/auth/callback?code=xxx
 * Expo Router parses ?code=xxx into useLocalSearchParams().
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = params.code as string | undefined;
      console.log("[Callback] Code received:", !!code);

      if (code) {
        const fullUrl = `exp://auth/callback?code=${code}`;
        const { error } = await supabase.auth.exchangeCodeForSession(fullUrl);
        if (error) {
          console.log("[Callback] Exchange error:", error.message);
          // Try alternate format
          const { error: err2 } = await supabase.auth.exchangeCodeForSession(code);
          if (err2) console.log("[Callback] Alternate exchange error:", err2.message);
        }
      }

      // Session is now set (or will be via onAuthStateChange) — go to profile
      setTimeout(() => {
        router.replace("/(tabs)/profile" as any);
      }, 500);
    }

    handleCallback();
  }, [params.code]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={Colors.gold} />
      <Text style={s.text}>Signing you in...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    gap: 16,
  },
  text: {
    fontSize: 15,
    color: Colors.gray,
    fontWeight: "500",
  },
});
