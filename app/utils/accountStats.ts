import type { CharacterCard } from "../../server/utils/accountCharacters";

export function summarizeAccountRealms(realms: { available: boolean; characters: CharacterCard[] }[]) {
  const available = realms.filter(realm => realm.available);
  const characters = available.flatMap(realm => realm.characters);
  const created = characters.flatMap(character => character.createdAt ? [character.createdAt] : []).sort();
  const played = characters.flatMap(character => character.lastPlayed ? [character.lastPlayed] : []).sort();
  return {
    characters: characters.length,
    highestLevel: characters.length ? Math.max(...characters.map(character => character.level)) : null,
    realms: available.filter(realm => realm.characters.length > 0).length,
    firstCharacter: created[0] ?? null,
    lastPlayed: played.at(-1) ?? null,
    partial: available.length !== realms.length,
    available: available.length > 0,
  };
}

export function formatAccountDate(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(value));
}

export function formatAccountAge(value: string | null | undefined, now = Date.now()) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  // Count calendar days in UTC, matching the date displayed above the caption.
  const days = Math.floor(now / 86_400_000) - Math.floor(Date.parse(value) / 86_400_000);
  if (days < 0) return null;
  return `${days} ${days === 1 ? "Day" : "Days"} ago`;
}
