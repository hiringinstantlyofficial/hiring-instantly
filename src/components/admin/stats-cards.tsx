"use client";

import Link from "next/link";
import {
  Briefcase,
  CalendarPlus,
  CircleCheck,
  ClipboardCheck,
  FileEdit,
} from "lucide-react";

import { useAdminStats } from "@/hooks/use-admin-jobs";

const cards = [
  { key: "total", label: "Total jobs", icon: Briefcase },
  { key: "active", label: "Active", icon: CircleCheck },
  // Links straight into the queue: the one tile with a service-level
  // expectation ("reviewed within one working day") behind it.
  { key: "pending", label: "Awaiting review", icon: ClipboardCheck, href: "/admin/review" },
  { key: "draft", label: "Drafts", icon: FileEdit },
  { key: "postedThisWeek", label: "Posted this week", icon: CalendarPlus },
] as const;

export function StatsCards() {
  const { data, isPending, isError } = useAdminStats();

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const body = (
          <>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-slate-400">{card.label}</dt>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-surface text-primary">
                <card.icon className="size-4" aria-hidden />
              </span>
            </div>
            <dd className="mt-3 text-3xl font-bold text-navy-700">
              {isPending ? (
                <span className="skeleton block h-9 w-16" />
              ) : isError ? (
                "—"
              ) : (
                data![card.key]
              )}
            </dd>
          </>
        );

        return "href" in card ? (
          <Link
            key={card.key}
            href={card.href}
            className="border border-line bg-white p-5 transition-colors hover:border-primary"
          >
            {body}
          </Link>
        ) : (
          <div key={card.key} className="border border-line bg-white p-5">
            {body}
          </div>
        );
      })}
    </dl>
  );
}
