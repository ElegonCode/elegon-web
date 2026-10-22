import { expect, test } from "vite-plus/test";
import { makeExcerpt, parseSteamNewsRss, sanitizeSteamHtml } from "../server/utils/steamNews.ts";

const encode = (html: string) =>
  html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const feed = (description: string, extra = "") => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title>Fishing &amp; Cooking</title>
    <description>${encode(description)}</description>
    <link><![CDATA[https://store.steampowered.com/news/app/4268360/view/719041721925633163]]></link>
    <pubDate>Mon, 14 Sep 2026 16:06:23 +0000</pubDate>
    ${extra}
  </item>
  <item>
    <title>Older</title>
    <description>${encode("<p>Old</p>")}</description>
    <link><![CDATA[https://store.steampowered.com/news/app/4268360/view/1]]></link>
    <pubDate>Mon, 07 Sep 2026 10:57:24 +0000</pubDate>
  </item>
  <item><title>No link</title><pubDate>Mon, 07 Sep 2026 10:57:24 +0000</pubDate></item>
</channel></rss>`;

test("parses Steam RSS items newest first", () => {
  const posts = parseSteamNewsRss(
    feed(
      '<p class="bb_paragraph">Hello <b>world</b></p>',
      '<enclosure url="https://clan.akamai.steamstatic.com/images/1/cover.png" length="0" type="image/png" />',
    ),
  );
  expect(posts).toHaveLength(2);
  expect(posts[0]).toEqual({
    id: "719041721925633163",
    title: "Fishing & Cooking",
    date: "2026-09-14T16:06:23.000Z",
    url: "https://store.steampowered.com/news/app/4268360/view/719041721925633163",
    image: "https://clan.akamai.steamstatic.com/images/1/cover.png",
    excerpt: "Hello world",
    html: "<p>Hello <b>world</b></p>",
  });
  expect(posts[1]?.image).toBeNull();
});

test("falls back to the first image in the post as a cover", () => {
  const [post] = parseSteamNewsRss(
    feed('<p>Hi</p><img src="https://clan.akamai.steamstatic.com/images/1/a.png?x=1&amp;y=2" />'),
  );
  expect(post?.image).toBe("https://clan.akamai.steamstatic.com/images/1/a.png?x=1&y=2");
});

test("maps Steam headings and keeps formatting", () => {
  expect(
    sanitizeSteamHtml(
      '<div class="bb_h2">Bosses</div><ul class="bb_ul"><li><p class="bb_paragraph">One</p></li></ul><p></p>',
    ),
  ).toBe("<h3>Bosses</h3><ul><li><p>One</p></li></ul>");
});

test("strips scripts, handlers and unsafe URLs", () => {
  const html = sanitizeSteamHtml(
    '<p onclick="x()">a<script>alert(1)</script><iframe src="https://x"><p>no</p></iframe>' +
      '<a href="javascript:alert(1)">b</a><img src="http://insecure/x.png" onerror="x()">' +
      '<img src="data:image/png;base64,AA"><style>p{}</style><svg><script>1</script></svg>c</p>',
  );
  expect(html).toBe("<p>abc</p>");
});

test("unwraps Steam's link filter and escapes attributes", () => {
  expect(
    sanitizeSteamHtml(
      '<a class="bb_link" href="https://steamcommunity.com/linkfilter/?u=https%3A%2F%2Fwww.elegon.app%2Fchangelog%3Fa%3D%22%3E" rel="">log</a>',
    ),
  ).toBe(
    '<a href="https://www.elegon.app/changelog?a=%22%3E" target="_blank" rel="noopener noreferrer nofollow">log</a>',
  );
  expect(
    sanitizeSteamHtml(
      '<a href="https://steamcommunity.com/linkfilter/?u=javascript:alert(1)">x</a>',
    ),
  ).toBe("x");
});

test("closes unbalanced tags and escapes stray brackets", () => {
  expect(sanitizeSteamHtml("<p><b>bold</p> 1 < 2 > 0")).toBe("<p><b>bold</b></p> 1 &lt; 2 &gt; 0");
  expect(sanitizeSteamHtml("<p>open")).toBe("<p>open</p>");
  expect(sanitizeSteamHtml("<p>A & B &amp; C</p>")).toBe("<p>A &amp; B &amp; C</p>");
  expect(sanitizeSteamHtml("</li></ul>text")).toBe("text");
});

test("excerpts cut on a word boundary", () => {
  expect(makeExcerpt("<p>short</p>")).toBe("short");
  const excerpt = makeExcerpt(`<p>${"word ".repeat(100)}</p>`, 50);
  expect(excerpt.endsWith("word…")).toBe(true);
  expect(excerpt.length).toBeLessThanOrEqual(51);
});
