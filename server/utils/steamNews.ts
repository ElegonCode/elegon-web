export const STEAM_NEWS_APP_ID = "4268360";
export const STEAM_NEWS_URL = `https://store.steampowered.com/news/app/${STEAM_NEWS_APP_ID}`;
export const STEAM_NEWS_FEED_URL = `https://store.steampowered.com/feeds/news/app/${STEAM_NEWS_APP_ID}/?cc=GB&l=english`;

export type SteamNewsPost = {
  id: string;
  title: string;
  date: string;
  url: string;
  image: string | null;
  excerpt: string;
  html: string;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point =
        code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Reads an RSS element's text, unwrapping CDATA or decoding XML entities. */
function readElement(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!match?.[1]) return "";
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return cdata?.[1] ?? decodeEntities(raw);
}

function safeUrl(value: string | undefined, base?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(decodeEntities(value).trim(), base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    // Steam wraps outbound links in its "you are leaving Steam" interstitial.
    if (url.hostname === "steamcommunity.com" && url.pathname.startsWith("/linkfilter")) {
      const target = url.searchParams.get("u") ?? url.searchParams.get("url");
      return target ? safeUrl(target) : null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function readAttributes(source: string) {
  const attributes: Record<string, string> = {};
  for (const match of source.matchAll(
    /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g,
  )) {
    attributes[match[1]!.toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? "";
  }
  return attributes;
}

const SIMPLE_TAGS = new Set([
  "p",
  "ul",
  "ol",
  "li",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "blockquote",
  "code",
  "pre",
  "h2",
  "h3",
  "h4",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
]);
const VOID_TAGS = new Set(["br", "hr", "img"]);
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "svg",
  "math",
  "form",
  "textarea",
  "select",
]);
const HEADING_CLASSES: Record<string, string> = { bb_h1: "h2", bb_h2: "h3", bb_h3: "h4" };

/**
 * Rebuilds Steam's announcement HTML from an allowlist so it can be rendered on the site.
 * Only known formatting tags survive; links and images are limited to http(s) URLs.
 */
export function sanitizeSteamHtml(html: string) {
  const output: string[] = [];
  const open: string[] = [];
  // Maps each source <div>/<span> to the tag we emitted for it ("" when dropped).
  const containers: { source: string; emitted: string }[] = [];
  let skipping: string | null = null;
  let skipDepth = 0;

  const close = (tag: string) => {
    const index = open.lastIndexOf(tag);
    if (index === -1) return;
    while (open.length > index) output.push(`</${open.pop()}>`);
  };

  for (const token of html.matchAll(/<!--[\s\S]*?-->|<\/?([a-zA-Z][\w-]*)([^<>]*)>|[^<]+|</g)) {
    const [text, rawName, rawAttributes = ""] = token;
    if (text.startsWith("<!--")) continue;

    if (!rawName) {
      if (!skipping) {
        output.push(
          text === "<" ? "&lt;" : text.replace(/&(?!#?\w+;)/g, "&amp;").replace(/>/g, "&gt;"),
        );
      }
      continue;
    }

    const name = rawName.toLowerCase();
    const closing = text.startsWith("</");

    if (skipping) {
      if (name === skipping) skipDepth += closing ? -1 : 1;
      if (skipDepth === 0) skipping = null;
      continue;
    }
    if (DROP_WITH_CONTENT.has(name)) {
      if (!closing && !text.endsWith("/>")) {
        skipping = name;
        skipDepth = 1;
      }
      continue;
    }

    if (name === "div" || name === "span") {
      if (closing) {
        const index = containers.findLastIndex((entry) => entry.source === name);
        if (index !== -1) {
          const [entry] = containers.splice(index, 1);
          if (entry?.emitted) close(entry.emitted);
        }
        continue;
      }
      const classes = (readAttributes(rawAttributes).class ?? "").split(/\s+/);
      const heading = classes.map((value) => HEADING_CLASSES[value]).find(Boolean);
      const emitted = heading ?? "";
      containers.push({ source: name, emitted });
      if (emitted) {
        output.push(`<${emitted}>`);
        open.push(emitted);
      }
      continue;
    }

    if (name === "a") {
      if (closing) {
        close("a");
        continue;
      }
      const href = safeUrl(readAttributes(rawAttributes).href, STEAM_NEWS_URL);
      if (!href) continue;
      output.push(
        `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer nofollow">`,
      );
      open.push("a");
      continue;
    }

    if (VOID_TAGS.has(name)) {
      if (closing) continue;
      if (name === "img") {
        const src = safeUrl(readAttributes(rawAttributes).src);
        if (src?.startsWith("https://")) {
          output.push(`<img src="${escapeAttribute(src)}" alt="" loading="lazy" decoding="async">`);
        }
      } else {
        output.push(`<${name}>`);
      }
      continue;
    }

    if (SIMPLE_TAGS.has(name)) {
      if (closing) {
        close(name);
      } else {
        output.push(`<${name}>`);
        open.push(name);
      }
    }
  }

  while (open.length) output.push(`</${open.pop()}>`);
  // Steam inserts empty paragraphs as spacers; the page's own spacing handles that.
  return output
    .join("")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

export function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<(br|\/p|\/li|\/h[1-6]|\/div)[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " "),
  ).trim();
}

export function makeExcerpt(html: string, length = 220) {
  const text = htmlToText(html);
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, cut.lastIndexOf(" ") > length * 0.6 ? cut.lastIndexOf(" ") : length).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export function parseSteamNewsRss(xml: string): SteamNewsPost[] {
  const posts: SteamNewsPost[] = [];
  for (const [, item = ""] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const url = safeUrl(readElement(item, "link") || readElement(item, "guid"));
    const id = url?.match(/\/view\/(\d+)/)?.[1];
    const published = new Date(readElement(item, "pubDate"));
    if (!url || !id || Number.isNaN(published.getTime())) continue;

    const html = sanitizeSteamHtml(readElement(item, "description"));
    const enclosure = item.match(/<enclosure\s[^>]*url="([^"]+)"/)?.[1];
    const firstImage = html.match(/<img src="([^"]+)"/)?.[1];
    const image = safeUrl(enclosure) ?? (firstImage ? decodeEntities(firstImage) : null);

    posts.push({
      id,
      title: readElement(item, "title") || "Untitled update",
      date: published.toISOString(),
      url,
      image: image?.startsWith("https://") ? image : null,
      excerpt: makeExcerpt(html),
      html,
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}
