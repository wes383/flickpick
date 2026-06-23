import type { SeedListEntry } from "@/types";
import { normalizeAward } from "@/lib/award-mapper";

export interface PresetListMeta {
  id: string;
  file: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
}

/** Raw JSON entry format (snake_case keys, year may be string). */
interface RawSeedListEntry {
  title?: string;
  year?: string | number;
  tmdb_id?: number;
  tmdbId?: number;
  imdbId?: string;
  imdb_id?: string;
  rating?: number;
  rank?: number;
  genres?: string[];
  award?: string;
}

function normalizeEntry(raw: RawSeedListEntry): SeedListEntry {
  const rawYear =
    typeof raw.year === "string" ? parseInt(raw.year, 10) : raw.year;
  return {
    title: raw.title,
    year: typeof rawYear === "number" && !isNaN(rawYear) ? rawYear : undefined,
    tmdbId: raw.tmdb_id ?? raw.tmdbId,
    imdbId: raw.imdbId ?? raw.imdb_id,
    rating: raw.rating,
    rank: raw.rank,
    genres: raw.genres,
    award: raw.award ? normalizeAward(raw.award) ?? raw.award : undefined,
  };
}

export const presetLists: PresetListMeta[] = [
  {
    id: "imdb-top-250",
    file: "imdb-top-250.json",
    name: "IMDb Top 250 movies",
    nameZh: "IMDB Top 250",
    description: "The highest-rated films on IMDB",
    descriptionZh: "IMDB 上评分最高的电影",
  },
  {
    id: "letterboxd-top-500",
    file: "letterboxd-top-500.json",
    name: "Letterboxd's Top 500 Films",
    nameZh: "Letterboxd Top 500",
    description: "Letterboxd community favorites",
    descriptionZh: "Letterboxd 社区最爱",
  },
  {
    id: "sight-sound-top-250",
    file: "sight-sound-top-250.json",
    name: "The Sight and Sound Greatest Films of All Time",
    nameZh: "《视与听》影史最佳电影",
    description: "BFI Sight & Sound critics' poll",
    descriptionZh: "BFI 视与听影评人投票",
  },
  {
    id: "tspdt-top-1000",
    file: "tspdt-top-1000.json",
    name: "TSPDT 1000 Greatest Films",
    nameZh: "TSPDT Top 1000",
    description: "They Shoot Pictures, Don't They? all-time greatest",
    descriptionZh: "TSPDT 史上最伟大 1000 部电影",
  },
  {
    id: "tspdt-21st-century-1000",
    file: "tspdt-21st-century-1000.json",
    name: "TSPDT 21st Century's 1000 Most Acclaimed Films",
    nameZh: "TSPDT 21世纪 Top 1000",
    description: "TSPDT greatest films of the 21st century",
    descriptionZh: "TSPDT 21世纪最伟大 1000 部电影",
  },
  {
    id: "oscar-winners",
    file: "oscar-winners.json",
    name: "Academy Awards",
    nameZh: "奥斯卡获奖名单",
    description: "All Academy Award categories",
    descriptionZh: "包含所有奥斯卡奖项",
  },
  {
    id: "cannes-winners",
    file: "cannes-winners.json",
    name: "Cannes Film Festival",
    nameZh: "戛纳电影节获奖名单",
    description: "All main competition prizes at Cannes Film Festival",
    descriptionZh: "戛纳电影节所有主竞赛单元奖项",
  },
  {
    id: "berlinale-awards",
    file: "berlinale-awards.json",
    name: "Berlin International Film Festival",
    nameZh: "柏林国际电影节获奖名单",
    description: "Selected prizes at the Berlin International Film Festival",
    descriptionZh: "柏林国际电影节部分主竞赛单元奖项",
  },
  {
    id: "venice-awards",
    file: "venice-awards.json",
    name: "Venice Film Festival",
    nameZh: "威尼斯电影节获奖名单",
    description: "Selected prizes at the Venice Film Festival",
    descriptionZh: "威尼斯电影节部分主竞赛单元奖项",
  },
  {
    id: "cahiers-du-cinema-top-10",
    file: "cahiers-du-cinema-top-10.json",
    name: "Cahiers du Cinéma Annual Top 10",
    nameZh: "《电影手册》年度十佳",
    description: "Cahiers du Cinéma critics' annual top 10 films",
    descriptionZh: "《电影手册》影评人年度十佳电影",
  },
  {
    id: "afi-100",
    file: "afi-100.json",
    name: "AFI's 100 Years...100 Movies",
    nameZh: "AFI 百年百大",
    description: "American Film Institute's 100 greatest American films",
    descriptionZh: "美国电影学会百年百大美国电影",
  },
  {
    id: "douban-top-250",
    file: "douban-top-250.json",
    name: "Douban Top 250",
    nameZh: "豆瓣 Top 250",
    description: "Douban's highest-rated films",
    descriptionZh: "豆瓣评分最高的电影",
  },
];

export async function loadPresetList(
  fileId: string
): Promise<SeedListEntry[]> {
  try {
    const data = await import(`@/data/${fileId}`);
    const raw = data.default as RawSeedListEntry[];
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeEntry);
  } catch {
    return [];
  }
}

export async function getPresetListSize(fileId: string): Promise<number> {
  try {
    const data = await import(`@/data/${fileId}`);
    return (data.default as SeedListEntry[]).length;
  } catch {
    return 0;
  }
}
