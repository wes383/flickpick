"use client";

import { Navbar } from "@/components/navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-center mb-12">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground/70">
            Last updated: June 24, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              1. Introduction
            </h2>
            <p>
              FlickPick (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is
              committed to protecting your privacy. This Privacy Policy explains
              what information we collect, how we use it, and what choices you
              have. It applies to all users of our website and services
              (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By using FlickPick, you consent to the practices described in this
              policy. If you do not agree, please discontinue use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-foreground">
              2.1 Browser Fingerprint (Local Storage)
            </h3>
            <p>
              We use the open-source library FingerprintJS to generate a unique
              device identifier (&quot;browser fingerprint&quot;) based on your
              browser configuration and device characteristics (e.g., screen
              resolution, installed fonts, timezone). This identifier is stored
              in your browser&apos;s <strong>localStorage</strong> and is used
              solely to identify your session for community features such as
              liking and deleting public lists. We do not combine this
              identifier with other data sources to build a profile of you, and
              it is never transmitted to any third-party analytics service.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              2.2 User-Provided Data
            </h3>
            <p>
              When you use community features, we store the following in our
              database:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                A <strong>display name</strong> that you choose (this is not
                linked to any real identity).
              </li>
              <li>
                The <strong>film lists</strong> you submit to the community
                board.
              </li>
              <li>
                <strong>Like interactions</strong> (which lists your fingerprint
                has liked).
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect email addresses, passwords,
              phone numbers, or any other traditional personal registration
              information.
            </p>

            <h3 className="text-lg font-medium text-foreground">
              2.3 Automatically Collected Data
            </h3>
            <p>
              Like most websites, our server and hosting providers may
              automatically collect certain technical information when you visit,
              including IP address, browser type, operating system, referring
              URLs, and pages viewed. This data is used for security and
              operational purposes and is not combined with other data to
              identify you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              3. Cookies and Local Storage
            </h2>
            <p>
              FlickPick does <strong>not</strong> use HTTP cookies for tracking
              or analytics. We do use browser <strong>localStorage</strong> to
              store:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your browser fingerprint identifier.</li>
              <li>Your language and theme preferences.</li>
              <li>Your active ranking session data (seed list, matchups).</li>
            </ul>
            <p>
              All of this data remains on your device and can be cleared at any
              time through your browser settings or the &quot;Clear All
              Data&quot; option on our Settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              4. Third-Party Services
            </h2>
            <p>We integrate the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>TMDB API</strong> — We send film search queries to The
                Movie Database (TMDB) to retrieve film metadata and images. TMDB
                may log these API requests according to their own privacy policy.
              </li>
              <li>
                <strong>Cloudflare Turnstile</strong> — We use Cloudflare
                Turnstile to protect against automated abuse. During
                verification, Cloudflare may collect technical information about
                your device and browser. See{" "}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Cloudflare&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> — Our website is hosted on Vercel. When
                you visit the site, Vercel may collect technical information
                such as IP address, browser type, and request logs for
                operational and security purposes. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Vercel&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Supabase</strong> — Our backend database is hosted on
                Supabase. Data stored includes your submitted film lists, display
                name, and like interactions. Supabase acts as a data processor
                on our behalf. See{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Supabase&apos;s Privacy Policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              5. Legal Basis for Processing (EEA Users)
            </h2>
            <p>
              If you are located in the European Economic Area (EEA), we process
              your personal data under the following legal bases pursuant to
              Article 6 of the GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Consent</strong> — for browser fingerprint storage and
                local data collection.
              </li>
              <li>
                <strong>Legitimate interests</strong> — for preventing abuse,
                maintaining service integrity, and improving user experience.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              6. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To provide and maintain community features (e.g., identifying
                your uploads and likes, preventing duplicate likes).
              </li>
              <li>
                To prevent abuse, spam, and manipulation of community features.
              </li>
              <li>To improve the user experience and site functionality.</li>
              <li>
                To comply with legal obligations when required by applicable law.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. Data Sharing and Disclosure
            </h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal
              information to third parties. We may disclose information only in
              the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                With your explicit consent (e.g., when you choose to upload a
                list to the community board, the display name and film list
                become publicly visible).
              </li>
              <li>
                To comply with a legal obligation, court order, or governmental
                request.
              </li>
              <li>
                To protect the rights, property, or safety of FlickPick, its
                users, or the public.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              8. International Data Transfers
            </h2>
            <p>
              Your data may be transferred to and processed in countries other
              than your own, including the United States. Where transfers are
              made from the EEA, we rely on appropriate safeguards such as the
              EU-U.S. Data Privacy Framework or Standard Contractual Clauses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              9. Data Retention
            </h2>
            <p>
              Your browser fingerprint is stored locally on your device and can
              be cleared at any time via your browser settings or the
              &quot;Clear All Data&quot; option in our Settings page. Community
              data (film lists, display names, likes) is retained as long as it
              remains on the platform. You can delete your own uploaded list at
              any time via the Community page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              10. Your Rights
            </h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>
                Object to or restrict processing of your personal data.
              </li>
              <li>
                Lodge a complaint with a supervisory authority (EEA users).
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              below. We will respond to verified requests within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              11. California Residents (CCPA)
            </h2>
            <p>
              If you are a California resident, you have the right to: (a)
              request disclosure of the categories and specific pieces of
              personal information collected; (b) request deletion of your
              personal information; and (c) not be discriminated against for
              exercising these rights. We do not sell personal information as
              defined under the CCPA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              12. Children&apos;s Privacy
            </h2>
            <p>
              FlickPick is not directed at children under the age of 13 (or the
              applicable age of digital consent in your jurisdiction). We do not
              knowingly collect personal information from children. If you
              believe a child has provided us with personal data, please contact
              us and we will take steps to delete such information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              13. Data Security
            </h2>
            <p>
              We implement reasonable technical and organizational measures to
              protect your data against unauthorized access, alteration,
              disclosure, or destruction. However, no method of electronic
              transmission or storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              14. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated &quot;Last
              updated&quot; date. We encourage you to review this page
              periodically. Continued use of the Service after changes
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              15. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise
              your data rights, please contact us at{" "}
              <a
                href="mailto:support@wesluma.com"
                className="underline hover:text-foreground transition-colors"
              >
                support@wesluma.com
              </a>
              .
            </p>
          </section>

          <div className="pt-8 border-t border-border/50">
            <Link
              href="/about"
              className="text-sm underline hover:text-foreground transition-colors"
            >
              &larr; Back to About
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
