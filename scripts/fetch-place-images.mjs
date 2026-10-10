// Fetches real photos for every city and place in frontend/src/data/destinations.js
// from Wikipedia / Wikimedia Commons and writes scripts/place-images.json.
//
// Usage: node scripts/fetch-place-images.mjs
//
// Every image records its author, license and how it was found:
//   source "article" — taken from the place's own Wikipedia article (high confidence)
//   source "commons" — found by a Wikimedia Commons search (low confidence, check by eye)

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(ROOT, "frontend/src/data/destinations.js");
const OUT_FILE = join(ROOT, "scripts/place-images.json");

const UA = "PravasiImageBot/1.0 (shivkaransinghbais2820@gmail.com)";
const DELAY_MS = 300;
const COVER_WIDTH = 900;
const CARD_WIDTH = 1200;
const GALLERY_WIDTH = 1200;

// Wikipedia article for each city's cover photo. The cover must not reuse a place's photo.
const CITY_ARTICLES = {
  bangalore: ["Vidhana Soudha", "Bangalore"],
  mysore: ["Mysore Dasara", "Mysore"],
  coorg: ["Kodagu district", "Madikeri"],
  chikmagalur: ["Chikmagalur", "Chikmagalur district"],
  kochi: ["Kochi", "Fort Kochi"],
  munnar: ["Munnar"],
  alleppey: ["Alappuzha", "Kuttanad"],
  wayanad: ["Wayanad district"],
  chennai: ["Chennai", "Ripon Building"],
  ooty: ["Ooty", "Nilgiris district"],
  kodaikanal: ["Kodaikanal"],
  pondicherry: ["Pondicherry"],
  tirupati: ["Tirupati", "Tirumala"],
  visakhapatnam: ["Visakhapatnam"],
  hyderabad: ["Hyderabad"],
};

