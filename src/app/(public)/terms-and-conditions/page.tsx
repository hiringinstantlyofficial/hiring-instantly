import type { Metadata } from "next";

import { LegalLayout, type LegalSection } from "@/components/layout/legal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/lib/site";

const LAST_UPDATED = "2026-07-29";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms that govern your use of ${siteConfig.name} — what we provide, what we don't guarantee, and the rules for using the platform.`,
  alternates: { canonical: "/terms-and-conditions" },
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <p>
        By accessing or using {siteConfig.name} (the &ldquo;Service&rdquo;), you
        agree to these Terms &amp; Conditions and to our{" "}
        <a href="/privacy-policy">Privacy Policy</a>. If you do not agree, please
        do not use the Service.
      </p>
    ),
  },
  {
    id: "who-may-use",
    title: "Who may use the Service",
    body: (
      <p>
        You may use the Service if you are legally permitted to work and are
        capable of entering a binding contract under the Indian Contract Act,
        1872. If you use the Service on behalf of an organisation, you confirm
        you are authorised to bind that organisation to these terms.
      </p>
    ),
  },
  {
    id: "what-we-provide",
    title: "What the Service is",
    body: (
      <>
        <p>
          {siteConfig.name} is a job listing platform. We publish openings
          submitted by employers and make them searchable. That is the whole of
          our role.
        </p>
        <p>
          <strong>
            We are not an employer, recruiter, staffing agency, or party to any
            employment relationship
          </strong>{" "}
          formed between you and an employer. We do not conduct interviews, make
          hiring decisions, negotiate terms, or guarantee that any listing will
          lead to an interview or an offer.
        </p>
      </>
    ),
  },
  {
    id: "listings",
    title: "Accuracy of listings",
    body: (
      <>
        <p>
          Listings are supplied by employers. We review submissions before
          publication and remove listings we find to be misleading, but we cannot
          independently verify every claim in every posting.
        </p>
        <p>
          Details such as salary, location, seniority and application deadlines
          are as provided by the employer and may change or be withdrawn without
          notice. You are responsible for satisfying yourself about a role and an
          employer before applying or accepting an offer.
        </p>
      </>
    ),
  },
  {
    id: "employer-obligations",
    title: "Obligations of employers",
    body: (
      <>
        <p>If you submit a listing, you confirm that:</p>
        <ul>
          <li>
            the role is genuine, currently open, and you are authorised to
            advertise it;
          </li>
          <li>
            the listing is accurate, and you will tell us promptly when the role
            closes or its details change;
          </li>
          <li>
            the listing complies with applicable law, including laws prohibiting
            discrimination on grounds such as religion, race, caste, sex, place
            of birth, or disability;
          </li>
          <li>
            you will never charge a candidate a fee, deposit, or payment of any
            kind to apply for, secure, or retain the role;
          </li>
          <li>
            you will handle candidate data lawfully and only for recruitment for
            the advertised role.
          </li>
        </ul>
        <p>
          We may edit, decline, or remove any listing at our discretion, and may
          suspend employers who breach these terms.
        </p>
      </>
    ),
  },
  {
    id: "candidate-conduct",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            scrape, crawl, or bulk-download listings other than as permitted by
            our <a href="/robots.txt">robots.txt</a>;
          </li>
          <li>
            copy, republish, or resell listings or other content from the
            Service;
          </li>
          <li>
            submit false information, impersonate another person, or post
            fraudulent listings;
          </li>
          <li>
            interfere with the Service, attempt to gain unauthorised access to
            it, or circumvent any security or rate-limiting measure;
          </li>
          <li>use the Service to send spam or unsolicited commercial messages.</li>
        </ul>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees",
    body: (
      <p>
        The Service is free for candidates. We never charge you to search,
        view, or apply for a listing. Where we charge employers for placement,
        the applicable terms are agreed separately in writing.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <p>
        The Service, including its design, code, text and branding, belongs to us
        or our licensors and is protected by applicable intellectual property
        law. Employers retain rights in the listing content they submit and grant
        us a non-exclusive licence to host, display and distribute it for the
        purpose of operating and promoting the Service.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party sites",
    body: (
      <p>
        Applying for a role generally takes you to a third-party website or email
        address. Those destinations are outside our control. We do not endorse
        them and are not responsible for their content, security, or practices.
        Your dealings with any employer are solely between you and that employer.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: (
      <p>
        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; basis. To the fullest extent permitted by law, we
        disclaim all warranties, express or implied, including any warranty of
        merchantability, fitness for a particular purpose, accuracy of listings,
        or uninterrupted availability of the Service.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, we will not be liable for any
          indirect, incidental, special, consequential or punitive damages, or
          for any loss of employment opportunity, income, data, or goodwill,
          arising from your use of the Service or from any dealing with an
          employer found through it.
        </p>
        <p>
          Nothing in these terms limits liability that cannot lawfully be limited,
          including liability for fraud.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <p>
        You agree to indemnify and hold us harmless from any claim, demand, loss
        or expense (including reasonable legal fees) arising out of your breach
        of these terms, your misuse of the Service, or, if you are an employer,
        any listing you submit.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <p>
        We may suspend or terminate access to the Service, in whole or in part,
        at any time, with or without notice, where we reasonably believe these
        terms have been breached or where necessary to protect the Service or its
        users.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and jurisdiction",
    body: (
      <p>
        These terms are governed by the laws of India. The courts at Bengaluru,
        Karnataka, will have exclusive jurisdiction over any dispute arising out
        of or in connection with these terms or the Service.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may revise these terms from time to time. The &ldquo;last
        updated&rdquo; date above reflects the current version, and continued use
        of the Service after a change means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>{" "}
        or use our <a href="/contact">contact form</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms & Conditions"
        subtitle="The rules of the road for using the platform — plainly stated."
        breadcrumb={[
          { name: "Terms & Conditions", href: "/terms-and-conditions" },
        ]}
      />
      <LegalLayout sections={sections} lastUpdated={LAST_UPDATED} />
    </>
  );
}
