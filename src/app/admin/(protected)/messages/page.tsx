import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.error("[admin] failed to load messages:", error);

  const messages = data ?? [];

  return (
    <div className="p-6 lg:p-8">
      <header>
        <h1 className="text-h2">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enquiries submitted through the public contact form.
        </p>
      </header>

      {messages.length ? (
        <ul className="mt-8 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-h4">
                  {message.subject || "(no subject)"}
                </h2>
                <time
                  dateTime={message.created_at}
                  className="text-xs text-slate-400"
                >
                  {formatDate(message.created_at)}
                </time>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {message.name} ·{" "}
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject || "your enquiry"}`,
                  )}`}
                  className="text-primary hover:underline"
                >
                  {message.email}
                </a>
              </p>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 flex flex-col items-center border border-line bg-white px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-surface text-primary">
            <Inbox className="size-7" aria-hidden />
          </span>
          <h2 className="mt-5 text-h3">No messages yet</h2>
          <p className="mt-2 max-w-md text-base text-slate-600">
            Submissions from the contact form will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
