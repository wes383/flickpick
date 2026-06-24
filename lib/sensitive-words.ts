import { readFileSync } from "node:fs";
import { join } from "node:path";
import OpenCC from "opencc-js";
import { createClient } from "@supabase/supabase-js";

const LEET_MULTI_PATTERNS: Array<[RegExp, string]> = [
  [/\|_\|/g, "u"],      // |_| → u
  [/\\\//g, "v"],       // \/ → v
  [/\/\\/g, "v"],       // /\ → v
  [/\(\)/g, "o"],       // () → o
  [/\[\]/g, "o"],       // [] → o
  [/\{\}/g, "h"],       // {} → h
  [/\}\{/g, "h"],       // }{ → h
  [/#-/g, "h"],         // #- → h
  [/vv/g, "w"],         // vv → w
  [/\/\/\//g, "w"],     // \/\/ → w
  [/13/g, "b"],         // 13 → b
];

const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "^": "a",
  "*": "a",
  "&": "a",
  "△": "a",
  "▲": "a",
  "λ": "a",
  
  "8": "b",
  "ß": "b",
  
  "3": "e",
  "€": "e",
  
  "1": "i",
  "!": "i",
  "|": "i",
  
  "0": "o",
  
  "5": "s",
  $: "s",
  "§": "s",
  "%": "s",
  
  "7": "t",
  "+": "t",
  "†": "t",
  
  "6": "g",
  "9": "g",
  
  "#": "h",
  
  "(": "c",
  "[": "c",
  "<": "c",
  "{": "c",
  
  "2": "z",
  
  "/": "",
  "\\": "",
  "_": "",
  "-": "",
  ".": "",
  "=": "",
  "~": "",
  "`": "",
  "'": "",
  '"': "",
  ",": "",
  ";": "",
  ":": "",
};

const LEET_REGEX = /[@4^*&△▲λ8ß3€1!|05$§%7+†69#(\[<{2\/\\_\-.=~`'",;:]/g;

const LOOKALIKE_MAP: Record<string, string> = {
  'а': 'a', 'А': 'a',
  'е': 'e', 'Е': 'e',
  'о': 'o', 'О': 'o',
  'р': 'p', 'Р': 'p',
  'с': 'c', 'С': 'c',
  'у': 'y', 'У': 'y',
  'х': 'x', 'Х': 'x',
  'і': 'i', 'І': 'i',
  'ѕ': 's', 'Ѕ': 's',
  'ј': 'j', 'Ј': 'j',
  'ԁ': 'd', 'Ԁ': 'd',
  'ԛ': 'q', 'Ԛ': 'q',
  
  'α': 'a', 'Α': 'a',
  'β': 'b', 'Β': 'b',
  'ε': 'e', 'Ε': 'e',
  'ι': 'i', 'Ι': 'i',
  'ο': 'o', 'Ο': 'o',
  'ρ': 'p', 'Ρ': 'p',
  'τ': 't', 'Τ': 't',
  'υ': 'y', 'Υ': 'y',
  'χ': 'x', 'Χ': 'x',
  'ν': 'v', 'Ν': 'v',
  'κ': 'k', 'Κ': 'k',
  'μ': 'u', 'Μ': 'u',
  'η': 'n', 'Η': 'h',
  'ζ': 'z', 'Ζ': 'z',
  
  'ⅰ': 'i', 'ⅱ': 'ii', 'ⅲ': 'iii',
  'ⅳ': 'iv', 'ⅴ': 'v',
  'ⅼ': 'l',
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
  'Ⓐ': 'a', 'ⓐ': 'a',
  'Ⓑ': 'b', 'ⓑ': 'b',
  'Ⓒ': 'c', 'ⓒ': 'c',
  'Ⓓ': 'd', 'ⓓ': 'd',
  'Ⓔ': 'e', 'ⓔ': 'e',
  
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e',
  'ғ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j',
  'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o',
  'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u',
  'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y', 'ᴢ': 'z',
};

const t2sConverter = OpenCC.Converter({ from: "tw", to: "cn" });

function normalizeLookalikes(text: string): string {
  let result = "";
  for (const char of text) {
    result += LOOKALIKE_MAP[char] || char;
  }
  return result;
}

function compressRepeats(text: string): string {
  return text.replace(/(.)\1{2,}/g, '$1');
}

function normalize(text: string): string {
  let result = text;

  result = result.toLowerCase();

  result = result.replace(/[\uFF01-\uFF5E]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  result = result.replace(/\u3000/g, " ");

  result = t2sConverter(result);
  
  result = normalizeLookalikes(result);

  for (const [pattern, replacement] of LEET_MULTI_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  result = result.replace(LEET_REGEX, (ch) => LEET_MAP[ch] ?? ch);

  result = compressRepeats(result);

  result = result.replace(/[^\p{L}\p{N}]/gu, "");

  return result;
}

interface ACNode {
  children: Map<string, number>;
  fail: number;
  output: boolean;
}

class AhoCorasick {
  private nodes: ACNode[];

  constructor(patterns: string[]) {
    this.nodes = [{ children: new Map(), fail: 0, output: false }];
    for (const pattern of patterns) {
      this.insert(pattern);
    }
    this.buildFailLinks();
  }

  private insert(pattern: string): void {
    let current = 0;
    for (const char of pattern) {
      let next = this.nodes[current].children.get(char);
      if (next === undefined) {
        next = this.nodes.length;
        this.nodes.push({ children: new Map(), fail: 0, output: false });
        this.nodes[current].children.set(char, next);
      }
      current = next;
    }
    this.nodes[current].output = true;
  }

  private buildFailLinks(): void {
    const queue: number[] = [];
    let head = 0;

    for (const child of this.nodes[0].children.values()) {
      this.nodes[child].fail = 0;
      queue.push(child);
    }

    while (head < queue.length) {
      const current = queue[head++];
      for (const [char, child] of this.nodes[current].children) {
        queue.push(child);
        let fail = this.nodes[current].fail;
        while (fail !== 0 && !this.nodes[fail].children.has(char)) {
          fail = this.nodes[fail].fail;
        }
        this.nodes[child].fail = this.nodes[fail].children.get(char) ?? 0;
        if (this.nodes[this.nodes[child].fail].output) {
          this.nodes[child].output = true;
        }
      }
    }
  }

  search(text: string): boolean {
    let current = 0;
    for (const char of text) {
      while (current !== 0 && !this.nodes[current].children.has(char)) {
        current = this.nodes[current].fail;
      }
      current = this.nodes[current].children.get(char) ?? 0;
      if (this.nodes[current].output) {
        return true;
      }
    }
    return false;
  }
}

let cachedAutomaton: AhoCorasick | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function loadWordsFromSupabase(): Promise<string[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.storage
    .from("private-config")
    .download("sensitive_words.txt");

  if (error) throw error;

  const content = await data.text();
  return content
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

function loadWordsFromLocal(): string[] {
  const filePath = join(process.cwd(), "data", "sensitive_words.txt");
  const content = readFileSync(filePath, "utf-8");
  return content
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

async function getAutomaton(): Promise<AhoCorasick> {
  if (cachedAutomaton && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedAutomaton;
  }

  let words: string[] = [];

  try {
    words = await loadWordsFromSupabase();
  } catch (err) {
    console.warn("[SensitiveWords] Failed to load from Supabase, trying local file");
    
    try {
      words = loadWordsFromLocal();
    } catch {
      console.error("[SensitiveWords] All word sources failed, using empty list");
      words = [];
    }
  }

  words = [...new Set(words.map((w) => normalize(w)))].filter((w) => {
    if (!w) return false;
    if (w.length === 1 && /[a-z]/.test(w)) return false;
    return true;
  });

  cachedAutomaton = new AhoCorasick(words);
  cacheTimestamp = Date.now();

  return cachedAutomaton;
}

export async function containsSensitiveWord(text: string): Promise<boolean> {
  const normalized = normalize(text);
  if (!normalized) return false;
  
  const automaton = await getAutomaton();
  return automaton.search(normalized);
}
