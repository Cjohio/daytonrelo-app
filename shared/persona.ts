/**
 * Persona store — persists to AsyncStorage so the user's path is
 * remembered across app launches.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type Persona = "military" | "relocation" | "discover";

const STORAGE_KEY = "dayton_relo_persona";
const VALID: Persona[] = ["military", "relocation", "discover"];

// In-memory cache for sync reads during a session
let _persona: Persona | null = null;

/** Sync read — returns in-memory value (populated after loadPersonaAsync) */
export function getPersona(): Persona | null {
  return _persona;
}

/** Save persona to memory + AsyncStorage */
export function setPersona(p: Persona): void {
  _persona = p;
  AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
}

export function clearPersona(): void {
  _persona = null;
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}

/** Call once on app start to hydrate from storage */
export async function loadPersonaAsync(): Promise<Persona | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && VALID.includes(stored as Persona)) {
      _persona = stored as Persona;
      return _persona;
    }
  } catch {}
  return null;
}