// Wikipedia article titles for places whose names don't search cleanly.
// A missing title falls back to a search for "{place} {city}".
const PLACE_ARTICLES = {
  "Lalbagh Botanical Garden": "Lal Bagh",
  "Cubbon Park": "Cubbon Park",
  "Bangalore Palace": "Bangalore Palace",
  "Nandi Hills": "Nandi Hills, India",
  "ISKCON Temple": "ISKCON Temple Bangalore",
  "Commercial Street": "Commercial Street, Bangalore",
  "Mysore Palace": "Mysore Palace",
  "Chamundi Hills": "Chamundi Hills",
  "Brindavan Gardens": "Brindavan Gardens",
  "St. Philomena's Cathedral": "St. Philomena's Church, Mysore",
  "Devaraja Market": "Devaraja Market",
  "Karanji Lake": "Karanji Lake",
  "Abbey Falls": "Abbey Falls",
  "Raja's Seat": "Raja's Seat",
  "Namdroling Monastery": "Namdroling Monastery",
  "Dubare Elephant Camp": "Dubare",
  "Madikeri Fort": "Madikeri Fort",
  "Mandalpatti Viewpoint": "Mandalpatti",
  "Mullayanagiri Peak": "Mullayanagiri",
  "Baba Budangiri": "Baba Budangiri",
  "Hebbe Falls": "Hebbe Falls",
  "Kemmangundi": "Kemmangundi",
  "Sringeri Sharada Temple": "Sringeri Sharada Peetham",
  "Fort Kochi Beach": "Fort Kochi",
  "Chinese Fishing Nets": "Chinese fishing nets",
  "Mattancherry Palace": "Mattancherry Palace",
  "Jew Town & Paradesi Synagogue": "Paradesi Synagogue",
  "Marine Drive": "Marine Drive, Kochi",
  "Eravikulam National Park": "Eravikulam National Park",
  "Mattupetty Dam": "Mattupetty Dam",
  "Top Station": "Top Station",
  "Kundala Lake": "Kundala Dam",
  "Backwater Houseboat Ride": "Kettuvallam",
  "Alleppey Beach": "Alappuzha Beach",
  "Vembanad Lake": "Vembanad",
  "Krishnapuram Palace": "Krishnapuram Palace",
  "Marari Beach": "Mararikulam",
  "Kumarakom Bird Sanctuary": "Kumarakom Bird Sanctuary",
  "Edakkal Caves": "Edakkal Caves",
  "Chembra Peak": "Chembra Peak",
  "Banasura Sagar Dam": "Banasura Sagar Dam",
  "Wayanad Wildlife Sanctuary": "Wayanad Wildlife Sanctuary",
  "Soochipara Falls": "Soochipara Falls",
  "Thirunelli Temple": "Thirunelli Temple",
  "Marina Beach": "Marina Beach",
  "Kapaleeshwarar Temple": "Kapaleeshwarar Temple",
  "Fort St. George": "Fort St. George, India",
  "Santhome Cathedral": "San Thome Church",
  "DakshinaChitra Museum": "DakshinaChitra",
  "Ooty Lake": "Ooty Lake",
  "Nilgiri Mountain Railway": "Nilgiri Mountain Railway",
  "Government Botanical Gardens": "Government Botanical Garden, Ooty",
  "Doddabetta Peak": "Doddabetta",
  "Pykara Falls": "Pykara",
  "Kodaikanal Lake": "Kodaikanal Lake",
  "Coaker's Walk": "Coaker's Walk",
  "Bryant Park": "Bryant Park, Kodaikanal",
  "Pillar Rocks": "Pillar Rocks",
  "Silver Cascade Falls": "Silver Cascade Falls",
  "Kurinji Andavar Temple": "Kurinji Andavar Temple",
  "Promenade Beach": "Promenade Beach",
  "White Town (French Quarter)": "White Town, Pondicherry",
  "Auroville": "Matrimandir",
  "Sri Aurobindo Ashram": "Sri Aurobindo Ashram",
  "Paradise Beach": "Paradise Beach, Pondicherry",
  "Tirumala Venkateswara Temple": "Tirumala Venkateswara Temple",
  "Sri Padmavathi Temple": "Padmavathi Ammavari Temple",
  "Chandragiri Fort": "Chandragiri Fort",
  "Talakona Waterfalls": "Talakona",
  "Silathoranam Natural Arch": "Silathoranam",
  "Kapila Theertham": "Kapila Theertham",
  "RK Beach": "Ramakrishna Beach",
  "Kailasagiri Hill": "Kailasagiri",
  "Borra Caves": "Borra Caves",
  "INS Kursura Submarine Museum": "INS Kursura (S20)",
  "Yarada Beach": "Yarada Beach",
  "Simhachalam Temple": "Simhachalam",
  "Charminar": "Charminar",
  "Golconda Fort": "Golconda",
  "Hussain Sagar Lake": "Hussain Sagar",
  "Chowmahalla Palace": "Chowmahalla Palace",
  "Laad Bazaar": "Laad Bazaar",
  "Ramoji Film City": "Ramoji Film City",
};

// Places that are an activity rather than a landmark: go straight to a Commons topic search.
const COMMONS_TOPICS = {
  "Coffee Estate Walks": ["Chikmagalur coffee plantation", "Coffee plantation Karnataka"],
  "Kathakali Performance": ["Kathakali Kochi", "Kathakali"],
  "Tea Museum": ["Munnar tea museum", "Munnar tea factory"],
  "Echo Point": ["Echo Point Munnar", "Munnar lake"],
  "Tea Factory": ["Nilgiris tea factory", "Ooty tea factory"],
  "Rue Suffren Cafes": ["Pondicherry White Town street", "Pondicherry French Quarter street"],
  "T. Nagar Shopping": ["Ranganathan Street", "T. Nagar Chennai"],
};

// Filenames that are never a photo of the place itself.
const SKIP_FILE = /\.(svg|gif|png|tiff?|pdf|ogg|ogv|webm|mp3|wav)$|logo|map|flag|icon|seal|emblem|locator|location|diagram|plan\b|coat[_ ]of[_ ]arms|signature|symbol|montage|collage|chart|graph|stamp|banner|portrait|painting|drawing|sketch|lithograph|engraving|watercolou?r|illustration|wikipedia|wiki_|commons-|question_book|edit-clear|ambox|crystal_clear|nuvola|disambig|padlock|oojs|_cropped_face|selfie|bust_of|statue_of_(sri|swami|mahatma)|prabhupada|_with_family|\b1[5-8]\d\d\b/i;
const SKIP_CATEGORY = /portrait|paintings|drawings|maps of|logos|diagrams|people of|selfies|engravings|lithographs|illustrations/i;
const MIN_WIDTH = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (s = "") =>
  s.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

