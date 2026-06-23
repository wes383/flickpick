import type { SeedListEntry } from "@/types";

export interface ParsedCsvResult {
  entries: SeedListEntry[];
  source: "imdb" | "letterboxd" | "unknown";
  count: number;
  maxRating?: number;
}

export function parseCsv(csvText: string): ParsedCsvResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) {
    return { entries: [], source: "unknown", count: 0 };
  }

  const header = lines[0].toLowerCase();
  const source = detectSource(header);

  const imdbIdColumn = findColumnIndex(header, [
    "const",
    "imdb_id",
    "imdbid",
    "imdb",
  ]);

  const titleColumn = findColumnIndex(header, [
    "title",
    "name",
    "your name",
    "film",
    "movie",
  ]);

  const yearColumn = findColumnIndex(header, ["year", "release_year"]);

  const ratingColumn = findColumnIndex(header, [
    "your rating",
    "rating",
    "imdb rating",
  ]);

  const titleTypeColumn = findColumnIndex(header, ["title type"]);

  const entries: SeedListEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    if (titleTypeColumn >= 0) {
      const titleType = cols[titleTypeColumn]?.trim().toLowerCase();
      if (titleType && !titleType.includes("movie")) {
        continue;
      }
    }

    const rating = parseRating(ratingColumn, cols);

    if (imdbIdColumn >= 0 && cols[imdbIdColumn]) {
      const imdbId = cols[imdbIdColumn].trim();
      if (/^tt\d+$/.test(imdbId)) {
        entries.push({ imdbId, rating });
        continue;
      }
    }

    if (titleColumn >= 0 && cols[titleColumn] && yearColumn >= 0 && cols[yearColumn]) {
      const title = cols[titleColumn].trim().replace(/^"|"$/g, "");
      const year = parseInt(cols[yearColumn].trim(), 10);
      if (title && !isNaN(year)) {
        entries.push({ title, year, rating });
      }
    }
  }

  const maxRating =
    source === "imdb" ? 10 : source === "letterboxd" ? 5 : undefined;

  return { entries, source, count: entries.length, maxRating };
}

function detectSource(header: string): "imdb" | "letterboxd" | "unknown" {
  if (header.includes("letterboxd uri")) return "letterboxd";
  if (header.includes("const") && header.includes("your rating") && header.includes("imdb rating")) return "imdb";
  if (header.includes("name") && header.includes("year") && header.includes("rating")) return "letterboxd";
  return "unknown";
}

function findColumnIndex(header: string, candidates: string[]): number {
  const cols = header.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  for (const candidate of candidates) {
    const idx = cols.findIndex((c) => c === candidate || c.includes(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseRating(ratingColumn: number, cols: string[]): number | undefined {
  if (ratingColumn < 0 || !cols[ratingColumn]) return undefined;
  const val = parseFloat(cols[ratingColumn].trim());
  return isNaN(val) ? undefined : val;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
