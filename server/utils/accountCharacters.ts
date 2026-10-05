export type CharacterCard = { id: string; name: string; classSelection: number; level: number; zone: string };
type SqlResult = { schema: { elements: { name: string | { some?: string } }[] }; rows: unknown[][] };

// Project only the account-scoped view; never accept SQL or identity from a browser.
export const CHARACTER_QUERY = "SELECT id, name, class_selection, level, zone_name, deleted_at FROM account_characters";

export function parseAccountCharacters(results: SqlResult[]): CharacterCard[] {
  if (!Array.isArray(results) || results.length !== 1) throw new Error("Unexpected character response");
  const result = results[0]!;
  const columns = result.schema.elements.map((field) => typeof field.name === "string" ? field.name : field.name.some);
  for (const field of ["id", "name", "class_selection", "level", "zone_name", "deleted_at"]) {
    if (!columns.includes(field)) throw new Error("Missing character field");
  }
  return result.rows.flatMap((row) => {
    const get = (name: string) => row[columns.indexOf(name)];
    // Spacetime timestamps are SATS newtypes around microseconds. A zero
    // DeletedAt means the character has not been deleted.
    const rawDeleted = get("deleted_at");
    const deleted = Array.isArray(rawDeleted) ? rawDeleted[0] : rawDeleted;
    if (String(deleted) !== "0") return [];
    if (typeof get("name") !== "string" || !/^\d+$/.test(String(get("id")))) throw new Error("Invalid character row");
    return [{ id: String(get("id")), name: get("name") as string, classSelection: Number(get("class_selection")), level: Number(get("level")), zone: String(get("zone_name") || "Unknown") }];
  });
}
