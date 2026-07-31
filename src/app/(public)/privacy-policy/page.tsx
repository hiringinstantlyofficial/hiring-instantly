import type { Metadata } from "next";

import { LegalLayout, type LegalSection } from "@/components/layout/legal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/lib/site";

const LAST_UPDATED = "2026-07-30";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, stores and protects personal data, and the rights you have over your information.`,
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          This Privacy Policy explains how {siteConfig.name} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;) handles personal data when you
          visit our website, search job listings, contact us, or subscribe to
          job alerts.
        </p>
        <p>
          We operate a job listing platform. We are not an employer, a staffing
          agency, or a party to any employment relationship formed through a
          listing on this site.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>We keep collection deliberately minimal.</p>
        <ul>
          <li>
            <strong>Information you give us.</strong> Your name, email address,
            subject and message when you use the contact form; your email
            address when you subscribe to job notifications.
          </li>
          <li>
            <strong>Information collected automatically.</strong> Standard
            server and log data such as IP address, browser type, referring
            page, and the pages you view. We use IP addresses transiently to
            rate-limit form submissions and prevent spam.
          </li>
          <li>
            <strong>Information collected by advertising and analytics
            partners.</strong> We display third-party advertising, and our
            advertising partners set cookies and read device identifiers to
            select and measure the ads you see. This is described in full in{" "}
            <a href="#advertising">Advertising</a> below.
          </li>
          <li>
            <strong>Information we do not collect.</strong> We do not require an
            account to browse or search. We do not collect resumes, identity
            documents, or payment details on this website.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <>
        <ul>
          <li>To respond to enquiries you send us through the contact form.</li>
          <li>
            To send job notification emails, where you have asked to receive
            them. Every email includes an unsubscribe link.
          </li>
          <li>
            To keep the service secure and available — detecting spam, abuse and
            technical faults.
          </li>
          <li>
            To understand, in aggregate, which listings and pages are useful, so
            we can improve the site.
          </li>
          <li>
            To fund the site through advertising, which keeps it free for
            candidates. See <a href="#advertising">Advertising</a> for what our
            partners receive and how to opt out of personalisation.
          </li>
        </ul>
        <p>
          We do not sell your personal data, and we do not upload the details you
          give us — your name, email address or message — to any advertising
          platform. Advertising partners do receive technical data directly from
          your browser, which is inherent to how ads are delivered; that is
          described in <a href="#advertising">Advertising</a>.
        </p>
        <p>
          We do not share your contact details with employers unless you have
          chosen to send them to an employer yourself.
        </p>
      </>
    ),
  },
  {
    id: "applications",
    title: "Job applications",
    body: (
      <>
        <p>
          Applications are made directly with the employer. When you select
          &ldquo;Apply&rdquo; on a listing, you are taken to the employer&apos;s
          own application system or an email address the employer has supplied.
        </p>
        <p>
          Anything you submit at that point — your resume, cover letter, contact
          details — goes to the employer, not to us, and is governed by{" "}
          <strong>the employer&apos;s privacy practices, not this policy</strong>.
          We encourage you to review them before applying.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: (
      <>
        <p>
          Cookies are small files stored by your browser. This site uses them in
          three categories:
        </p>
        <ul>
          <li>
            <strong>Strictly necessary.</strong> Required for the site to
            function — for example, maintaining a signed-in session for
            administrators. These cannot be switched off.
          </li>
          <li>
            <strong>Analytics.</strong> We use{" "}
            <strong>Google Analytics 4</strong> to measure, in aggregate, which
            pages and listings are useful so we can improve them. It records
            things like the pages you visit, how you arrived, your approximate
            location derived from a truncated IP address, and your device and
            browser type. We do not use it to identify you individually, and we
            do not send it your name, email address or anything you type into a
            form. You can prevent Google Analytics from collecting your data
            entirely by installing the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Google Analytics opt-out browser add-on
            </a>
            .
          </li>
          <li>
            <strong>Advertising.</strong> Set by third-party advertising
            partners, including Google, to select, cap and measure the ads shown
            to you. See <a href="#advertising">Advertising</a> below.
          </li>
        </ul>
        <p>
          You can block or delete cookies through your browser settings, and most
          browsers let you refuse third-party cookies specifically. The public
          pages of this site will continue to work normally if you do — you may
          simply see less relevant advertising rather than none.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising",
    body: (
      <>
        <p>
          This site is free to use and carries third-party advertising, which is
          how we pay for hosting and for reviewing listings. We use{" "}
          <strong>Google AdSense</strong> to serve those ads.
        </p>
        <p>How this works, in the terms Google requires us to disclose:</p>
        <ul>
          <li>
            <strong>Third-party vendors, including Google, use cookies to serve
            ads based on your prior visits</strong> to this website or other
            websites.
          </li>
          <li>
            <strong>
              Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visit to this site
              and/or other sites on the internet.
            </strong>
          </li>
          <li>
            Google uses the <strong>DoubleClick DART cookie</strong> and similar
            identifiers to serve ads based on your visit to this and other sites
            on the internet.
          </li>
          <li>
            Ad selection may use general location inferred from your IP address,
            your device and browser type, and the content of the page you are
            viewing. It does not use the contents of messages you send us
            through the contact form, and we do not pass your email address to
            advertising partners.
          </li>
        </ul>

        <h3>How to opt out of personalised advertising</h3>
        <p>You have several independent ways to turn this off:</p>
        <ul>
          <li>
            <strong>Google&apos;s own controls.</strong> You may opt out of
            personalised advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Google Ads Settings
            </a>
            . Opting out does not remove advertising; it makes it
            non-personalised.
          </li>
          <li>
            <strong>Industry-wide opt-out.</strong> You may opt out of the use of
            cookies for personalised advertising by many third-party vendors at{" "}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              aboutads.info/choices
            </a>{" "}
            or{" "}
            <a
              href="https://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              the Network Advertising Initiative opt-out page
            </a>
            .
          </li>
          <li>
            <strong>Your browser.</strong> Block third-party cookies, or use your
            browser&apos;s private browsing mode.
          </li>
          <li>
            <strong>Your device.</strong> Mobile operating systems offer a
            &ldquo;limit ad tracking&rdquo; or &ldquo;opt out of ads
            personalisation&rdquo; setting that applies across apps and sites.
          </li>
        </ul>

        <h3>Other advertising partners</h3>
        <p>
          We may work with additional advertising networks in future. Third-party
          ad servers or ad networks use technology to send the advertisements and
          links that appear on this site directly to your browser, and they
          automatically receive your IP address when this happens. They may also
          use cookies, JavaScript or web beacons to measure the effectiveness of
          their campaigns and to personalise the advertising content you see.
        </p>
        <p>
          <strong>
            We have no access to or control over the cookies used by third-party
            advertisers.
          </strong>{" "}
          This Privacy Policy does not cover their practices. You should consult
          the respective privacy policies of these third-party ad servers for
          more detailed information, including how to opt out of certain
          practices. Google&apos;s own practices are described in the{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Google advertising privacy notice
          </a>
          .
        </p>

        <h3>Consent, where the law requires it</h3>
        <p>
          Google requires publishers to obtain consent before setting
          non-essential advertising cookies for visitors in the European
          Economic Area, the United Kingdom and Switzerland, under its EU user
          consent policy. If you are visiting from one of those regions,
          advertising and analytics cookies are set only after you have given
          consent through the notice presented on the site, and you can withdraw
          or change that consent at any time through the same notice.
        </p>
        <p>
          If you are in India, we rely on your consent for non-essential cookies
          as described in <a href="#your-rights">Your rights</a>, and you may
          withdraw it using any of the controls listed above.
        </p>
        <p>
          <strong>We do not serve personalised advertising to anyone we know to
          be under 18</strong>, and our advertising partners are instructed to
          treat this site as general-audience content that is not directed at
          children.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and disclosure",
    body: (
      <>
        <p>We share personal data only in these circumstances:</p>
        <ul>
          <li>
            <strong>Service providers.</strong> Infrastructure partners who host
            the site and database on our behalf, under contract, and only to
            provide those services.
          </li>
          <li>
            <strong>Advertising and analytics partners.</strong> As described in{" "}
            <a href="#advertising">Advertising</a>, these partners receive
            technical data — your IP address, device and browser information, and
            the page you are viewing — directly from your browser when an ad or
            measurement script loads. We do not send them your name, email
            address, or the contents of anything you submit to us.
          </li>
          <li>
            <strong>Legal obligation.</strong> Where required by applicable law,
            a court order, or a lawful request from a public authority.
          </li>
          <li>
            <strong>Protection of rights.</strong> Where necessary to
            investigate fraud, abuse, or threats to the safety of any person.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party-listings",
    title: "Third-party listings and links",
    body: (
      <>
        <p>
          Job listings describe opportunities offered by third-party employers.
          While we review listings before publishing them, we cannot guarantee
          the accuracy, completeness or continued availability of any role, nor
          the conduct of any employer.
        </p>
        <p>
          <strong>
            We will never ask you to pay a fee to apply for a job, and no
            legitimate employer should either.
          </strong>{" "}
          If a listing found through this site asks you for money, deposits, or
          sensitive financial information, stop and report it to us.
        </p>
        <p>
          External links are provided for convenience. We are not responsible
          for the content or privacy practices of sites we link to.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data retention",
    body: (
      <p>
        Contact form submissions are retained for up to 24 months so we can
        follow up on and reference past correspondence. Newsletter subscriptions
        are retained until you unsubscribe. Server logs are retained for a short
        operational period. We delete or anonymise data once it is no longer
        needed for the purpose it was collected for.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Data is transmitted over encrypted connections and stored with a managed
        database provider using access controls and row-level security policies,
        so public visitors can only read published listings. No system is
        perfectly secure, but we take reasonable technical and organisational
        measures appropriate to the sensitivity of the limited data we hold.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Subject to applicable law, including India&apos;s Digital Personal Data
          Protection Act, 2023, you may ask us to:
        </p>
        <ul>
          <li>confirm what personal data of yours we hold, and get a copy;</li>
          <li>correct data that is inaccurate, incomplete or out of date;</li>
          <li>erase data we no longer have a lawful reason to keep;</li>
          <li>withdraw consent, for example by unsubscribing from emails.</li>
        </ul>
        <p>
          To exercise any of these, email{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>
          . We will respond within the period required by law.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        This site is intended for people who are legally permitted to work. It is
        not directed at children, and we do not knowingly collect personal data
        from anyone under 18. If you believe a child has provided us data, contact
        us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the service evolves or the law changes. The
        &ldquo;last updated&rdquo; date at the top of this page always reflects
        the current version. Material changes will be highlighted on the site.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and grievances",
    body: (
      <>
        <p>
          For any privacy question, request or complaint, contact our grievance
          contact at{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>{" "}
          or through our <a href="/contact">contact form</a>.
        </p>
        <p>
          If you are not satisfied with our response, you may escalate to the
          relevant data protection authority in your jurisdiction.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle="What we collect, why we collect it, and the control you have over it."
        breadcrumb={[{ name: "Privacy Policy", href: "/privacy-policy" }]}
      />
      <LegalLayout sections={sections} lastUpdated={LAST_UPDATED} />
    </>
  );
}
