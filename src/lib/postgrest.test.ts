import { describe, expect, it } from "vitest";

import {
  containsPattern,
  escapeLike,
  quoteFilterValue,
  sanitizeSearchTerm,
} from "@/lib/postgrest";

describe("escapeLike", () => {
  it("leaves an ordinary term alone", () => {
    expect(escapeLike("Bengaluru")).toBe("Bengaluru");
  });

  it("escapes LIKE wildcards so they match literally", () => {
    // The motivating case: a location of "100% Remote" must not turn the % into
    // a wildcard that matches everything.
    expect(escapeLike("100% Remote")).toBe("100\\% Remote");
    expect(escapeLike("a_b")).toBe("a\\_b");
  });

  it("escapes the escape character itself", () => {
    // Left unescaped, the backslash would swallow the "b" that follows it.
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("produces a single backslash per escape, not a doubled one", () => {
    const escaped = escapeLike("50%");
    expect(escaped).toHaveLength(4);
    expect([...escaped]).toEqual(["5", "0", "\\", "%"]);
  });

  it("does not touch characters that are not LIKE metacharacters", () => {
    expect(escapeLike("Bengaluru, KA (Remote)")).toBe("Bengaluru, KA (Remote)");
  });
});

describe("quoteFilterValue", () => {
  it("wraps the value in PostgREST string-literal quotes", () => {
    expect(quoteFilterValue("hello")).toBe('"hello"');
  });

  it("escapes embedded quotes and backslashes", () => {
    expect(quoteFilterValue('say "hi"')).toBe('"say \\"hi\\""');
    expect(quoteFilterValue("a\\b")).toBe('"a\\\\b"');
  });
});

describe("containsPattern", () => {
  it("builds a quoted substring pattern", () => {
    expect(containsPattern("acme")).toBe('"%acme%"');
  });

  it("neutralises PostgREST operator syntax in the term", () => {
    // The injection the analysis flagged: `.` was not stripped, so a term like
    // this could close the ilike clause and start a new filter. Quoting keeps
    // the whole thing on the data side of the grammar.
    const pattern = containsPattern("x.eq.1,status.neq.draft");
    expect(pattern).toBe('"%x.eq.1,status.neq.draft%"');
    expect(pattern.startsWith('"')).toBe(true);
    expect(pattern.endsWith('"')).toBe(true);
  });

  it("keeps legitimate dotted and comma'd searches intact", () => {
    expect(containsPattern("Node.js")).toBe('"%Node.js%"');
    expect(containsPattern("Bengaluru, KA")).toBe('"%Bengaluru, KA%"');
  });

  it("escapes wildcards inside the term while keeping its own", () => {
    expect(containsPattern("100%")).toBe('"%100\\\\%%"');
  });
});

describe("sanitizeSearchTerm", () => {
  it("strips tsquery operators", () => {
    expect(sanitizeSearchTerm("react & node")).toBe("react node");
    expect(sanitizeSearchTerm("cat|dog!bird")).toBe("cat dog bird");
    expect(sanitizeSearchTerm("(engineer)")).toBe("engineer");
  });

  it("collapses whitespace and trims", () => {
    expect(sanitizeSearchTerm("  data    analyst  ")).toBe("data analyst");
  });

  it("returns an empty string when nothing survives", () => {
    expect(sanitizeSearchTerm("&|!()")).toBe("");
  });
});