async function http(url, { method = "GET", json = true } = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(DELAY_MS);
    try {
      const res = await fetch(url, { method, headers: { "User-Agent": UA, "Api-User-Agent": UA } });
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!json) return res;
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await sleep(1000);
    }
  }
  return null;
}

const wikiApi = (params) =>
  http(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`);
const commonsApi = (params) =>
  http(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params })}`);

const significantWords = (s) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
    .filter((w) => w.length > 3 && !["temple", "beach", "falls", "lake", "park", "peak", "fort", "palace", "hill", "hills", "national", "museum", "walks", "ride", "garden", "gardens", "india"].includes(w));

async function resolveArticle(title) {
  const summary = await http(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  if (!summary || summary.type === "disambiguation" || !summary.title) return null;
  return summary;
}

async function findArticle(place, city) {
  const hint = PLACE_ARTICLES[place.name];
  if (hint) {
    const summary = await resolveArticle(hint);
    if (summary) return summary;
  }
  const res = await wikiApi({ action: "query", list: "search", srsearch: `${place.name} ${city.name}`, srlimit: "5" });
  const words = significantWords(place.name);
  for (const hit of res?.query?.search ?? []) {
    const t = hit.title.toLowerCase();
    // Only accept a search hit that is actually about this place, not the city it's in.
    if (words.length && words.some((w) => t.includes(w))) {
      const summary = await resolveArticle(hit.title);
      if (summary) return summary;
    }
  }
  return null;
}

function fileTitleFromUrl(url) {
  const m = decodeURIComponent(url.split("?")[0]).match(/\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/);
  return m ? `File:${m[1].replace(/_/g, " ")}` : null;
}

async function imageInfo(api, titles, width) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const res = await api({
      action: "query",
      titles: titles.slice(i, i + 40).join("|"),
      prop: "imageinfo|categories",
      cllimit: "max",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(width),
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|NonFree|Categories",
    });
    for (const page of res?.query?.pages ?? []) {
      const ii = page.imageinfo?.[0];
      if (!ii) continue;
      out.push({ title: page.title, ii, categories: (page.categories ?? []).map((c) => c.title).join(" ") });
    }
  }
  return out;
}

function toCandidate({ title, ii, categories }, source, article, query) {
  const meta = ii.extmetadata ?? {};
  const cats = `${categories} ${meta.Categories?.value ?? ""}`;
  if (!ii.url?.includes("/wikipedia/commons/")) return null; // enwiki-local files are usually non-free
  if (meta.NonFree?.value) return null;
  if (!/^image\/(jpeg|webp)$/.test(ii.mime)) return null;
  if (SKIP_FILE.test(title) || SKIP_CATEGORY.test(cats)) return null;
  if (ii.width < MIN_WIDTH) return null;
  return {
    file: title,
    original: ii.url,
    thumb: ii.thumburl ?? ii.url,
    width: ii.width,
    height: ii.height,
    landscape: ii.width >= ii.height * 1.15,
    author: stripHtml(meta.Artist?.value) || "Unknown",
    license: stripHtml(meta.LicenseShortName?.value) || "See source",
    licenseUrl: meta.LicenseUrl?.value ?? null,
    descriptionUrl: ii.descriptionurl,
    source,
    article: article ?? null,
    query: query ?? null,
  };
}

async function articleCandidates(summary, width) {
  const titles = [];
  const lead = summary.originalimage?.source && fileTitleFromUrl(summary.originalimage.source);
  if (lead) titles.push(lead);
  const res = await wikiApi({ action: "query", titles: summary.title, prop: "images", imlimit: "max" });
  for (const img of res?.query?.pages?.[0]?.images ?? []) {
    if (!titles.includes(img.title) && !SKIP_FILE.test(img.title)) titles.push(img.title);
  }
  const infos = await imageInfo(wikiApi, titles, width);
  // Keep the article's lead image first, then the rest in article order.
  infos.sort((a, b) => titles.indexOf(a.title) - titles.indexOf(b.title));
  return infos.map((i) => toCandidate(i, "article", summary.title)).filter(Boolean);
}

async function commonsCandidates(query, width) {
  const res = await commonsApi({ action: "query", list: "search", srnamespace: "6", srsearch: query, srlimit: "20" });
  const titles = (res?.query?.search ?? []).map((h) => h.title).filter((t) => !SKIP_FILE.test(t));
  if (!titles.length) return [];
  const infos = await imageInfo(commonsApi, titles, width);
  infos.sort((a, b) => titles.indexOf(a.title) - titles.indexOf(b.title));
  return infos.map((i) => toCandidate(i, "commons", null, query)).filter(Boolean);
}

