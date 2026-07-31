"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { popularSearches } from "@/lib/site";
import { withParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

/** Cities offered as suggestions; free text is still accepted. */
const CITY_SUGGESTIONS = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Remote",
] as const;

export function JobSearchBar({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      `/jobs${withParams(searchParams, {
        q: keyword.trim() || null,
        location: location.trim() || null,
      })}`,
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        role="search"
        aria-label="Search jobs"
        className={cn(
          "flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:gap-0 sm:py-3",
          variant === "hero" ? "shadow-lift" : "border border-line",
        )}
      >
        <div className="flex flex-1 items-center gap-3 sm:px-2">
          <Search className="size-6 shrink-0 text-navy-700" aria-hidden />
          <label htmlFor="job-keyword" className="sr-only">
            Job title or keyword
          </label>
          <input
            id="job-keyword"
            name="q"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Job title or keyword"
            className="w-full min-w-0 border-0 border-b border-line py-2 text-base text-navy-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-primary sm:border-b-0"
          />
        </div>

        <span aria-hidden className="hidden h-12 w-px bg-line sm:block" />

        <div className="flex flex-1 items-center gap-3 sm:px-4">
          <MapPin className="size-6 shrink-0 text-navy-700" aria-hidden />
          <label htmlFor="job-location" className="sr-only">
            Location
          </label>
          <input
            id="job-location"
            name="location"
            type="text"
            list="city-suggestions"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Any location in India"
            className="w-full min-w-0 border-0 border-b border-line py-2 text-base text-navy-700 placeholder:text-slate-400 focus:outline-none focus-visible:border-primary sm:border-b-0"
          />
          <datalist id="city-suggestions">
            {CITY_SUGGESTIONS.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        <Button type="submit" size="md" className="sm:ml-2">
          Search
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Popular:{" "}
        {popularSearches.map((term, index) => (
          <span key={term}>
            <a
              href={`/jobs?q=${encodeURIComponent(term)}`}
              className="hover:text-primary hover:underline"
            >
              {term}
            </a>
            {index < popularSearches.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
