import type { Language } from "@/types";

const TMDB_LANG_MAP: Record<Language, string> = {
  en: "en-US",
  zh: "zh-CN",
};

export function toTmdbLanguage(lang: Language): string {
  return TMDB_LANG_MAP[lang];
}

export const dictionaries = {
  en: {
    // Brand
    brand: "FlickPick",
    tagline: "Discover Your Top 10 Films",

    // Nav
    nav: {
      home: "Home",
      setup: "Setup",
      rank: "Rank",
      results: "Results",
      community: "Community",
      settings: "Settings",
      about: "About",
    },

    // Home page
    home: {
      heroTitle: "Find your Top 10 films",
      heroSubtitle:
        "Build a seed list from curated rankings, TMDB filters, or your own IMDB & Letterboxd exports. Then let head-to-head comparisons reveal your true favorites.",
      cta: "Get Started",
      secondaryCta: "How it works",
      step1Title: "Build your seed list",
      step1Desc:
        "Choose from curated lists, filter TMDB, import CSV, or search manually.",
      step2Title: "Compare head-to-head",
      step2Desc:
        "Pick your preferred film in each matchup. Borda counting tracks your taste.",
      step3Title: "See your Top 10",
      step3Desc:
        "Your personal ranking emerges from every choice you make.",
      featuresTitle: "Why FlickPick",
      feature1: "Curated Lists",
      feature1Desc: "IMDB, Letterboxd, Sight & Sound, TSPDT, and more.",
      feature2: "Smart Algorithm",
      feature2Desc: "Borda count with active sampling ensures optimal, robust rankings.",
      feature3: "Import Anywhere",
      feature3Desc: "Bring your IMDB and Letterboxd lists in seconds.",
    },

    // Setup page
    setup: {
      title: "Build Your Seed List",
      subtitle: "Add films from multiple sources to create your ranking pool.",
      tabPreset: "Curated Lists",
      tabTmdb: "Filter",
      tabCsv: "CSV Import",
      tabSearch: "Search",
      selected: "selected",
      movies: "films",
      startRanking: "Start Ranking",
      remove: "Remove",
      preview: "Preview",
      empty: "No films selected yet.",
      activeDesc: "You have an ongoing ranking. Go back to continue, or reset to start over.",
      activeResume: "Continue Ranking",
      activeReset: "Reset & Start Over",
      activeResetConfirm: "Reset Ranking?",
      activeResetDesc: "This will clear all your current matchups and results. You will need to start over from the seed list.",
      activeResetDone: "Ranking reset",
      activeFilms: "{count} films seeded · {comparisons} matchups completed",

      // Preset lists
      presetSubtitle: "Pick from renowned curated film lists.",
      listSelected: "Selected",
      listEmpty: "This list is empty. Fill the JSON file to use it.",
      loadList: "Load",
      loadingList: "Loading...",
      resolveError: "Failed to resolve some films.",
      presetBackToList: "Back to list menu",
      presetAward: "Award",
      presetRankRange: "Rank Range",
      presetLastUpdated: "Updated",
      presetNoResults: "No results.",
      presetResolving: "Resolving films... {resolved}/{total}",

      // TMDB filter
      tmdbSubtitle: "Filter to build a custom seed list.",
      genres: "Genres",
      yearRange: "Year Range",
      minRating: "Minimum Rating",
      minVotes: "Minimum Votes",
      language: "Language",
      sortBy: "Sort By",
      count: "Number of films",
      sortedBy: "Sorted by vote count",
      apply: "Apply Filter",
      applying: "Fetching...",
      sortPopularity: "Popularity",
      sortRating: "Rating",
      sortReleaseDate: "Release Date",
      sortTitle: "Title",
      languageOptions: [
        "Any language",
        "English",
        "Chinese",
        "Spanish",
        "French",
        "German",
        "Italian",
        "Japanese",
        "Korean",
        "Portuguese",
        "Russian",
        "Hindi",
        "Arabic",
        "Danish",
        "Dutch",
        "Finnish",
        "Norwegian",
        "Polish",
        "Swedish",
        "Turkish",
        "Vietnamese",
        "Thai",
        "Indonesian",
        "Malay",
        "Czech",
        "Greek",
        "Hebrew",
        "Hungarian",
        "Romanian",
        "Ukrainian",
        "Bengali",
        "Filipino",
        "Tamil",
        "Persian",
        "Tibetan",
        "Bulgarian",
      ],
      genreOptions: [
        // 28
        "Action",
        // 12
        "Adventure",
        // 16
        "Animation",
        // 35
        "Comedy",
        // 80
        "Crime",
        // 99
        "Documentary",
        // 18
        "Drama",
        // 10751
        "Family",
        // 14
        "Fantasy",
        // 36
        "History",
        // 27
        "Horror",
        // 10402
        "Music",
        // 9648
        "Mystery",
        // 10749
        "Romance",
        // 878
        "Science Fiction",
        // 10770
        "TV Movie",
        // 53
        "Thriller",
        // 10752
        "War",
        // 37
        "Western",
      ],

      // CSV import
      csvSubtitle: "Import your IMDB or Letterboxd CSV export.",
      csvHowTo: "How to get a CSV? IMDB: Your Ratings → ⋮ Actions → Export. Letterboxd: Settings → Data → Export your data, then extract ratings.csv from the ZIP. Other CSVs are also supported if they contain an IMDb ID column (Const, imdb_id) or a title column (Title, Name) + year column (Year, release_year). A rating column is optional for filtering by score.",
      csvDropzone: "Drop CSV file here or click to browse",
      csvParsed: "Parsed {count} entries from {source}",
      csvImport: "Import",
      csvImporting: "Importing...",
      csvError: "Failed to parse CSV file.",
      csvResolveError: "Resolved {resolved} of {total} films.",
      csvRatingFilter: "Filter by minimum rating",
      csvNoFilter: "No filter",
      csvRatingCount: "{count} entries with ratings",
      csvStartResolve: "Start Resolving",
      csvEntriesAfterFilter: "{count} entries to resolve",
      csvUnmatched: "{count} unmatched",
      csvUnmatchedSearch: "Search",
      csvUnmatchedMatch: "Match",

      // Search
      searchSubtitle: "Search for specific films.",
      searchPlaceholder: "Search for a film...",
      searchResults: "Results",
      noResults: "No results found.",
      add: "Add",
      added: "Added",
      alreadyAdded: "{count} already added",
      allAdded: "All results are already in your seed list.",
      loadMore: "Load More",
      noMore: "No more results.",
      clearAll: "Clear all",
      clearAllConfirm: "Clear all films?",
      clearAllDescription:
        "This will remove all films from your seed list. This cannot be undone.",
      cleared: "Cleared",
    },

    // Rank page
    rank: {
      title: "Which do you prefer?",
      subtitle: "Click the film you like more.",
      progress: "Matchup {current}",
      progressLabel: "Progress",
      viewResults: "View Results",
      undo: "Undo",
      skip: "Skip",
      empty: "No films in your seed list.",
      goSetup: "Go to Setup",
      keyboardHint: "Use ← / → keys to choose",
      keyLeft: "←",
      keyRight: "→",
      loading: "Loading next matchup...",
      complete: "Top 10 Complete!",
      completeDesc: "Found in {count} matchups.",
      found: "{found}/{total} found",
    },

    // Results page
    results: {
      title: "Your Top 10",
      subtitle: "Based on {count} matchups across {films} films.",
      rank: "Rank",
      film: "Film",
      restart: "Start Over",
      share: "Share Image",
      shareGenerating: "Generating...",
      shareCardTitle: "My Top 10 Films",
      shareCardSubtitle: "Based on {count} matchups across {films} films",
      empty: "No results yet. Complete some matchups first.",
      notReady: "Your Top 10 isn't ready yet. Keep comparing to finish.",
      goRank: "Go to Ranking",
      uploadToPublic: "Upload to Public",
      uploadDialog: {
        title: "Share Your Top 10",
        desc: "Publish your Top 10 to the community board. Others can like your list.",
        usernameLabel: "Username",
        usernamePlaceholder: "Enter a display name",
        confirm: "Upload",
        success: "Uploaded to community",
        failed: "Upload failed",
        replaceWarning: "You already have an uploaded list. Replacing will delete your current list and reset all likes.",
        sensitiveError: "This username is not available.",
      },
    },

    // Community page
    community: {
      title: "Community Top 100",
      subtitle: "Browse Top 100 lists shared by film lovers. Like your favorites.",
      tabSiteTop: "Site-wide Top 100",
      tabAllLists: "All Lists",
      siteTopTitle: "Site-wide Top 100",
      siteTopSubtitle: "Aggregated from all uploads, weighted by rank position.",
      allListsTitle: "All Lists",
      sortRecent: "Most Recent",
      sortLikes: "Most Liked",
      loadMore: "Load More",
      empty: "No lists yet. Be the first to upload!",
      deleteMine: "Delete My Upload",
      ownListDesc: "This is your uploaded list. Delete it to upload a new one.",
      yours: "You",
      deleted: "Your upload has been deleted.",
      score: "Score",
      appearances: "in",
      director: "Director",
      viewCompact: "List",
      viewCards: "Cards",
    },

    // Settings
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      clearData: "Clear All Data",
      clearDataDesc: "Remove your session and all stored data.",
      clearDataConfirm: "Are you sure? This cannot be undone.",
      apiStatus: "TMDB API",
      apiConfigured: "Configured",
      apiNotConfigured: "Not configured",
    },

    // Common
    common: {
      loading: "Loading...",
      error: "Something went wrong.",
      retry: "Retry",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      next: "Next",
    },

    // About page
    about: {
      title: "About FlickPick",
      intro: "FlickPick helps you discover your personal top 10 films. Pick a seed list from curated rankings, then decide each head-to-head matchup — the algorithm narrows down your true favorites with minimal comparisons.",
      algorithmDesc: "FlickPick uses a Tournament Tree with Replacement algorithm to find your Top 10 films with the fewest possible comparisons. It is the engineering-optimal solution for noiseless pairwise selection.",
      algorithmStep1Desc: "All films are placed as leaves of a complete binary tree. Adjacent films compete head-to-head, and winners advance upward. After N−1 matchups, the root holds your #1 film.",
      algorithmStep2Desc: "The champion is removed, and the path from its leaf to the root is re-evaluated. Each subsequent rank requires at most ⌈log₂N⌉ additional comparisons. The total is (N−1) + (K−1) × ⌈log₂N⌉.",
      algorithmOptimalDesc: "For N=200 and K=10, you need only ~271 matchups — 85% fewer than fully sorting all films. This is the best achievable in the pairwise comparison model without noise.",
      communityDesc: "After ranking your films, you can publish your Top 10 to the Community board. Browse other users' lists and give a heart to the lists you agree with. The site-wide Top 100 aggregates all uploads into a crowd-sourced global ranking — weighted by rank position so higher-placed films earn more points.",
      listImdb: "IMDb Top 250 — updated June 23, 2026",
      listLetterboxd: "Letterboxd Top 500 — updated June 23, 2026",
      listDouban: "Douban Top 250 — updated June 23, 2026",
      listSightSound: "Sight & Sound Greatest Films — 2022 Critics' Poll",
      listTspdt1000: "TSPDT 1000 Greatest Films — 2026 edition",
      listTspdt21st: "TSPDT 21st Century 1000 — 2026 edition",
      listAfi: "AFI's 100 Years…100 Movies — 10th Anniversary Edition",
      tmdbFullAttribution: "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.",
    },
  },

  zh: {
    brand: "FlickPick",
    tagline: "发现你的十佳电影",

    nav: {
      home: "首页",
      setup: "构建",
      rank: "对决",
      results: "结果",
      community: "社区",
      settings: "设置",
      about: "关于",
    },

    home: {
      heroTitle: "找到你的十佳电影",
      heroSubtitle:
        "从经典榜单、TMDB 筛选或 IMDB、Letterboxd 导入中构建种子库，通过两两对决揭示你真正最爱的电影。",
      cta: "开始使用",
      secondaryCta: "了解原理",
      step1Title: "构建种子库",
      step1Desc: "从经典榜单、TMDB 筛选、CSV 导入或手动搜索中添加电影。",
      step2Title: "两两对决",
      step2Desc: "在每组对决中选择你更喜欢的电影，Borda 计数法会追踪你的品味。",
      step3Title: "查看十佳",
      step3Desc: "你的个人排名从每一次选择中自然浮现。",
      featuresTitle: "为什么选择 FlickPick",
      feature1: "经典榜单",
      feature1Desc: "IMDB、Letterboxd、视与听、TSPDT 等。",
      feature2: "智能算法",
      feature2Desc: "Borda 计数结合主动采样，确保排名最优且鲁棒。",
      feature3: "随处导入",
      feature3Desc: "几秒内导入你的 IMDB 和 Letterboxd 列表。",
    },

    setup: {
      title: "构建你的种子库",
      subtitle: "从多个来源添加电影，创建你的排名池。",
      tabPreset: "经典榜单",
      tabTmdb: "筛选",
      tabCsv: "CSV 导入",
      tabSearch: "搜索",
      selected: "已选",
      movies: "部电影",
      startRanking: "开始排名",
      remove: "移除",
      preview: "预览",
      empty: "尚未选择电影。",
      activeDesc: "你有一个正在进行的排名。返回对决页面继续，或重置重新开始。",
      activeResume: "继续对决",
      activeReset: "重置并重新开始",
      activeResetConfirm: "重置排名？",
      activeResetDesc: "这将清除当前所有的对决记录和结果，你需要从种子库重新开始。",
      activeResetDone: "排名已重置",
      activeFilms: "已选 {count} 部电影 · 已完成 {comparisons} 场对决",

      // Preset lists
      presetSubtitle: "从知名电影榜单中选择。",
      listSelected: "已选",
      listEmpty: "此榜单为空。请填充 JSON 文件后使用。",
      loadList: "加载",
      loadingList: "加载中...",
      resolveError: "部分电影解析失败。",
      presetBackToList: "返回列表菜单",
      presetAward: "奖项",
      presetRankRange: "排名范围",
      presetLastUpdated: "更新于",
      presetNoResults: "无匹配结果。",
      presetResolving: "正在匹配电影... {resolved}/{total}",

      tmdbSubtitle: "筛选构建自定义种子库。",
      genres: "类型",
      yearRange: "年份范围",
      minRating: "最低评分",
      minVotes: "最低投票数",
      language: "语言",
      sortBy: "排序方式",
      count: "电影数量",
      sortedBy: "按评分数排序",
      apply: "应用筛选",
      applying: "获取中...",
      sortPopularity: "流行度",
      sortRating: "评分",
      sortReleaseDate: "上映日期",
      sortTitle: "标题",
      languageOptions: [
        "不限语言",
        "英语",
        "中文",
        "西班牙语",
        "法语",
        "德语",
        "意大利语",
        "日语",
        "韩语",
        "葡萄牙语",
        "俄语",
        "印地语",
        "阿拉伯语",
        "丹麦语",
        "荷兰语",
        "芬兰语",
        "挪威语",
        "波兰语",
        "瑞典语",
        "土耳其语",
        "越南语",
        "泰语",
        "印度尼西亚语",
        "马来语",
        "捷克语",
        "希腊语",
        "希伯来语",
        "匈牙利语",
        "罗马尼亚语",
        "乌克兰语",
        "孟加拉语",
        "菲律宾语",
        "泰米尔语",
        "波斯语",
        "藏语",
        "保加利亚语",
      ],
      genreOptions: [
        // 28
        "动作",
        // 12
        "冒险",
        // 16
        "动画",
        // 35
        "喜剧",
        // 80
        "犯罪",
        // 99
        "纪录片",
        // 18
        "剧情",
        // 10751
        "家庭",
        // 14
        "奇幻",
        // 36
        "历史",
        // 27
        "恐怖",
        // 10402
        "音乐",
        // 9648
        "悬疑",
        // 10749
        "爱情",
        // 878
        "科幻",
        // 10770
        "电视电影",
        // 53
        "惊悚",
        // 10752
        "战争",
        // 37
        "西部",
      ],

      csvSubtitle: "导入你的 IMDB 或 Letterboxd CSV 导出文件。",
      csvHowTo: "如何获取 CSV？IMDB：Your Ratings → ⋮ Actions → Export。Letterboxd：Settings → Data → Export your data，解压得到 ratings.csv 文件。其他来源的 CSV 只要包含 IMDb ID 列（Const、imdb_id）或标题列（Title、Name）+ 年份列（Year、release_year）即可解析。可选包含评分列（Rating）用于按分数筛选。",
      csvDropzone: "拖放 CSV 文件到此处或点击浏览",
      csvParsed: "从 {source} 解析了 {count} 条记录",
      csvImport: "导入",
      csvImporting: "导入中...",
      csvError: "CSV 文件解析失败。",
      csvResolveError: "成功解析 {resolved}/{total} 部电影。",
      csvRatingFilter: "按最低评分筛选",
      csvNoFilter: "不限",
      csvRatingCount: "{count} 条含评分记录",
      csvStartResolve: "开始匹配",
      csvEntriesAfterFilter: "共 {count} 条待匹配",
      csvUnmatched: "{count} 条未匹配",
      csvUnmatchedSearch: "搜索",
      csvUnmatchedMatch: "匹配",

      searchSubtitle: "搜索查找特定电影。",
      searchPlaceholder: "搜索电影...",
      searchResults: "搜索结果",
      noResults: "未找到结果。",
      add: "添加",
      added: "已添加",
      alreadyAdded: "已添加 {count} 部",
      allAdded: "结果已全部添加到种子库。",
      loadMore: "加载更多",
      noMore: "没有更多结果。",
      clearAll: "清除全部",
      clearAllConfirm: "清除全部电影？",
      clearAllDescription: "将从种子库中移除所有电影，此操作不可撤销。",
      cleared: "已清除",
    },

    rank: {
      title: "你更喜欢哪一部？",
      subtitle: "点击你更喜欢的电影。",
      progress: "第 {current} 场对决",
      progressLabel: "进度",
      viewResults: "查看结果",
      undo: "撤销",
      skip: "跳过",
      empty: "种子库中没有电影。",
      goSetup: "去构建种子库",
      keyboardHint: "使用 ← / → 键选择",
      keyLeft: "←",
      keyRight: "→",
      loading: "正在加载下一组对决...",
      complete: "十佳已揭晓！",
      completeDesc: "共 {count} 场对决。",
      found: "已确定 {found}/{total}",
    },

    results: {
      title: "你的十佳电影",
      subtitle: "基于 {films} 部电影的 {count} 场对决。",
      rank: "排名",
      film: "电影",
      restart: "重新开始",
      share: "生成分享图",
      shareGenerating: "生成中...",
      shareCardTitle: "我的十佳电影",
      shareCardSubtitle: "基于 {films} 部电影的 {count} 场对决",
      empty: "暂无结果，请先完成一些对决。",
      notReady: "十佳排名尚未完成，继续对决以获得最终结果。",
      goRank: "去对决",
      uploadToPublic: "上传至公开",
      uploadDialog: {
        title: "分享你的十佳",
        desc: "将你的十佳发布到社区榜单，其他人可以为你的榜单点赞。",
        usernameLabel: "用户名",
        usernamePlaceholder: "输入显示名称",
        confirm: "上传",
        success: "已上传至社区",
        failed: "上传失败",
        replaceWarning: "你已上传过榜单。替换将删除当前榜单并清零所有点赞。",
        sensitiveError: "该用户名不可用。",
      },
    },

    // Community page
    community: {
      title: "社区百强",
      subtitle: "浏览影迷们分享的百强榜单，为你喜欢的点赞。",
      tabSiteTop: "全站 Top 100",
      tabAllLists: "全部榜单",
      siteTopTitle: "全站 Top 100",
      siteTopSubtitle: "汇总所有上传，按排名位置加权计算。",
      allListsTitle: "全部榜单",
      sortRecent: "最新",
      sortLikes: "最多点赞",
      loadMore: "加载更多",
      empty: "还没有榜单，快来上传第一个吧！",
      deleteMine: "删除我的上传",
      ownListDesc: "这是你上传的榜单，删除后可重新上传。",
      yours: "你的",
      deleted: "你的上传已删除。",
      score: "得分",
      appearances: "出现在",
      director: "导演",
      viewCompact: "列表",
      viewCards: "卡片",
    },

    settings: {
      title: "设置",
      language: "语言",
      theme: "主题",
      light: "浅色",
      dark: "深色",
      system: "跟随系统",
      clearData: "清除所有数据",
      clearDataDesc: "移除你的会话和所有存储的数据。",
      clearDataConfirm: "确定吗？此操作不可撤销。",
      apiStatus: "TMDB API",
      apiConfigured: "已配置",
      apiNotConfigured: "未配置",
    },

    common: {
      loading: "加载中...",
      error: "出错了。",
      retry: "重试",
      cancel: "取消",
      close: "关闭",
      back: "返回",
      next: "下一步",
    },

    // About page
    about: {
      title: "关于 FlickPick",
      intro: "FlickPick 帮你发现个人十佳电影。从精选榜单中选择种子库，然后在每场两两对决中做出选择——算法会以最少的比较次数筛选出你真正最爱的电影。",
      algorithmDesc: "FlickPick 使用锦标赛树 + 替补算法，以尽可能少的比较次数找出你的十佳电影。这是无噪声二选一模型下工程可实现的最优算法。",
      algorithmStep1Desc: "所有电影作为完全二叉树的叶子节点，相邻电影两两对决，胜者向上晋升。经过 N−1 场对决后，根节点即为你的第一名。",
      algorithmStep2Desc: "抽出冠军后，将其叶子置空，沿路径到根重新比较。每确定下一个名次最多需要 ⌈log₂N⌉ 场对决。总比较次数为 (N−1) + (K−1) × ⌈log₂N⌉。",
      algorithmOptimalDesc: "以 N=200、K=10 为例，仅需约 271 场对决，比全排序少 85%。",
      communityDesc: "完成排名后，你可以将十佳发布到社区榜单。浏览其他用户列表，为喜欢的榜单点赞。全站 Top 100 汇总所有上传，按排名位置加权计算出全局榜单。",
      listImdb: "IMDb Top 250 — 更新于 2026 年 6 月 23 日",
      listLetterboxd: "Letterboxd Top 500 — 更新于 2026 年 6 月 23 日",
      listDouban: "豆瓣 Top 250 — 更新于 2026 年 6 月 23 日",
      listSightSound: "《视与听》影史最佳电影 — 2022 年影评人版",
      listTspdt1000: "TSPDT Top 1000 — 2026 年版",
      listTspdt21st: "TSPDT 21 世纪 Top 1000 — 2026 年版",
      listAfi: "AFI 百年百大 — 10th Anniversary Edition",
      tmdbFullAttribution: "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.",
    },
  },
};

export type Dictionary = typeof dictionaries.en;

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang];
}
