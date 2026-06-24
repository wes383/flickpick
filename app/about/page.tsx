"use client";

import { Navbar } from "@/components/navbar";
import { useI18n } from "@/lib/i18n/context";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-4 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            {t.about.title.replace("FlickPick", "").trim()}{" "}
            <span className="font-[family-name:var(--font-plus-jakarta-sans)]">
              FlickPick
            </span>
          </h1>
          <p className="mt-8 text-left text-muted-foreground leading-relaxed">
            {t.about.intro}
          </p>
        </div>

        <section className="space-y-4 mb-12">
          <p className="text-muted-foreground leading-relaxed">
            {t.about.communityDesc}
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <p className="text-muted-foreground leading-relaxed">{t.about.listImdb}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listLetterboxd}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listDouban}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listSightSound}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listTspdt1000}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listTspdt21st}</p>
          <p className="text-muted-foreground leading-relaxed">{t.about.listAfi}</p>
        </section>

        <section className="space-y-4 mb-12">
          <p className="text-muted-foreground leading-relaxed">
            {t.about.algorithmDesc}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t.about.algorithmStep1Desc}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t.about.algorithmStep2Desc}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t.about.algorithmOptimalDesc}
          </p>
        </section>

        <section className="mt-16 pt-8 border-t border-border/50 space-y-6">
          <div className="flex items-center gap-4">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              aria-label="TMDB"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                alt="TMDB Logo"
                className="h-5 w-auto"
              />
            </a>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.about.tmdbFullAttribution}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="/privacy"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/wes383/flickpick"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
