"use client";

import { Navbar } from "@/components/navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-center mb-12">
          Terms of Use
        </h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-sm text-muted-foreground/70">
            Last updated: June 24, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using FlickPick (&quot;the Service&quot;), you
              agree to be bound by these Terms of Use (&quot;Terms&quot;). If
              you do not agree to these Terms, you may not access or use the
              Service. These Terms apply to all users, including those who are
              contributors, licensors, and customers of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p>
              FlickPick is a web application that helps users discover their
              personal top 10 films through a tournament-style comparison
              algorithm. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Seed list building from curated rankings, TMDB filters, or CSV
                imports.
              </li>
              <li>Film ranking through head-to-head comparisons.</li>
              <li>Result export and sharing features.</li>
              <li>
                Community features for sharing and viewing other users&apos;
                rankings.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              3. Eligibility
            </h2>
            <p>
              You must be at least 13 years old (or the applicable age of
              digital consent in your jurisdiction) to use the Service. By using
              the Service, you represent and warrant that you have the legal
              capacity to enter into these Terms and that you will comply with
              all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              4. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You are solely responsible for the content you submit, including
                film lists, display names, and any other information you provide.
              </li>
              <li>
                You agree not to use the Service for any unlawful purpose or in
                any way that violates applicable laws or regulations.
              </li>
              <li>
                You agree not to attempt to interfere with the proper working of
                the Service, including but not limited to: submitting
                intentionally false data, using automated tools to manipulate
                community features, or attempting to gain unauthorized access to
                any part of the Service.
              </li>
              <li>
                You agree not to upload content that is offensive,
                discriminatory, harassing, defamatory, or infringes on the
                rights of others.
              </li>
              <li>
                You agree not to use the Service to distribute spam, malware, or
                other harmful content.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              5. Community Features
            </h2>
            <p>
              The Service includes community features such as public film lists
              and likes. By using these features, you grant FlickPick a
              non-exclusive, worldwide, royalty-free, sublicensable license to
              display, distribute, and aggregate your submitted content for the
              purpose of operating and improving the Service.
            </p>
            <p>
              We reserve the right to remove any content that violates these
              Terms or is otherwise deemed inappropriate, without prior notice or
              liability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              6. Intellectual Property
            </h2>
            <p>
              The FlickPick name, logo, and all associated content, features,
              and functionality are owned by FlickPick and are protected by
              copyright, trademark, and other intellectual property laws. The
              Service is provided under the MIT License.
            </p>
            <p>
              Film metadata and images are sourced from The Movie Database (TMDB)
              and are subject to TMDB&apos;s terms of use. This website uses TMDB
              and the TMDB APIs but is not endorsed, certified, or otherwise
              approved by TMDB.
            </p>
            <p>
              You retain ownership of any content you submit to the Service.
              However, by submitting content, you grant us the license described
              in Section 5 above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. Third-Party Links and Services
            </h2>
            <p>
              The Service may contain links to third-party websites or services
              (e.g., TMDB, Cloudflare, Supabase). We are not responsible for the
              content or practices of these third-party sites. Your use of
              third-party services is at your own risk and subject to their
              respective terms and privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              8. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied. FlickPick disclaims all warranties, including but not
              limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Implied warranties of merchantability, fitness for a particular
                purpose, and non-infringement.
              </li>
              <li>
                Warranties that the Service will be uninterrupted, error-free,
                or free of viruses or other harmful components.
              </li>
              <li>
                Warranties regarding the accuracy, reliability, or completeness
                of any content or information provided through the Service.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, FlickPick and
              its affiliates, officers, employees, agents, and licensors shall
              not be liable for any indirect, incidental, special, consequential,
              or punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your access to or use of (or inability to access or use) the Service.</li>
              <li>Any conduct or content of any third party on the Service.</li>
              <li>Any content obtained from the Service.</li>
              <li>
                Unauthorized access, use, or alteration of your transmissions or
                content.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless FlickPick and
              its affiliates, officers, employees, agents, and licensors from
              and against any claims, liabilities, damages, losses, and expenses
              (including reasonable attorneys&apos; fees) arising out of or in
              any way connected with: (a) your access to or use of the Service;
              (b) your violation of these Terms; or (c) your infringement of any
              intellectual property or other right of any third party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              11. Termination
            </h2>
            <p>
              We may terminate or suspend your access to the Service
              immediately, without prior notice or liability, for any reason,
              including without limitation if you breach these Terms. Upon
              termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be posted on this page with an updated &quot;Last
              updated&quot; date. Your continued use of the Service after any
              changes constitutes your acceptance of the new Terms. If you do
              not agree to the updated Terms, you must stop using the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              13. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which FlickPick operates, without
              regard to conflict of law principles. Any disputes arising out of
              or relating to these Terms or the Service shall be resolved in the
              courts of that jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              14. Severability
            </h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or
              unenforceable, the remaining provisions shall continue in full
              force and effect. The invalid provision shall be modified to the
              minimum extent necessary to make it valid and enforceable while
              preserving its original intent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              15. Entire Agreement
            </h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and FlickPick regarding your use of
              the Service, and supersede any prior agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              16. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
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
