import { formatDate } from "@/lib/utils";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Long-form legal pages: sticky table of contents beside numbered sections, so
 * a wall of text stays scannable.
 */
export function LegalLayout({
  sections,
  lastUpdated,
}: {
  sections: LegalSection[];
  lastUpdated: string;
}) {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <nav
          aria-label="On this page"
          className="shrink-0 lg:w-64 lg:sticky lg:top-[98px] lg:self-start"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            On this page
          </h2>
          <ol className="mt-4 space-y-2.5">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-slate-600 hover:text-primary hover:underline"
                >
                  <span className="text-slate-400">{index + 1}.</span>{" "}
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-400">
            Last updated: {formatDate(lastUpdated)}
          </p>

          <div className="prose-legal mt-6 max-w-none">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2>
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