async function verify(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await http(url, { method: "HEAD", json: false });
    if (res?.ok && (res.headers.get("content-type") ?? "").startsWith("image/")) return true;
  }
  return false;
}

const usedFiles = new Set();

// Picks up to `count` unused, verified candidates, preferring landscape when asked.
async function pick(candidates, count, { preferLandscape = false, preferPortrait = false } = {}) {
  const ordered = [...candidates];
  if (preferLandscape) ordered.sort((a, b) => Number(b.landscape) - Number(a.landscape));
  if (preferPortrait) ordered.sort((a, b) => a.width / a.height - b.width / b.height);
  const chosen = [];
  for (const c of ordered) {
    if (chosen.length >= count) break;
    if (usedFiles.has(c.file) || chosen.some((x) => x.file === c.file)) continue;
    if (!(await verify(c.thumb))) continue;
    chosen.push(c);
  }
  chosen.forEach((c) => usedFiles.add(c.file));
  return chosen;
}

const toImage = ({ thumb, file, width, height, author, license, licenseUrl, descriptionUrl, source, article, query }) => ({
  url: thumb, file, width, height, author, license, licenseUrl, descriptionUrl, source, article, query,
});

async function main() {
  const src = await readFile(DATA_FILE, "utf8");
  const { CITIES } = await import(`data:text/javascript,${encodeURIComponent(src)}`);
  const result = { generatedAt: new Date().toISOString(), cities: {} };
  const problems = [];

  // Places first, so city covers can't take a photo a place needs.
  const placeResults = {};
  for (const city of CITIES) {
    placeResults[city.slug] = {};
    for (const place of city.places) {
      let article = null;
      let pool = [];
      if (!COMMONS_TOPICS[place.name]) {
        const summary = await findArticle(place, city);
        if (summary) {
          article = summary.title;
          pool = await articleCandidates(summary, CARD_WIDTH);
        }
      }
      // Card: the article's lead photo if it is landscape, else any landscape photo from the article.
      let [card] = await pick(pool, 1, { preferLandscape: true });
      let gallery = await pick(pool, 2);
      const queries = COMMONS_TOPICS[place.name] ?? [`${place.name} ${city.name}`, place.name];
      for (const q of queries) {
        if (card && gallery.length === 2) break;
        const extra = await commonsCandidates(q, CARD_WIDTH);
        if (!card) [card] = await pick(extra, 1, { preferLandscape: true });
        if (gallery.length < 2) gallery = gallery.concat(await pick(extra, 2 - gallery.length));
      }
      if (!card || gallery.length < 2) problems.push(`${city.slug}/${place.slug}: card=${!!card} gallery=${gallery.length}`);
      placeResults[city.slug][place.slug] = {
        name: place.name,
        article,
        card: card ? toImage(card) : null,
        gallery: gallery.map(toImage),
      };
      console.log(`${city.slug}/${place.slug}: ${article ?? "(no article)"} — ${[card, ...gallery].filter(Boolean).map((c) => c.source).join(", ")}`);
    }
  }

  for (const city of CITIES) {
    let cover = null;
    let coverArticle = null;
    for (const title of CITY_ARTICLES[city.slug] ?? [city.name]) {
      const summary = await resolveArticle(title);
      if (!summary) continue;
      [cover] = await pick(await articleCandidates(summary, COVER_WIDTH), 1, { preferPortrait: true });
      if (cover) { coverArticle = summary.title; break; }
    }
    if (!cover) {
      [cover] = await pick(await commonsCandidates(`${city.name} city`, COVER_WIDTH), 1, { preferPortrait: true });
    }
    if (!cover) problems.push(`${city.slug}: no cover`);
    result.cities[city.slug] = { name: city.name, article: coverArticle, cover: cover ? toImage(cover) : null, places: placeResults[city.slug] };
    console.log(`${city.slug} cover: ${cover?.file ?? "NONE"}`);
  }

  await writeFile(OUT_FILE, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`\nWrote ${OUT_FILE}`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):\n${problems.join("\n")}`);
    process.exitCode = 1;
  }
}

main();
