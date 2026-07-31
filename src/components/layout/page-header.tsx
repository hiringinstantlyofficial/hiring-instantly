import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Shared hero band for the non-listing pages, so the theme carries across. */
export function PageHeader({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { name: string; href: string }[];
}) {
  return (
    <section className="hero-pattern border-b border-line-soft">
      <div className="container-page py-12 lg:py-16">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
                <ChevronRight className="size-4" aria-hidden />
              </li>
              {breadcrumb.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index === breadcrumb.length - 1 ? (
                    <span
                      aria-current="page"
                      className="font-semibold text-navy-700"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link href={crumb.href} className="hover:text-primary">
                        {crumb.name}
                      </Link>
                      <ChevronRight className="size-4" aria-hidden />
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
