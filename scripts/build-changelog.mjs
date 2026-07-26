import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const webRoot = resolve(import.meta.dirname, "..");
const contentRoot = resolve(webRoot, "content", "changelog");
const outputPath = resolve(
  webRoot,
  "server",
  "generated",
  "changelog.json",
);

function parseFrontmatter(markdown, filename) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${filename} does not contain valid frontmatter.`);
  }

  const values = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    let value = rawValue;
    try {
      value = JSON.parse(rawValue);
    } catch {
      // Numeric frontmatter values are parsed below.
    }
    values.set(key, value);
  }

  const id = Number(values.get("entryId"));
  const date = String(values.get("date") ?? "");
  const description = String(values.get("description") ?? "").trim();
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${filename} has an invalid entryId.`);
  }
  const parsedDate = new Date(`${date}T00:00:00Z`);
  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date;
  if (!validDate) {
    throw new Error(`${filename} has an invalid date.`);
  }
  if (!description || description.length > 2_000) {
    throw new Error(`${filename} has an invalid description.`);
  }

  return { id, date, description };
}

function contentRevision(entries) {
  const content = JSON.stringify(entries);
  let hash = 2_166_136_261;
  for (let index = 0; index < content.length; index += 1) {
    hash = Math.imul(hash ^ content.charCodeAt(index), 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const filenames = (await readdir(contentRoot))
  .filter((filename) => filename.endsWith(".md"))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
const entries = await Promise.all(
  filenames.map(async (filename) =>
    parseFrontmatter(
      await readFile(resolve(contentRoot, filename), "utf8"),
      filename,
    ),
  ),
);

const ids = new Set(entries.map((entry) => entry.id));
if (ids.size !== entries.length) {
  throw new Error("Changelog entry IDs must be unique.");
}

entries.sort(
  (left, right) =>
    right.date.localeCompare(left.date) || right.id - left.id,
);
const changelog = {
  revision: contentRevision(entries),
  entries,
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(changelog, null, 2)}\n`, "utf8");
console.log(
  `Built changelog revision ${changelog.revision} from ${entries.length} entries.`,
);
