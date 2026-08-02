/**
 * The shared skin for the admin forms — a bordered fieldset, a labelled field
 * with its hint/error slot, and the input class the two share. Kept apart from
 * either form so the job and article screens cannot drift into two different
 * looking admin panels.
 */

export const inputClass =
  "w-full border border-line bg-white px-3.5 py-2.5 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

export function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-line bg-white p-6">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {legend}
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Field({
  label,
  children,
  error,
  hint,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-sm font-semibold text-navy-700">
        {label}
        {required ? <span className="text-accent-red"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-sm text-accent-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
