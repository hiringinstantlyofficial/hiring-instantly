/**
 * Escaping helpers for values interpolated into PostgREST filters.
 *
 * Two different escapes are needed and they are not interchangeable:
 *
 *   - `escapeLike` protects the SQL LIKE/ILIKE *pattern* language, so a user
 *     typing `100%` searches for a literal percent sign instead of a wildcard.
 *   - `quoteFilterValue` protects the PostgREST *filter* grammar, which is what
 *     `.or()` builds a raw string in. Without it a search term containing `.`
 *     or `,` is read as operator/clause syntax rather than as data.
 *
 * `.eq()`, `.ilike()` and friends take the value as a separate argument and
 * only need the first; `.or()` takes one string and needs both.
 */

/**
 * Escapes the LIKE metacharacters (`%`, `_`) and the escape character itself.
 * Backslash is Postgres's default LIKE ESCAPE, so an unescaped `\` in the term
 * would silently swallow the character after it.
 */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (match) => `\\${match}`);
}

/**
 * Wraps a value in the double quotes PostgREST uses for string literals, so
 * `.`, `,`, `(` and `)` inside it are data rather than filter syntax. Inner
 * quotes and backslashes are backslash-escaped, per the PostgREST grammar.
 */
export function quoteFilterValue(value: string): string {
  return `"${value.replace(/["\\]/g, (match) => `\\${match}`)}"`;
}

/**
 * An `ilike` pattern for a substring match, safe to drop into an `.or()`
 * string: `title.ilike.` + this.
 */
export function containsPattern(term: string): string {
  return quoteFilterValue(`%${escapeLike(term)}%`);
}

/**
 * Postgres `websearch_to_tsquery` chokes on stray boolean/phrase operators, so
 * they are stripped before the term reaches `.textSearch()`.
 */
export function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[&|!():*'"\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
