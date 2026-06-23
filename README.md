# FlickPick

FlickPick is a web application that helps movie lovers discover their true **Top 10 Films**. Instead of scrolling through infinite lists or trying to manually sort hundreds of movies, FlickPick uses a **Tournament Tree with Replacement** algorithm. By presenting you with head-to-head, pairwise matchups, the app narrows down your favorites with the absolute minimum number of comparisons.

Check out the live application to build your seed list, make your choices, and export your personal Top 10 card!

---

## Features

- **Multi-Source Seed List Builder:**
  - **Curated Lists:** Choose from IMDb Top 250, Letterboxd Top 500, Douban Top 250, Sight & Sound, TSPDT (All-Time & 21st Century), AFI 100, and major film festival winners (Cannes Palme d'Or, Berlin Golden Bear, Venice Golden Lion, Oscars).
  - **TMDb Filter:** Filter by genre, year, minimum rating, vote count, language, and sorting options.
  - **CSV Import:** Seamlessly import your personal export data from IMDb (ratings) or Letterboxd (ratings.csv) with automatic column matching and rating filters.
  - **Direct Search:** Search and add specific movies from TMDb manually.
- **Tournament Tree Sort Engine:**
  - Uses an optimal Selection Tree variant with replacement to track matchups.
  - Allows you to undo choices, skip matchups, and dynamically computes progress.
- **Premium UI/UX:**
  - Built with Tailwind CSS and Radix UI primitives.
  - Supports smooth micro-animations, glassmorphism elements, and fully responsive layouts.
  - Dark Mode and Light Mode support.
- **Result Export:**
  - Generates a beautifully styled shareable image of your Top 10 list for social sharing.

---

## How the Algorithm Works

FlickPick implements a **Tournament Tree with Replacement** algorithm (similar to a Selection Tree/Heapsort tournament phase). This is the mathematically optimal solution for noiseless, pairwise selection of the top $K$ items out of $N$ items.

### The Phases:
1. **Building Phase:** All $N$ movies are placed as leaves of a complete binary tree. Adjacent movies compete head-to-head. Winners advance up the tree. After $N - 1$ comparisons, the overall champion (#1 favorite) emerges at the root.
2. **Replacement (Extracting) Phase:** To find the #2 movie, the champion is removed from the leaf. We then re-evaluate the path from that leaf to the root. Only the movies that directly lost to the champion along its path need to be compared. This requires at most $\lceil\log_2 N\rceil$ additional comparisons. We repeat this process until the top $K$ movies are extracted.

### Comparison Complexity:
For $N$ movies and extracting the Top $K$:
$$\text{Total Comparisons} \le (N - 1) + (K - 1) \cdot \lceil\log_2 N\rceil$$

For example, with $N = 200$ and $K = 10$:
- A full sort would require around $200 \log_2 200 \approx 1500$ comparisons.
- FlickPick's tournament algorithm requires at most **$199 + 9 \times 8 = 271$ comparisons** — over **80% fewer matchups** for the user!

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (for icons)
- **Components:** [Radix UI](https://www.radix-ui.com/) & Custom UI primitives
- **Utility Libraries:** [PapaParse](https://www.papaparse.com/) (CSV parsing), [html-to-image](https://github.com/bubkoo/html-to-image) (image rendering)
- **Data Source:** [TMDb API](https://www.themoviedb.org/documentation/api)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- A [TMDb API Key](https://developer.themoviedb.org/docs/getting-started/) 

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/wes383/flickpick.git
   cd flickpick
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your TMDb API key:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. Start the local development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

MIT