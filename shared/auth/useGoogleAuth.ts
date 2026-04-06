import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

// In Expo Go: exp://192.168.x.x:PORT/--/auth/callback
// In standalone build: daytonrelo://auth/callback
// Both must be listed in Supabase → Auth → URL Configuration → Redirect URLs
const REDIRECT_URL = Linking.createURL("/auth/callback");

console.log("[Auth] Redirect URL:", REDIRECT_URL);

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:          REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { error: error?.message ?? "Could not start Google sign in." };
    }

    // Open the full browser — when Google auth completes, Supabase redirects
    // to REDIRECT_URL (the deep link), which iOS opens back in Expo Go.
    // The auth/callback screen handles the code exchange from there.
    await WebBrowser.openBrowserAsync(data.url);

    // At this point the browser has closed (either by redirect or user dismissal).
    // The actual session will be set by the auth/callback screen via deep link,
    // or it may already be set if the browser handled it internally.
    return { error: null };
  } catch (e: any) {
    console.log("[Auth] Error:", e?.message);
    return { error: e?.message ?? "Something went wrong with Google sign in." };
  }
}

export { REDIRECT_URL };
