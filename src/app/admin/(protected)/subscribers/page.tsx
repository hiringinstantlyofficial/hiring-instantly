import type { Metadata } from "next";
import { CalendarPlus, MailCheck, Mails, MailX } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscribers" };

/** Server-side cap on listed rows; the count tiles come from HEAD counts, so
 *  they stay correct even once the list outgrows this. */
const MAX_ROWS = 1000;

export default async function AdminSubscribersPage() {
  const supabase = await createSupabaseServerClient();

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Reads run as the admin through RLS (newsletter_admin_read), the same as
  // every other admin page. Counts are HEAD requests — no rows transferred.
  const [listResult, total, active, unsubscribed, thisMonth] =
    await Promise.all([
      supabase
        .from("newsletter_subscribers")
        .select("id, email, unsubscribed_at, created_at")
        .order("created_at", { ascending: false })
        .limit(MAX_ROWS),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .is("unsubscribed_at", null),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .not("unsubscribed_at", "is", null),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthAgo),
    ]);

  if (listResult.error) {
    console.error("[admin] failed to load subscribers:", listResult.error);
  }

  const subscribers = listResult.data ?? [];

  const cards = [
    { label: "Total subscribers", value: total.count ?? 0, icon: Mails },
    // "Active" is who a job broadcast actually reaches — the same filter the
    // send action uses.
    { label: "Active", value: active.count ?? 0, icon: MailCheck },
    { label: "Unsubscribed", value: unsubscribed.count ?? 0, icon: MailX },
    { label: "New in 30 days", value: thisMonth.count ?? 0, icon: CalendarPlus },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-h2">Subscribers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Everyone signed up for job alerts through the footer form. Broadcasts
          go to the active ones.
        </p>
      </header>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-slate-400">{card.label}</dt>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-surface text-primary">
                <card.icon className="size-4" aria-hidden />
              </span>
            </div>
            <dd className="mt-3 text-3xl font-bold text-navy-700">
              {card.value.toLocaleString("en-IN")}
            </dd>
          </div>
        ))}
      </dl>

      {subscribers.length ? (
        <div className="mt-8 border border-line bg-white">
          {/* Phones get stacked cards — the 560px table would clip its date
              and status columns off the viewport. */}
          <ul className="divide-y divide-line-soft md:hidden">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${subscriber.email}`}
                    className="min-w-0 truncate font-medium text-navy-700 hover:text-primary"
                  >
                    {subscriber.email}
                  </a>
                  {subscriber.unsubscribed_at ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      Unsubscribed
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-semibold text-accent-green">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Subscribed {formatDate(subscriber.created_at)}
                  {subscriber.unsubscribed_at
                    ? ` · unsubscribed ${formatDate(subscriber.unsubscribed_at)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Newsletter subscribers</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Subscribed
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-line-soft last:border-0"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="font-medium text-navy-700 hover:text-primary"
                      >
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(subscriber.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {subscriber.unsubscribed_at ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          Unsubscribed {formatDate(subscriber.unsubscribed_at)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-semibold text-accent-green">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-line px-4 py-3 text-xs text-slate-400">
            Showing {subscribers.length.toLocaleString("en-IN")} of{" "}
            {(total.count ?? subscribers.length).toLocaleString("en-IN")}{" "}
            {total.count === 1 ? "subscriber" : "subscribers"}
            {(total.count ?? 0) > MAX_ROWS
              ? ` — only the newest ${MAX_ROWS.toLocaleString("en-IN")} are listed`
              : ""}
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center border border-line bg-white px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-surface text-primary">
            <Mails className="size-7" aria-hidden />
          </span>
          <h2 className="mt-5 text-h3">No subscribers yet</h2>
          <p className="mt-2 max-w-md text-base text-slate-600">
            Signups from the &ldquo;Get job notifications&rdquo; form in the
            site footer will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
